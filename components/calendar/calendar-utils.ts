import type { Transition } from "framer-motion";
import type { WeekStartDay } from "@/lib/preferences";
import {
  SNAP_MINUTES,
  MAX_OVERLAP_COLUMNS,
  type EventDaySegment,
  type OverlapLayout,
} from "./calendar-types";

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
 * @param referenceDate - The date to get the week for (defaults to today)
 * @param weekStartsOn - Which day the week starts on (0 = Sunday, 1 = Monday, defaults to 1)
 */
export function getWeekDates(
  referenceDate: Date = new Date(),
  weekStartsOn: WeekStartDay = 1
): Date[] {
  const date = new Date(referenceDate);
  const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate the offset to the start of the week
  // For Monday start (1): Sunday (0) goes back 6 days, Monday (1) stays, etc.
  // For Sunday start (0): Sunday (0) stays, Monday (1) goes back 1 day, etc.
  let daysToSubtract: number;
  if (weekStartsOn === 1) {
    // Monday start
    daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
  } else {
    // Sunday start
    daysToSubtract = currentDay;
  }

  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - daysToSubtract);

  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + index);
    return d;
  });
}

/**
 * Get the ISO date string (YYYY-MM-DD) for a day in the week.
 */
export function getDateForDayIndex(weekDates: Date[], dayIndex: number): string {
  return weekDates[dayIndex].toISOString().split("T")[0];
}

/**
 * Get the day index (0-6) from an ISO date string.
 * @param date - ISO date string (e.g., "2026-01-27")
 * @param weekStartsOn - Which day the week starts on (0 = Sunday, 1 = Monday, defaults to 1)
 * @returns Day index where 0 is the first day of the week
 */
export function getDayIndexFromDate(date: string, weekStartsOn: WeekStartDay = 1): number {
  const d = new Date(date + "T00:00:00"); // Ensure consistent parsing
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (weekStartsOn === 1) {
    // Monday start: Mon=0, Tue=1, ..., Sun=6
    return day === 0 ? 6 : day - 1;
  } else {
    // Sunday start: Sun=0, Mon=1, ..., Sat=6
    return day;
  }
}

/**
 * Check if a date falls within a week (inclusive).
 */
export function isDateInWeek(date: string, weekDates: Date[]): boolean {
  const weekStart = weekDates[0].toISOString().split("T")[0];
  const weekEnd = weekDates[6].toISOString().split("T")[0];
  return date >= weekStart && date <= weekEnd;
}

/**
 * Format a week range for display, e.g., "Jan 20 – 26" or "Jan 27 – Feb 2"
 */
export function formatWeekRange(weekDates: Date[]): string {
  const start = weekDates[0];
  const end = weekDates[6];
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`;
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

// ============================================================================
// Overlap layout calculation
// ============================================================================

/**
 * Check if two time ranges overlap.
 * Touching edges (end === start) are NOT considered overlapping.
 */
function timeRangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Calculate overlap layout for a list of segments within a single day.
 * Implements a column-packing algorithm with progressive nesting:
 * - Segments are sorted by start time, then by duration (longer first)
 * - Each segment is assigned to the leftmost available column
 * - Width is calculated based on maximum concurrent columns in the time range
 *
 * @param segments - Array of event segments for a single day
 * @returns The same segments with layout information attached
 */
export function calculateOverlapLayout(
  segments: EventDaySegment[],
): EventDaySegment[] {
  if (segments.length === 0) return segments;
  if (segments.length === 1) {
    return [
      {
        ...segments[0],
        layout: {
          column: 0,
          totalColumns: 1,
          leftPercent: 0,
          widthPercent: 100,
        },
      },
    ];
  }

  // Sort: earlier start first, then longer duration first
  const sorted = [...segments].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) {
      return a.startMinutes - b.startMinutes;
    }
    // Longer duration first (goes to the left)
    const aDuration = a.endMinutes - a.startMinutes;
    const bDuration = b.endMinutes - b.startMinutes;
    return bDuration - aDuration;
  });

  // Track column assignments: each column tracks when it becomes free
  // columnEnds[i] = the end time of the last segment in column i
  const columnEnds: number[] = [];

  // Map from segment index (in sorted array) to column assignment
  const columnAssignments: number[] = [];

  // Assign columns using greedy left-packing
  for (const segment of sorted) {
    // Find the leftmost column where this segment fits
    let assignedColumn = -1;
    for (let col = 0; col < columnEnds.length; col++) {
      if (columnEnds[col] <= segment.startMinutes) {
        // This column is free
        assignedColumn = col;
        break;
      }
    }

    if (assignedColumn === -1) {
      // No free column, create a new one (up to max)
      if (columnEnds.length < MAX_OVERLAP_COLUMNS) {
        assignedColumn = columnEnds.length;
        columnEnds.push(segment.endMinutes);
      } else {
        // Max columns reached, find the column that ends soonest
        let minEnd = columnEnds[0];
        assignedColumn = 0;
        for (let col = 1; col < columnEnds.length; col++) {
          if (columnEnds[col] < minEnd) {
            minEnd = columnEnds[col];
            assignedColumn = col;
          }
        }
        columnEnds[assignedColumn] = segment.endMinutes;
      }
    } else {
      columnEnds[assignedColumn] = segment.endMinutes;
    }

    columnAssignments.push(assignedColumn);
  }

  // For each segment, calculate the maximum concurrent columns during its time range
  const result: EventDaySegment[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const segment = sorted[i];
    const column = columnAssignments[i];

    // Count how many segments overlap with this one
    let maxConcurrent = 1;
    const overlappingColumns = new Set<number>([column]);

    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;
      const other = sorted[j];
      if (
        timeRangesOverlap(
          segment.startMinutes,
          segment.endMinutes,
          other.startMinutes,
          other.endMinutes,
        )
      ) {
        overlappingColumns.add(columnAssignments[j]);
      }
    }

    maxConcurrent = overlappingColumns.size;

    // Calculate position and width
    const totalColumns = maxConcurrent;
    const widthPercent = 100 / totalColumns;
    const leftPercent = column * widthPercent;

    const layout: OverlapLayout = {
      column,
      totalColumns,
      leftPercent,
      widthPercent,
    };

    result.push({
      ...segment,
      layout,
    });
  }

  return result;
}
