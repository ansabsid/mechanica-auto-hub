
import { supabase } from "@/integrations/supabase/client";
import { CartItem, Cart, InstallationOptions, Garage } from "@/types/cart.types";

// Get user's cart or create a new one if it doesn't exist
export async function getUserCart(): Promise<Cart | null> {
  const { data } = await supabase.auth.getSession();
  
  if (!data.session?.user) {
    return null;
  }

  const userId = data.session.user.id;
  
  try {
    // Try to get the existing cart
    const { data: carts, error } = await (supabase
      .from('carts') as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (!error && carts) {
      return carts;
    }
    
    // Create a new cart if it doesn't exist
    const { data: newCart, error: createError } = await (supabase
      .from('carts') as any)
      .insert({ user_id: userId })
      .select()
      .single();
      
    if (createError) throw createError;
    return newCart;
  } catch (error) {
    console.error("Error getting/creating cart:", error);
    throw error;
  }
}

// Get all items in the cart with part details
export async function getCartItems(cartId: string): Promise<CartItem[]> {
  try {
    // Query to get cart items with part details
    const { data, error } = await (supabase
      .from('cart_items') as any)
      .select(`
        *,
        part:part_id (
          id,
          name,
          description,
          price,
          stock,
          garage_id
        )
      `)
      .eq('cart_id', cartId);
      
    if (error) throw error;
    
    // Get all part IDs from cart items to fetch available garages
    const partIds = data.map((item: any) => item.part.id);
    
    if (partIds.length === 0) {
      return []; // If no items in cart, return empty array
    }
    
    // Fetch garages that can install these parts
    // Using raw query to work around type issues with parts_garages table
    const { data: garagesData, error: garagesError } = await supabase
      .from('parts_garages')
      .select(`
        part_id,
        installation_fee,
        garage:garage_id (
          id,
          name,
          location
        )
      `)
      .in('part_id', partIds);
    
    if (garagesError) throw garagesError;
    
    // Create a map of part_id to garages for quick lookup
    const partGaragesMap = partIds.reduce((acc: any, partId: number) => {
      acc[partId] = garagesData.filter((pg: any) => pg.part_id === partId)
        .map((pg: any) => ({
          id: pg.garage.id,
          name: pg.garage.name,
          location: pg.garage.location,
          installationFee: pg.installation_fee
        }));
      return acc;
    }, {});
    
    // Add garages information to cart items
    const itemsWithGarages = data.map((item: any) => {
      const garages = partGaragesMap[item.part.id] || [];
      return {
        ...item,
        part: {
          ...item.part,
          availableGarages: garages
        }
      };
    });
    
    return itemsWithGarages || [];
  } catch (error) {
    console.error("Error getting cart items:", error);
    throw error;
  }
}

// Add a part to the cart
export async function addToCart(
  partId: number, 
  cartId: string, 
  quantity: number = 1,
  installationOptions?: InstallationOptions
): Promise<CartItem> {
  try {
    // Check if the item already exists in the cart
    const { data: existingItems, error: checkError } = await (supabase
      .from('cart_items') as any)
      .select('*')
      .eq('cart_id', cartId)
      .eq('part_id', partId)
      .is('installation_data', installationOptions ? null : installationOptions)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingItems) {
      // Update quantity if the item already exists
      const newQuantity = existingItems.quantity + quantity;
      
      const { data: updatedItem, error: updateError } = await (supabase
        .from('cart_items') as any)
        .update({ quantity: newQuantity })
        .eq('id', existingItems.id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      return updatedItem;
    } else {
      // Add new item to cart
      const newItem = {
        cart_id: cartId,
        part_id: partId,
        quantity: quantity,
        installation_data: installationOptions || null
      };
      
      const { data: insertedItem, error: addError } = await (supabase
        .from('cart_items') as any)
        .insert(newItem)
        .select()
        .single();
        
      if (addError) throw addError;
      return insertedItem;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

// Update the quantity of a cart item
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
  try {
    if (quantity <= 0) {
      // Delete the item if quantity is 0 or negative
      await removeFromCart(cartItemId);
      throw new Error("Item removed from cart");
    }
    
    const { data, error } = await (supabase
      .from('cart_items') as any)
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
}

// Remove an item from the cart
export async function removeFromCart(cartItemId: string): Promise<void> {
  try {
    const { error } = await (supabase
      .from('cart_items') as any)
      .delete()
      .eq('id', cartItemId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

// Clear all items from the cart
export async function clearCart(cartId: string): Promise<void> {
  try {
    const { error } = await (supabase
      .from('cart_items') as any)
      .delete()
      .eq('cart_id', cartId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

// Get available garages for a part
export async function getGaragesForPart(partId: number): Promise<Garage[]> {
  try {
    // Using raw query instead of typed query to work around type issues
    const { data, error } = await supabase
      .rpc('get_garages_for_part', { part_id_param: partId });
    
    if (error) {
      console.error("RPC error:", error);
      // Fallback to direct query if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('parts_garages')
        .select(`
          installation_fee,
          garage:garage_id (
            id,
            name,
            location
          )
        `)
        .eq('part_id', partId);
        
      if (fallbackError) throw fallbackError;
      
      return (fallbackData || []).map((item: any) => ({
        id: item.garage.id,
        name: item.garage.name,
        location: item.garage.location,
        installationFee: item.installation_fee
      }));
    }
    
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      installationFee: item.installation_fee
    }));
  } catch (error) {
    console.error("Error getting garages for part:", error);
    throw error;
  }
}

// Get user session
export async function getUserSession() {
  const { data } = await supabase.auth.getSession();
  return data;
}
