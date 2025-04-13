
import { useEffect } from "react";
import { useCartData } from "./useCartData";
import { useCartActions } from "./useCartActions";
import { useCartCalculations } from "./useCartCalculations";

// Re-export types
export type { CartItem, Cart, InstallationOptions } from "./types";

export const useCart = () => {
  const { cart, cartItems, setCartItems, isLoading, fetchCart } = useCartData();
  
  const { addToCart, updateCartItemQuantity, removeFromCart, clearCart } = 
    useCartActions(fetchCart, setCartItems);
  
  const { calculateTotal } = useCartCalculations(cartItems);

  // Force refresh whenever the component using the hook mounts
  useEffect(() => {
    console.log("useCart hook mounted, fetching cart");
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    cartItems,
    isLoading,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart: () => clearCart(cart?.id),
    calculateTotal,
    refreshCart: fetchCart,
  };
};
