
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
      
      // Fetch all orders in a single query
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, created_at, status, user_name, user_email, user_phone, shipping_address')
        .in('id', orderIds);
      
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setDebug(prev => ({ ...prev, ordersError }));
      }
      
      console.log("Fetched orders:", ordersData);
      setDebug(prev => ({ ...prev, ordersData, ordersCount: ordersData?.length || 0 }));
      
      // Create a map for quick order lookup
      const orderMap = new Map();
      if (ordersData && ordersData.length > 0) {
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
          // Get the corresponding order data
          const order = orderMap.get(item.order_id);
          
          // Store the order data in debug
          setDebug(prev => ({ 
            ...prev, 
            [`orderData_${item.order_id}`]: order
          }));
          
          // Get corresponding profile if available
          const profile = order?.user_id ? profileMap.get(order.user_id) : null;
          
          // Get corresponding part if available
          const part = partMap.get(item.part_id);
          
          // Enhanced logging for order customer data
          console.log(`Order ${item.order_id} customer data:`, {
            fromOrder: order ? {
              name: order.user_name,
              email: order.user_email,
              phone: order.user_phone
            } : 'No order data found',
            fromProfile: profile ? {
              name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
              email: profile.email,
              phone: profile.phone
            } : 'No profile data'
          });
          
          // PRIORITY: We will now prioritize getting customer info from the orders table first
          // Default values for customer info
          let customerName = "Unknown Customer";
          let customerPhone = "No Phone";
          let customerEmail = "No Email";
          let customerSourceInfo = "Not found";
          
          // First priority: Check for order data (always use this if available)
          if (order && order.user_name) {
            customerName = order.user_name;
            customerSourceInfo = "Order Table (name)";
          }
          
          if (order && order.user_email) {
            customerEmail = order.user_email;
            customerSourceInfo = customerSourceInfo === "Not found" ? 
              "Order Table (email)" : customerSourceInfo + " + email";
          }
          
          if (order && order.user_phone) {
            customerPhone = order.user_phone;
            customerSourceInfo = customerSourceInfo === "Not found" ? 
              "Order Table (phone)" : customerSourceInfo + " + phone";
          }
          
          // Second priority: Fall back to profile data ONLY if order data is missing
          if (customerName === "Unknown Customer" && profile && profile.firstName && profile.lastName) {
            customerName = `${profile.firstName} ${profile.lastName}`;
            customerSourceInfo = "Profile Table";
          }
          
          if (customerEmail === "No Email" && profile && profile.email) {
            customerEmail = profile.email;
            customerSourceInfo = customerSourceInfo === "Not found" ? 
              "Profile Table (email)" : customerSourceInfo + " + email";
          }
          
          if (customerPhone === "No Phone" && profile && profile.phone) {
            customerPhone = profile.phone;
            customerSourceInfo = customerSourceInfo === "Not found" ? 
              "Profile Table (phone)" : customerSourceInfo + " + phone";
          }
          
          // Default order date to current date if not available
          const orderDate = order?.created_at ? 
            new Date(order.created_at).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
          
          return {
            id: item.id,
            customerName,
            customerPhone,
            customerEmail,
            part: part?.name || `Part #${item.part_id}`,
            orderDate,
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
      setDebug(prev => ({ 
        ...prev, 
        mappedRequests: requests, 
        requestsCount: requests.length,
        customerSourceSummary: requests.map(r => ({
          orderItemId: r.orderItemId,
          customerName: r.customerName,
          customerEmail: r.customerEmail,
          customerPhone: r.customerPhone
        }))
      }));
      
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
