/**
 * =============================================================================
 * File: time-range-utils.ts
 * =============================================================================
 *
 * Pure utility functions for resolving, formatting, and querying granular
 * (lazy) dates used on goal start dates and target dates.
 *
 * All functions are referentially transparent — the "current year" or
 * reference date is always passed explicitly so the helpers remain testable
 * and free of side effects.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Resolve month/quarter selections to concrete ISO date boundaries.
 * - Format a granular date for human-readable display.
 * - Determine which quarter a date falls in.
 * - Check whether a goal's date window overlaps a given range.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - React state management.
 * - Rendering UI.
 * - Persisting data.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses date-fns v4 for date arithmetic.
 * - "start" role resolves to the first day of a period; "end" resolves to
 *   the last day.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - resolveMonthDate
 * - resolveQuarterDate
 * - formatGranularDate
 * - getQuarterForDate
 * - getMonthLabel
 * - isActiveInRange
 */

import {
  format,
  parse,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  setMonth,
  setYear,
} from "date-fns";
import type { DateGranularity } from "./types";

// ============================================================================
// Types
// ============================================================================

/** The role a date plays — determines whether we resolve to period start or end. */
export type DateRole = "start" | "end";

// ============================================================================
// Resolution Helpers
// ============================================================================

/**
 * Convert a Date to an ISO date string (yyyy-MM-dd).
 */
function toISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Parse an ISO date string to a Date.
 */
function fromISO(iso: string): Date {
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : new Date();
}

/**
 * Resolve a month selection to an ISO date string.
 *
 * @param year  - Calendar year (e.g., 2026)
 * @param month - 0-indexed month (0 = January, 11 = December)
 * @param role  - "start" → first day, "end" → last day
 */
export function resolveMonthDate(
  year: number,
  month: number,
  role: DateRole,
): string {
  const base = setMonth(setYear(new Date(2000, 0, 1), year), month);
  return toISO(role === "start" ? startOfMonth(base) : endOfMonth(base));
}

/**
 * Resolve a quarter selection to an ISO date string.
 *
 * @param year    - Calendar year (e.g., 2026)
 * @param quarter - 1-indexed quarter (1 = Q1 Jan–Mar, 4 = Q4 Oct–Dec)
 * @param role    - "start" → first day, "end" → last day
 */
export function resolveQuarterDate(
  year: number,
  quarter: 1 | 2 | 3 | 4,
  role: DateRole,
): string {
  const firstMonthOfQuarter = (quarter - 1) * 3; // 0, 3, 6, 9
  const base = new Date(year, firstMonthOfQuarter, 1);
  return toISO(role === "start" ? startOfQuarter(base) : endOfQuarter(base));
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format a granular date for display.
 *
 * Examples:
 * - ("2026-03-15", "day")     → "Mar 15, 2026"
 * - ("2026-03-01", "month")   → "Mar 2026"
 * - ("2026-04-01", "quarter") → "Q2 2026"
 * - ("2026-06-30", "quarter") → "Q2 2026"
 */
export function formatGranularDate(
  isoDate: string,
  granularity: DateGranularity = "day",
): string {
  const date = fromISO(isoDate);

  switch (granularity) {
    case "quarter": {
      const q = getQuarterForDate(date);
      return `Q${q} ${date.getFullYear()}`;
    }
    case "month":
      return format(date, "MMM yyyy");
    case "day":
    default:
      return format(date, "MMM d, yyyy");
  }
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Determine which calendar quarter a date falls in (1–4).
 */
export function getQuarterForDate(date: Date): 1 | 2 | 3 | 4 {
  return (Math.floor(date.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
}

/**
 * Get the short label for a 0-indexed month.
 */
export function getMonthLabel(month: number): string {
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return labels[month] ?? "";
}

/**
 * Get the month range description for a quarter.
 */
export function getQuarterMonthRange(quarter: 1 | 2 | 3 | 4): string {
  const ranges: Record<number, string> = {
    1: "Jan – Mar",
    2: "Apr – Jun",
    3: "Jul – Sep",
    4: "Oct – Dec",
  };
  return ranges[quarter] ?? "";
}

/**
 * Check whether a goal's start/end window overlaps a given date range.
 * Useful for filtering goals into horizon views.
 *
 * @param goalStart - Goal's start date ISO string (or undefined = unbounded start)
 * @param goalEnd   - Goal's deadline/target date ISO string (or undefined = unbounded end)
 * @param windowStart - Window start ISO string
 * @param windowEnd   - Window end ISO string
 * @returns true if the goal's window intersects the given window
 */
export function isActiveInRange(
  goalStart: string | undefined,
  goalEnd: string | undefined,
  windowStart: string,
  windowEnd: string,
): boolean {
  // A goal with no dates is considered always active
  if (!goalStart && !goalEnd) return true;

  // Overlap check: goalStart <= windowEnd AND goalEnd >= windowStart
  const startOk = !goalStart || goalStart <= windowEnd;
  const endOk = !goalEnd || goalEnd >= windowStart;

  return startOk && endOk;
}
