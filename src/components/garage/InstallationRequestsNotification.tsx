
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, User, Phone, Car, Wrench, RefreshCw, Clock, Mail } from "lucide-react";
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
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [debug, setDebug] = useState<any>({});
  
  const fetchInstallationRequests = async () => {
    if (isRefreshing) return;
    
    setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      let garageId = "c64a9350-d34a-4903-b34c-16c0e4699a44";
      
      console.log("Fetching installation requests for garage:", garageId);
      setDebug(prev => ({ ...prev, garageId, fetchStarted: new Date().toISOString() }));
      
      // Fetch order items with installation data that belong to this garage
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
      
      // Get all order IDs for these order items
      const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];
      console.log("Order IDs to fetch:", orderIds);
      
      // Directly fetch orders with user details - important for customer information
      // Use .in() instead of .eq() to fetch multiple orders at once
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, created_at, status, user_name, user_email, user_phone, shipping_address')
        .in('id', orderIds);
        
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setIsLoading(false);
        setIsRefreshing(false);
        setDebug(prev => ({ ...prev, ordersError }));
        return;
      }
      
      console.log("Fetched orders with user details:", ordersData);
      setDebug(prev => ({ ...prev, ordersData, ordersCount: ordersData?.length || 0 }));
      
      // Create a map of order IDs to order data for easy lookup
      const orderMap = new Map();
      if (ordersData) {
        ordersData.forEach(order => {
          orderMap.set(order.id, order);
        });
      }
      
      // Get all part IDs for these order items
      const partIds = orderItemsData.map(item => item.part_id);
      
      // Fetch parts data for these parts
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
      
      // Create a map of part IDs to part data for easy lookup
      const partMap = new Map();
      if (partsData) {
        partsData.forEach(part => {
          partMap.set(part.id, part);
        });
      }
      
      // Get all user IDs from orders
      const userIds = (ordersData || [])
        .filter(order => order.user_id)
        .map(order => order.user_id);
      
      // Fetch profiles for these users only if we have user IDs
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
          
          // Create a map of user IDs to profile data for easy lookup
          profilesData.forEach(profile => {
            profileMap.set(profile.id, profile);
          });
        }
      }
      
      // Map order items to installation requests with all the details
      const requests: InstallationRequest[] = orderItemsData
        .map(item => {
          // Get order information - prioritize using order data for customer info
          const order = orderMap.get(item.order_id) || { 
            created_at: new Date().toISOString(), 
            user_id: null,
            user_name: "Unknown Customer",
            user_email: "No Email",
            user_phone: "No Phone"
          };
          
          // Get profile information if available
          const profile = order.user_id ? profileMap.get(order.user_id) : null;
          
          // Get part information
          const part = partMap.get(item.part_id);
          
          // Determine customer name - prioritize order's user_name over profile
          const customerName = order.user_name || 
            (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : "Unknown Customer");
            
          // Determine customer contact info - prioritize order's contact info over profile
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
            <DialogTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" /> Installation Requests
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
      
      {selectedRequest && (
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Installation Request Details</DialogTitle>
              <DialogDescription>
                Contact customer to schedule the installation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" /> 
                  <span className="font-medium">Customer:</span> 
                  <span className="ml-2">{selectedRequest.customerName}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" /> 
                  <span className="font-medium">Phone:</span> 
                  <span className="ml-2">{selectedRequest.customerPhone}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" /> 
                  <span className="font-medium">Email:</span> 
                  <span className="ml-2">{selectedRequest.customerEmail}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Car className="h-4 w-4 mr-2 text-gray-500" /> 
                  <span className="font-medium">Part:</span> 
                  <span className="ml-2">{selectedRequest.part}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Wrench className="h-4 w-4 mr-2 text-gray-500" /> 
                  <span className="font-medium">Installation Fee:</span> 
                  <span className="ml-2">${selectedRequest.installationFee}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Actions:</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {selectedRequest.status === 'new' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusUpdate('contacted')}
                      className="justify-start"
                    >
                      <Phone className="h-4 w-4 mr-2" /> 
                      Mark as Contacted
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleScheduleAppointment}
                    className="justify-start bg-mechanica-500 hover:bg-mechanica-600"
                  >
                    <Calendar className="h-4 w-4 mr-2" /> 
                    Schedule Installation
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={() => setContactDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {selectedRequest && (
        <Dialog open={schedulingDialogOpen} onOpenChange={setSchedulingDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Installation</DialogTitle>
              <DialogDescription>
                Select a date and time for the installation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Select Date:</h4>
                <div className="border rounded-md">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Select Time:</h4>
                <Select 
                  value={selectedTime} 
                  onValueChange={setSelectedTime}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTimeDisplay(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDate && selectedTime && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Scheduled for:</h4>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-mechanica-500" />
                    <span className="mr-2">{format(selectedDate, 'MMMM d, yyyy')}</span>
                    <Clock className="h-4 w-4 mr-1 text-mechanica-500" />
                    <span>{formatTimeDisplay(selectedTime)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={() => setSchedulingDialogOpen(false)} className="mr-2">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmSchedule}
                disabled={!selectedDate || !selectedTime}
                className="bg-mechanica-500 hover:bg-mechanica-600"
              >
                Confirm Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InstallationRequestsNotification;
