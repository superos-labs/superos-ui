/**
 * Utility functions for blueprint operations.
 */

import type { CalendarEvent } from "@/components/calendar";
import type { Blueprint, BlueprintBlock } from "./types";

// ============================================================================
// Blueprint → Calendar Events
// ============================================================================

/**
 * Convert blueprint blocks to calendar events for a specific week.
 * This is used when importing the blueprint during weekly planning.
 *
 * @param blueprint - The blueprint to import
 * @param weekDates - Array of 7 Date objects for the target week
 * @param weekStartsOn - Which day the week starts on (0 = Sunday, 1 = Monday)
 * @returns Array of CalendarEvent objects ready to add to the schedule
 */
export function blueprintToEvents(
  blueprint: Blueprint,
  weekDates: Date[],
): CalendarEvent[] {
  return blueprint.blocks.map((block) => {
    // Get the actual date for this day of week
    const date = weekDates[block.dayOfWeek];
    const dateString = date.toISOString().split("T")[0];

    return {
      id: crypto.randomUUID(),
      title: block.title,
      date: dateString,
      dayIndex: block.dayOfWeek,
      startMinutes: block.startMinutes,
      durationMinutes: block.durationMinutes,
      color: block.color,
      status: "planned" as const,
      blockType: block.blockType,
      sourceGoalId: block.sourceGoalId,
      sourceEssentialId: block.sourceEssentialId,
    };
  });
}

// ============================================================================
// Calendar Events → Blueprint
// ============================================================================

/**
 * Convert current calendar events to a blueprint template.
 * This is used when saving the first blueprint or updating it.
 *
 * @param events - Array of calendar events from the current week
 * @param weekDates - Array of 7 Date objects for the current week
 * @returns Array of BlueprintBlock objects
 */
export function eventsToBlueprint(
  events: CalendarEvent[],
  weekDates: Date[],
): BlueprintBlock[] {
  // Create a map of date string to day index
  const dateToIndex = new Map<string, number>();
  weekDates.forEach((date, index) => {
    const dateString = date.toISOString().split("T")[0];
    dateToIndex.set(dateString, index);
  });

  // Filter to events in the current week and convert
  return events
    .filter((event) => {
      // Only include planned events (not completed ones in the blueprint)
      // and events that are in the current week
      return dateToIndex.has(event.date);
    })
    .map((event) => ({
      id: crypto.randomUUID(),
      dayOfWeek: dateToIndex.get(event.date) ?? event.dayIndex,
      startMinutes: event.startMinutes,
      durationMinutes: event.durationMinutes,
      title: event.title,
      color: event.color,
      blockType: event.blockType ?? "goal",
      sourceGoalId: event.sourceGoalId,
      sourceEssentialId: event.sourceEssentialId,
    }));
}

// ============================================================================
// Blueprint Helpers
// ============================================================================

/**
 * Calculate the total planned hours in a blueprint.
 */
export function getBlueprintTotalHours(blueprint: Blueprint): number {
  const totalMinutes = blueprint.blocks.reduce(
    (sum, block) => sum + block.durationMinutes,
    0
  );
  return Math.round((totalMinutes / 60) * 10) / 10;
}

/**
 * Get all blocks for a specific goal from the blueprint.
 */
export function getBlueprintBlocksForGoal(
  blueprint: Blueprint,
  goalId: string
): BlueprintBlock[] {
  return blueprint.blocks.filter((block) => block.sourceGoalId === goalId);
}

/**
 * Get all blocks for a specific essential from the blueprint.
 */
export function getBlueprintBlocksForEssential(
  blueprint: Blueprint,
  essentialId: string
): BlueprintBlock[] {
  return blueprint.blocks.filter(
    (block) => block.sourceEssentialId === essentialId
  );
}
