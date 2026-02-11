/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public entry point for Backlog module.
 *
 * Centralizes and re-exports:
 * - Backlog composition root.
 * - Next Block Card (execution companion).
 * - Goals and Essentials components.
 * - Shared backlog types.
 * - Onboarding helpers.
 *
 * This barrel only exports what the backlog module owns. Lib-level types
 * (GoalStats, TaskScheduleInfo, etc.) and hooks (useActivitySchedule) should
 * be imported directly from their source modules.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Provide a stable, ergonomic import surface.
 * - Hide internal folder structure.
 * - Group related exports by domain (Goals, Essentials, Shared).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Business logic.
 * - State management.
 * - Runtime behavior.
 * - Re-exporting lib-level types or hooks.
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Backlog package public API — components and types only."
 */

// =============================================================================
// Main Component
// =============================================================================

export { Backlog } from "./backlog";
export type { BacklogProps } from "./backlog";

// =============================================================================
// Next Block Card
// =============================================================================

export { NextBlockCard } from "./next-block-card";
export type { NextBlockCardProps } from "./next-block-card";

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
  LifeArea,
  GoalSectionProps,
  GoalItemRowProps,
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

