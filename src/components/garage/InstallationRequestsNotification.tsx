
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

interface GarageUser {
  id: string;
  email?: string;
  garage_id?: string;
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
      const garageUser = user as unknown as GarageUser;
      let garageId = garageUser?.garage_id;
      
      if (!garageId) {
        console.log("No garage ID found for this user, attempting to fetch from profiles or garages");
        
        // First try to fetch garage ID from profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('garage_id')
          .eq('id', user?.id)
          .single();
          
        if (profileData?.garage_id) {
          console.log("Found garage ID in profile:", profileData.garage_id);
          garageId = profileData.garage_id;
        } else {
          // If not in profiles, try to fetch from garages table
          const { data: garagesData, error: garagesError } = await supabase
            .from('garages')
            .select('id')
            .limit(1)
            .single();
            
          if (garagesError || !garagesData) {
            console.error("Error fetching garage:", garagesError);
            toast({
              title: "Error",
              description: "Could not fetch your garage information",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          // Use the first garage ID found
          garageId = garagesData.id;
          console.log("Using first available garage ID:", garageId);
        }
      }
      
      // Use the garage ID we found to fetch installation requests
      await fetchRequestsForGarage(garageId);
    } catch (error: any) {
      console.error("Unexpected error fetching installation requests:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const fetchRequestsForGarage = async (garageId: string) => {
    try {
      console.log("Fetching installation requests for garage ID:", garageId);
      
      // Fetch installation requests for this garage from order items with installation data
      // Critical fix: Changed from `is('installation_status', null)` to `not.is('installation_status', null)`
      // This was filtering out all items that had installation status set
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
          part:part_id (name),
          orders:order_id (
            id,
            user_id,
            created_at,
            status
          )
        `)
        .eq('garage_id', garageId);
        
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
      
      console.log("Fetched order items with installation:", orderItemsData);
      
      if (!orderItemsData || orderItemsData.length === 0) {
        console.log("No installation requests found for garage:", garageId);
        setInstallationRequests([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch customer information for these orders
      const userIds = orderItemsData
        .filter(item => item.orders && item.orders.user_id)
        .map(item => item.orders.user_id);
        
      if (userIds.length === 0) {
        console.error("No valid user IDs found in orders");
        setInstallationRequests([]);
        setIsLoading(false);
        return;
      }
      
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
      const requests: InstallationRequest[] = orderItemsData
        .filter(item => item.orders) // Filter out items without orders data
        .map(item => {
          const user = usersData?.find(u => u.id === item.orders.user_id);
          
          return {
            id: item.id,
            customerName: user?.email || "Unknown",
            customerPhone: user?.phone || "Not provided",
            part: item.part?.name || "Unknown part",
            orderDate: new Date(item.orders.created_at).toISOString().split('T')[0],
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
      setInstallationRequests(requests);
    } catch (error) {
      console.error("Error in fetchRequestsForGarage:", error);
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
