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
 * - Re-export goal creation and inspiration types from unified schedule.
 * - Re-export shared types (LifeArea, GoalIconOption) from lib/types.
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
 * - Goal creation and inspiration types originate in lib/unified-schedule/types.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalItem
 * - BacklogItem (deprecated alias)
 * - NewGoalData (re-export from unified-schedule)
 * - GoalIconOption (re-export from lib/types)
 * - LifeArea (re-export from lib/types)
 * - GoalTask (re-export)
 * - Milestone (re-export)
 * - Subtask (re-export)
 */

import type { ScheduleTask, Milestone } from "@/lib/unified-schedule";
import type { BacklogItemBase } from "../backlog-types";

// Re-export goal creation type
export type { NewGoalData } from "@/lib/unified-schedule";

// Re-export shared types
export type { GoalIconOption, LifeArea } from "@/lib/types";

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
