import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format hours for display, limiting to 2 decimal places.
 * Removes trailing zeros for cleaner display (e.g., "2" not "2.00", "2.5" not "2.50").
 * Does not include the "h" suffix - add it at the call site if needed.
 */
export function formatHours(hours: number): string {
  // Round to 2 decimal places to avoid floating-point precision issues
  const rounded = Math.round(hours * 100) / 100;
  // Format and remove unnecessary trailing zeros
  return rounded.toFixed(2).replace(/\.?0+$/, "");
}
