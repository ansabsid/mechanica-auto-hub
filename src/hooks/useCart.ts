
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
      // Check if user already has a cart
      const { data: existingCarts, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(1);
      
      if (cartError) throw cartError;
      
      if (existingCarts && existingCarts.length > 0) {
        setCartId(existingCarts[0].id);
        return existingCarts[0].id;
      }
      
      // Create new cart if none exists
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: session.user.id })
        .select()
        .single();
      
      if (createError) throw createError;
      
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
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          part:part_id (
            id, name, description, price, stock, 
            manufacturer_id, model_id, year,
            garage_id, garages:garage_id (name, location)
          )
        `)
        .eq('cart_id', cartIdValue);
      
      if (error) throw error;
      
      // Process the data to ensure it matches the CartItem interface
      const validCartItems: CartItem[] = (data || []).map(item => {
        // Make sure part property conforms to the Part interface
        return {
          ...item,
          part: {
            ...item.part,
            garages: item.part.garages || null,
          },
        } as CartItem;
      });
      
      setCartItems(validCartItems);
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
      // Check if item already exists in cart
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartIdValue)
        .eq('part_id', partId);
      
      if (existingItems && existingItems.length > 0) {
        // Update quantity if item already exists
        const newQuantity = existingItems[0].quantity + quantity;
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItems[0].id);
        
        if (error) throw error;
      } else {
        // Insert new item if it doesn't exist
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartIdValue,
            part_id: partId,
            quantity,
          });
        
        if (error) throw error;
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
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);
      
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);
      
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);
      
      if (error) throw error;
      
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
