
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

// Mock installation requests
const mockInstallationRequests = [
  {
    id: "req1",
    customerName: "Ahmed Mohammed",
    customerPhone: "+971 50 123 4567",
    part: "Bosch Premium Oil Filter",
    orderDate: "2025-04-10",
    status: "new",
    price: 35,
    installationFee: 45
  },
  {
    id: "req2",
    customerName: "Fatima Ali",
    customerPhone: "+971 55 987 6543",
    part: "AC Delco Brake Pads",
    orderDate: "2025-04-09",
    status: "contacted",
    price: 85,
    installationFee: 50
  },
  {
    id: "req3",
    customerName: "Mohammed Rahman",
    customerPhone: "+971 52 555 1234",
    part: "NGK Laser Platinum Spark Plugs",
    orderDate: "2025-04-08",
    status: "scheduled",
    appointmentDate: "2025-04-12",
    appointmentTime: "14:00",
    price: 45,
    installationFee: 35
  }
];

export const InstallationRequestsNotification = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const unreadRequests = mockInstallationRequests.filter(req => req.status === "new").length;
  
  const handleRequestClick = (request: any) => {
    setSelectedRequest(request);
    setContactDialogOpen(true);
  };
  
  const handleStatusUpdate = (status: string, appointmentDetails?: any) => {
    // In a real app, this would update the request status in the database
    toast({
      title: "Status updated",
      description: `Customer will be ${status === 'contacted' ? 'contacted' : 'scheduled for installation'}`
    });
    
    setContactDialogOpen(false);
    setOpenDialog(false);
  };
  
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
            {mockInstallationRequests.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No installation requests</p>
            ) : (
              mockInstallationRequests.map(request => (
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
                  
                  {request.status === 'scheduled' && (
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
                      date: '2025-04-15',
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
