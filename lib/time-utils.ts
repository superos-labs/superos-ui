/**
 * Shared time formatting and parsing utilities.
 *
 * Consolidates time-related functions previously duplicated across
 * multiple backlog components.
 */

import type { EssentialSlot } from "@/lib/essentials";

// =============================================================================
// Day Labels
// =============================================================================

/** Short day labels (single letter) */
export const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** Full day labels (abbreviated) */
export const DAY_FULL_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

// =============================================================================
// Time Formatting
// =============================================================================

/**
 * Format minutes from midnight to 12-hour time string.
 * @example formatTime(450) // "7:30 AM"
 * @example formatTime(780) // "1:00 PM"
 */
export function formatTime(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  return `${hours12}:${mins.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format minutes to short 12-hour time (omits minutes if on the hour).
 * @example formatTimeShort(720) // "12 PM"
 * @example formatTimeShort(750) // "12:30 PM"
 */
export function formatTimeShort(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

  if (mins === 0) {
    return `${hours12} ${period}`;
  }
  return `${hours12}:${mins.toString().padStart(2, "0")} ${period}`;
}

// =============================================================================
// Time Parsing
// =============================================================================

/**
 * Parse a time string into minutes from midnight.
 * Supports formats: "7", "7:30", "7am", "7:30am", "7 AM", "7:30 AM", "19:30"
 * @returns minutes from midnight, or null if invalid
 */
export function parseTime(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toLowerCase();

  if (minutes < 0 || minutes > 59) return null;

  // 24-hour format (no AM/PM specified)
  if (!period && hours >= 0 && hours <= 23) {
    return hours * 60 + minutes;
  }

  // 12-hour format with AM/PM
  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === "pm" || period === "p") {
      if (hours !== 12) hours += 12;
    } else if (period === "am" || period === "a") {
      if (hours === 12) hours = 0;
    }
  }

  return hours * 60 + minutes;
}

// =============================================================================
// Day Formatting
// =============================================================================

/**
 * Format an array of day indices into a human-readable string.
 * @example formatDays([0, 1, 2, 3, 4]) // "Weekdays"
 * @example formatDays([5, 6]) // "Weekends"
 * @example formatDays([0, 2, 4]) // "Mon, Wed, Fri"
 */
export function formatDays(days: number[]): string {
  if (days.length === 0) return "";

  const sortedDays = [...days].sort((a, b) => a - b);

  // Check for common patterns
  if (sortedDays.length === 7) {
    return "Every day";
  }

  if (sortedDays.length === 5 && sortedDays.every((d, i) => d === i)) {
    return "Weekdays";
  }

  if (sortedDays.length === 2 && sortedDays[0] === 5 && sortedDays[1] === 6) {
    return "Weekends";
  }

  // Otherwise, list the days
  return sortedDays.map((d) => DAY_FULL_LABELS[d]).join(", ");
}

// =============================================================================
// Time Range Formatting
// =============================================================================

/**
 * Format a time range, optimizing for same-period times.
 * @example formatTimeRange(720, 60) // "12 – 1 PM"
 * @example formatTimeRange(660, 120) // "11 AM – 1 PM"
 */
export function formatTimeRange(
  startMinutes: number,
  durationMinutes: number,
): string {
  const endMinutes = startMinutes + durationMinutes;
  const startStr = formatTimeShort(startMinutes);
  const endStr = formatTimeShort(endMinutes);

  // If both are in same period, only show period once
  const startPeriod = startMinutes >= 720 ? "PM" : "AM";
  const endPeriod = endMinutes >= 720 ? "PM" : "AM";

  if (startPeriod === endPeriod) {
    const startWithoutPeriod = startStr.replace(` ${startPeriod}`, "");
    return `${startWithoutPeriod} – ${endStr}`;
  }

  return `${startStr} – ${endStr}`;
}

// =============================================================================
// Elapsed Time Formatting (for focus timers)
// =============================================================================

/**
 * Format milliseconds to elapsed time display (MM:SS or HH:MM:SS).
 * Hours are padded to 2 digits.
 * @example formatElapsedMs(90000) // "01:30"
 * @example formatElapsedMs(3661000) // "01:01:01"
 */
export function formatElapsedMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format milliseconds to compact elapsed time display (MM:SS or H:MM:SS).
 * Hours are NOT padded (more compact for UI elements).
 * @example formatElapsedMsCompact(90000) // "01:30"
 * @example formatElapsedMsCompact(3661000) // "1:01:01"
 */
export function formatElapsedMsCompact(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

// =============================================================================
// Schedule Summary Formatting
// =============================================================================

/**
 * Format all slots for an essential into a summary string.
 * Groups by day pattern, then lists time ranges.
 * @example formatScheduleSummary(slots) // "Every day, 12 – 1 PM, 7 – 8 PM"
 */
export function formatScheduleSummary(slots: EssentialSlot[]): string {
  if (slots.length === 0) return "Not scheduled";

  // Group slots by days pattern
  const byDaysPattern = new Map<string, EssentialSlot[]>();
  slots.forEach((slot) => {
    const key = [...slot.days].sort((a, b) => a - b).join(",");
    if (!byDaysPattern.has(key)) {
      byDaysPattern.set(key, []);
    }
    byDaysPattern.get(key)!.push(slot);
  });

  const summaries: string[] = [];

  byDaysPattern.forEach((groupSlots, daysKey) => {
    const days = daysKey.split(",").map(Number);
    const daysLabel = formatDays(days);
    const timeRanges = groupSlots
      .map((s) => formatTimeRange(s.startMinutes, s.durationMinutes))
      .join(", ");
    summaries.push(`${daysLabel}, ${timeRanges}`);
  });

  return summaries.join(" · ");
}
