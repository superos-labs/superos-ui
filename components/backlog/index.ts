// Public API for the Backlog component family

// Main component
export { Backlog } from "./backlog";
export type { BacklogProps } from "./backlog";

// Sub-components
export { BacklogSection } from "./backlog-section";
export type { BacklogSectionProps } from "./backlog-section";

export { BacklogItemRow } from "./backlog-item-row";
export type { BacklogItemRowProps } from "./backlog-item-row";

export { TaskRow, SubtaskRow } from "./task-row";
export type { TaskRowProps } from "./task-row";

export { InlineTaskCreator, InlineGoalCreator } from "./inline-creators";
export type { InlineTaskCreatorProps, InlineGoalCreatorProps } from "./inline-creators";

export { EditEssentialsView } from "./edit-essentials-view";
export type { EditEssentialsViewProps } from "./edit-essentials-view";

export { BacklogGoalList } from "./backlog-goal-list";
export type { BacklogGoalListProps } from "./backlog-goal-list";

export { GoalInspirationGallery } from "./goal-inspiration-gallery";
export type { GoalInspirationGalleryProps } from "./goal-inspiration-gallery";

// Types
export type {
  BacklogItem,
  BacklogTask,
  BacklogGroup,
  BacklogMode,
  NewGoalData,
  LifeArea,
  GoalIconOption,
  Milestone,
  InspirationGoal,
  InspirationCategory,
} from "./backlog-types";

// Re-export types from unified-schedule for convenience
export type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo } from "@/lib/unified-schedule";
