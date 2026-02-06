/**
 * =============================================================================
 * File: utils.ts
 * =============================================================================
 *
 * Small, shared utility helpers.
 *
 * Includes:
 * - Class name composition helper (clsx + tailwind-merge).
 * - Hour formatting helpers for analytics and UI display.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Merge conditional Tailwind class names safely.
 * - Format numeric hour values for human-readable display.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Keep this file minimal and generic.
 * - Prefer colocating domain-specific utilities near their features.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - cn
 * - formatHours
 * - formatHoursWithUnit
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format hours for display, limiting to 1 decimal place.
 * Removes trailing zeros for cleaner display (e.g., "2" not "2.0", "2.5" stays "2.5").
 * Does not include the "h" suffix - add it at the call site if needed.
 */
export function formatHours(hours: number): string {
  // Round to 1 decimal place
  const formatted = hours.toFixed(1);
  // Remove trailing .0 for whole numbers
  return formatted.endsWith(".0") ? Math.round(hours).toString() : formatted;
}

/**
 * Format hours for display with "h" suffix.
 * Convenience wrapper around formatHours() for common UI patterns.
 * @example formatHoursWithUnit(2.5) // "2.5h"
 * @example formatHoursWithUnit(3.0) // "3h"
 * @example formatHoursWithUnit(0) // "0h"
 */
export function formatHoursWithUnit(hours: number): string {
  return `${formatHours(hours)}h`;
}
