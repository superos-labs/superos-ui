/**
 * =============================================================================
 * File: lib/weekly-planning/use-planning-flow.ts
 * =============================================================================
 *
 * Client-side hook that manages the state machine for the Weekly Planning flow.
 *
 * Orchestrates a two-step experience:
 * 1) Prioritize important tasks.
 * 2) Schedule prioritized tasks onto calendar blocks.
 *
 * Provides step navigation, confirm/cancel handling, and session-only
 * tracking of weekly focus tasks.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Track current planning step.
 * - Reset flow when planning mode becomes active.
 * - Manage weekly focus task IDs (session-only).
 * - Expose navigation and action handlers.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Does not persist any data.
 * - Assumes calendar already contains blueprint blocks.
 * - Confirm is only valid in the "schedule" step.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - usePlanningFlow
 */

"use client";

import * as React from "react";
import type {
  UsePlanningFlowOptions,
  UsePlanningFlowReturn,
  PlanningStep,
} from "./types";

/**
 * Hook for managing the planning flow.
 * Handles step navigation, confirm/cancel actions, and weekly focus tracking.
 */
export function usePlanningFlow({
  isActive,
  weekDates: _weekDates,
  onConfirm,
  onCancel,
}: UsePlanningFlowOptions): UsePlanningFlowReturn {
  // -------------------------------------------------------------------------
  // Step State
  // -------------------------------------------------------------------------
  const [step, setStep] = React.useState<PlanningStep>("prioritize");

  // Reset to prioritize step when planning mode becomes active
  React.useEffect(() => {
    if (isActive) {
      setStep("prioritize");
    }
  }, [isActive]);

  // -------------------------------------------------------------------------
  // Weekly Focus Task Tracking (session-only)
  // -------------------------------------------------------------------------
  const [weeklyFocusTaskIds, setWeeklyFocusTaskIds] = React.useState<
    Set<string>
  >(new Set());

  const addToWeeklyFocus = React.useCallback((taskId: string) => {
    setWeeklyFocusTaskIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  }, []);

  const removeFromWeeklyFocus = React.useCallback((taskId: string) => {
    setWeeklyFocusTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }, []);

  const isInWeeklyFocus = React.useCallback(
    (taskId: string) => weeklyFocusTaskIds.has(taskId),
    [weeklyFocusTaskIds],
  );

  // -------------------------------------------------------------------------
  // Step Navigation
  // -------------------------------------------------------------------------
  const nextStep = React.useCallback(() => {
    if (step === "prioritize") {
      setStep("schedule");
    }
  }, [step]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const confirm = React.useCallback(
    (saveAsBlueprint: boolean) => {
      // Only confirm from schedule step
      if (step === "schedule") {
        onConfirm?.(saveAsBlueprint);
      }
    },
    [step, onConfirm],
  );

  const cancel = React.useCallback(() => {
    // Clear weekly focus on cancel
    setWeeklyFocusTaskIds(new Set());
    setStep("prioritize");
    onCancel?.();
  }, [onCancel]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    step,
    nextStep,
    confirm,
    cancel,
    weeklyFocusTaskIds,
    addToWeeklyFocus,
    removeFromWeeklyFocus,
    isInWeeklyFocus,
  };
}
