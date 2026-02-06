/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Shell fixture data barrel.
 *
 * Centralizes and re-exports all shell fixture data (goals, essentials, events,
 * icons, and life areas) so consumers can import from a single module.
 *
 * Also defines named data set presets (sample, empty, complete) used by the
 * shell experience, onboarding previews, and dev shortcuts.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export domain-specific shell fixture modules.
 * - Re-export commonly used types for convenience.
 * - Define strongly-typed fixture data sets.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - "sample" = rich demo data with tasks and milestones.
 * - "complete" = clean goals + events for skip-onboarding flows.
 * - "empty" = blank state for fresh users.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GOAL_ICONS
 * - ALL_ESSENTIALS, DEFAULT_ENABLED_ESSENTIAL_IDS, COMPLETE_ENABLED_ESSENTIAL_IDS
 * - SHELL_GOALS, COMPLETE_GOALS, EMPTY_GOALS
 * - SHELL_CALENDAR_EVENTS, COMPLETE_CALENDAR_EVENTS, EMPTY_CALENDAR_EVENTS
 * - DATA_SETS, DataSetId, DataSet
 */

import type {
  CalendarEvent,
  ScheduleGoal,
  ScheduleEssential,
} from "@/lib/unified-schedule";

// Re-export life areas from canonical source
export { LIFE_AREAS, LIFE_AREAS_BY_ID, getLifeArea } from "@/lib/life-areas";
export type { LifeAreaId } from "@/lib/life-areas";

// Re-export types for convenience
export type { LifeArea, GoalIconOption } from "@/lib/types";

// Domain modules — import for local use, then re-export
import { GOAL_ICONS } from "./goal-icons";
import {
  ALL_ESSENTIALS,
  DEFAULT_ENABLED_ESSENTIAL_IDS,
  COMPLETE_ENABLED_ESSENTIAL_IDS,
  EMPTY_ESSENTIALS,
} from "./essentials";
import { SHELL_GOALS, COMPLETE_GOALS, EMPTY_GOALS } from "./goals";
import {
  SHELL_CALENDAR_EVENTS,
  COMPLETE_CALENDAR_EVENTS,
  EMPTY_CALENDAR_EVENTS,
} from "./events";

export {
  GOAL_ICONS,
  ALL_ESSENTIALS,
  DEFAULT_ENABLED_ESSENTIAL_IDS,
  COMPLETE_ENABLED_ESSENTIAL_IDS,
  EMPTY_ESSENTIALS,
  SHELL_GOALS,
  COMPLETE_GOALS,
  EMPTY_GOALS,
  SHELL_CALENDAR_EVENTS,
  COMPLETE_CALENDAR_EVENTS,
  EMPTY_CALENDAR_EVENTS,
};

// =============================================================================
// Data Set Types
// =============================================================================

export type DataSetId = "sample" | "empty" | "complete";

export interface DataSet {
  essentials: ScheduleEssential[];
  goals: ScheduleGoal[];
  events: CalendarEvent[];
}

export const DATA_SETS: Record<DataSetId, DataSet> = {
  sample: {
    essentials: ALL_ESSENTIALS,
    goals: SHELL_GOALS,
    events: SHELL_CALENDAR_EVENTS,
  },
  empty: {
    essentials: EMPTY_ESSENTIALS,
    goals: EMPTY_GOALS,
    events: EMPTY_CALENDAR_EVENTS,
  },
  complete: {
    essentials: ALL_ESSENTIALS,
    goals: COMPLETE_GOALS,
    events: COMPLETE_CALENDAR_EVENTS,
  },
};
