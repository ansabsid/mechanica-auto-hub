
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Cart, CartItem } from "./types";
import { getUserCart, getCartItems, getUserSession } from "@/api/cart";

export const useCartData = () => {
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

      console.log("User is authenticated, getting cart for user:", sessionData.session.user.id);
      
      // Always attempt to create/get a cart for the authenticated user
      const userCart = await getUserCart();
      
      if (userCart) {
        console.log("User cart found, fetching items:", userCart);
        setCart(userCart);
        const items = await getCartItems(userCart.id);
        console.log(`Retrieved ${items.length} cart items:`, items);
        setCartItems(items);
      } else {
        console.log("No cart found for user, setting empty cart");
        setCart(null);
        setCartItems([]);
      }
    } catch (error: any) {
      console.error("Error fetching cart:", error.message);
      toast({
        title: "Error",
        description: "Failed to load your cart. Error: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    cart,
    cartItems,
    setCartItems,
    isLoading,
    fetchCart
  };
};
