/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public export surface for backlog Goals components, types, and utilities.
 *
 * Acts as the single entry point for importing goal-related UI primitives,
 * onboarding components, and supporting helpers.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export goal section and row components.
 * - Re-export inline editors and creators.
 * - Re-export onboarding goal components.
 * - Re-export goal-related types and utilities.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Containing logic.
 * - Defining behavior.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Consumers should import from this file instead of deep paths.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * Components:
 * - GoalSection
 * - GoalItemRow
 * - TaskRow, SubtaskRow
 * - InlineTaskCreator, InlineGoalCreator
 * - OnboardingGoalsCard
 * - InlineGoalEditor
 * - GoalSuggestionRow
 * - AddedGoalRow
 *
 * Types:
 * - GoalItem, BacklogItem
 * - GoalTask, Milestone, Subtask
 * - NewGoalData, GoalIconOption
 * - LifeArea
 *
 * Utilities:
 * - formatScheduledTime
 * - formatDeadlineDate
 */

// =============================================================================
// Components
// =============================================================================

export { GoalSection } from "./goal-section";
export type { GoalSectionProps } from "./goal-section";

export { GoalItemRow } from "./goal-item-row";
export type { GoalItemRowProps } from "./goal-item-row";

export { TaskRow, SubtaskRow } from "./task-row";
export type { TaskRowProps } from "./task-row";

export { InlineTaskCreator, InlineGoalCreator } from "./inline-creators";
export type {
  InlineTaskCreatorProps,
  InlineGoalCreatorProps,
} from "./inline-creators";

// Onboarding components
export { OnboardingGoalsCard } from "./onboarding-goals-card";
export type { OnboardingGoalsCardProps } from "./onboarding-goals-card";

export { InlineGoalEditor } from "./inline-goal-editor";
export type {
  InlineGoalEditorProps,
  InlineGoalEditorData,
} from "./inline-goal-editor";

export { GoalSuggestionRow } from "./goal-suggestion-row";
export type { GoalSuggestionRowProps } from "./goal-suggestion-row";

export { AddedGoalRow } from "./added-goal-row";
export type { AddedGoalRowProps, AddedGoal } from "./added-goal-row";

// =============================================================================
// Types
// =============================================================================

export type {
  GoalItem,
  BacklogItem,
  GoalTask,
  Milestone,
  Subtask,
  NewGoalData,
  GoalIconOption,
  LifeArea,
} from "./goal-types";

// =============================================================================
// Utilities
// =============================================================================

export { formatScheduledTime, formatDeadlineDate } from "./goal-utils";
