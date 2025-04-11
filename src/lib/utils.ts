
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This utility helps manage complex class combinations with proper precedence
 * @param inputs Any number of class values to be combined
 * @returns A unified class string with conflicts properly resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric price value into AED (UAE Dirham) currency string
 * @param amount The numeric price to format
 * @returns Formatted price string with AED currency symbol and two decimal places
 */
export function formatPrice(amount: number): string {
  return `AED ${amount.toFixed(2)}`;
}
