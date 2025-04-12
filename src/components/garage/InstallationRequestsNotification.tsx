
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, User, Phone, Car, Wrench, RefreshCw } from "lucide-react";
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

interface InstallationRequest {
  id: string;
  customerName: string;
  customerPhone: string;
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
}

export const InstallationRequestsNotification = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InstallationRequest | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [installationRequests, setInstallationRequests] = useState<InstallationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      
      // Fetch order items with installation info
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
      
      // Get related order information
      const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, created_at, status')
        .in('id', orderIds);
        
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setIsLoading(false);
        setIsRefreshing(false);
        setDebug(prev => ({ ...prev, ordersError }));
        return;
      }
      
      console.log("Fetched orders:", ordersData);
      setDebug(prev => ({ ...prev, ordersData, ordersCount: ordersData?.length || 0 }));
      
      // Create a map for easier lookup
      const orderMap = new Map();
      ordersData.forEach(order => {
        orderMap.set(order.id, order);
      });
      
      // Get user information
      const userIds = ordersData
        .filter(order => order.user_id)
        .map(order => order.user_id);
        
      // Handle case with no valid users
      if (userIds.length === 0) {
        console.log("No valid user IDs found in orders, using dummy data for display");
        
        // Create placeholder requests with the available data
        const placeholderRequests: InstallationRequest[] = orderItemsData.map(item => ({
          id: item.id,
          customerName: "Customer Information Unavailable",
          customerPhone: "Phone Not Available",
          part: `Part #${item.part_id}`,
          orderDate: "Unknown Date",
          status: item.installation_status || "new",
          price: Number(item.price),
          installationFee: Number(item.installation_fee) || 50,
          garageId: item.garage_id,
          orderId: item.order_id,
          orderItemId: item.id,
          appointmentDate: item.scheduled_date,
          appointmentTime: item.scheduled_time
        }));
        
        console.log("Created placeholder installation requests:", placeholderRequests);
        setInstallationRequests(placeholderRequests);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, phone')
        .in('id', userIds);
        
      if (usersError) {
        console.error("Error fetching customer information:", usersError);
        setIsLoading(false);
        setIsRefreshing(false);
        setDebug(prev => ({ ...prev, usersError }));
        return;
      }
      
      console.log("Fetched users:", usersData);
      setDebug(prev => ({ ...prev, usersData, usersCount: usersData?.length || 0 }));
      
      const userMap = new Map();
      usersData?.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Get part information
      const partIds = orderItemsData.map(item => item.part_id);
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id, name')
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
      
      // Map the data to the InstallationRequest interface
      const requests: InstallationRequest[] = orderItemsData
        .map(item => {
          const order = orderMap.get(item.order_id) || { created_at: new Date().toISOString(), user_id: null };
          const user = order.user_id ? userMap.get(order.user_id) : null;
          const part = partMap.get(item.part_id);
          
          return {
            id: item.id,
            customerName: user?.email || "Unknown",
            customerPhone: user?.phone || "Not provided",
            part: part?.name || `Part #${item.part_id}`,
            orderDate: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : "Unknown",
            status: item.installation_status || "new",
            price: Number(item.price),
            installationFee: Number(item.installation_fee) || 50,
            garageId: item.garage_id,
            orderId: item.order_id,
            orderItemId: item.id,
            appointmentDate: item.scheduled_date,
            appointmentTime: item.scheduled_time
          };
        });
      
      console.log("Processed installation requests:", requests);
      setDebug(prev => ({ ...prev, mappedRequests: requests, requestsCount: requests.length }));
      
      // Set the installation requests state
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
                        <div className="flex items-center text-xs text-gray-500 mt-2">
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
                    onClick={() => handleStatusUpdate('scheduled', {
                      date: new Date().toISOString().split('T')[0],
                      time: '10:00'
                    })}
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
    </>
  );
};
