
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { CartItem, InstallationOptions } from "./types";
import { 
  addToCart as apiAddToCart, 
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  getUserSession,
  getUserCart
} from "@/api/cart";

export const useCartActions = (
  refreshCart: () => Promise<void>,
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
) => {
  const { toast } = useToast();

  // Add an item to the cart
  const addToCart = useCallback(async (partId: number, quantity: number = 1, installationOptions?: InstallationOptions) => {
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
      
      console.log("User is authenticated:", sessionData.session.user.id);
      
      // Always attempt to create/get a cart for the authenticated user
      const userCart = await getUserCart();
      
      if (!userCart) {
        console.error("Failed to create or retrieve cart");
        toast({
          title: "Error",
          description: "Failed to create cart",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Using cart with ID:", userCart.id);
      
      // Now that we definitely have a cart, add the item
      const addedItem = await apiAddToCart(partId, userCart.id, quantity, installationOptions);
      console.log("Item successfully added to cart:", addedItem);
      
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
      await refreshCart();
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  }, [toast, refreshCart]);

  // Update quantity of a cart item
  const updateCartItemQuantity = useCallback(async (cartItemId: string, quantity: number) => {
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
      
      // Force refresh cart items to ensure we're in sync with the server
      await refreshCart();
    } catch (error: any) {
      console.error("Error updating cart item:", error.message);
      // If the item was removed, refresh the cart
      if (error.message === "Item removed from cart") {
        refreshCart();
      } else {
        toast({
          title: "Error",
          description: "Failed to update cart item",
          variant: "destructive",
        });
      }
    }
  }, [toast, refreshCart, setCartItems]);

  // Remove an item from cart
  const removeFromCart = useCallback(async (cartItemId: string) => {
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
      refreshCart();
    }
  }, [toast, refreshCart, setCartItems]);

  // Clear all items from cart
  const clearCart = useCallback(async (cartId: string | undefined) => {
    if (!cartId) return;
    
    try {
      await apiClearCart(cartId);
      
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
  }, [toast, setCartItems]);

  return {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart
  };
};
