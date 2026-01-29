/**
 * Component-level types for the Goals section of the Backlog.
 *
 * These types are specific to the UI component layer. Core data types
 * (ScheduleGoal, ScheduleTask, Milestone, Subtask) are in lib/unified-schedule.
 * Shared creation types are in lib/goals.
 */

import type { GoalColor } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";
import type { ScheduleTask, Milestone } from "@/lib/unified-schedule";
import type { BacklogItemBase } from "../backlog-types";

// Re-export from lib/goals for convenience
export type {
  NewGoalData,
  GoalIconOption,
  InspirationGoal,
  InspirationCategory,
  LifeArea,
} from "@/lib/goals";

// Re-export task types for convenience
export type {
  ScheduleTask as GoalTask,
  Milestone,
  Subtask,
} from "@/lib/unified-schedule";

// =============================================================================
// Goal Item (Component Display Type)
// =============================================================================

/**
 * GoalItem represents a goal in the backlog UI.
 * Extends the shared BacklogItemBase with goal-specific properties.
 */
export interface GoalItem extends BacklogItemBase {
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  plannedHours?: number;
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  completedHours?: number;
  /** Ordered milestones (sequential steps toward the goal) */
  milestones?: Milestone[];
  /** Whether milestones are enabled for this goal (defaults to true if milestones exist) */
  milestonesEnabled?: boolean;
  /** Tasks associated with this goal */
  tasks?: ScheduleTask[];
}

/**
 * @deprecated Use GoalItem instead. Kept for backward compatibility.
 */
export type BacklogItem = GoalItem;
