
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, User, Phone, Car, Wrench } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";

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
  const { toast } = useToast();
  const { user, isAuthenticated, userRole } = useAuth();
  
  const fetchInstallationRequests = async () => {
    setIsLoading(true);
    try {
      // Check if we're in demo mode (not authenticated)
      if (!isAuthenticated) {
        setInstallationRequests([]);
        setIsLoading(false);
        return;
      }
      
      // For real garages (authenticated), fetch actual installation requests
      const { data: garagesData, error: garagesError } = await supabase
        .from('garages')
        .select('id')
        .eq('id', user?.garage_id);
        
      if (garagesError) {
        console.error("Error fetching garage:", garagesError);
        toast({
          title: "Error",
          description: "Could not fetch your garage information",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!garagesData || garagesData.length === 0) {
        console.error("No garage found for this user");
        setInstallationRequests([]);
        setIsLoading(false);
        return;
      }
      
      const garageId = garagesData[0].id;
      
      // Fetch installation requests for this garage from order items with installation data
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          garage_id,
          quantity,
          price,
          part:part_id (name),
          installation_status,
          scheduled_date,
          scheduled_time,
          orders:order_id (
            id,
            user_id,
            created_at,
            status
          )
        `)
        .eq('garage_id', garageId)
        .is('installation_status', null)
        .not('orders.status', 'eq', 'cancelled');
        
      if (orderItemsError) {
        console.error("Error fetching installation requests:", orderItemsError);
        toast({
          title: "Error",
          description: "Failed to load installation requests",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!orderItemsData || orderItemsData.length === 0) {
        setInstallationRequests([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch customer information for these orders
      const userIds = orderItemsData.map(item => item.orders.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, phone')
        .in('id', userIds);
        
      if (usersError) {
        console.error("Error fetching customer information:", usersError);
        setIsLoading(false);
        return;
      }
      
      // Map the data to our interface
      const requests: InstallationRequest[] = orderItemsData.map(item => {
        const user = usersData?.find(u => u.id === item.orders.user_id);
        
        return {
          id: item.id,
          customerName: user?.email || "Unknown",
          customerPhone: user?.phone || "Not provided",
          part: item.part?.name || "Unknown part",
          orderDate: new Date(item.orders.created_at).toISOString().split('T')[0],
          status: item.installation_status || "new",
          price: Number(item.price),
          installationFee: 50, // This should come from your installation data
          garageId: item.garage_id,
          orderId: item.order_id,
          orderItemId: item.id,
          appointmentDate: item.scheduled_date,
          appointmentTime: item.scheduled_time
        };
      });
      
      setInstallationRequests(requests);
    } catch (error) {
      console.error("Unexpected error fetching installation requests:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInstallationRequests();
  }, [isAuthenticated, user]);
  
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
      
      // Refresh the data
      fetchInstallationRequests();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update installation status",
        variant: "destructive",
      });
    } finally {
      setContactDialogOpen(false);
      setOpenDialog(false);
    }
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
              <p className="text-center py-4 text-gray-500">No installation requests</p>
            ) : (
              installationRequests.map(request => (
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
              ))
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
