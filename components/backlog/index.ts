/**
 * Public API for the Backlog component family.
 *
 * The backlog is organized into two subfolders:
 * - goals/     - Goal-related components (tasks, milestones, inspiration)
 * - essentials/ - Essential-related components (sleep, schedule templates)
 */

// =============================================================================
// Main Component
// =============================================================================

export { Backlog } from "./backlog";
export type { BacklogProps } from "./backlog";

// =============================================================================
// Shared Types
// =============================================================================

export type {
  BacklogItemBase,
  BacklogMode,
  BacklogGroup,
} from "./backlog-types";

// =============================================================================
// Goals (Re-exports from ./goals/)
// =============================================================================

// Components
export {
  GoalSection,
  GoalItemRow,
  GoalInspirationGallery,
  TaskRow,
  SubtaskRow,
  InlineTaskCreator,
  InlineGoalCreator,
  // Onboarding components
  OnboardingGoalsCard,
  InlineGoalEditor,
  GoalSuggestionRow,
  AddedGoalRow,
} from "./goals";

// Types
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
  GoalSectionProps,
  GoalItemRowProps,
  GoalInspirationGalleryProps,
  TaskRowProps,
  InlineTaskCreatorProps,
  InlineGoalCreatorProps,
  // Onboarding types
  OnboardingGoalsCardProps,
  InlineGoalEditorProps,
  InlineGoalEditorData,
  GoalSuggestionRowProps,
  AddedGoalRowProps,
  AddedGoal,
} from "./goals";

// Utilities
export { formatScheduledTime, formatDeadlineDate } from "./goals";

// =============================================================================
// Essentials (Re-exports from ./essentials/)
// =============================================================================

// Components
export {
  EssentialsSection,
  EssentialRow,
  SleepRow,
  InlineEssentialCreator,
} from "./essentials";

// Types
export type {
  EssentialItem,
  NewEssentialData,
  EssentialSlot,
  EssentialTemplate,
  EssentialConfig,
  EssentialsSectionProps,
  EssentialRowProps,
  SleepRowProps,
  InlineEssentialCreatorProps,
} from "./essentials";

// =============================================================================
// Hooks (Re-exported from lib/essentials for convenience)
// =============================================================================

export { useActivitySchedule } from "@/lib/essentials";
export type {
  UseActivityScheduleOptions,
  UseActivityScheduleReturn,
} from "@/lib/essentials";

// =============================================================================
// Unified Schedule Types (Re-exported for convenience)
// =============================================================================

export type {
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";
