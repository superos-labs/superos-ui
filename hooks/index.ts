// Public API for hooks
// Re-exports from lib/unified-schedule for backward compatibility

export { useUnifiedSchedule } from "@/lib/unified-schedule";
export type {
  UseUnifiedScheduleOptions,
  UseUnifiedScheduleReturn,
  ScheduleGoal,
  ScheduleTask,
  ScheduleEssential,
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  DeadlineTask,
  Subtask,
} from "@/lib/unified-schedule";
