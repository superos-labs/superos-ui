/**
 * =============================================================================
 * File: goal-types.ts
 * =============================================================================
 *
 * Shared type definitions for backlog Goals.
 *
 * Defines the UI-facing GoalItem shape used by backlog components and re-exports
 * related goal, life area, and task types from domain modules for convenience.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define GoalItem display type.
 * - Re-export goal-related domain types.
 * - Re-export task and milestone types used by goals.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Containing business logic.
 * - Defining persistence models.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - plannedHours and completedHours are deprecated in favor of derived stats.
 * - GoalItem remains thin and composable.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalItem
 * - BacklogItem (deprecated alias)
 * - NewGoalData (re-export)
 * - GoalIconOption (re-export)
 * - InspirationGoal (re-export)
 * - InspirationCategory (re-export)
 * - LifeArea (re-export)
 * - GoalTask (re-export)
 * - Milestone (re-export)
 * - Subtask (re-export)
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
