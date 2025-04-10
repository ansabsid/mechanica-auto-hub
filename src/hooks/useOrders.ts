
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
      // Using direct from to avoid type errors
      const { data, error } = await supabase.rpc('get_user_orders', {
        p_user_id: session.user.id
      }) as any;
      
      if (error) {
        // Fallback to direct query
        const { data: ordersData, error: directError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }) as any;
          
        if (directError) throw directError;
        
        if (ordersData) {
          const typedOrders: Order[] = ordersData.map((order: any) => ({
            id: order.id,
            user_id: order.user_id,
            total_amount: order.total_amount,
            status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled',
            created_at: order.created_at,
            updated_at: order.updated_at
          }));
          
          setOrders(typedOrders);
        }
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Process RPC results
        const typedOrders: Order[] = data.map((order: any) => ({
          id: order.id,
          user_id: order.user_id,
          total_amount: order.total_amount,
          status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled',
          created_at: order.created_at,
          updated_at: order.updated_at
        }));
        
        setOrders(typedOrders);
      }
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
      // Get order details
      const { data: orderData, error: orderError } = await supabase.rpc('get_order', {
        p_order_id: orderId
      }) as any;
      
      if (orderError) {
        // Fallback to direct queries
        const { data: directOrderData, error: directOrderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single() as any;
          
        if (directOrderError) throw directOrderError;
        
        // Get order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            part:part_id (name, description)
          `)
          .eq('order_id', orderId) as any;
          
        if (itemsError) throw itemsError;
        
        // Format order with items
        const orderWithItems: Order = {
          id: directOrderData.id,
          user_id: directOrderData.user_id,
          total_amount: directOrderData.total_amount,
          status: directOrderData.status as 'pending' | 'processing' | 'completed' | 'cancelled',
          created_at: directOrderData.created_at,
          updated_at: directOrderData.updated_at,
          items: itemsData?.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            part_id: item.part_id,
            garage_id: item.garage_id,
            quantity: item.quantity,
            price: item.price,
            created_at: item.created_at,
            part: item.part ? {
              name: item.part.name,
              description: item.part.description
            } : undefined
          })) || []
        };
        
        setCurrentOrder(orderWithItems);
        return orderWithItems;
      }
      
      // Process RPC results if successful
      if (orderData) {
        const orderWithItems: Order = {
          id: orderData.id,
          user_id: orderData.user_id,
          total_amount: orderData.total_amount,
          status: orderData.status as 'pending' | 'processing' | 'completed' | 'cancelled',
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          items: orderData.items?.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            part_id: item.part_id,
            garage_id: item.garage_id,
            quantity: item.quantity,
            price: item.price,
            created_at: item.created_at,
            part: item.part ? {
              name: item.part.name,
              description: item.part.description
            } : undefined
          })) || []
        };
        
        setCurrentOrder(orderWithItems);
        return orderWithItems;
      }
      
      return null;
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
    // Start a transaction using RPC
    try {
      const orderItems = cartItems.map(item => ({
        part_id: item.part_id,
        garage_id: item.part.garage_id || null,
        quantity: item.quantity,
        price: item.part.price,
      }));
      
      const { data, error } = await supabase.rpc('create_order_with_items', {
        p_user_id: session.user.id,
        p_total_amount: totalAmount,
        p_items: JSON.stringify(orderItems)
      }) as any;
      
      if (error) {
        // Fallback to manual transaction
        // 1. Create the order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: session.user.id,
            total_amount: totalAmount,
            status: 'pending',
          })
          .select()
          .single() as any;
        
        if (orderError) throw orderError;
        
        // 2. Create order items
        const formattedItems = cartItems.map(item => ({
          order_id: order.id,
          part_id: item.part_id,
          garage_id: item.part.garage_id || null,
          quantity: item.quantity,
          price: item.part.price,
        }));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(formattedItems) as any;
        
        if (itemsError) throw itemsError;
        
        toast({
          title: "Order created",
          description: "Your order has been placed successfully!",
        });
        
        // Refresh orders list
        await fetchUserOrders();
        return order;
      }
      
      toast({
        title: "Order created",
        description: "Your order has been placed successfully!",
      });
      
      // Refresh orders list
      await fetchUserOrders();
      return data;
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
      // Use RPC to cancel order
      const { error } = await supabase.rpc('cancel_order', {
        p_order_id: orderId
      }) as any;
      
      if (error) {
        // Fallback to direct update
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId) as any;
        
        if (updateError) throw updateError;
      }
      
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
