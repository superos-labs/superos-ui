/**
 * =============================================================================
 * File: blueprint/index.ts
 * =============================================================================
 *
 * Public entry point for the Blueprint system.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export blueprint hook, utilities, and types.
 * - Provide a single import surface for blueprint features.
 */

// Hook
export { useBlueprint } from "./use-blueprint";

// Utilities
export {
  blueprintToEvents,
  eventsToBlueprint,
  getBlueprintTotalHours,
  getBlueprintBlocksForGoal,
  getBlueprintBlocksForEssential,
  blueprintEssentialsNeedUpdate,
  eventsEssentialsNeedUpdate,
  generateBlueprintEventsForWeeks,
  getWeekDatesWithOffset,
} from "./blueprint-utils";

// Types
export type { Blueprint, BlueprintBlock, UseBlueprintReturn } from "./types";
