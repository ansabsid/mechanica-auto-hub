
import { supabase } from "@/integrations/supabase/client";
import { CartItem, Cart } from "@/types/cart.types";

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
    // Modified query to properly join with parts table
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
    
    // Instead of querying a non-existent garages table, we'll mock the garage data for now
    // In a real implementation, you'd query a profiles table that has garage information or similar
    const itemsWithGarages = (data || []).map((item: any) => {
      if (item.part?.garage_id) {
        // Mock garage data based on the garage_id
        // This is a temporary solution until a proper garage table is set up
        return {
          ...item,
          part: {
            ...item.part,
            garages: {
              name: `Garage ${item.part.garage_id.substring(0, 4)}`,
              location: "Dubai, UAE"
            }
          }
        };
      }
      return item;
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
  installationOptions?: {
    installationRequired: boolean;
    garageId: string;
    garageName: string;
    installationFee: number;
  }
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

// Get user session
export async function getUserSession() {
  const { data } = await supabase.auth.getSession();
  return data;
}
