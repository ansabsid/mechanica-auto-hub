
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

  // Function to fetch customer details directly from an order
  const fetchOrderCustomerDetails = async (orderId: string) => {
    try {
      console.log(`Fetching customer details for order: ${orderId}`);
      
      const { data, error } = await supabase
        .from('orders')
        .select('user_name, user_email, user_phone')
        .eq('id', orderId)
        .single();
        
      if (error) {
        console.error(`Error fetching customer details for order ${orderId}:`, error);
        return null;
      }
      
      console.log(`Customer details for order ${orderId}:`, data);
      return data;
    } catch (error) {
      console.error(`Error in fetchOrderCustomerDetails for ${orderId}:`, error);
      return null;
    }
  };

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
      setDebug(prev => ({ ...prev, orderIds }));
      
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
      
      // Map to store customer data fetched directly
      const customerDataMap = new Map();
      
      // For each order ID, fetch customer details directly to ensure we have the latest data
      for (const orderId of orderIds) {
        const customerData = await fetchOrderCustomerDetails(orderId);
        if (customerData) {
          customerDataMap.set(orderId, customerData);
        }
      }
      
      // Save the customer data for debugging
      setDebug(prev => ({ ...prev, customerDataFromOrders: Object.fromEntries(customerDataMap) }));
      
      // Map order items to installation requests for display
      const requests: InstallationRequest[] = await Promise.all(orderItemsData
        .map(async (item) => {
          // Get the corresponding order data
          const order = orderMap.get(item.order_id);
          
          // Debug: Store the order data for better troubleshooting
          setDebug(prev => ({ 
            ...prev, 
            [`orderData_${item.order_id}`]: order,
            orderData: order
          }));
          
          // Get corresponding part if available
          const part = partMap.get(item.part_id);
          
          // Get customer data that was fetched directly
          const directCustomerData = customerDataMap.get(item.order_id);
          
          // Default values - only use order data, no fallback to profiles
          let customerName = "Unknown Customer";
          let customerPhone = "No Phone";
          let customerEmail = "No Email";
          let customerSourceInfo = "Not found";
          
          // First try direct customer data
          if (directCustomerData) {
            if (directCustomerData.user_name) {
              customerName = directCustomerData.user_name;
              customerSourceInfo = "Direct Order Query (name)";
            }
            
            if (directCustomerData.user_email) {
              customerEmail = directCustomerData.user_email;
              customerSourceInfo = customerSourceInfo === "Not found" ? 
                "Direct Order Query (email)" : customerSourceInfo + " + email";
            }
            
            if (directCustomerData.user_phone) {
              customerPhone = directCustomerData.user_phone;
              customerSourceInfo = customerSourceInfo === "Not found" ? 
                "Direct Order Query (phone)" : customerSourceInfo + " + phone";
            }
          }
          // Then use data from the orders table
          else if (order) {
            if (order.user_name) {
              customerName = order.user_name;
              customerSourceInfo = "Order Table (name)";
            }
            
            if (order.user_email) {
              customerEmail = order.user_email;
              customerSourceInfo = customerSourceInfo === "Not found" ? 
                "Order Table (email)" : customerSourceInfo + " + email";
            }
            
            if (order.user_phone) {
              customerPhone = order.user_phone;
              customerSourceInfo = customerSourceInfo === "Not found" ? 
                "Order Table (phone)" : customerSourceInfo + " + phone";
            }
            
            // Debug logging for order data
            console.log(`Using order data for ${item.order_id}:`, {
              customerName,
              customerEmail,
              customerPhone,
              source: customerSourceInfo
            });
          } else {
            console.log(`No order found for order_id: ${item.order_id}`);
          }
          
          // Default order date to current date if not available
          const orderDate = order?.created_at ? 
            new Date(order.created_at).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
          
          const requestData = {
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
          
          // Final debug log for this request
          console.log(`Processed installation request for ${item.id}:`, requestData);
          
          return requestData;
        }));
      
      console.log("Processed installation requests with customer info:", requests);
      setDebug(prev => ({ 
        ...prev, 
        mappedRequests: requests, 
        requestsCount: requests.length,
        customerSourceSummary: requests.map(r => ({
          orderItemId: r.orderItemId,
          customerName: r.customerName,
          customerEmail: r.customerEmail,
          customerPhone: r.customerPhone,
          source: r.customerName !== "Unknown Customer" ? "Order Table" : "Not Found"
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
      setDebug(prev => ({ ...prev, lastFetchTime: new Date().toISOString() }));
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
