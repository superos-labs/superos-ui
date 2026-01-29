/**
 * Types for the weekly planning system.
 * Manages weekly planning flow.
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
