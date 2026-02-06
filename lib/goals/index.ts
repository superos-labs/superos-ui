/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public types barrel for backlog-related domain.
 *
 * Re-exports commonly used backlog and inspiration-related types so consumers
 * can import from a single module.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export backlog and inspiration domain types.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - NewGoalData
 * - GoalIconOption
 * - InspirationGoal
 * - InspirationCategory
 * - LifeArea
 */

// Types
export type {
  NewGoalData,
  GoalIconOption,
  InspirationGoal,
  InspirationCategory,
  LifeArea,
} from "./types";
