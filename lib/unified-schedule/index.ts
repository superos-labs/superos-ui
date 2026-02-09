/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public entry point for the unified schedule domain.
 *
 * Aggregates and re-exports the primary orchestration hook, composable sub-hooks,
 * immutable state utilities, and shared types that make up the unified schedule
 * system.
 *
 * Intended to provide a single, stable import surface for consumers.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Expose the main `useUnifiedSchedule` orchestration hook.
 * - Expose composable sub-hooks for advanced or partial integrations.
 * - Re-export immutable goal/task/milestone state utilities.
 * - Re-export core domain and derived types.
 * - Re-export goal creation and inspiration types (merged from lib/goals).
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Avoid exporting internal-only modules directly.
 * - Prefer adding new public APIs here rather than importing deep paths.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - Hooks (useUnifiedSchedule, useGoalState, useScheduling, etc.)
 * - State utilities from goal-state-utils
 * - Time range utilities (resolve, format, query helpers)
 * - Unified schedule types (including DateGranularity)
 * - Goal creation types (NewGoalData, InspirationGoal, InspirationCategory)
 */

// Main orchestration hook
export { useUnifiedSchedule } from "./use-unified-schedule";

// Composable sub-hooks (for advanced/custom use cases)
export { useGoalState } from "./use-goal-state";
export type { UseGoalStateOptions, UseGoalStateReturn } from "./use-goal-state";

export { useEssentialVisibility } from "./use-essential-visibility";
export type {
  UseEssentialVisibilityOptions,
  UseEssentialVisibilityReturn,
} from "./use-essential-visibility";

export { useEventState } from "./use-event-state";
export type {
  UseEventStateOptions,
  UseEventStateReturn,
} from "./use-event-state";

export { useScheduleStats } from "./use-schedule-stats";
export type {
  UseScheduleStatsOptions,
  UseScheduleStatsReturn,
} from "./use-schedule-stats";

export { useScheduling } from "./use-scheduling";
export type {
  UseSchedulingOptions,
  UseSchedulingReturn,
} from "./use-scheduling";

export { useEssentialAutoComplete } from "./use-essential-auto-complete";
export type { UseEssentialAutoCompleteOptions } from "./use-essential-auto-complete";

// Week navigation hook
export { useWeekNavigation } from "./use-week-navigation";
export type { UseWeekNavigationOptions } from "./use-week-navigation";

// State update utilities (for direct state manipulation or testing)
export {
  // Goal-level
  updateGoalById,
  findGoalById,
  // Task-level
  updateTaskById,
  addTaskToGoal,
  removeTaskFromGoal,
  findTaskInGoal,
  // Subtask-level
  updateSubtaskById,
  addSubtaskToTask,
  removeSubtaskFromTask,
  // Milestone-level
  updateMilestoneById,
  addMilestoneToGoal,
  removeMilestoneFromGoal,
  // Composed (multi-level)
  updateTaskInGoals,
  updateSubtaskInGoals,
  updateMilestoneInGoals,
  findTaskAcrossGoals,
  // Milestone-task association utilities
  getTasksForMilestone,
  getCurrentMilestone,
  assignAllTasksToMilestone,
  clearTaskMilestoneAssignments,
  completeTasksInMilestone,
} from "./goal-state-utils";

// Time range utilities
export {
  resolveMonthDate,
  resolveQuarterDate,
  formatGranularDate,
  getQuarterForDate,
  getMonthLabel,
  getQuarterMonthRange,
  isActiveInRange,
} from "./time-range-utils";
export type { DateRole } from "./time-range-utils";

// Types
export type {
  // Date granularity (lazy dates)
  DateGranularity,
  // Core data types
  Subtask,
  Milestone,
  ScheduleTask,
  ScheduleGoal,
  ScheduleEssential,
  // Calendar event types (domain layer - source of truth)
  CalendarEvent,
  HoverPosition,
  BlockStatus,
  // Computed/derived types
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  DeadlineTask,
  DeadlineGoal,
  DeadlineMilestone,
  QuarterDeadlineItem,
  // Sync settings types
  GoalSyncSettings,
  BlockSyncSettings,
  SyncDestination,
  BlockSyncState,
  // Hook types
  UseUnifiedScheduleOptions,
  UseUnifiedScheduleReturn,
  // Goal creation & inspiration types (merged from lib/goals)
  NewGoalData,
  InspirationGoal,
  InspirationCategory,
} from "./types";
