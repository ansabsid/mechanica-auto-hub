
import { CartItem } from "./types";

export const useCartCalculations = (cartItems: CartItem[]) => {
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
    calculateTotal
  };
};
