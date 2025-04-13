
import { supabase } from "@/integrations/supabase/client";
import { Cart } from "@/types/cart.types";
import { getUserSession } from "./auth";

/**
 * Gets the user's cart or creates a new one if it doesn't exist
 * @returns Promise resolving to the user's cart or null if no user is logged in
 */
export async function getUserCart(): Promise<Cart | null> {
  try {
    const sessionData = await getUserSession();
    
    if (!sessionData.session?.user) {
      console.log("No authenticated user found");
      return null;
    }

    const userId = sessionData.session.user.id;
    
    console.log("Getting cart for user:", userId);
    
    // Try to get an existing cart with an explicit where clause for user_id
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
    
    console.log("Cart query results:", data);
    
    // If we found a cart, return the first one (should only be one per user)
    if (data && data.length > 0) {
      console.log("Found existing cart:", data[0]);
      return data[0];
    }
    
    console.log("No existing cart, creating new cart for user:", userId);
    
    // Create a new cart with explicit user_id
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select();
      
    if (createError) {
      console.error("Error creating new cart:", createError);
      
      // If we get a unique violation error (cart already exists), try fetching again
      if (createError.code === '23505') {
        console.log("Cart might already exist due to race condition, trying to fetch again");
        const { data: reFetchData, error: reFetchError } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', userId);
          
        if (reFetchError) {
          console.error("Error fetching cart after race condition:", reFetchError);
          throw reFetchError;
        }
        
        if (reFetchData && reFetchData.length > 0) {
          console.log("Retrieved cart after race condition:", reFetchData[0]);
          return reFetchData[0];
        }
      }
      
      throw createError;
    }
    
    // Ensure we're getting the right data format back
    if (newCart && newCart.length > 0) {
      console.log("New cart created:", newCart[0]);
      return newCart[0];
    }
    
    console.error("Failed to create cart, no data returned");
    return null;
  } catch (error) {
    console.error("Error getting/creating cart:", error);
    throw error;
  }
}

/**
 * Clears all items from a cart
 * @param cartId The UUID of the cart to clear
 * @returns Promise resolving when the cart is cleared
 */
export async function clearCart(cartId: string): Promise<void> {
  try {
    console.log("Clearing cart with ID:", cartId);
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);
      
    if (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
    
    console.log("Cart cleared successfully");
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}
