// Public API for the unified schedule system

// Main orchestration hook
export { useUnifiedSchedule } from "./use-unified-schedule";

// Composable sub-hooks (for advanced/custom use cases)
export { useGoalState } from "./use-goal-state";
export type { UseGoalStateOptions, UseGoalStateReturn } from "./use-goal-state";

export { useCommitmentVisibility } from "./use-commitment-visibility";
export type { UseCommitmentVisibilityOptions, UseCommitmentVisibilityReturn } from "./use-commitment-visibility";

export { useEventState } from "./use-event-state";
export type { UseEventStateOptions, UseEventStateReturn } from "./use-event-state";

export { useScheduleStats } from "./use-schedule-stats";
export type { UseScheduleStatsOptions, UseScheduleStatsReturn } from "./use-schedule-stats";

export { useScheduling } from "./use-scheduling";
export type { UseSchedulingOptions, UseSchedulingReturn } from "./use-scheduling";

export { useCommitmentAutoComplete } from "./use-commitment-auto-complete";
export type { UseCommitmentAutoCompleteOptions } from "./use-commitment-auto-complete";

// Week navigation hook
export { useWeekNavigation } from "./use-week-navigation";
export type { UseWeekNavigationOptions } from "./use-week-navigation";

// Types
export type {
  // Progress indicator types
  ProgressIndicator,
  // Core data types
  Subtask,
  Milestone,
  ScheduleTask,
  ScheduleGoal,
  ScheduleCommitment,
  // Computed/derived types
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  DeadlineTask,
  // Hook types
  UseUnifiedScheduleOptions,
  UseUnifiedScheduleReturn,
} from "./types";

// Constants
export {
  PROGRESS_INDICATOR_LABELS,
  PROGRESS_INDICATOR_UNITS,
} from "./types";
