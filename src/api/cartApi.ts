
import { supabase } from "@/integrations/supabase/client";
import { CartItem, Cart } from "@/types/cart.types";

// Get or create a cart for the current user
export const getOrCreateUserCart = async (userId: string): Promise<string | null> => {
  try {
    // Check if user already has a cart - using raw query to avoid type issues
    const { data: existingCarts, error: cartError } = await (supabase as any).rpc(
      'get_user_cart',
      { p_user_id: userId }
    );
    
    if (cartError) {
      // Fallback to direct query
      const { data: cartsData, error: directError } = await (supabase
        .from('carts') as any)
        .select('*')
        .eq('user_id', userId)
        .limit(1);
        
      if (directError) throw directError;
      
      if (cartsData && cartsData.length > 0) {
        return cartsData[0].id;
      }
      
      // Create new cart if none exists
      const { data: newCart, error: createError } = await (supabase
        .from('carts') as any)
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (createError) throw createError;
      
      if (newCart) {
        return newCart.id;
      }
      
      return null;
    }
    
    if (existingCarts && existingCarts.length > 0) {
      return existingCarts[0].id;
    }
    
    // Create new cart if none exists using RPC
    const { data: newCart, error: createError } = await (supabase as any).rpc(
      'create_cart',
      { p_user_id: userId }
    );
    
    if (createError) {
      // Fallback to direct insert
      const { data: insertData, error: insertError } = await (supabase
        .from('carts') as any)
        .insert({ user_id: userId })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return insertData.id;
    }
    
    if (newCart) {
      return newCart.id;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error getting or creating cart:", error.message);
    throw error;
  }
};

// Fetch cart items with part details
export const fetchCartItemsById = async (cartId: string): Promise<CartItem[]> => {
  try {
    // Using raw query to avoid type issues
    const { data, error } = await (supabase as any).rpc(
      'get_cart_items',
      { p_cart_id: cartId }
    );
    
    if (error) {
      // Fallback to direct query
      const { data: directData, error: directError } = await (supabase
        .from('cart_items') as any)
        .select(`
          *,
          part:part_id (
            id, name, description, price, stock, 
            manufacturer_id, model_id, year,
            garage_id, garages:garage_id (name, location)
          )
        `)
        .eq('cart_id', cartId);
        
      if (directError) throw directError;
      
      // Process the data to match CartItem interface
      if (directData) {
        return directData.map((item: any) => {
          return {
            id: item.id,
            cart_id: item.cart_id,
            part_id: item.part_id,
            quantity: item.quantity,
            part: {
              id: item.part?.id || 0,
              name: item.part?.name || '',
              description: item.part?.description || null,
              price: item.part?.price || 0,
              stock: item.part?.stock || 0,
              manufacturer_id: item.part?.manufacturer_id || 0,
              model_id: item.part?.model_id || 0,
              year: item.part?.year || 0,
              garage_id: item.part?.garage_id || null,
              garages: item.part?.garages ? {
                name: item.part.garages.name || 'Unknown',
                location: item.part.garages.location || 'Unknown'
              } : null
            }
          };
        });
      }
      return [];
    }
    
    // Process the data to ensure it matches the CartItem interface
    if (data && Array.isArray(data)) {
      return data.map((item: any) => {
        return {
          id: item.id,
          cart_id: item.cart_id,
          part_id: item.part_id,
          quantity: item.quantity,
          part: {
            id: item.part?.id || 0,
            name: item.part?.name || '',
            description: item.part?.description || null,
            price: item.part?.price || 0,
            stock: item.part?.stock || 0,
            manufacturer_id: item.part?.manufacturer_id || 0,
            model_id: item.part?.model_id || 0,
            year: item.part?.year || 0,
            garage_id: item.part?.garage_id || null,
            garages: item.part?.garages ? {
              name: item.part.garages.name || 'Unknown',
              location: item.part.garages.location || 'Unknown'
            } : null
          }
        };
      });
    }
    
    return [];
  } catch (error: any) {
    console.error("Error fetching cart items:", error.message);
    throw error;
  }
};

// Add item to cart
export const addItemToCart = async (cartId: string, partId: number, quantity: number = 1): Promise<void> => {
  try {
    // Using RPC to add item to cart
    const { error } = await (supabase as any).rpc(
      'add_item_to_cart',
      {
        p_cart_id: cartId,
        p_part_id: partId,
        p_quantity: quantity
      }
    );
    
    if (error) {
      // Fallback to check and update/insert logic
      const { data: existingItems, error: checkError } = await (supabase
        .from('cart_items') as any)
        .select('*')
        .eq('cart_id', cartId)
        .eq('part_id', partId);
        
      if (checkError) throw checkError;
      
      if (existingItems && existingItems.length > 0) {
        // Update quantity if item already exists
        const newQuantity = existingItems[0].quantity + quantity;
        const { error: updateError } = await (supabase
          .from('cart_items') as any)
          .update({ quantity: newQuantity })
          .eq('id', existingItems[0].id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new item if it doesn't exist
        const { error: insertError } = await (supabase
          .from('cart_items') as any)
          .insert({
            cart_id: cartId,
            part_id: partId,
            quantity,
          });
        
        if (insertError) throw insertError;
      }
    }
  } catch (error: any) {
    console.error("Error adding to cart:", error.message);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (cartItemId: string, quantity: number): Promise<void> => {
  try {
    // Use RPC to update quantity
    const { error } = await (supabase as any).rpc(
      'update_cart_item_quantity',
      {
        p_cart_item_id: cartItemId,
        p_quantity: quantity
      }
    );
    
    if (error) {
      // Fallback to direct update
      const { error: updateError } = await (supabase
        .from('cart_items') as any)
        .update({ quantity })
        .eq('id', cartItemId);
        
      if (updateError) throw updateError;
    }
  } catch (error: any) {
    console.error("Error updating cart item:", error.message);
    throw error;
  }
};

// Remove item from cart
export const removeCartItem = async (cartItemId: string): Promise<void> => {
  try {
    // Use RPC to remove item
    const { error } = await (supabase as any).rpc(
      'remove_cart_item',
      { p_cart_item_id: cartItemId }
    );
    
    if (error) {
      // Fallback to direct delete
      const { error: deleteError } = await (supabase
        .from('cart_items') as any)
        .delete()
        .eq('id', cartItemId);
        
      if (deleteError) throw deleteError;
    }
  } catch (error: any) {
    console.error("Error removing from cart:", error.message);
    throw error;
  }
};

// Clear all items from cart
export const clearCartItems = async (cartId: string): Promise<void> => {
  try {
    // Use RPC to clear cart
    const { error } = await (supabase as any).rpc(
      'clear_cart',
      { p_cart_id: cartId }
    );
    
    if (error) {
      // Fallback to direct delete
      const { error: deleteError } = await (supabase
        .from('cart_items') as any)
        .delete()
        .eq('cart_id', cartId);
        
      if (deleteError) throw deleteError;
    }
  } catch (error: any) {
    console.error("Error clearing cart:", error.message);
    throw error;
  }
};

// Get current session
export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
};

// Subscribe to auth changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, { session }) => {
    callback(event, session);
  });
};
