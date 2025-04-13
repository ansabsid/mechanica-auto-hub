
import { useState, useCallback, useEffect } from "react";
import { useCartData } from "./useCartData";
import { useCartActions } from "./useCartActions";
import { useCartCalculations } from "./useCartCalculations";
import { Cart, CartItem, InstallationOptions } from "./types";

/**
 * Custom hook for managing cart functionality
 */
export const useCart = () => {
  const { cart, cartItems, setCartItems, isLoading, fetchCart, lastError } = useCartData();
  const { addToCart, updateCartItemQuantity, removeFromCart, clearCart } = useCartActions(fetchCart, setCartItems);
  const { subtotal, tax, total, installationTotal, calculateTotal } = useCartCalculations(cartItems);

  // Refresh cart state
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Load cart data when the component mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    cartItems,
    isLoading,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    lastError,
    // Calculated values
    subtotal,
    tax,
    total,
    installationTotal,
    calculateTotal
  };
};
