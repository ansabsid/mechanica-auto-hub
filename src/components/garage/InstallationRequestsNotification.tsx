import React, { useState, useEffect } from 'react';
import { Bell, Bug, Wrench, AlertTriangle, UserPlus, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useInstallationRequests, InstallationRequest } from "@/hooks/useInstallationRequests";
import { useAuth } from "@/hooks/auth";
import { ContactDialog } from "./installation/ContactDialog";
import { SchedulingDialog } from "./installation/SchedulingDialog";
import { DebugDialog } from "./installation/DebugDialog";
import { RequestsList } from "./installation/RequestsList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RlsDebugHelper } from "./installation/RlsDebugHelper";

export const InstallationRequestsNotification = () => {
  const { user } = useAuth();
  const [garageId, setGarageId] = useState("c64a9350-d34a-4903-b34c-16c0e4699a44");
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InstallationRequest | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [accessFixDialogOpen, setAccessFixDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [userGarageInfo, setUserGarageInfo] = useState<any>(null);
  const [isFixingAccess, setIsFixingAccess] = useState(false);
  
  const { 
    installationRequests, 
    isLoading, 
    isRefreshing, 
    debug, 
    fetchInstallationRequests, 
    updateInstallationStatus,
    scheduleInstallation
  } = useInstallationRequests(garageId);

  useEffect(() => {
    const getUserGarageInfo = async () => {
      if (!user) return;
      
      try {
        console.log("Checking user profile for garage ID...");
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('garage_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        
        if (profileData?.garage_id) {
          console.log("Found garage ID in profile:", profileData.garage_id);
          setUserGarageInfo({
            garageId: profileData.garage_id,
            source: "profile"
          });
          setGarageId(profileData.garage_id);
          return;
        }
        
        if (user?.user_metadata?.garageId) {
          console.log("Found garage ID in user metadata:", user.user_metadata.garageId);
          setUserGarageInfo({
            garageId: user.user_metadata.garageId,
            source: "metadata" 
          });
          setGarageId(user.user_metadata.garageId);
          return;
        }
        
        console.log("No garage ID found in profile or metadata, using default:", garageId);
        
      } catch (error) {
        console.error("Error getting user garage info:", error);
      }
    };
    
    getUserGarageInfo();
  }, [user]);

  useEffect(() => {
    console.log("Initial fetch of installation requests for garage:", garageId);
    fetchInstallationRequests();
  }, [garageId]);

  useEffect(() => {
    console.log("Installation requests updated:", installationRequests);
    console.log("Current debug state:", debug);
  }, [installationRequests, debug]);
  
  const handleManualRefresh = () => {
    console.log("Manual refresh requested for garage:", garageId);
    toast.info("Refreshing installation requests...");
    fetchInstallationRequests();
  };
  
  const handleRequestClick = (request: InstallationRequest) => {
    console.log("Request clicked:", request);
    setSelectedRequest(request);
    setContactDialogOpen(true);
  };
  
  const handleStatusUpdate = async (status: string) => {
    if (!selectedRequest) return;
    
    const success = await updateInstallationStatus(selectedRequest.orderItemId, status);
    
    if (success) {
      setContactDialogOpen(false);
      setOpenDialog(false);
    }
  };
  
  const handleScheduleAppointment = () => {
    if (!selectedRequest) return;
    setSchedulingDialogOpen(true);
  };
  
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
  
  const handleFixGarageAccess = async () => {
    if (!user) {
      toast.error("You must be logged in to fix garage access");
      return;
    }
    
    setIsFixingAccess(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ garage_id: garageId })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating profile with garage ID:", error);
        toast.error("Failed to link your account to this garage");
        return;
      }
      
      setUserGarageInfo({
        garageId: garageId,
        source: "profile (recently updated)"
      });
      
      toast.success("Successfully linked your account to this garage");
      
      fetchInstallationRequests();
      setAccessFixDialogOpen(false);
    } catch (error) {
      console.error("Error in handleFixGarageAccess:", error);
      toast.error("An error occurred while fixing garage access");
    } finally {
      setIsFixingAccess(false);
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
  
  const hasAccessIssue = debug.garageAccessCheck && !debug.garageAccessCheck.hasAccess;
  
  return (
    <>
      {hasAccessIssue && (
        <Alert variant="destructive" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm flex flex-col">
            <p className="font-medium">Access Issue Detected</p>
            <p className="text-xs mt-1">Your account is not linked to this garage in the database. Fix this to view installation requests.</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2 text-xs bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-100 w-full"
              onClick={() => setAccessFixDialogOpen(true)}
            >
              <UserPlus className="h-3 w-3 mr-1" /> Link My Account to This Garage
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
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
              {userGarageInfo && (
                <span className="block text-xs text-gray-500 mt-1">
                  Garage ID: {userGarageInfo.garageId.substring(0, 8)}... (from {userGarageInfo.source})
                </span>
              )}
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
      
      <ContactDialog 
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        request={selectedRequest}
        onContactCustomer={() => handleStatusUpdate('contacted')}
        onScheduleInstallation={handleScheduleAppointment}
      />
      
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
      
      <DebugDialog 
        open={debugDialogOpen}
        onOpenChange={setDebugDialogOpen}
        debug={debug}
        user={user}
      />
      
      <Dialog open={accessFixDialogOpen} onOpenChange={setAccessFixDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <DatabaseIcon className="mr-2 h-5 w-5" /> Fix Garage Access
            </DialogTitle>
            <DialogDescription>
              Link your user account to this garage in the database to gain access to installation requests.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your user account (ID: {user?.id?.substring(0, 8)}...) is not currently linked to garage ID: {garageId.substring(0, 8)}...
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                This will update your user profile in the database to link it with this garage, granting you access to its installation requests.
              </p>
            </div>
            
            <RlsDebugHelper garageId={garageId} />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccessFixDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFixGarageAccess}
              disabled={isFixingAccess}
            >
              {isFixingAccess ? "Linking..." : "Link Account to Garage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
