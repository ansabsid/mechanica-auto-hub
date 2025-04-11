
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
    
    // Use the RPC function to get garages data with proper typing
    const { data: garagesData, error: garagesError } = await supabase
      .rpc('get_garages_for_part_bulk', { part_ids: partIds }) as unknown as { 
        data: Array<{
          part_id: number;
          id: string;
          name: string;
          location: string;
          installation_fee: number;
        }> | null;
        error: any;
      };
    
    if (garagesError) {
      console.error("Error fetching garages data:", garagesError);
      // Return the items without garage information if there's an error
      return data || [];
    }
    
    // Create a map of part_id to garages for quick lookup
    const partGaragesMap: Record<number, Garage[]> = {};
    
    // Check if garagesData is not null before processing
    if (garagesData) {
      garagesData.forEach((item) => {
        if (!partGaragesMap[item.part_id]) {
          partGaragesMap[item.part_id] = [];
        }
        partGaragesMap[item.part_id].push({
          id: item.id,
          name: item.name,
          location: item.location,
          installationFee: item.installation_fee
        });
      });
    }
    
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
    // Check if the item already exists in the cart WITH THE SAME INSTALLATION OPTIONS
    const { data: existingItems, error: checkError } = await (supabase
      .from('cart_items') as any)
      .select('*')
      .eq('cart_id', cartId)
      .eq('part_id', partId);
      
    if (checkError) throw checkError;
    
    // Check if we have an item with the same installation configuration
    const matchingItem = existingItems?.find(item => {
      // If both have installation data or both don't have installation data
      if (!!item.installation_data === !!installationOptions) {
        // If neither has installation data, they match
        if (!installationOptions) return true;
        
        // If both have installation data, check if they match
        return item.installation_data?.garageId === installationOptions.garageId;
      }
      return false;
    });
    
    if (matchingItem) {
      // Update quantity if the item with same installation options already exists
      const newQuantity = matchingItem.quantity + quantity;
      
      const { data: updatedItem, error: updateError } = await (supabase
        .from('cart_items') as any)
        .update({ quantity: newQuantity })
        .eq('id', matchingItem.id)
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
      
      // Check if the installation_data column exists - if not, modify the insert
      try {
        const { data: insertedItem, error: addError } = await (supabase
          .from('cart_items') as any)
          .insert(newItem)
          .select()
          .single();
          
        if (addError) throw addError;
        return insertedItem;
      } catch (error: any) {
        // If the error is about installation_data column not found,
        // try inserting without that field
        if (error.message?.includes("installation_data")) {
          // Fallback to inserting without installation data
          const basicItem = {
            cart_id: cartId,
            part_id: partId,
            quantity: quantity
          };
          
          const { data: basicInsertedItem, error: basicAddError } = await (supabase
            .from('cart_items') as any)
            .insert(basicItem)
            .select()
            .single();
            
          if (basicAddError) throw basicAddError;
          
          // For now, return the item without installation data
          console.log("Added item without installation data due to schema limitations");
          return basicInsertedItem;
        } else {
          throw error;
        }
      }
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
    // Using RPC function with proper type casting
    const { data, error } = await supabase
      .rpc('get_garages_for_part', { part_id_param: partId }) as unknown as {
        data: Array<{
          id: string;
          name: string;
          location: string;
          installation_fee: number;
        }> | null;
        error: any;
      };
    
    if (error) {
      console.error("RPC error:", error);
      
      // If RPC fails, return empty array
      console.error("Falling back to empty array due to RPC error");
      return [];
    }
    
    return (data || []).map((item) => ({
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
