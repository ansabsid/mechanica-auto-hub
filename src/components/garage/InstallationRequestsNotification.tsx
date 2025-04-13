import React, { useState, useEffect } from 'react';
import { Bell, Calendar, User, Phone, Car, Wrench, RefreshCw, Clock, Mail, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstallationRequestGarage } from "@/types/order.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InstallationRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  part: string;
  orderDate: string;
  status: string;
  price: number;
  installationFee: number;
  appointmentDate?: string;
  appointmentTime?: string;
  garageId: string;
  orderId: string;
  orderItemId: string;
  partId: number;
}

export const InstallationRequestsNotification = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InstallationRequest | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [installationRequests, setInstallationRequests] = useState<InstallationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [debug, setDebug] = useState<any>({
    authUser: null,
    lastFetchTime: null,
    rpcTest: null,
    dbAccessTest: null,
    directOrdersQuery: null
  });
  
  const fetchInstallationRequests = async () => {
    if (isRefreshing) return;
    
    setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      let garageId = "c64a9350-d34a-4903-b34c-16c0e4699a44";
      
      console.log("Fetching installation requests for garage:", garageId);
      setDebug(prev => ({ ...prev, garageId, fetchStarted: new Date().toISOString() }));
      
      // Get the authenticated user first to confirm our auth state
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Auth session error:", sessionError);
        setDebug(prev => ({ ...prev, sessionError }));
      } else {
        console.log("Auth session:", sessionData?.session ? "Active" : "Not active");
        setDebug(prev => ({ ...prev, authSession: sessionData }));
      }
      
      // Fetch order items assigned to this garage with installation data
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          garage_id,
          quantity,
          price,
          installation_status,
          scheduled_date,
          scheduled_time,
          installation_fee,
          part_id
        `)
        .eq('garage_id', garageId)
        .not('installation_status', 'is', null);
        
      if (orderItemsError) {
        console.error("Error fetching installation requests:", orderItemsError);
        toast({
          title: "Error",
          description: "Failed to load installation requests",
          variant: "destructive",
        });
        setIsLoading(false);
        setIsRefreshing(false);
        setDebug(prev => ({ ...prev, orderItemsError }));
        return;
      }
      
      console.log("Fetched order items with installation:", orderItemsData);
      setDebug(prev => ({ ...prev, orderItemsData, itemsCount: orderItemsData?.length || 0 }));
      
      if (!orderItemsData || orderItemsData.length === 0) {
        console.log("No installation requests found for garage:", garageId);
        setInstallationRequests([]);
        setIsLoading(false);
        setIsRefreshing(false);
        
        toast({
          title: "No Installation Requests",
          description: "There are currently no installation requests for this garage."
        });
        return;
      }
      
      const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];
      console.log("Order IDs to fetch:", orderIds);
      
      // Updated approach: Fetch each order individually to troubleshoot potential issues
      let ordersData = [];
      let errorCounts = 0;
      
      for (const orderId of orderIds) {
        try {
          console.log("Fetching individual order:", orderId);
          
          // Use maybeSingle to handle when an order might not exist
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('id, user_id, created_at, status, user_name, user_email, user_phone, shipping_address')
            .eq('id', orderId)
            .maybeSingle();
            
          if (orderError) {
            console.error(`Error fetching order ${orderId}:`, orderError);
            errorCounts++;
          } else if (orderData) {
            console.log(`Successfully fetched order ${orderId}:`, orderData);
            ordersData.push(orderData);
          } else {
            console.log(`No data returned for order ${orderId}`);
          }
        } catch (err) {
          console.error(`Exception fetching order ${orderId}:`, err);
          errorCounts++;
        }
      }
      
      console.log(`Fetched ${ordersData.length} orders, encountered ${errorCounts} errors`);
      setDebug(prev => ({ 
        ...prev, 
        ordersData, 
        ordersCount: ordersData?.length || 0,
        errorCounts,
        orderIds 
      }));
      
      const orderMap = new Map();
      if (ordersData) {
        ordersData.forEach(order => {
          orderMap.set(order.id, order);
        });
      }
      
      // Direct query to test RLS policies
      const { data: directTestData, error: directTestError } = await supabase
        .from('order_items')
        .select('*')
        .eq('garage_id', garageId)
        .limit(2);
      
      setDebug(prev => ({ 
        ...prev, 
        directTest: {
          data: directTestData,
          error: directTestError
        }
      }));
      
      // Fetch part data for display
      const partIds = orderItemsData.map(item => item.part_id);
      
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id, name, description, image_url')
        .in('id', partIds);
        
      if (partsError) {
        console.error("Error fetching parts:", partsError);
        setDebug(prev => ({ ...prev, partsError }));
      }
      
      console.log("Fetched parts:", partsData);
      setDebug(prev => ({ ...prev, partsData, partsCount: partsData?.length || 0 }));
      
      const partMap = new Map();
      if (partsData) {
        partsData.forEach(part => {
          partMap.set(part.id, part);
        });
      }
      
      const userIds = (ordersData || [])
        .filter(order => order.user_id)
        .map(order => order.user_id);
      
      console.log("User IDs for profiles:", userIds);
      
      // Fetch user profile data if available
      let profileMap = new Map();
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, firstName, lastName, email, phone')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Error fetching user profiles:", profilesError);
          setDebug(prev => ({ ...prev, profilesError }));
        } else if (profilesData) {
          console.log("Fetched user profiles:", profilesData);
          setDebug(prev => ({ ...prev, profilesData, profilesCount: profilesData.length }));
          
          profilesData.forEach(profile => {
            profileMap.set(profile.id, profile);
          });
        }
      } else {
        console.log("No user IDs found in orders data to fetch profiles");
      }
      
      // Map order items to installation requests for display
      const requests: InstallationRequest[] = orderItemsData
        .map(item => {
          const order = orderMap.get(item.order_id) || { 
            created_at: new Date().toISOString(), 
            user_id: null,
            user_name: "Unknown Customer",
            user_email: "No Email",
            user_phone: "No Phone"
          };
          
          const profile = order.user_id ? profileMap.get(order.user_id) : null;
          
          const part = partMap.get(item.part_id);
          
          // Enhanced logging for order customer data
          console.log(`Order ${item.order_id} customer data:`, {
            fromOrder: {
              name: order.user_name,
              email: order.user_email,
              phone: order.user_phone
            },
            fromProfile: profile ? {
              name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
              email: profile.email,
              phone: profile.phone
            } : 'No profile data'
          });
          
          const customerName = order.user_name || 
            (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : "Unknown Customer");
            
          const customerPhone = order.user_phone || profile?.phone || "No Phone";
          const customerEmail = order.user_email || profile?.email || "No Email";
          
          return {
            id: item.id,
            customerName,
            customerPhone,
            customerEmail,
            part: part?.name || `Part #${item.part_id}`,
            orderDate: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : "Unknown",
            status: item.installation_status || "new",
            price: Number(item.price),
            installationFee: Number(item.installation_fee) || 50,
            garageId: item.garage_id,
            orderId: item.order_id,
            orderItemId: item.id,
            appointmentDate: item.scheduled_date,
            appointmentTime: item.scheduled_time,
            partId: item.part_id
          };
        });
      
      console.log("Processed installation requests with customer info and part names:", requests);
      setDebug(prev => ({ ...prev, mappedRequests: requests, requestsCount: requests.length }));
      
      setInstallationRequests(requests);
      
      if (requests.length > 0 && isRefreshing && !isLoading) {
        toast({
          title: `${requests.length} Installation Requests Found`,
          description: "Installation requests have been loaded successfully."
        });
      }
    } catch (error) {
      console.error("Error in fetchInstallationRequests:", error);
      setDebug(prev => ({ ...prev, error }));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchInstallationRequests();
    
    const intervalId = setInterval(() => {
      fetchInstallationRequests();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleRequestClick = (request: InstallationRequest) => {
    setSelectedRequest(request);
    setContactDialogOpen(true);
  };
  
  const handleStatusUpdate = async (status: string, appointmentDetails?: {date: string, time: string}) => {
    if (!selectedRequest) return;
    
    try {
      let updateData: any = {
        installation_status: status
      };
      
      if (appointmentDetails) {
        updateData.scheduled_date = appointmentDetails.date;
        updateData.scheduled_time = appointmentDetails.time;
      }
      
      const { error } = await supabase
        .from('order_items')
        .update(updateData)
        .eq('id', selectedRequest.orderItemId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Status updated",
        description: `Customer will be ${status === 'contacted' ? 'contacted' : 'scheduled for installation'}`
      });
      
      fetchInstallationRequests();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update installation status",
      });
    } finally {
      setContactDialogOpen(false);
      setOpenDialog(false);
    }
  };
  
  const handleManualRefresh = () => {
    toast({
      title: "Refreshing...",
      description: "Checking for new installation requests"
    });
    fetchInstallationRequests();
  };
  
  const handleScheduleAppointment = () => {
    if (!selectedRequest) return;
    setSchedulingDialogOpen(true);
  };
  
  const handleConfirmSchedule = async () => {
    if (!selectedRequest || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select both date and time for the appointment",
      });
      return;
    }
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('order_items')
        .update({ 
          scheduled_date: formattedDate,
          scheduled_time: selectedTime,
          installation_status: 'scheduled'
        })
        .eq('id', selectedRequest.orderItemId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Appointment scheduled",
        description: `Installation scheduled for ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`,
      });
      
      setSchedulingDialogOpen(false);
      setContactDialogOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      await fetchInstallationRequests();
    } catch (error: any) {
      console.error("Error scheduling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule the appointment",
      });
    }
  };
  
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];
  
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  
  const unreadRequests = installationRequests.filter(req => req.status === "new").length;
  
  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadRequests > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {unreadRequests}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="mr-2 h-5 w-5" /> Installation Requests
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setDebugDialogOpen(true)}
                className="h-8 w-8"
              >
                <Bug className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Customers who purchased parts with installation service
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mechanica-600"></div>
              </div>
            ) : installationRequests.length === 0 ? (
              <div>
                <p className="text-center py-4 text-gray-500">No installation requests</p>
                <div className="border-t pt-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManualRefresh}
                    className="w-full text-xs flex items-center justify-center"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mechanica-600 mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
                <details className="mt-4 text-xs text-gray-400">
                  <summary>Debug Info</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManualRefresh}
                    className="text-xs flex items-center"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mechanica-600 mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
                
                {installationRequests.map(request => (
                  <div 
                    key={request.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                      request.status === 'new' ? 'border-mechanica-500 bg-mechanica-50' : ''
                    }`}
                    onClick={() => handleRequestClick(request)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{request.customerName}</h3>
                          {request.status === 'new' && (
                            <Badge className="ml-2 bg-mechanica-500">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{request.part}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Phone className="h-3 w-3 mr-1" /> 
                          {request.customerPhone}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" /> 
                          Order date: {new Date(request.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${request.price + request.installationFee}</p>
                        <p className="text-xs text-gray-500">
                          (Part: ${request.price}, Install: ${request.installationFee})
                        </p>
                      </div>
                    </div>
                    
                    {request.status === 'scheduled' && request.appointmentDate && request.appointmentTime && (
                      <div className="mt-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> 
                        Scheduled: {new Date(request.appointmentDate).toLocaleDateString()} at {request.appointmentTime}
                      </div>
                    )}
                    
                    {request.status === 'contacted' && (
                      <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> 
                        Customer contacted
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Debug Dialog */}
      <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Debug Information</DialogTitle>
            <DialogDescription>
              Technical details to troubleshoot installation requests
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
