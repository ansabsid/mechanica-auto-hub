
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
        status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled' | 'confirmed',
        created_at: order.created_at,
        updated_at: order.updated_at,
        user_name: order.user_name,
        user_email: order.user_email,
        user_phone: order.user_phone,
        shipping_address: order.shipping_address
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
    if (!orderId) {
      console.error("getOrderDetails called with empty orderId");
      return null;
    }
    
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
      .maybeSingle();
      
    if (orderError) {
      console.error("Error fetching order:", orderError.message, orderError);
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
    
    // Fetch order items directly
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
        installation_status
      `)
      .eq('order_id', orderId);
      
    if (itemsError) {
      console.error("Error fetching order items:", itemsError.message);
      throw itemsError;
    }
    
    console.log("Order items found:", itemsData?.length || 0);
    
    // Only try to fetch part and garage details if we have items
    const formattedItems: OrderItem[] = [];
    
    if (itemsData && itemsData.length > 0) {
      // Fetch parts details
      const partIds = itemsData.map(item => item.part_id);
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id, name, description')
        .in('id', partIds);
        
      if (partsError) {
        console.error("Error fetching parts:", partsError.message);
      }
      
      // Build a lookup object for parts
      const partsLookup: Record<number, { name: string; description?: string }> = {};
      if (partsData) {
        partsData.forEach(part => {
          partsLookup[part.id] = {
            name: part.name,
            description: part.description
          };
        });
      }
      
      // Fetch garages details for items with garage_id
      const garageIds = itemsData
        .filter(item => item.garage_id)
        .map(item => item.garage_id);
        
      let garagesLookup: Record<string, { name: string; location: string }> = {};
      
      if (garageIds.length > 0) {
        const { data: garagesData, error: garagesError } = await supabase
          .from('garages')
          .select('id, name, location')
          .in('id', garageIds);
          
        if (garagesError) {
          console.error("Error fetching garages:", garagesError.message);
        } else if (garagesData) {
          garagesData.forEach(garage => {
            garagesLookup[garage.id] = {
              name: garage.name,
              location: garage.location
            };
          });
        }
      }
      
      // Map items with part and garage details
      itemsData.forEach(item => {
        const formattedItem: OrderItem = {
          id: item.id,
          order_id: item.order_id,
          part_id: item.part_id,
          quantity: item.quantity,
          price: item.price,
          created_at: item.created_at,
          installation_fee: item.installation_fee || 0,
          installation_status: item.installation_status as any,
          scheduled_date: item.scheduled_date,
          scheduled_time: item.scheduled_time,
        };
        
        // Add part details if available
        if (partsLookup[item.part_id]) {
          formattedItem.part = partsLookup[item.part_id];
        }
        
        // Add garage details if available
        if (item.garage_id && garagesLookup[item.garage_id]) {
          formattedItem.garage_id = item.garage_id;
          formattedItem.garage = garagesLookup[item.garage_id];
        }
        
        formattedItems.push(formattedItem);
      });
    }
    
    // Format complete order with items
    const orderWithItems: Order = {
      id: orderData.id,
      user_id: orderData.user_id,
      total_amount: orderData.total_amount,
      status: orderData.status as 'pending' | 'processing' | 'completed' | 'cancelled' | 'confirmed',
      created_at: orderData.created_at,
      updated_at: orderData.updated_at,
      items: formattedItems,
      user_name: orderData.user_name,
      user_email: orderData.user_email,
      user_phone: orderData.user_phone,
      shipping_address: orderData.shipping_address
    };
    
    console.log("Returning formatted order with", formattedItems.length, "items");
    return orderWithItems;
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    throw error;
  }
}

/**
 * Creates a new order with items from the user's cart
 * Tries to use an RPC function first, falls back to manual transaction if unavailable
 * @param userId The UUID of the user placing the order
 * @param cartItems Array of cart items to convert to order items
 * @param totalAmount The total amount of the order
 * @param userDetails Optional user contact details for the order
 * @returns Promise resolving to the created order data
 */
export const createOrder = async (
  userId: string, 
  cartItems: CartItem[], 
  totalAmount: number,
  userDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
): Promise<Order | null> => {
  try {
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    console.log("🔍 [API] Creating order for user:", userId);
    console.log("🔍 [API] Order total amount:", totalAmount);
    console.log("🔍 [API] Cart items count:", cartItems.length);
    
    if (userDetails) {
      console.log("🔍 [API] User details provided:", userDetails);
    }

    // Debug: Check for installation data
    const installationItems = cartItems.filter(item => item.installation_data);
    console.log("🔍 [API] Items with installation:", installationItems.length);
    
    if (installationItems.length > 0) {
      installationItems.forEach(item => {
        console.log("🔍 [API] Installation details for part:", item.part_id, {
          part_name: item.part.name,
          garage: item.installation_data?.garageId,
          garageName: item.installation_data?.garageName,
          installationFee: item.installation_data?.installationFee
        });
      });
    }

    // Format order items
    const orderItems: CreateOrderItem[] = cartItems.map(item => ({
      part_id: item.part_id,
      garage_id: item.installation_data?.garageId || null,
      quantity: item.quantity,
      price: item.part.price || 0,
      installation_fee: item.installation_data?.installationFee || null
    }));
    
    // Create order manually (skip RPC for reliability)
    // 1. Create the order with initial status 'pending' and user details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        user_name: userDetails?.name || undefined,
        user_email: userDetails?.email || undefined,
        user_phone: userDetails?.phone || undefined,
        shipping_address: userDetails?.address || undefined
      })
      .select()
      .single();
    
    if (orderError) {
      console.error("🔍 [API] Error creating order:", orderError);
      throw orderError;
    }
    
    console.log("🔍 [API] Order created:", order.id);
    
    // 2. Create order items with installation data if available
    // Explicitly include installation_status for installation items
    const formattedItems = cartItems.map(item => ({
      order_id: order.id,
      part_id: item.part_id,
      garage_id: item.installation_data?.garageId || null,
      quantity: item.quantity,
      price: item.part.price,
      installation_fee: item.installation_data?.installationFee || null,
      installation_status: item.installation_data?.garageId ? 'new' : null
    }));
    
    console.log("🔍 [API] Creating order items:", formattedItems);
    
    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(formattedItems)
      .select();
    
    if (itemsError) {
      console.error("🔍 [API] Error creating order items:", itemsError);
      throw itemsError;
    }
    
    console.log("🔍 [API] Order items created:", createdItems);

    // 3. Verify the installation data was properly saved
    if (installationItems.length > 0) {
      // Log more details about the verification query
      console.log("🔍 [API] Verifying installation data was saved, querying with order_id:", order.id);
      
      // Run multiple verification queries to isolate issues
      console.log("🔍 [API] Verification query 1: All items for this order");
      const { data: allOrderItems, error: allOrderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
        
      if (allOrderItemsError) {
        console.error("🔍 [API] Error verifying all order items:", allOrderItemsError);
      } else {
        console.log("🔍 [API] All items for this order:", allOrderItems);
      }
      
      console.log("🔍 [API] Verification query 2: Items with garage_id for this order");
      const { data: verifyItems, error: verifyError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id)
        .not('garage_id', 'is', null);

      if (verifyError) {
        console.error("🔍 [API] Error verifying installation items:", verifyError);
      } else {
        console.log("🔍 [API] Verified installation items:", verifyItems);
        
        // Check for any discrepancies
        if (verifyItems.length !== installationItems.length) {
          console.error(`🔍 [API] Warning: Expected ${installationItems.length} installation items, but found ${verifyItems.length}`);
        }

        // Check each item individually
        verifyItems.forEach(item => {
          if (item.installation_status !== 'new') {
            console.error(`🔍 [API] Warning: Item ${item.id} has incorrect installation_status: ${item.installation_status}`);
          }
          
          console.log(`🔍 [API] Installation item in DB:`, {
            id: item.id,
            part_id: item.part_id,
            garage_id: item.garage_id,
            installation_status: item.installation_status,
            installation_fee: item.installation_fee
          });
        });
      }
      
      // Extra check: Items with missing installation_status
      console.log("🔍 [API] Verification query 3: Items with garage_id but no installation_status");
      const { data: incompleteItems, error: incompleteError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id)
        .not('garage_id', 'is', null)
        .is('installation_status', null);
        
      if (incompleteError) {
        console.error("🔍 [API] Error checking for incomplete installation items:", incompleteError);
      } else if (incompleteItems && incompleteItems.length > 0) {
        console.error("🔍 [API] Found incomplete installation items:", incompleteItems);
        
        // Try to fix these items
        for (const item of incompleteItems) {
          console.log(`🔍 [API] Attempting to fix incomplete installation item: ${item.id}`);
          
          const { error: fixError } = await supabase
            .from('order_items')
            .update({ installation_status: 'new' })
            .eq('id', item.id);
            
          if (fixError) {
            console.error(`🔍 [API] Error fixing item ${item.id}:`, fixError);
          } else {
            console.log(`🔍 [API] Successfully fixed item ${item.id}`);
          }
        }
      } else {
        console.log("🔍 [API] No incomplete installation items found");
      }
    }
    
    return {
      id: order.id,
      user_id: order.user_id,
      total_amount: order.total_amount,
      status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled' | 'confirmed',
      created_at: order.created_at,
      updated_at: order.updated_at,
      user_name: order.user_name,
      user_email: order.user_email,
      user_phone: order.user_phone,
      shipping_address: order.shipping_address
    };
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

// Function to check all orders with installation requests - Debug helper
export async function debugCheckAllInstallationRequests() {
  console.log("🔍 [DEBUG] Checking all installation requests in the database");
  
  try {
    // First, check if the order_items table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('order_items')
      .select('count(*)', { count: 'exact', head: true });
      
    if (tableError) {
      console.error("🔍 [DEBUG] Error checking order_items table:", tableError);
      return;
    }
    
    console.log("🔍 [DEBUG] order_items table exists:", tableInfo !== null);
    
    // Check all order items with garage_id (potential installations)
    const { data: garageItems, error: garageError } = await supabase
      .from('order_items')
      .select('*')
      .not('garage_id', 'is', null)
      .limit(50);
      
    if (garageError) {
      console.error("🔍 [DEBUG] Error checking items with garage_id:", garageError);
    } else {
      console.log(`🔍 [DEBUG] Found ${garageItems?.length || 0} order items with garage_id`);
      
      if (garageItems && garageItems.length > 0) {
        console.log("🔍 [DEBUG] Sample items with garage_id:", garageItems);
      }
    }
    
    // Check all items with installation_status
    const { data: installationItems, error: installationError } = await supabase
      .from('order_items')
      .select('*')
      .not('installation_status', 'is', null)
      .limit(50);
      
    if (installationError) {
      console.error("🔍 [DEBUG] Error checking items with installation_status:", installationError);
    } else {
      console.log(`🔍 [DEBUG] Found ${installationItems?.length || 0} order items with installation_status`);
      
      if (installationItems && installationItems.length > 0) {
        console.log("🔍 [DEBUG] Sample items with installation_status:", installationItems);
      }
    }
    
    // Check all garages (for reference)
    const { data: allGarages, error: garagesError } = await supabase
      .from('garages')
      .select('id, name, location')
      .limit(20);
      
    if (garagesError) {
      console.error("🔍 [DEBUG] Error checking garages:", garagesError);
    } else {
      console.log(`🔍 [DEBUG] Found ${allGarages?.length || 0} garages`);
      
      if (allGarages && allGarages.length > 0) {
        console.log("🔍 [DEBUG] Available garages:", allGarages);
      }
    }
    
    // Special check for Garage Masters
    const garageMastersId = "c64a9350-d34a-4903-b34c-16c0e4699a44";
    const { data: garageMasters, error: gmError } = await supabase
      .from('garages')
      .select('id, name, location')
      .eq('id', garageMastersId)
      .single();
      
    if (gmError) {
      console.error(`🔍 [DEBUG] Error checking for Garage Masters with ID ${garageMastersId}:`, gmError);
    } else {
      console.log("🔍 [DEBUG] Garage Masters info:", garageMasters);
      
      // Check if any items are assigned to this garage
      const { data: gmItems, error: gmItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('garage_id', garageMastersId)
        .limit(20);
        
      if (gmItemsError) {
        console.error("🔍 [DEBUG] Error checking items for Garage Masters:", gmItemsError);
      } else {
        console.log(`🔍 [DEBUG] Found ${gmItems?.length || 0} items for Garage Masters`);
        
        if (gmItems && gmItems.length > 0) {
          console.log("🔍 [DEBUG] Items for Garage Masters:", gmItems);
        }
      }
    }
    
  } catch (error) {
    console.error("🔍 [DEBUG] General error checking installation requests:", error);
  }
}
