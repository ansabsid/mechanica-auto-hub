
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, CreateOrderItem } from "@/types/order.types";
import { CartItem } from "@/types/cart.types";

/**
 * Fetches all orders for a specific user
 * Tries to use an RPC function first, falls back to direct query if unavailable
 * @param userId The UUID of the user to fetch orders for
 * @returns Promise resolving to an array of Order objects
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    // Try to use the RPC function first
    const { data, error } = await (supabase as any).rpc('get_user_orders', {
      p_user_id: userId
    });
    
    if (error) {
      // Fallback to direct query
      const { data: ordersData, error: directError } = await (supabase
        .from('orders') as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
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
        
        return typedOrders;
      }
      return [];
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
 * Tries to use an RPC function first, falls back to direct queries if unavailable
 * @param orderId The UUID of the order to fetch
 * @returns Promise resolving to a complete Order object with items, or null if not found
 */
export async function getOrderDetails(orderId: string): Promise<Order | null> {
  try {
    // Try to get order details from RPC function
    const { data: orderData, error: orderError } = await (supabase as any).rpc('get_order', {
      p_order_id: orderId
    });
    
    if (orderError) {
      // Fallback to direct queries
      const { data: directOrderData, error: directOrderError } = await (supabase
        .from('orders') as any)
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (directOrderError) throw directOrderError;
      
      // Get order items with installation details
      const { data: itemsData, error: itemsError } = await (supabase
        .from('order_items') as any)
        .select(`
          *,
          part:part_id (name, description),
          garage:garage_id (name, location)
        `)
        .eq('order_id', orderId);
        
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
    }
    
    return null;
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
    
    // Try to create order using RPC
    const { data, error } = await (supabase as any).rpc('create_order_with_items', {
      p_user_id: userId,
      p_total_amount: totalAmount,
      p_items: JSON.stringify(orderItems)
    });
    
    if (error) {
      // Fallback to manual transaction
      // 1. Create the order
      const { data: order, error: orderError } = await (supabase
        .from('orders') as any)
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
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
      
      const { error: itemsError } = await (supabase
        .from('order_items') as any)
        .insert(formattedItems);
      
      if (itemsError) throw itemsError;
      
      return order;
    }
    
    return data;
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
    // Try to use RPC to cancel order
    const { error } = await (supabase as any).rpc('cancel_order', {
      p_order_id: orderId
    });
    
    if (error) {
      // Fallback to direct update
      const { error: updateError } = await (supabase
        .from('orders') as any)
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
}
