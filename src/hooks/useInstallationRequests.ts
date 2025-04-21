
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export interface InstallationRequest {
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

interface DebugData {
  authUser: any;
  lastFetchTime: string | null;
  garageId?: string;
  fetchStarted?: string;
  authSession?: any;
  sessionError?: any;
  orderItemsData?: any;
  orderItemsError?: any;
  itemsCount?: number;
  ordersData?: any;
  ordersCount?: number;
  errorCounts?: number;
  orderIds?: string[];
  partsData?: any;
  partsError?: any;
  partsCount?: number;
  mappedRequests?: InstallationRequest[];
  requestsCount?: number;
  directTest?: {
    data: any;
    error: any;
  };
  error?: any;
  customerDataFromOrders?: any;
  profileData?: any;
  orderLookupFailures?: any[];
  rawQuery?: string;
  garageAccessCheck?: any;
}

export const useInstallationRequests = (garageId: string) => {
  const [installationRequests, setInstallationRequests] = useState<InstallationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debug, setDebug] = useState<DebugData>({
    authUser: null,
    lastFetchTime: null,
    orderLookupFailures: []
  });
  const { toast } = useToast();

  // Function to check garage access and connection
  const checkGarageAccess = async (garageId: string) => {
    try {
      console.log(`Checking garage access for: ${garageId}`);
      
      const { data, error } = await supabase
        .rpc('check_garage_and_installation_requests', { garage_id_param: garageId });
        
      if (error) {
        console.error("Garage access check error:", error);
        return {
          hasAccess: false,
          error: error.message,
          details: null
        };
      }
      
      console.log("Garage access check result:", data);
      return {
        hasAccess: data[0]?.user_has_access || false,
        garageExists: data[0]?.garage_exists || false,
        garageName: data[0]?.garage_name,
        requestsCount: data[0]?.installation_requests_count,
        error: data[0]?.error_message,
        details: data
      };
    } catch (error: any) {
      console.error("Exception in checkGarageAccess:", error);
      return {
        hasAccess: false,
        error: error.message || 'Unknown error',
        details: error
      };
    }
  };

  const fetchInstallationRequests = async () => {
    if (isRefreshing) return;
    
    setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      console.log("Fetching installation requests for garage:", garageId);
      setDebug(prev => ({ ...prev, garageId, fetchStarted: new Date().toISOString(), orderLookupFailures: [] }));
      
      // Get current auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Auth session error:", sessionError);
        setDebug(prev => ({ ...prev, sessionError }));
      } else {
        console.log("Auth session:", sessionData?.session ? "Active" : "Not active");
        setDebug(prev => ({ ...prev, authSession: sessionData }));
      }
      
      // First check garage access
      const accessCheck = await checkGarageAccess(garageId);
      setDebug(prev => ({ ...prev, garageAccessCheck: accessCheck }));
      
      if (!accessCheck.hasAccess) {
        console.error("Access denied to garage:", garageId);
        toast({
          title: "Access Error",
          description: `You don't have access to this garage's installation requests`,
          variant: "destructive",
        });
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      // First try the direct table access - this tests if RLS is working properly
      const { data: directData, error: directError } = await supabase
        .from('order_items')
        .select('*')
        .eq('garage_id', garageId)
        .not('installation_status', 'is', null)
        .limit(10);
        
      setDebug(prev => ({ 
        ...prev, 
        directTest: { 
          data: directData, 
          error: directError,
          success: !directError && directData && directData.length > 0
        } 
      }));
        
      if (directError) {
        console.error("Direct table access error:", directError);
        // Continue to use the RPC function as a fallback
      } else {
        console.log("Direct table access success, found", directData?.length || 0, "items");
      }
      
      // Use our database function to get installation requests
      const { data: requestsData, error } = await supabase.rpc(
        'get_garage_installation_requests',
        { garage_id_param: garageId }
      );
      
      if (error) {
        console.error("Error fetching installation requests:", error);
        toast({
          title: "Error",
          description: "Failed to load installation requests",
          variant: "destructive",
        });
        setIsLoading(false);
        setIsRefreshing(false);
        setDebug(prev => ({ ...prev, error }));
        return;
      }
      
      console.log("Fetched installation requests:", requestsData);
      
      if (!requestsData || requestsData.length === 0) {
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
      
      // Map the response data to our InstallationRequest interface
      const mappedRequests: InstallationRequest[] = requestsData.map(item => {
        // Get the order date (assuming orders table doesn't have it in our data)
        const orderDate = new Date().toISOString().split('T')[0];
        
        return {
          id: item.order_item_id,
          customerName: item.user_name || "Unknown Customer",
          customerPhone: item.user_phone || "No Phone",
          customerEmail: item.user_email || "No Email",
          part: item.part_name || `Part #${item.part_id}`,
          orderDate,
          status: item.installation_status || "new",
          price: 0, // We don't have this in our view, could add if needed
          installationFee: Number(item.installation_fee) || 50,
          garageId: item.garage_id,
          orderId: item.order_id,
          orderItemId: item.order_item_id,
          appointmentDate: item.scheduled_date,
          appointmentTime: item.scheduled_time,
          partId: item.part_id
        };
      });
      
      console.log("Processed installation requests:", mappedRequests);
      setDebug(prev => ({ 
        ...prev, 
        mappedRequests,
        requestsCount: mappedRequests.length,
      }));
      
      setInstallationRequests(mappedRequests);
      
      if (mappedRequests.length > 0 && isRefreshing && !isLoading) {
        toast({
          title: `${mappedRequests.length} Installation Requests Found`,
          description: "Installation requests have been loaded successfully."
        });
      }
    } catch (error) {
      console.error("Error in fetchInstallationRequests:", error);
      setDebug(prev => ({ ...prev, error }));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setDebug(prev => ({ ...prev, lastFetchTime: new Date().toISOString() }));
    }
  };

  const updateInstallationStatus = async (
    orderItemId: string, 
    status: string, 
    appointmentDetails?: {date: string, time: string}
  ) => {
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
        .eq('id', orderItemId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Status updated",
        description: `Customer will be ${status === 'contacted' ? 'contacted' : 'scheduled for installation'}`
      });
      
      fetchInstallationRequests();
      return true;
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update installation status",
      });
      return false;
    }
  };

  const scheduleInstallation = async (
    orderItemId: string,
    selectedDate: Date,
    selectedTime: string
  ) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('order_items')
        .update({ 
          scheduled_date: formattedDate,
          scheduled_time: selectedTime,
          installation_status: 'scheduled'
        })
        .eq('id', orderItemId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Appointment scheduled",
        description: `Installation scheduled for ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`,
      });
      
      await fetchInstallationRequests();
      return true;
    } catch (error: any) {
      console.error("Error scheduling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule the appointment",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchInstallationRequests();
    
    const intervalId = setInterval(() => {
      fetchInstallationRequests();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [garageId]);

  return {
    installationRequests,
    isLoading,
    isRefreshing,
    debug,
    fetchInstallationRequests,
    updateInstallationStatus,
    scheduleInstallation
  };
};
