/**
 * Utility functions for blueprint operations.
 */

import type { CalendarEvent } from "@/lib/unified-schedule";
import type { Blueprint, BlueprintBlock } from "./types";
import type { EssentialTemplate } from "@/lib/essentials";

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
  // Essentials are now included in the blueprint
  return events
    .filter((event) => {
      // Only include events that are in the current week
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
    0,
  );
  return Math.round((totalMinutes / 60) * 10) / 10;
}

/**
 * Get all blocks for a specific goal from the blueprint.
 */
export function getBlueprintBlocksForGoal(
  blueprint: Blueprint,
  goalId: string,
): BlueprintBlock[] {
  return blueprint.blocks.filter((block) => block.sourceGoalId === goalId);
}

/**
 * Get all blocks for a specific essential from the blueprint.
 */
export function getBlueprintBlocksForEssential(
  blueprint: Blueprint,
  essentialId: string,
): BlueprintBlock[] {
  return blueprint.blocks.filter(
    (block) => block.sourceEssentialId === essentialId,
  );
}

// ============================================================================
// Essential Sync Detection
// ============================================================================

/**
 * Represents a normalized essential slot for comparison.
 * Uses a consistent format to compare blueprint blocks against essential templates.
 */
interface NormalizedSlot {
  essentialId: string;
  dayOfWeek: number;
  startMinutes: number;
  durationMinutes: number;
}

/**
 * Create a unique key for a normalized slot for Set comparison.
 */
function slotKey(slot: NormalizedSlot): string {
  return `${slot.essentialId}:${slot.dayOfWeek}:${slot.startMinutes}:${slot.durationMinutes}`;
}

/**
 * Check if blueprint essentials differ from current essential templates.
 * Returns true if there are differences that the user might want to sync.
 *
 * This compares:
 * - Which essentials are present
 * - The day/time/duration of each essential slot
 *
 * @param blueprint - The current blueprint
 * @param essentialTemplates - Current essential templates from configuration
 * @param enabledEssentialIds - IDs of currently enabled essentials
 * @returns true if the blueprint's essentials differ from the templates
 */
export function blueprintEssentialsNeedUpdate(
  blueprint: Blueprint,
  essentialTemplates: EssentialTemplate[],
  enabledEssentialIds: string[],
): boolean {
  // Normalize blueprint essential blocks
  const blueprintSlots: NormalizedSlot[] = blueprint.blocks
    .filter(
      (block) =>
        block.blockType === "essential" && block.sourceEssentialId != null,
    )
    .map((block) => ({
      essentialId: block.sourceEssentialId!,
      dayOfWeek: block.dayOfWeek,
      startMinutes: block.startMinutes,
      durationMinutes: block.durationMinutes,
    }));

  // Normalize essential templates (expand slots to individual day entries)
  const templateSlots: NormalizedSlot[] = [];
  for (const template of essentialTemplates) {
    // Only include enabled essentials
    if (!enabledEssentialIds.includes(template.essentialId)) continue;

    for (const slot of template.slots) {
      for (const dayOfWeek of slot.days) {
        templateSlots.push({
          essentialId: template.essentialId,
          dayOfWeek,
          startMinutes: slot.startMinutes,
          durationMinutes: slot.durationMinutes,
        });
      }
    }
  }

  // Compare using Sets for order-independent comparison
  const blueprintKeys = new Set(blueprintSlots.map(slotKey));
  const templateKeys = new Set(templateSlots.map(slotKey));

  // Check if sets are different
  if (blueprintKeys.size !== templateKeys.size) {
    return true;
  }

  for (const key of blueprintKeys) {
    if (!templateKeys.has(key)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if calendar events' essentials differ from current essential templates.
 * Similar to blueprintEssentialsNeedUpdate but works with CalendarEvent[] instead of Blueprint.
 * Used during blueprint edit mode to compare the current editing state.
 *
 * @param events - Current calendar events (during blueprint edit mode)
 * @param weekDates - Week dates for day index resolution
 * @param essentialTemplates - Current essential templates from configuration
 * @param enabledEssentialIds - IDs of currently enabled essentials
 * @returns true if the events' essentials differ from the templates
 */
export function eventsEssentialsNeedUpdate(
  events: CalendarEvent[],
  weekDates: Date[],
  essentialTemplates: EssentialTemplate[],
  enabledEssentialIds: string[],
): boolean {
  // Create a map of date string to day index
  const dateToIndex = new Map<string, number>();
  weekDates.forEach((date, index) => {
    const dateString = date.toISOString().split("T")[0];
    dateToIndex.set(dateString, index);
  });

  // Normalize event essential blocks
  const eventSlots: NormalizedSlot[] = events
    .filter(
      (event) =>
        event.blockType === "essential" &&
        event.sourceEssentialId != null &&
        dateToIndex.has(event.date),
    )
    .map((event) => ({
      essentialId: event.sourceEssentialId!,
      dayOfWeek: dateToIndex.get(event.date) ?? event.dayIndex,
      startMinutes: event.startMinutes,
      durationMinutes: event.durationMinutes,
    }));

  // Normalize essential templates (expand slots to individual day entries)
  const templateSlots: NormalizedSlot[] = [];
  for (const template of essentialTemplates) {
    // Only include enabled essentials
    if (!enabledEssentialIds.includes(template.essentialId)) continue;

    for (const slot of template.slots) {
      for (const dayOfWeek of slot.days) {
        templateSlots.push({
          essentialId: template.essentialId,
          dayOfWeek,
          startMinutes: slot.startMinutes,
          durationMinutes: slot.durationMinutes,
        });
      }
    }
  }

  // Compare using Sets for order-independent comparison
  const eventKeys = new Set(eventSlots.map(slotKey));
  const templateKeys = new Set(templateSlots.map(slotKey));

  // Check if sets are different
  if (eventKeys.size !== templateKeys.size) {
    return true;
  }

  for (const key of eventKeys) {
    if (!templateKeys.has(key)) {
      return true;
    }
  }

  return false;
}
