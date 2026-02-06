/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public entry point for Backlog module.
 *
 * Centralizes and re-exports:
 * - Backlog composition root.
 * - Goals and Essentials components.
 * - Shared backlog types.
 * - Onboarding helpers.
 * - Convenience re-exports from lib domains.
 *
 * This file defines the public surface area of the Backlog package.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Provide a stable, ergonomic import surface.
 * - Hide internal folder structure.
 * - Group related exports by domain (Goals, Essentials, Shared, Hooks).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Business logic.
 * - State management.
 * - Runtime behavior.
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Backlog package public API."
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
