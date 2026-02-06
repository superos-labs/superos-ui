import type { CalendarEvent } from "@/lib/unified-schedule";

// ============================================================================
// Overnight block helpers
// ============================================================================

/** Maximum duration for events (just under 48 hours, spanning at most 2 days) */
export const MAX_EVENT_DURATION_MINUTES = 2879;

/**
 * Check if an event spans across midnight into the next day.
 */
export function isOvernightEvent(event: CalendarEvent): boolean {
  return event.startMinutes + event.durationMinutes > 1440;
}

/**
 * Get the day index where the event ends (0-6).
 * For overnight events, this is the next day (with week wrapping).
 * Note: This uses modulo arithmetic and is mainly for positioning within a week.
 * For cross-week matching, use getNextDayDate() with actual dates instead.
 */
export function getEventEndDayIndex(event: CalendarEvent): number {
  if (!isOvernightEvent(event)) return event.dayIndex;
  return (event.dayIndex + 1) % 7;
}

/**
 * Get the ISO date string for the day after the given date.
 * Used for calculating the actual end date of overnight events.
 */
export function getNextDayDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  date.setDate(date.getDate() + 1);
  // Use local date parts instead of toISOString() to avoid timezone conversion issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get the end time in minutes within the end day (0-1440).
 * For overnight events, this is the time on day 2.
 */
export function getEventEndMinutes(event: CalendarEvent): number {
  const rawEnd = event.startMinutes + event.durationMinutes;
  return isOvernightEvent(event) ? rawEnd - 1440 : rawEnd;
}

/**
 * Clamp event duration to the maximum allowed (2 days).
 */
export function clampEventDuration(durationMinutes: number): number {
  return Math.min(durationMinutes, MAX_EVENT_DURATION_MINUTES);
}

// ============================================================================
// Segment types
// ============================================================================

/**
 * Segment position for styling overnight blocks.
 * - 'only': Single-day event (full rounded corners)
 * - 'start': First day of overnight event (rounded top, flat bottom)
 * - 'end': Second day of overnight event (flat top, rounded bottom)
 */
export type SegmentPosition = "only" | "start" | "end";

/**
 * Layout information for positioning overlapping events.
 * Calculated by the overlap layout algorithm.
 */
export interface OverlapLayout {
  /** 0-indexed column position within the overlap group */
  column: number;
  /** Total number of concurrent columns in this segment's time range */
  totalColumns: number;
  /** Calculated left position as a percentage (0-100) */
  leftPercent: number;
  /** Calculated width as a percentage (0-100) */
  widthPercent: number;
}

/**
 * Represents a visible segment of an event for a specific day.
 * Overnight events produce two segments (one per day).
 */
export interface EventDaySegment {
  event: CalendarEvent;
  dayIndex: number;
  startMinutes: number; // 0-1440 within this day
  endMinutes: number; // 0-1440 within this day
  position: SegmentPosition;
  /** Layout positioning for overlapping events */
  layout?: OverlapLayout;
}

// ============================================================================
// Segment generation
// ============================================================================

/**
 * Get the day index (0-6, Monday-start) from an ISO date string.
 * Used internally for segment positioning.
 */
function getDayIndexFromDateInternal(date: string): number {
  const d = new Date(date + "T00:00:00");
  const day = d.getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday-start (Mon=0, Sun=6)
}

/**
 * Get all event segments that should be rendered for a specific day.
 * Single-day events produce one segment; overnight events may produce
 * a 'start' segment on day 1 and/or an 'end' segment on day 2.
 *
 * @param events - Array of calendar events to filter
 * @param targetDate - ISO date string (e.g., "2026-01-20") for the target day
 */
export function getSegmentsForDay(
  events: CalendarEvent[],
  targetDate: string,
): EventDaySegment[] {
  const segments: EventDaySegment[] = [];
  const targetDayIndex = getDayIndexFromDateInternal(targetDate);

  for (const event of events) {
    const isOvernight = isOvernightEvent(event);

    // Check if this day is the start day (match by exact date)
    if (event.date === targetDate) {
      segments.push({
        event,
        dayIndex: targetDayIndex,
        startMinutes: event.startMinutes,
        endMinutes: isOvernight
          ? 1440
          : event.startMinutes + event.durationMinutes,
        position: isOvernight ? "start" : "only",
      });
    }
    // Check if this day is the end day (for overnight events only)
    // Compare actual dates to avoid cross-week confusion
    else if (isOvernight && getNextDayDate(event.date) === targetDate) {
      segments.push({
        event,
        dayIndex: targetDayIndex,
        startMinutes: 0,
        endMinutes: getEventEndMinutes(event),
        position: "end",
      });
    }
  }

  return segments;
}
