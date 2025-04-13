
import React, { useState } from 'react';
import { Bell, Bug, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useInstallationRequests, InstallationRequest } from "@/hooks/useInstallationRequests";
import { useAuth } from "@/hooks/auth";
import { ContactDialog } from "./installation/ContactDialog";
import { SchedulingDialog } from "./installation/SchedulingDialog";
import { DebugDialog } from "./installation/DebugDialog";
import { RequestsList } from "./installation/RequestsList";

export const InstallationRequestsNotification = () => {
  // Default garage ID - in a real app, this would come from context or props
  const garageId = "c64a9350-d34a-4903-b34c-16c0e4699a44";
  
  // UI state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InstallationRequest | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  
  const { user } = useAuth();
  
  // Use the custom hook for data fetching and management
  const { 
    installationRequests, 
    isLoading, 
    isRefreshing, 
    debug, 
    fetchInstallationRequests, 
    updateInstallationStatus,
    scheduleInstallation
  } = useInstallationRequests(garageId);
  
  // Handle request click
  const handleRequestClick = (request: InstallationRequest) => {
    setSelectedRequest(request);
    setContactDialogOpen(true);
  };
  
  // Handle status update
  const handleStatusUpdate = async (status: string) => {
    if (!selectedRequest) return;
    
    const success = await updateInstallationStatus(selectedRequest.orderItemId, status);
    
    if (success) {
      setContactDialogOpen(false);
      setOpenDialog(false);
    }
  };
  
  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchInstallationRequests();
  };
  
  // Schedule appointment handler
  const handleScheduleAppointment = () => {
    if (!selectedRequest) return;
    setSchedulingDialogOpen(true);
  };
  
  // Confirm schedule handler
  const handleConfirmSchedule = async () => {
    if (!selectedRequest || !selectedDate || !selectedTime) return;
    
    const success = await scheduleInstallation(
      selectedRequest.orderItemId,
      selectedDate,
      selectedTime
    );
    
    if (success) {
      setSchedulingDialogOpen(false);
      setContactDialogOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  };
  
  // Available times for scheduling
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];
  
  // Format time display
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  
  // Calculate unread requests
  const unreadRequests = installationRequests.filter(req => req.status === "new").length;
  
  return (
    <>
      {/* Main Dialog Trigger */}
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
            <RequestsList 
              installationRequests={installationRequests}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              onRefresh={handleManualRefresh}
              onRequestClick={handleRequestClick}
              debug={debug}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Customer Contact Dialog */}
      <ContactDialog 
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        request={selectedRequest}
        onContactCustomer={() => handleStatusUpdate('contacted')}
        onScheduleInstallation={handleScheduleAppointment}
      />
      
      {/* Scheduling Dialog */}
      <SchedulingDialog 
        open={schedulingDialogOpen}
        onOpenChange={setSchedulingDialogOpen}
        request={selectedRequest}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        onConfirm={handleConfirmSchedule}
        availableTimes={availableTimes}
        formatTimeDisplay={formatTimeDisplay}
      />
      
      {/* Debug Dialog */}
      <DebugDialog 
        open={debugDialogOpen}
        onOpenChange={setDebugDialogOpen}
        debug={debug}
        user={user}
      />
    </>
  );
};
