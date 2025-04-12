
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

  // Fetch user's orders
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

  // Fetch a single order with its items
  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      const orderData = await getOrderDetails(orderId);
      setCurrentOrder(orderData);
      return orderData;
    } catch (error: any) {
      console.error("Error fetching order details:", error.message);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new order from cart items
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

    setIsProcessing(true);
    try {
      const orderData = await createOrder(session.user.id, cartItems, totalAmount);
      
      // Handle installation requests if any cart items have installation_data
      const itemsWithInstallation = cartItems.filter(item => item.installation_data);
      
      if (itemsWithInstallation.length > 0 && orderData && orderData.id) {
        // Process each item with installation data
        for (const item of itemsWithInstallation) {
          if (item.installation_data && item.installation_data.garageId) {
            // Update the order_items to include garage_id for installation
            const { error } = await supabase
              .from('order_items')
              .update({ 
                garage_id: item.installation_data.garageId,
                installation_fee: item.installation_data.installationFee
              })
              .eq('order_id', orderData.id)
              .eq('part_id', item.part_id);
              
            if (error) {
              console.error("Error updating order item with installation data:", error);
            }
          }
        }
      }
      
      toast({
        title: "Order created",
        description: "Your order has been placed successfully!",
      });
      
      // Refresh orders list
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

  // Cancel an order
  const handleCancelOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await cancelOrder(orderId);
      
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled",
      });
      
      // Refresh orders list
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

  return {
    orders,
    currentOrder,
    isLoading,
    isProcessing,
    fetchUserOrders,
    fetchOrderDetails,
    createOrder: handleCreateOrder,
    cancelOrder: handleCancelOrder,
  };
};
