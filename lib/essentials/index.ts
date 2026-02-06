/**
 * =============================================================================
 * File: essentials/index.ts
 * =============================================================================
 *
 * Public entry point for the Essentials system.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export essentials types, hooks, and utilities.
 * - Provide a single import surface for essentials features.
 */

// Types
export type {
  EssentialSlot,
  EssentialTemplate,
  EssentialConfig,
  UseEssentialConfigOptions,
  UseEssentialConfigReturn,
  ImportEssentialsOptions,
} from "./types";

// Constants
export { DEFAULT_ESSENTIAL_SLOTS } from "./types";

// Hooks
export { useEssentialConfig } from "./use-essential-config";
export { useActivitySchedule } from "./use-activity-schedule";
export type {
  UseActivityScheduleOptions,
  UseActivityScheduleReturn,
} from "./use-activity-schedule";

// Utilities
export {
  importEssentialsToEvents,
  hasEssentialEventsForWeek,
  weekNeedsEssentialImport,
} from "./import-essentials";
