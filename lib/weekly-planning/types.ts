/**
 * Types for the weekly planning system.
 * Manages weekly plans and tracks progress.
 */

import type { ProgressIndicator } from "@/lib/unified-schedule";

// ============================================================================
// Weekly Intention (kept for data structure compatibility)
// ============================================================================

/**
 * A single goal's intention for a specific week.
 * Note: The intentions UI has been removed, but this type is kept for
 * data structure compatibility with WeeklyPlan and IntentionProgress.
 */
export interface WeeklyIntention {
  /** The goal this intention is for */
  goalId: string;
  /** Target value (interpreted based on goal's progressIndicator) */
  target: number;
  /** For 'specific-tasks' indicator: which tasks must be completed */
  targetTaskIds?: string[];
  /** Override the goal's default progress indicator for this week only */
  progressIndicatorOverride?: ProgressIndicator;
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
  /** Intentions set during planning (empty array when no intentions are set) */
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
  // Options reserved for future use (session-only, no persistence)
}

export interface UseWeeklyPlanReturn {
  /** Get the weekly plan for a specific week (null if none) */
  getWeeklyPlan: (weekStartDate: string) => WeeklyPlan | null;
  /** Save a weekly plan */
  saveWeeklyPlan: (plan: WeeklyPlan) => void;
  /** Check if a weekly plan exists for a specific week */
  hasWeeklyPlan: (weekStartDate: string) => boolean;
}

export interface UsePlanningFlowOptions {
  /** Whether planning mode is active */
  isActive: boolean;
  /** Current week dates */
  weekDates: Date[];
  /** Callback when planning is confirmed */
  onConfirm?: () => void;
  /** Callback when planning is cancelled */
  onCancel?: () => void;
}

export interface UsePlanningFlowReturn {
  /** Confirm the planning session */
  confirm: () => void;
  /** Cancel and exit planning mode */
  cancel: () => void;
}
