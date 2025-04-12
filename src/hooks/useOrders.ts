
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserOrders, getOrderDetails, createOrder, cancelOrder } from "@/api/orderApi";
import { Order } from "@/types/order.types";
import { CartItem } from "@/types/cart.types";

export type { Order, OrderItem } from "@/types/order.types";

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchUserOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your orders",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userOrders = await getUserOrders(session.user.id);
      setOrders(userOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error.message);
      toast({
        title: "Error",
        description: "Failed to load your orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    if (!orderId) {
      console.error("fetchOrderDetails called with empty orderId");
      toast({
        title: "Error",
        description: "Missing order ID",
        variant: "destructive",
      });
      return null;
    }
    
    console.log("fetchOrderDetails called for order:", orderId);
    setIsLoading(true);
    
    try {
      // Only clear current order if we're fetching a different order
      if (currentOrder?.id !== orderId) {
        setCurrentOrder(null);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.error("No authenticated user found when fetching order");
        toast({
          title: "Authentication required",
          description: "Please login to view order details",
          variant: "destructive",
        });
        setIsLoading(false);
        return null;
      }
      
      console.log("Fetching order with auth user:", session.user.id, "for order ID:", orderId);
      
      const orderData = await getOrderDetails(orderId);
      console.log("Order data received:", orderData);
      
      if (!orderData) {
        console.error("No order data returned for ID:", orderId);
        toast({
          title: "Order not found",
          description: `The requested order (${orderId}) could not be found`,
          variant: "destructive",
        });
        setIsLoading(false);
        return null;
      }
      
      if (orderData.user_id !== session.user.id) {
        console.error("Order user_id doesn't match current user");
        toast({
          title: "Access denied",
          description: "You don't have permission to view this order",
          variant: "destructive",
        });
        setIsLoading(false);
        return null;
      }
      
      setCurrentOrder(orderData);
      
      // Check if order should be confirmed based on installation status
      if (orderData.status === 'pending') {
        const hasScheduledInstallation = orderData.items?.some(item => 
          item.installation_status === 'scheduled' && item.scheduled_date && item.scheduled_time
        );
        
        if (hasScheduledInstallation) {
          console.log("Order has scheduled installation, updating status to confirmed:", orderId);
          await confirmOrderWithScheduledInstallation(orderId);
          
          // Update the current order status in memory
          setCurrentOrder({
            ...orderData,
            status: 'confirmed'
          });
        } else {
          // Continue with the usual auto-confirmation check
          updateOrderStatusBasedOnInstallation(orderData.id);
        }
      }
      
      return orderData;
    } catch (error: any) {
      console.error("Error fetching order details:", error.message, error);
      toast({
        title: "Error",
        description: "Failed to load order details: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // New function to confirm orders with scheduled installations
  const confirmOrderWithScheduledInstallation = async (orderId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);
        
      if (updateError) {
        console.error("Error confirming order with scheduled installation:", updateError);
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      } else {
        console.log("Order confirmed successfully after finding scheduled installation:", orderId);
        toast({
          title: "Order status updated",
          description: "Order has been confirmed",
        });
      }
    } catch (error: any) {
      console.error("Error in confirmOrderWithScheduledInstallation:", error);
    }
  };

  // Check if order has items with installation and update status accordingly
  const updateOrderStatusBasedOnInstallation = async (orderId: string) => {
    try {
      console.log("Checking if order needs to be auto-confirmed:", orderId);
      
      // First, fetch order items to check if any have installation
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('installation_status, garage_id')
        .eq('order_id', orderId);
        
      if (itemsError) {
        console.error("Error fetching order items for status check:", itemsError);
        return;
      }
      
      // If no items have installation (no garage_id), auto-confirm the order
      const hasInstallationItems = items.some(item => item.garage_id !== null);
      
      if (!hasInstallationItems) {
        console.log("Order has no installation items, auto-confirming:", orderId);
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', orderId);
          
        if (updateError) {
          console.error("Error auto-confirming order:", updateError);
        } else {
          console.log("Order auto-confirmed successfully:", orderId);
          
          // Refresh current order if it's the one being viewed
          if (currentOrder && currentOrder.id === orderId) {
            fetchOrderDetails(orderId);
          }
        }
      } else {
        console.log("Order has installation items, will wait for scheduling:", orderId);
      }
    } catch (error: any) {
      console.error("Error in updateOrderStatusBasedOnInstallation:", error);
    }
  };

  const handleCreateOrder = async (cartItems: CartItem[], totalAmount: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please login to complete your order",
        variant: "destructive",
      });
      return null;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return null;
    }

    console.log("🔍 [Order Creation] Cart items being ordered:", cartItems);
    const installationItems = cartItems.filter(item => item.installation_data);
    console.log("🔍 [Order Creation] Items with installation:", installationItems);
    
    if (installationItems.length > 0) {
      console.log("🔍 [Order Creation] Installation garages:", 
        installationItems.map(item => ({
          garageId: item.installation_data?.garageId,
          garageName: item.installation_data?.garageName,
          fee: item.installation_data?.installationFee
        }))
      );
    }

    setIsProcessing(true);
    try {
      const orderData = await createOrder(session.user.id, cartItems, totalAmount);
      
      const itemsWithInstallation = cartItems.filter(item => item.installation_data);
      
      console.log("Items with installation:", itemsWithInstallation);
      
      if (itemsWithInstallation.length > 0 && orderData && orderData.id) {
        console.log("🔍 [Order Creation] Processing installation items for order:", orderData.id);
        
        for (const item of itemsWithInstallation) {
          if (item.installation_data && item.installation_data.garageId) {
            console.log(`🔍 [Order Creation] Setting installation data for part ${item.part_id}:`, {
              garage_id: item.installation_data.garageId,
              installation_fee: item.installation_data.installationFee,
              part_name: item.part.name
            });
            
            const { data, error } = await supabase
              .from('order_items')
              .update({ 
                garage_id: item.installation_data.garageId,
                installation_fee: item.installation_data.installationFee,
                installation_status: 'new'
              })
              .eq('order_id', orderData.id)
              .eq('part_id', item.part_id);
              
            if (error) {
              console.error("🔍 [Order Creation] Error updating order item with installation data:", error);
            } else {
              console.log("🔍 [Order Creation] Successfully updated order item with installation data:", data);
              
              const { data: verifyData, error: verifyError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderData.id)
                .eq('part_id', item.part_id)
                .single();
              
              if (verifyError) {
                console.error("🔍 [Order Creation] Error verifying order item update:", verifyError);
              } else {
                console.log("🔍 [Order Creation] Verified order item data:", verifyData);
                
                if (verifyData.garage_id !== item.installation_data.garageId) {
                  console.error("🔍 [Order Creation] Warning: Garage ID mismatch! Expected:", item.installation_data.garageId, "Got:", verifyData.garage_id);
                }
                
                if (verifyData.installation_status !== 'new') {
                  console.error("🔍 [Order Creation] Warning: Installation status not set to 'new'! Current value:", verifyData.installation_status);
                }
              }
            }
          }
        }
      }
      
      toast({
        title: "Order created",
        description: "Your order has been placed successfully!",
      });
      
      // Auto-confirm order if no installation is needed
      if (orderData && orderData.id) {
        updateOrderStatusBasedOnInstallation(orderData.id);
      }
      
      await fetchUserOrders();
      return orderData;
    } catch (error: any) {
      console.error("Error creating order:", error.message);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await cancelOrder(orderId);
      
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled",
      });
      
      await fetchUserOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error.message);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateInstallationSchedule = async (
    orderItemId: string, 
    scheduledDate: string, 
    scheduledTime: string,
    orderId: string
  ) => {
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ 
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          installation_status: 'scheduled'
        })
        .eq('id', orderItemId);
        
      if (updateError) {
        console.error("Error updating installation schedule:", updateError);
        toast({
          title: "Error",
          description: "Failed to schedule installation",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      // Update the order status to confirmed when installation is scheduled
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);
        
      if (orderUpdateError) {
        console.error("Error updating order status:", orderUpdateError);
        toast({
          title: "Warning",
          description: "Installation scheduled, but failed to update order status",
          variant: "destructive",
        });
      } else {
        console.log("Order status updated to confirmed:", orderId);
        
        // Refresh current order if it's the one being viewed
        if (currentOrder && currentOrder.id === orderId) {
          fetchOrderDetails(orderId);
        }
      }
      
      toast({
        title: "Installation scheduled",
        description: `Installation scheduled for ${scheduledDate} at ${scheduledTime}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error scheduling installation:", error.message);
      toast({
        title: "Error",
        description: "Failed to schedule installation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    currentOrder,
    isLoading,
    isProcessing,
    fetchUserOrders,
    fetchOrderDetails,
    createOrder: handleCreateOrder,
    cancelOrder: handleCancelOrder,
    updateInstallationSchedule,
    updateOrderStatusBasedOnInstallation,
    confirmOrderWithScheduledInstallation  // Export the new function
  };
};
