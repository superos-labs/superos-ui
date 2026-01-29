/**
 * Types for the weekly planning system.
 * Manages weekly planning flow with two steps:
 * 1. Prioritize: Select important tasks for the week
 * 2. Schedule: Drag prioritized tasks to the calendar
 */

// ============================================================================
// Weekly Plan
// ============================================================================

/**
 * A week's planning record.
 * Tracks when planning was completed for a given week.
 */
export interface WeeklyPlan {
  /** ISO date string of week start (e.g., "2026-01-26") */
  weekStartDate: string;
  /** When planning was completed (ISO string) */
  plannedAt: string;
}

// ============================================================================
// Planning Flow Types
// ============================================================================

/**
 * Planning flow step.
 * - prioritize: Select 2-3 important tasks per goal (calendar dimmed)
 * - schedule: Drag prioritized tasks to calendar (calendar active)
 */
export type PlanningStep = "prioritize" | "schedule";

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
  /** Current planning step */
  step: PlanningStep;
  /** Advance to the next step (prioritize → schedule) */
  nextStep: () => void;
  /** Confirm the planning session (only valid in schedule step) */
  confirm: () => void;
  /** Cancel and exit planning mode */
  cancel: () => void;

  // Weekly focus task tracking (session-only, lost on refresh)
  /** Set of task IDs marked as weekly focus */
  weeklyFocusTaskIds: Set<string>;
  /** Add a task to weekly focus */
  addToWeeklyFocus: (taskId: string) => void;
  /** Remove a task from weekly focus */
  removeFromWeeklyFocus: (taskId: string) => void;
  /** Check if a task is in weekly focus */
  isInWeeklyFocus: (taskId: string) => boolean;
}
