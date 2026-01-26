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

export { EditCommitmentsView } from "./edit-commitments-view";
export type { EditCommitmentsViewProps } from "./edit-commitments-view";

// Types
export type {
  BacklogItem,
  BacklogTask,
  BacklogGroup,
  BacklogMode,
  GoalDisplayMode,
  NewGoalData,
  LifeArea,
  GoalIconOption,
} from "./backlog-types";

// Re-export types from use-unified-schedule for convenience
export type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo } from "@/hooks/use-unified-schedule";
