
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
    
    // Try to get an existing cart using maybeSingle to handle no results gracefully
    const { data: existingCart, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error("Error fetching cart:", fetchError);
      throw fetchError;
    }
    
    // If cart exists, return it
    if (existingCart) {
      console.log("Found existing cart:", existingCart);
      return existingCart;
    }
    
    console.log("No existing cart, creating new cart for user:", userId);
    // Create a new cart if it doesn't exist
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();
      
    if (createError) {
      console.error("Error creating new cart:", createError);
      
      // Handle case where the cart might already exist (race condition)
      if (createError.code === '23505') { // Unique violation error code
        console.log("Cart might already exist due to race condition, trying to fetch again");
        const { data: reFetchCart, error: reFetchError } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (reFetchError) {
          console.error("Error fetching cart after race condition:", reFetchError);
          throw reFetchError;
        }
        
        if (reFetchCart) {
          console.log("Retrieved cart after race condition:", reFetchCart);
          return reFetchCart;
        }
      }
      
      throw createError;
    }
    
    console.log("New cart created:", newCart);
    return newCart;
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
