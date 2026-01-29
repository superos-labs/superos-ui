// Public API for the unified schedule system

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
} from "./goal-state-utils";

// Types
export type {
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
  // Hook types
  UseUnifiedScheduleOptions,
  UseUnifiedScheduleReturn,
} from "./types";
