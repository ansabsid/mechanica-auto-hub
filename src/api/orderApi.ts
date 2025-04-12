
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, CreateOrderItem } from "@/types/order.types";
import { CartItem } from "@/types/cart.types";

/**
 * Fetches all orders for a specific user
 * Uses a direct query to get orders from the database
 * @param userId The UUID of the user to fetch orders for
 * @returns Promise resolving to an array of Order objects
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    console.log("Fetching orders for user:", userId);
    
    // Use direct query instead of RPC
    const { data: ordersData, error: directError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (directError) {
      console.error("Error fetching orders:", directError.message);
      throw directError;
    }
    
    if (ordersData) {
      console.log("Orders found:", ordersData.length);
      
      const typedOrders: Order[] = ordersData.map((order: any) => ({
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled',
        created_at: order.created_at,
        updated_at: order.updated_at
      }));
      
      return typedOrders;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

/**
 * Fetches details for a single order including all its items
 * @param orderId The UUID of the order to fetch
 * @returns Promise resolving to a complete Order object with items, or null if not found
 */
export async function getOrderDetails(orderId: string): Promise<Order | null> {
  try {
    console.log("Fetching order details for ID:", orderId);
    
    // Get session to check authentication
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Current auth session:", sessionData.session ? "Authenticated" : "Not authenticated");
    
    if (!sessionData.session) {
      console.error("No authenticated session when fetching order details");
      return null;
    }
    
    // Get order data with explicit logging
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error("Error fetching order:", orderError.message, orderError);
      
      // Check if it's a "not found" error
      if (orderError.code === 'PGRST116') {
        console.log("Order not found with ID:", orderId);
        return null;
      }
      
      throw orderError;
    }
    
    if (!orderData) {
      console.log("No order data returned for ID:", orderId);
      return null;
    }
    
    console.log("Order found:", orderData);
    
    // Verify the order belongs to the current user
    if (orderData.user_id !== sessionData.session.user.id) {
      console.error("Order user_id doesn't match current user. Order user:", orderData.user_id, "Current user:", sessionData.session.user.id);
      return null;
    }
    
    // Get order items with installation details - FIXED QUERY by properly nesting the select
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        part_id,
        garage_id,
        quantity,
        price,
        created_at,
        scheduled_date,
        scheduled_time,
        installation_fee,
        installation_status,
        part:parts(name, description),
        garage:garages(name, location)
      `)
      .eq('order_id', orderId);
      
    if (itemsError) {
      console.error("Error fetching order items:", itemsError.message);
      throw itemsError;
    }
    
    console.log("Order items found:", itemsData?.length || 0, "Raw data:", itemsData);
    
    // Format order with items
    const orderWithItems: Order = {
      id: orderData.id,
      user_id: orderData.user_id,
      total_amount: orderData.total_amount,
      status: orderData.status as 'pending' | 'processing' | 'completed' | 'cancelled',
      created_at: orderData.created_at,
      updated_at: orderData.updated_at,
      items: itemsData?.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        part_id: item.part_id,
        garage_id: item.garage_id,
        quantity: item.quantity,
        price: item.price,
        created_at: item.created_at,
        installation_fee: item.installation_fee,
        installation_status: item.installation_status,
        scheduled_date: item.scheduled_date,
        scheduled_time: item.scheduled_time,
        part: item.part ? {
          name: item.part.name,
          description: item.part.description
        } : undefined,
        garage: item.garage ? {
          name: item.garage.name,
          location: item.garage.location
        } : undefined
      })) || []
    };
    
    return orderWithItems;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

/**
 * Creates a new order with items from the user's cart
 * Tries to use an RPC function first, falls back to manual transaction if unavailable
 * @param userId The UUID of the user placing the order
 * @param cartItems Array of cart items to convert to order items
 * @param totalAmount The total amount of the order
 * @returns Promise resolving to the created order data
 */
export async function createOrder(userId: string, cartItems: CartItem[], totalAmount: number): Promise<any> {
  try {
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Format order items
    const orderItems: CreateOrderItem[] = cartItems.map(item => ({
      part_id: item.part_id,
      garage_id: item.installation_data?.garageId || null,
      quantity: item.quantity,
      price: item.part.price,
      installation_fee: item.installation_data?.installationFee || null
    }));
    
    // Create order manually (skip RPC for reliability)
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    console.log("Order created:", order.id);
    
    // 2. Create order items with installation data if available
    const formattedItems = cartItems.map(item => ({
      order_id: order.id,
      part_id: item.part_id,
      garage_id: item.installation_data?.garageId || null,
      quantity: item.quantity,
      price: item.part.price,
      installation_fee: item.installation_data?.installationFee || null,
      installation_status: item.installation_data?.garageId ? 'new' : null
    }));
    
    console.log("Creating order items:", formattedItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(formattedItems);
    
    if (itemsError) throw itemsError;
    
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Cancels an existing order by updating its status
 * Tries to use an RPC function first, falls back to direct update if unavailable
 * @param orderId The UUID of the order to cancel
 * @returns Promise resolving to void
 */
export async function cancelOrder(orderId: string): Promise<void> {
  try {
    // Do direct update instead of RPC for reliability
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
}
