
import { supabase } from "@/integrations/supabase/client";
import { CartItem, InstallationOptions } from "@/types/cart.types";
import { getUserCart } from "./carts";
import { getUserSession } from "./auth";

/**
 * Gets all items in a cart with their part details and available garages for installation
 * @param cartId The UUID of the cart to fetch items for
 * @returns Promise resolving to an array of cart items with part details
 */
export async function getCartItems(cartId: string): Promise<CartItem[]> {
  try {
    console.log("Fetching cart items for cart:", cartId);
    // Get all cart items with their part details
    const { data, error } = await supabase
      .from('cart_items')
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
      
    if (error) {
      console.error("Error fetching cart items:", error);
      throw error;
    }
    
    console.log("Cart items raw data:", data);
    
    // Get all part IDs from cart items to fetch available garages
    const partIds = data.map((item: any) => item.part.id);
    
    if (partIds.length === 0) {
      console.log("No items in cart, returning empty array");
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
      return data.map((item: any) => {
        // Ensure proper conversion of installation_data to InstallationOptions
        let parsedInstallationData: InstallationOptions | undefined = undefined;
        
        if (item.installation_data) {
          try {
            if (typeof item.installation_data === 'object' && item.installation_data !== null) {
              parsedInstallationData = {
                installationRequired: true,
                garageId: item.installation_data.garageId || "",
                garageName: item.installation_data.garageName || "",
                installationFee: Number(item.installation_data.installationFee) || 0
              };
            } else if (typeof item.installation_data === 'string') {
              const parsed = JSON.parse(item.installation_data);
              parsedInstallationData = {
                installationRequired: true,
                garageId: parsed.garageId || "",
                garageName: parsed.garageName || "",
                installationFee: Number(parsed.installationFee) || 0
              };
            }
          } catch (e) {
            console.error("Error parsing installation_data:", e);
          }
        }
        
        return {
          id: item.id,
          cart_id: item.cart_id,
          part_id: item.part_id,
          quantity: item.quantity,
          installation_data: parsedInstallationData,
          part: {
            ...item.part,
            availableGarages: []
          }
        };
      });
    }
    
    console.log("Garages data for parts:", garagesData);
    
    // Create a map of part_id to garages for quick lookup
    const partGaragesMap: Record<number, any[]> = {};
    
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
    
    // Add garages information to cart items and properly cast installation_data
    const itemsWithGarages: CartItem[] = data.map((item: any) => {
      const garages = partGaragesMap[item.part.id] || [];
      
      // Properly handle installation_data conversion to InstallationOptions
      let parsedInstallationData: InstallationOptions | undefined = undefined;
      
      if (item.installation_data) {
        try {
          // If it's already an object, use it directly
          if (typeof item.installation_data === 'object' && item.installation_data !== null) {
            parsedInstallationData = {
              installationRequired: true,
              garageId: item.installation_data.garageId || "",
              garageName: item.installation_data.garageName || "",
              installationFee: Number(item.installation_data.installationFee) || 0
            };
          } 
          // If it's a string, try to parse it as JSON
          else if (typeof item.installation_data === 'string') {
            const parsed = JSON.parse(item.installation_data);
            parsedInstallationData = {
              installationRequired: true,
              garageId: parsed.garageId || "",
              garageName: parsed.garageName || "",
              installationFee: Number(parsed.installationFee) || 0
            };
          }
        } catch (e) {
          console.error("Error parsing installation_data:", e);
        }
      }
      
      return {
        id: item.id,
        cart_id: item.cart_id,
        part_id: item.part_id,
        quantity: item.quantity,
        installation_data: parsedInstallationData,
        part: {
          ...item.part,
          availableGarages: garages
        }
      };
    });
    
    console.log("Cart items with garages:", itemsWithGarages);
    return itemsWithGarages;
  } catch (error) {
    console.error("Error getting cart items:", error);
    throw error;
  }
}

/**
 * Adds a part to the cart, with optional installation options
 * If the part is already in the cart with same installation options, updates the quantity instead
 * @param partId The ID of the part to add
 * @param cartId The UUID of the cart to add to
 * @param quantity The quantity to add (default: 1)
 * @param installationOptions Optional installation details
 * @returns Promise resolving to the created or updated cart item
 */
export async function addToCart(
  partId: number, 
  cartId: string, 
  quantity: number = 1,
  installationOptions?: InstallationOptions
): Promise<CartItem> {
  try {
    console.log("addToCart called with:", {
      partId,
      cartId,
      quantity,
      installationOptions
    });
    
    // Check if the item already exists in the cart WITH THE SAME INSTALLATION OPTIONS
    const { data: existingItems, error: checkError } = await (supabase
      .from('cart_items') as any)
      .select('*')
      .eq('cart_id', cartId)
      .eq('part_id', partId);
      
    if (checkError) {
      console.error("Error checking existing items:", checkError);
      throw checkError;
    }
    
    console.log("Existing cart items:", existingItems);
    
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
      console.log("Found matching item, updating quantity:", matchingItem);
      // Update quantity if the item with same installation options already exists
      const newQuantity = matchingItem.quantity + quantity;
      
      const { data: updatedItem, error: updateError } = await (supabase
        .from('cart_items') as any)
        .update({ quantity: newQuantity })
        .eq('id', matchingItem.id)
        .select()
        .single();
        
      if (updateError) {
        console.error("Error updating item quantity:", updateError);
        throw updateError;
      }
      
      console.log("Item quantity updated:", updatedItem);
      return updatedItem;
    } else {
      console.log("No matching item found, adding new item");
      // Add new item to cart
      const newItem = {
        cart_id: cartId,
        part_id: partId,
        quantity: quantity,
        installation_data: installationOptions || null
      };
      
      console.log("New item to insert:", newItem);
      
      // Insert new item with installation data
      const { data: insertedItem, error: addError } = await (supabase
        .from('cart_items') as any)
        .insert(newItem)
        .select()
        .single();
        
      if (addError) {
        console.error("Error adding to cart:", addError);
        throw addError;
      }
      
      console.log("New item inserted:", insertedItem);
      return insertedItem;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

/**
 * Updates the quantity of an item in the cart
 * If quantity is <= 0, removes the item from the cart
 * @param cartItemId The UUID of the cart item to update
 * @param quantity The new quantity to set
 * @returns Promise resolving to the updated cart item
 */
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

/**
 * Removes an item from the cart
 * @param cartItemId The UUID of the cart item to remove
 * @returns Promise resolving when the item is removed
 */
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
