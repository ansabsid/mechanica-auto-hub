import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { CartItem, Cart, InstallationOptions } from "@/types/cart.types";
import { 
  getUserCart, 
  getCartItems, 
  addToCart as apiAddToCart, 
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  getUserSession
} from "@/api/cartApi";

// Use 'export type' for re-exporting types when isolatedModules is enabled
export type { CartItem, Cart } from "@/types/cart.types";

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user's cart and items
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching cart data...");
      const sessionData = await getUserSession();
      
      if (!sessionData.session?.user) {
        // If user is not logged in, show an empty cart
        console.log("No user session, setting empty cart");
        setCart(null);
        setCartItems([]);
        return;
      }

      const userCart = await getUserCart();
      
      if (userCart) {
        console.log("User cart found, fetching items");
        setCart(userCart);
        const items = await getCartItems(userCart.id);
        console.log(`Retrieved ${items.length} cart items:`, items);
        setCartItems(items);
      }
    } catch (error: any) {
      console.error("Error fetching cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to load your cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Initialize cart
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add an item to the cart
  const addToCart = async (partId: number, quantity: number = 1, installationOptions?: InstallationOptions) => {
    try {
      console.log("Adding to cart:", {
        partId, 
        quantity, 
        installationOptions
      });
      
      const sessionData = await getUserSession();
      
      if (!sessionData.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please login to add items to cart",
          variant: "destructive",
        });
        return;
      }
      
      if (!cart) {
        console.log("No cart found, fetching cart");
        await fetchCart();
        if (!cart) {
          console.log("Still no cart after fetch, creating new cart");
          const newCart = await getUserCart();
          setCart(newCart);
          if (!newCart) {
            console.error("Failed to create new cart");
            toast({
              title: "Error",
              description: "Failed to create cart",
              variant: "destructive",
            });
            return;
          }
        }
      }
      
      const cartId = cart?.id;
      if (!cartId) {
        console.error("No cart ID available");
        toast({
          title: "Error",
          description: "Cart not available",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Adding to cart with ID:", cartId);
      const addedItem = await apiAddToCart(partId, cartId, quantity, installationOptions);
      console.log("Item added to cart:", addedItem);
      
      let message = "Item added to your cart";
      
      // Customize message based on whether this is a purchase with installation
      if (installationOptions?.installationRequired) {
        message = `Part with installation at ${installationOptions.garageName} added to cart`;
      }
      
      toast({
        title: "Added to cart",
        description: message,
      });
      
      // Refresh cart items
      await fetchCart();
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  };

  // Update quantity of a cart item
  const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      
      await apiUpdateCartItemQuantity(cartItemId, quantity);
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (error: any) {
      console.error("Error updating cart item:", error.message);
      // If the item was removed, refresh the cart
      if (error.message === "Item removed from cart") {
        fetchCart();
      } else {
        toast({
          title: "Error",
          description: "Failed to update cart item",
          variant: "destructive",
        });
      }
    }
  };

  // Remove an item from cart
  const removeFromCart = async (cartItemId: string) => {
    try {
      await apiRemoveFromCart(cartItemId);
      
      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      
      toast({
        title: "Removed from cart",
        description: "Item removed from your cart",
      });
    } catch (error: any) {
      console.error("Error removing from cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
      // Refresh cart to ensure it's in sync
      fetchCart();
    }
  };

  // Clear all items from cart
  const clearCart = async () => {
    if (!cart) return;
    
    try {
      await apiClearCart(cart.id);
      
      // Update local state
      setCartItems([]);
      
      toast({
        title: "Cart cleared",
        description: "All items removed from your cart",
      });
    } catch (error: any) {
      console.error("Error clearing cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  // Calculate total price of items in cart (including installation fees)
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      let itemTotal = item.part.price * item.quantity;
      
      // Add installation fee if applicable
      if (item.installation_data) {
        itemTotal += item.installation_data.installationFee;
      }
      
      return total + itemTotal;
    }, 0);
  };

  return {
    cart,
    cartItems,
    isLoading,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    calculateTotal,
    refreshCart: fetchCart,
  };
};
