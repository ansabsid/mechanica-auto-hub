
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Part } from "@/hooks/useCarParts";

export interface CartItem {
  id: string;
  cart_id: string;
  part_id: number;
  quantity: number;
  part: Part;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch or create cart for the current user
  const getOrCreateCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please login to manage your cart",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Check if user already has a cart - using raw query to avoid type issues
      const { data: existingCarts, error: cartError } = await (supabase as any).rpc(
        'get_user_cart',
        { p_user_id: session.user.id }
      );
      
      if (cartError) {
        // Fallback to direct query
        const { data: cartsData, error: directError } = await (supabase
          .from('carts') as any)
          .select('*')
          .eq('user_id', session.user.id)
          .limit(1);
          
        if (directError) throw directError;
        
        if (cartsData && cartsData.length > 0) {
          setCartId(cartsData[0].id);
          return cartsData[0].id;
        }
        
        // Create new cart if none exists
        const { data: newCart, error: createError } = await (supabase
          .from('carts') as any)
          .insert({ user_id: session.user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        
        if (newCart) {
          setCartId(newCart.id);
          return newCart.id;
        }
        
        return null;
      }
      
      if (existingCarts && existingCarts.length > 0) {
        setCartId(existingCarts[0].id);
        return existingCarts[0].id;
      }
      
      // Create new cart if none exists using RPC
      const { data: newCart, error: createError } = await (supabase as any).rpc(
        'create_cart',
        { p_user_id: session.user.id }
      );
      
      if (createError) {
        // Fallback to direct insert
        const { data: insertData, error: insertError } = await (supabase
          .from('carts') as any)
          .insert({ user_id: session.user.id })
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        setCartId(insertData.id);
        return insertData.id;
      }
      
      if (newCart) {
        setCartId(newCart.id);
        return newCart.id;
      }
      
      return null;
    } catch (error: any) {
      console.error("Error getting or creating cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to initialize cart",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart items with part details
  const fetchCartItems = async () => {
    const cartIdValue = cartId || await getOrCreateCart();
    if (!cartIdValue) return;
    
    setIsLoading(true);
    try {
      // Using raw query to avoid type issues
      const { data, error } = await (supabase as any).rpc(
        'get_cart_items',
        { p_cart_id: cartIdValue }
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
          .eq('cart_id', cartIdValue);
          
        if (directError) throw directError;
        
        // Process the data to match CartItem interface
        if (directData) {
          const processedItems: CartItem[] = directData.map((item: any) => {
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
          
          setCartItems(processedItems);
        }
        return;
      }
      
      // Process the data to ensure it matches the CartItem interface
      if (data && Array.isArray(data)) {
        const validCartItems: CartItem[] = data.map((item: any) => {
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
        
        setCartItems(validCartItems);
      }
    } catch (error: any) {
      console.error("Error fetching cart items:", error.message);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (partId: number, quantity: number = 1) => {
    const cartIdValue = cartId || await getOrCreateCart();
    if (!cartIdValue) return;
    
    setIsLoading(true);
    try {
      // Using RPC to add item to cart
      const { error } = await (supabase as any).rpc(
        'add_item_to_cart',
        {
          p_cart_id: cartIdValue,
          p_part_id: partId,
          p_quantity: quantity
        }
      );
      
      if (error) {
        // Fallback to check and update/insert logic
        const { data: existingItems, error: checkError } = await (supabase
          .from('cart_items') as any)
          .select('*')
          .eq('cart_id', cartIdValue)
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
              cart_id: cartIdValue,
              part_id: partId,
              quantity,
            });
          
          if (insertError) throw insertError;
        }
      }
      
      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });
      
      // Refresh cart items
      await fetchCartItems();
    } catch (error: any) {
      console.error("Error adding to cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(cartItemId);
    
    setIsLoading(true);
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
      
      // Refresh cart items
      await fetchCartItems();
    } catch (error: any) {
      console.error("Error updating cart item:", error.message);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    setIsLoading(true);
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
      
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
      
      // Refresh cart items
      await fetchCartItems();
    } catch (error: any) {
      console.error("Error removing from cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all items from cart
  const clearCart = async () => {
    if (!cartId) return;
    
    setIsLoading(true);
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
      
      setCartItems([]);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error: any) {
      console.error("Error clearing cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.quantity * (item.part?.price || 0));
    }, 0);
  };

  // Initialize cart on auth state change
  useEffect(() => {
    const initCart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const cid = await getOrCreateCart();
        if (cid) {
          await fetchCartItems();
        }
      }
    };

    initCart();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await initCart();
      } else if (event === 'SIGNED_OUT') {
        setCartId(null);
        setCartItems([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    cartItems,
    isLoading,
    cartId,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    fetchCartItems,
    calculateTotal,
  };
};
