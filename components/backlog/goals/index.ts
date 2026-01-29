/**
 * Goals subfolder - components for goal management in the Backlog.
 */

// =============================================================================
// Components
// =============================================================================

export { GoalSection, BacklogSection } from "./goal-section";
export type { GoalSectionProps } from "./goal-section";

export { GoalItemRow, BacklogItemRow } from "./goal-item-row";
export type { GoalItemRowProps } from "./goal-item-row";

export { GoalList, BacklogGoalList } from "./goal-list";
export type { GoalListProps } from "./goal-list";

export { GoalInspirationGallery } from "./goal-inspiration-gallery";
export type { GoalInspirationGalleryProps } from "./goal-inspiration-gallery";

export { TaskRow, SubtaskRow } from "./task-row";
export type { TaskRowProps } from "./task-row";

export { InlineTaskCreator, InlineGoalCreator } from "./inline-creators";
export type {
  InlineTaskCreatorProps,
  InlineGoalCreatorProps,
} from "./inline-creators";

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
