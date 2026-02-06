/**
 * Shell fixture data — barrel file.
 *
 * Re-exports all shell data from domain-specific modules so consumers
 * can continue importing from `@/lib/fixtures/shell-data`.
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
