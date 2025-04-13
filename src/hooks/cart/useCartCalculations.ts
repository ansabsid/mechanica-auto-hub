import { CartItem } from "./types";

export const useCartCalculations = (cartItems: CartItem[]) => {
  // Calculate subtotal (just items, no installation)
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.part.price * item.quantity);
  }, 0);

  // Calculate installation total
  const installationTotal = cartItems.reduce((total, item) => {
    return total + (item.installation_data ? item.installation_data.installationFee : 0);
  }, 0);

  // Calculate tax (assuming 10% for simplicity)
  const taxRate = 0.1;
  const tax = (subtotal + installationTotal) * taxRate;
  
  // Calculate total price (including installation fees and tax)
  const total = subtotal + installationTotal + tax;

  // Original calculate total function (keeping for backward compatibility)
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
    subtotal,
    installationTotal,
    tax,
    total,
    calculateTotal
  };
};
