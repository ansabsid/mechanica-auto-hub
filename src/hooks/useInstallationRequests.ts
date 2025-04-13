
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
  profilesData?: any;
  profilesError?: any;
  profilesCount?: number;
  mappedRequests?: InstallationRequest[];
  requestsCount?: number;
  directTest?: {
    data: any;
    error: any;
  };
  error?: any;
}

export const useInstallationRequests = (garageId: string) => {
  const [installationRequests, setInstallationRequests] = useState<InstallationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debug, setDebug] = useState<DebugData>({
    authUser: null,
    lastFetchTime: null,
  });
  const { toast } = useToast();

  const fetchInstallationRequests = async () => {
    if (isRefreshing) return;
    
    setIsLoading(true);
    setIsRefreshing(true);
    
    try {
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
          
          // Prioritize customer data from the order table 
          // Only use "Unknown Customer" if both order and profile data are missing
          let customerName = "Unknown Customer";
          let customerPhone = "No Phone";
          let customerEmail = "No Email";
          
          // Check for order data first (from the debug tool or direct database)
          if (order.user_name) {
            customerName = order.user_name;
          } else if (profile?.firstName && profile?.lastName) {
            customerName = `${profile.firstName} ${profile.lastName}`;
          }
          
          if (order.user_phone) {
            customerPhone = order.user_phone;
          } else if (profile?.phone) {
            customerPhone = profile.phone;
          }
          
          if (order.user_email) {
            customerEmail = order.user_email;
          } else if (profile?.email) {
            customerEmail = profile.email;
          }
          
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

  // Update the status of an installation request
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

  // Schedule an appointment for installation
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
