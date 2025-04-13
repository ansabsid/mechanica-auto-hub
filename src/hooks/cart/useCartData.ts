
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Cart, CartItem } from "./types";
import { getUserCart, getCartItems, getUserSession } from "@/api/cart";

export const useCartData = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user's cart and items
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setLastError(null);
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

      console.log("User is authenticated, getting cart for user:", sessionData.session.user.id);
      
      // Always attempt to create/get a cart for the authenticated user
      const userCart = await getUserCart();
      
      if (userCart) {
        console.log("User cart found, fetching items:", userCart);
        setCart(userCart);
        
        try {
          const items = await getCartItems(userCart.id);
          console.log(`Retrieved ${items.length} cart items:`, items);
          setCartItems(items);
        } catch (cartItemsError: any) {
          console.error("Error fetching cart items:", cartItemsError.message || cartItemsError);
          setLastError(`Failed to load cart items: ${cartItemsError.message || "Unknown error"}`);
          setCartItems([]);
        }
      } else {
        console.log("No cart found for user, setting empty cart");
        setCart(null);
        setCartItems([]);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      console.error("Error fetching cart:", errorMessage);
      setLastError(`Failed to load cart: ${errorMessage}`);
      toast({
        title: "Error",
        description: "Failed to load your cart. Error: " + errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Log diagnostic information when component mounts or error changes
  useEffect(() => {
    if (lastError) {
      console.error("Cart error state:", { lastError, cartState: { cart, itemsCount: cartItems.length } });
    }
  }, [lastError, cart, cartItems]);

  return {
    cart,
    cartItems,
    setCartItems,
    isLoading,
    fetchCart,
    lastError
  };
};
