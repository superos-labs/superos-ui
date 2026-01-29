"use client";

/**
 * Hook for managing the weekly planning flow state.
 *
 * Two-step planning flow:
 * 1. Prioritize: Select 2-3 important tasks per goal (calendar dimmed)
 * 2. Schedule: Drag prioritized tasks to calendar (calendar active)
 *
 * Weekly focus tracking is session-only (lost on page refresh).
 */

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
  const confirm = React.useCallback(() => {
    // Only confirm from schedule step
    if (step === "schedule") {
      onConfirm?.();
    }
  }, [step, onConfirm]);

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
