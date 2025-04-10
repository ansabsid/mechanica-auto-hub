
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/types/cart.types";
import { 
  getOrCreateUserCart, 
  fetchCartItemsById, 
  addItemToCart, 
  updateCartItemQuantity as updateItemQuantity, 
  removeCartItem, 
  clearCartItems,
  getCurrentSession,
  onAuthStateChange
} from "@/api/cartApi";

export { CartItem } from "@/types/cart.types";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get or create cart for the current user
  const getOrCreateCart = async () => {
    const { data: { session } } = await getCurrentSession();
    
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
      const cid = await getOrCreateUserCart(session.user.id);
      if (cid) {
        setCartId(cid);
      }
      return cid;
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
      const items = await fetchCartItemsById(cartIdValue);
      setCartItems(items);
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
      await addItemToCart(cartIdValue, partId, quantity);
      
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
      await updateItemQuantity(cartItemId, quantity);
      
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
      await removeCartItem(cartItemId);
      
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
      await clearCartItems(cartId);
      
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
      const { data: { session } } = await getCurrentSession();
      if (session?.user) {
        const cid = await getOrCreateCart();
        if (cid) {
          await fetchCartItems();
        }
      }
    };

    initCart();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
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
