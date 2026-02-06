/**
 * =============================================================================
 * File: import-essentials.ts
 * =============================================================================
 *
 * Utility helpers for importing essential templates into calendar events.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Convert EssentialTemplate slots into CalendarEvent objects.
 * - Detect whether essentials already exist for a week.
 * - Determine if a week requires essential import.
 */

import type {
  ImportEssentialsOptions,
} from "./types";
import type { CalendarEvent } from "@/lib/unified-schedule";
import type { GoalColor } from "@/lib/colors";

/**
 * Generate a unique event ID for imported essentials.
 */
function generateEventId(): string {
  return `essential-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Import essential templates to calendar events for a given week.
 *
 * This function takes the user's essential templates (configured in Edit Essentials)
 * and creates corresponding calendar events for the specified week.
 *
 * @param options - Import options including templates, week dates, and essential data
 * @returns Array of CalendarEvent objects ready to be added to the calendar
 */
export function importEssentialsToEvents({
  templates,
  weekDates,
  essentials,
}: ImportEssentialsOptions): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Create a map for quick essential lookup
  const essentialMap = new Map(essentials.map((e) => [e.id, e]));

  for (const template of templates) {
    const essential = essentialMap.get(template.essentialId);
    if (!essential) continue;

    for (const slot of template.slots) {
      // For each day in the slot's days array, create an event
      for (const dayIndex of slot.days) {
        // Ensure dayIndex is valid (0-6)
        if (dayIndex < 0 || dayIndex >= 7) continue;

        const date = weekDates[dayIndex];
        if (!date) continue;

        const dateString = date.toISOString().split("T")[0];

        events.push({
          id: generateEventId(),
          title: essential.label,
          date: dateString,
          dayIndex,
          startMinutes: slot.startMinutes,
          durationMinutes: slot.durationMinutes,
          color: essential.color as GoalColor,
          blockType: "essential",
          sourceEssentialId: template.essentialId,
        });
      }
    }
  }

  return events;
}

/**
 * Check if a week already has essential events for a given essential.
 *
 * @param events - Current calendar events
 * @param essentialId - The essential ID to check
 * @returns True if at least one event for this essential exists
 */
export function hasEssentialEventsForWeek(
  events: CalendarEvent[],
  essentialId: string
): boolean {
  return events.some(
    (e) => e.blockType === "essential" && e.sourceEssentialId === essentialId
  );
}

/**
 * Check if a week needs essential imports (no essential events exist yet).
 *
 * @param events - Current calendar events for the week
 * @param enabledEssentialIds - IDs of essentials that should be tracked
 * @returns True if any enabled essential has no events in the week
 */
export function weekNeedsEssentialImport(
  events: CalendarEvent[],
  enabledEssentialIds: string[]
): boolean {
  for (const essentialId of enabledEssentialIds) {
    if (!hasEssentialEventsForWeek(events, essentialId)) {
      return true;
    }
  }
  return false;
}
