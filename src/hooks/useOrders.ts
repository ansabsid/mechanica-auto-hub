
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/hooks/useCart";

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  part_id: number;
  garage_id?: string;
  quantity: number;
  price: number;
  created_at: string;
  part?: {
    name: string;
    description?: string;
  };
}

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
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setOrders(data || []);
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
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          part:part_id (name, description)
        `)
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;
      
      const orderWithItems = {
        ...orderData,
        items: itemsData || [],
      };
      
      setCurrentOrder(orderWithItems);
      return orderWithItems;
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
  const createOrder = async (cartItems: CartItem[], totalAmount: number) => {
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
    // Start a transaction
    try {
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // 2. Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        part_id: item.part_id,
        garage_id: item.part.garage_id || null,
        quantity: item.quantity,
        price: item.part.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      toast({
        title: "Order created",
        description: "Your order has been placed successfully!",
      });
      
      // Refresh orders list
      await fetchUserOrders();
      return order;
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
  const cancelOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      
      if (error) throw error;
      
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
    createOrder,
    cancelOrder,
  };
};
