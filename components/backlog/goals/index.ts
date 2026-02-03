/**
 * Goals subfolder - components for goal management in the Backlog.
 */

// =============================================================================
// Components
// =============================================================================

export { GoalSection } from "./goal-section";
export type { GoalSectionProps } from "./goal-section";

export { GoalItemRow } from "./goal-item-row";
export type { GoalItemRowProps } from "./goal-item-row";

export { GoalInspirationGallery } from "./goal-inspiration-gallery";
export type { GoalInspirationGalleryProps } from "./goal-inspiration-gallery";

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
  InspirationGoal,
  InspirationCategory,
  LifeArea,
} from "./goal-types";

// =============================================================================
// Utilities
// =============================================================================

export { formatScheduledTime, formatDeadlineDate } from "./goal-utils";
