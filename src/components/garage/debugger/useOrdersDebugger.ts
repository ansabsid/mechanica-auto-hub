
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type OrderItem = {
  id: string;
  order_id: string;
  part_id: number;
  garage_id?: string;
  quantity?: number;
  price?: number;
  installation_status?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  installation_fee?: number;
};

export const useOrdersDebugger = () => {
  const [open, setOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const { toast } = useToast();
  
  const fetchOrderItems = async () => {
    setIsLoading(true);
    try {
      const garageId = "c64a9350-d34a-4903-b34c-16c0e4699a44";
      
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          part_id,
          garage_id,
          installation_status,
          scheduled_date,
          scheduled_time
        `)
        .eq('garage_id', garageId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      setOrderItems(items || []);
      setDebugInfo(prev => ({ ...prev, fetchedItems: items }));
      
      if (items && items.length > 0) {
        setSelectedItem(items[0]);
        setOrderId(items[0].order_id);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch installation orders",
        variant: "destructive"
      });
      setDebugInfo(prev => ({ ...prev, fetchError: error }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchOrderDetails = async (orderId: string) => {
    if (!orderId) return;
    
    setIsLoading(true);
    setOrderId(orderId);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setShowWarningAlert(false);
    
    try {
      console.log(`Fetching order details for ID: ${orderId}`);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
        
      if (orderError) {
        console.error("Error fetching order:", orderError);
        setDebugInfo(prev => ({ ...prev, orderError }));
      } else {
        console.log("Direct order data:", orderData);
        setDebugInfo(prev => ({ ...prev, directOrderData: orderData }));
      }
      
      let hasCustomerData = false;
      
      if (orderData && (orderData.user_name || orderData.user_email || orderData.user_phone)) {
        setCustomerName(orderData.user_name || '');
        setCustomerEmail(orderData.user_email || '');
        setCustomerPhone(orderData.user_phone || '');
        hasCustomerData = !!(orderData.user_name && orderData.user_email && orderData.user_phone);
        console.log("Found customer data in orders table:", {
          name: orderData.user_name,
          email: orderData.user_email,
          phone: orderData.user_phone
        });
        setDebugInfo(prev => ({ ...prev, customerSourceInfo: 'Found in orders table' }));
      } 
      else {
        console.log("No valid customer data in orders table. Order data:", orderData);
        setShowWarningAlert(true);
        setDebugInfo(prev => ({ ...prev, customerSourceInfo: 'Not found in orders table' }));
      }
      
      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .select(`
          id,
          part_id,
          installation_status,
          scheduled_date,
          scheduled_time,
          price,
          installation_fee
        `)
        .eq('order_id', orderId)
        .eq('garage_id', 'c64a9350-d34a-4903-b34c-16c0e4699a44')
        .maybeSingle();
        
      if (orderItemError) {
        console.error("Error fetching order item details:", orderItemError);
      } else {
        console.log("Order item details:", orderItem);
        setDebugInfo(prev => ({ ...prev, orderItemDetails: orderItem }));
        setSelectedItem(orderItem);
      }
      
      setDebugInfo(prev => ({
        ...prev,
        finalCustomerInfo: {
          name: customerName || '',
          email: customerEmail || '',
          phone: customerPhone || '',
          hasCompleteData: hasCustomerData
        }
      }));
      
    } catch (error) {
      console.error("Error in fetchOrderDetails:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      });
      setDebugInfo(prev => ({ ...prev, fetchOrderDetailsError: error }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectItem = (item: OrderItem) => {
    setSelectedItem(item);
    fetchOrderDetails(item.order_id);
  };
  
  const updateOrderCustomerInfo = async () => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "No order selected",
        variant: "destructive"
      });
      return;
    }
    
    if (!customerName || !customerEmail || !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all customer fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: checkOrder, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking order:", checkError);
        throw checkError;
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;
      
      console.log("Current user ID for order operations:", userId);
      
      if (!checkOrder) {
        console.log("Creating new order with customer info:", {
          id: orderId,
          user_id: userId,
          user_name: customerName,
          user_email: customerEmail,
          user_phone: customerPhone
        });
        
        let totalAmount = 0;
        if (selectedItem) {
          const price = Number(selectedItem.price) || 0;
          const installationFee = Number(selectedItem.installation_fee) || 0;
          totalAmount = price + installationFee;
          console.log("Calculated total amount:", totalAmount, "from price:", price, "and fee:", installationFee);
        }
        
        const { data: newOrder, error: createError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            user_name: customerName,
            user_email: customerEmail,
            user_phone: customerPhone,
            status: 'pending',
            total_amount: totalAmount || 0
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating order:", createError);
          throw createError;
        }
        
        console.log("Order created successfully:", newOrder);
        setDebugInfo(prev => ({ ...prev, createOrderResult: newOrder }));
        
        if (newOrder && newOrder.id) {
          console.log(`Updating order_items to use new order ID: ${newOrder.id} instead of ${orderId}`);
          
          const { error: updateItemError } = await supabase
            .from('order_items')
            .update({ order_id: newOrder.id })
            .eq('order_id', orderId)
            .eq('garage_id', 'c64a9350-d34a-4903-b34c-16c0e4699a44');
            
          if (updateItemError) {
            console.error("Error updating order items with new order ID:", updateItemError);
          } else {
            console.log("Successfully updated order items with new order ID");
            setOrderId(newOrder.id);
          }
        }
        
        toast({
          title: "Success",
          description: "Order created with customer information"
        });
        
        if (newOrder && newOrder.id) {
          await fetchOrderDetails(newOrder.id);
        }
        return;
      }
      
      console.log("Updating existing order with customer info:", {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      });
      
      const { data, error } = await supabase
        .from('orders')
        .update({
          user_name: customerName,
          user_email: customerEmail,
          user_phone: customerPhone
        })
        .eq('id', orderId)
        .select();
        
      if (error) throw error;
      
      console.log("Order updated successfully:", data);
      setDebugInfo(prev => ({ ...prev, updateResult: data }));
      
      toast({
        title: "Success",
        description: "Order customer information updated successfully"
      });
      
      await fetchOrderDetails(orderId);
      
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order customer information",
        variant: "destructive"
      });
      setDebugInfo(prev => ({ ...prev, updateError: error }));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchOrderItems();
    }
  }, [open]);

  return {
    open,
    setOpen,
    orderItems,
    selectedItem,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    isLoading,
    orderId,
    debugInfo,
    showWarningAlert,
    fetchOrderItems,
    handleSelectItem,
    updateOrderCustomerInfo
  };
};
