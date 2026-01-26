// Public API for the unified schedule system

// Main hook
export { useUnifiedSchedule } from "./use-unified-schedule";

// Types
export type {
  // Core data types
  Subtask,
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
