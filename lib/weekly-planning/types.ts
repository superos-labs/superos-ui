/**
 * Types for the weekly planning system.
 * Manages weekly intentions and tracks progress against them.
 */

import type { ProgressIndicator } from "@/lib/unified-schedule";

// ============================================================================
// Weekly Intention
// ============================================================================

/**
 * A single goal's intention for a specific week.
 */
export interface WeeklyIntention {
  /** The goal this intention is for */
  goalId: string;
  /** Target value (interpreted based on goal's progressIndicator) */
  target: number;
  /** For 'specific-tasks' indicator: which tasks must be completed */
  targetTaskIds?: string[];
}

// ============================================================================
// Weekly Plan
// ============================================================================

/**
 * A week's planning record.
 * Persisted independently so blueprint changes don't affect history.
 */
export interface WeeklyPlan {
  /** ISO date string of week start (e.g., "2026-01-26") */
  weekStartDate: string;
  /** Intentions set during planning */
  intentions: WeeklyIntention[];
  /** When planning was completed (ISO string) */
  plannedAt: string;
}

// ============================================================================
// Intention Progress
// ============================================================================

/**
 * Progress towards a goal's weekly intention.
 */
export interface IntentionProgress {
  /** The goal ID */
  goalId: string;
  /** The progress indicator type */
  indicator: ProgressIndicator;
  /** The intended target value */
  intended: number;
  /** The actual achieved value */
  actual: number;
  /** Progress as a percentage (0-100+, can exceed 100%) */
  progress: number;
  /** Unit label for display (e.g., "hours", "blocks", "days", "tasks") */
  unit: string;
  /** For specific-tasks: list of completed task IDs */
  completedTaskIds?: string[];
  /** For specific-tasks: list of target task IDs */
  targetTaskIds?: string[];
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseWeeklyPlanOptions {
  /** Storage key prefix for localStorage (default: 'superos-weekly-plan') */
  storageKey?: string;
}

export interface UseWeeklyPlanReturn {
  /** Get the weekly plan for a specific week (null if none) */
  getWeeklyPlan: (weekStartDate: string) => WeeklyPlan | null;
  /** Save a weekly plan */
  saveWeeklyPlan: (plan: WeeklyPlan) => void;
  /** Update intentions for a specific week */
  updateIntention: (
    weekStartDate: string,
    goalId: string,
    target: number,
    targetTaskIds?: string[]
  ) => void;
  /** Clear intention for a specific goal in a week */
  clearIntention: (weekStartDate: string, goalId: string) => void;
  /** Check if a weekly plan exists for a specific week */
  hasWeeklyPlan: (weekStartDate: string) => boolean;
}

export interface UsePlanningFlowOptions {
  /** Whether planning mode is active */
  isActive: boolean;
  /** Current week dates */
  weekDates: Date[];
  /** Callback when planning is confirmed */
  onConfirm?: (intentions: WeeklyIntention[]) => void;
  /** Callback when planning is cancelled */
  onCancel?: () => void;
}

export interface UsePlanningFlowReturn {
  /** Current draft intentions (being edited) */
  draftIntentions: WeeklyIntention[];
  /** Set intention for a goal */
  setIntention: (
    goalId: string,
    target: number,
    targetTaskIds?: string[]
  ) => void;
  /** Clear intention for a goal */
  clearIntention: (goalId: string) => void;
  /** Get intention for a specific goal */
  getIntention: (goalId: string) => WeeklyIntention | undefined;
  /** Confirm the current draft intentions */
  confirm: () => void;
  /** Cancel and discard changes */
  cancel: () => void;
  /** Reset draft to initial state */
  reset: (initialIntentions?: WeeklyIntention[]) => void;
}
