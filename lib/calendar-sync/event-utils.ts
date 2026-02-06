/**
 * =============================================================================
 * File: external-events-adapter.ts
 * =============================================================================
 *
 * Adapter utilities for transforming external calendar events into internal
 * CalendarEvent and AllDayEvent formats.
 *
 * Separates timed external events (rendered on the calendar grid) from all-day
 * external events (rendered in the deadline tray).
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Convert ExternalEvent[] into CalendarEvent[] for timed rendering.
 * - Resolve dayIndex for events within a given week.
 * - Extract and group all-day external events by date.
 * - Convert all-day external events into AllDayEvent format.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or syncing external calendars.
 * - Persisting external events.
 * - Rendering calendar or deadline tray UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Filters timed events to the active week.
 * - Uses a fallback slate color while honoring custom external colors.
 * - Adapters are pure and synchronous.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - externalEventsToCalendarEvents
 * - getAllDayEventsForDate
 * - getAllDayEventsForWeek
 * - externalEventsToAllDayEvents
 */

import type { ExternalEvent } from "./types";
import type { CalendarEvent } from "@/lib/unified-schedule";
import type { AllDayEvent } from "@/components/calendar";

/**
 * Convert external events to calendar events for rendering.
 * Filters out all-day events (handled separately in deadline tray).
 *
 * @param externalEvents - External events from enabled calendars
 * @param weekDates - Array of Date objects for the current week
 * @returns CalendarEvent[] ready for rendering on the calendar grid
 */
export function externalEventsToCalendarEvents(
  externalEvents: ExternalEvent[],
  weekDates: Date[]
): CalendarEvent[] {
  // Get week date strings for filtering
  const weekDateStrings = new Set(
    weekDates.map((d) => d.toISOString().split("T")[0])
  );

  return externalEvents
    .filter((event) => !event.isAllDay && weekDateStrings.has(event.date))
    .map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      dayIndex: getDayIndexFromDate(event.date, weekDates),
      startMinutes: event.startMinutes,
      durationMinutes: event.durationMinutes,
      color: "slate" as const, // Fallback color, customColor used for actual styling
      status: event.status ?? "planned",
      blockType: "external" as const,
      sourceProvider: event.provider,
      sourceCalendarId: event.calendarId,
      sourceCalendarName: event.calendarName,
      isExternal: true,
      notes: event.notes,
      focusedMinutes: event.focusedMinutes,
      // Custom hex color from the external calendar
      customColor: event.calendarColor,
    }));
}

/**
 * Get the day index (0-6) for a date within the week.
 * Returns 0 if the date is not found in the week.
 */
function getDayIndexFromDate(dateStr: string, weekDates: Date[]): number {
  const index = weekDates.findIndex(
    (d) => d.toISOString().split("T")[0] === dateStr
  );
  return index >= 0 ? index : 0;
}

/**
 * Filter external events to get only all-day events for a specific date.
 * Used by the deadline tray to show all-day external events.
 *
 * @param externalEvents - External events from enabled calendars
 * @param date - ISO date string (e.g., "2026-01-26")
 * @returns All-day external events for the specified date
 */
export function getAllDayEventsForDate(
  externalEvents: ExternalEvent[],
  date: string
): ExternalEvent[] {
  return externalEvents.filter(
    (event) => event.isAllDay && event.date === date
  );
}

/**
 * Filter external events to get all-day events for a week.
 * Returns a Map of date strings to arrays of all-day events.
 *
 * @param externalEvents - External events from enabled calendars
 * @param weekDates - Array of Date objects for the current week
 * @returns Map<dateString, ExternalEvent[]>
 */
export function getAllDayEventsForWeek(
  externalEvents: ExternalEvent[],
  weekDates: Date[]
): Map<string, ExternalEvent[]> {
  const result = new Map<string, ExternalEvent[]>();

  // Initialize all week dates with empty arrays
  weekDates.forEach((d) => {
    result.set(d.toISOString().split("T")[0], []);
  });

  // Add all-day events to their respective dates
  externalEvents
    .filter((event) => event.isAllDay)
    .forEach((event) => {
      const existing = result.get(event.date);
      if (existing) {
        existing.push(event);
      }
    });

  return result;
}

/**
 * Convert external all-day events to the AllDayEvent format for the DeadlineTray.
 * Returns a Map of date strings to arrays of AllDayEvent objects.
 *
 * @param externalEvents - External events from enabled calendars
 * @param weekDates - Array of Date objects for the current week
 * @returns Map<dateString, AllDayEvent[]>
 */
export function externalEventsToAllDayEvents(
  externalEvents: ExternalEvent[],
  weekDates: Date[]
): Map<string, AllDayEvent[]> {
  const result = new Map<string, AllDayEvent[]>();

  // Initialize all week dates with empty arrays
  weekDates.forEach((d) => {
    result.set(d.toISOString().split("T")[0], []);
  });

  // Add all-day events to their respective dates
  externalEvents
    .filter((event) => event.isAllDay)
    .forEach((event) => {
      const existing = result.get(event.date);
      if (existing) {
        existing.push({
          id: event.id,
          title: event.title,
          date: event.date,
          provider: event.provider,
          calendarId: event.calendarId,
          calendarName: event.calendarName,
          calendarColor: event.calendarColor,
          completed: event.status === "completed",
        });
      }
    });

  return result;
}
