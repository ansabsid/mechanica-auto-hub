
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price to AED currency
export function formatPrice(amount: number): string {
  return `AED ${amount.toFixed(2)}`;
}
