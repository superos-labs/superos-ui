// Public API for the blueprint system

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
