"use client";

/**
 * Hook for managing the weekly planning flow/wizard state.
 */

import * as React from "react";
import type { WeeklyIntention, UsePlanningFlowOptions, UsePlanningFlowReturn } from "./types";

/**
 * Hook for managing draft intentions during the planning flow.
 * Handles the temporary state before the user confirms their plan.
 */
export function usePlanningFlow({
  isActive,
  weekDates: _weekDates,
  onConfirm,
  onCancel,
}: UsePlanningFlowOptions): UsePlanningFlowReturn {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [draftIntentions, setDraftIntentions] = React.useState<
    WeeklyIntention[]
  >([]);

  // Reset draft when planning mode is deactivated
  React.useEffect(() => {
    if (!isActive) {
      setDraftIntentions([]);
    }
  }, [isActive]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const setIntention = React.useCallback(
    (goalId: string, target: number, targetTaskIds?: string[]) => {
      setDraftIntentions((prev) => {
        const filtered = prev.filter((i) => i.goalId !== goalId);
        return [
          ...filtered,
          {
            goalId,
            target,
            targetTaskIds,
          },
        ];
      });
    },
    []
  );

  const clearIntention = React.useCallback((goalId: string) => {
    setDraftIntentions((prev) => prev.filter((i) => i.goalId !== goalId));
  }, []);

  const getIntention = React.useCallback(
    (goalId: string): WeeklyIntention | undefined => {
      return draftIntentions.find((i) => i.goalId === goalId);
    },
    [draftIntentions]
  );

  const confirm = React.useCallback(() => {
    onConfirm?.(draftIntentions);
  }, [draftIntentions, onConfirm]);

  const cancel = React.useCallback(() => {
    setDraftIntentions([]);
    onCancel?.();
  }, [onCancel]);

  const reset = React.useCallback(
    (initialIntentions: WeeklyIntention[] = []) => {
      setDraftIntentions(initialIntentions);
    },
    []
  );

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    draftIntentions,
    setIntention,
    clearIntention,
    getIntention,
    confirm,
    cancel,
    reset,
  };
}
