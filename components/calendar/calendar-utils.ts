import type { Transition } from "framer-motion";
import { DAYS, SNAP_MINUTES } from "./calendar-types";

/**
 * Subtle scale animation for block enter/exit transitions.
 * Used by both DayView and WeekView for consistent animation behavior.
 */
export const blockAnimations = {
  initial: { scale: 0.96, opacity: 0.8 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 },
  transition: { duration: 0.12, ease: "easeOut" } satisfies Transition,
};

/**
 * Get an array of Date objects for each day of the week containing the reference date.
 * Week starts on Monday.
 */
export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);

  return DAYS.map((_, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return d;
  });
}

/**
 * Format an hour number (0-23) to a compact string like "12a", "12p", "1a", "1p"
 */
export function formatHour(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

/**
 * Format a Date to a full date string like "Monday, January 25"
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if an hour matches the current hour
 */
export function isCurrentHour(hour: number): boolean {
  return new Date().getHours() === hour;
}

/**
 * Snap a minute value to the nearest grid interval
 */
export function snapToGrid(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

/**
 * Format hour and optional minutes to a compact time string like "1p", "1:30p"
 */
export function formatEventTime(hour: number, minutes: number = 0): string {
  const h = hour % 12 || 12;
  const m = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : "";
  const ampm = hour < 12 ? "a" : "p";
  return `${h}${m}${ampm}`;
}

/**
 * Format total minutes from midnight to a compact time string.
 * Handles values > 1440 (next day) by normalizing to 0-1440 range.
 */
export function formatTimeFromMinutes(totalMinutes: number): string {
  // Normalize to 0-1440 range to handle overnight times
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return formatEventTime(hour, minutes);
}
