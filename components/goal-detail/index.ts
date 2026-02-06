/**
 * =============================================================================
 * File: goal-detail/index.ts
 * =============================================================================
 *
 * Public export surface for Goal Detail components.
 *
 * Centralizes all goal-detail related UI primitives so consuming code
 * can import from a single module boundary.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export GoalDetail composition root.
 * - Re-export goal-detail subcomponents.
 * - Re-export associated prop types.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing goal-detail behavior.
 * - Managing goal state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Keeps goal-detail as a cohesive feature slice.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalDetail
 * - GoalDetailProps
 * - GoalDetailHeader
 * - GoalDetailHeaderProps
 * - GoalDetailMilestones
 * - GoalDetailMilestonesProps
 * - GoalDetailTasks
 * - GoalDetailTasksProps
 */

export { GoalDetail } from "./goal-detail";
export type { GoalDetailProps } from "./goal-detail";

export { GoalDetailHeader } from "./goal-detail-header";
export type { GoalDetailHeaderProps } from "./goal-detail-header";

export { GoalDetailMilestones } from "./goal-detail-milestones";
export type { GoalDetailMilestonesProps } from "./goal-detail-milestones";

export { GoalDetailTasks } from "./goal-detail-tasks";
export type { GoalDetailTasksProps } from "./goal-detail-tasks";
