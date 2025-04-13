
import React from 'react';
import { User, Phone, Mail, Car, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InstallationRequest } from "@/hooks/useInstallationRequests";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: InstallationRequest | null;
  onContactCustomer: () => void;
  onScheduleInstallation: () => void;
}

export const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onOpenChange,
  request,
  onContactCustomer,
  onScheduleInstallation
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customer Information</DialogTitle>
          <DialogDescription>
            Contact information for installation request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="mr-2 h-5 w-5 text-gray-600" />
              <h3 className="font-medium">{request.customerName}</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <p>{request.customerPhone}</p>
              </div>
              
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <p>{request.customerEmail}</p>
              </div>
              
              <div className="flex items-center">
                <Car className="mr-2 h-4 w-4 text-gray-500" />
                <p>{request.part}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Update Status</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={onContactCustomer}
                variant="outline"
                className="flex items-center"
              >
                <Phone className="mr-2 h-4 w-4" /> Mark Contacted
              </Button>
              
              <Button
                onClick={onScheduleInstallation}
                className="flex items-center"
              >
                <Calendar className="mr-2 h-4 w-4" /> Schedule Installation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
