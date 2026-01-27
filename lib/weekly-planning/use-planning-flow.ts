"use client";

/**
 * Hook for managing the weekly planning flow/wizard state.
 */

import * as React from "react";
import type { ProgressIndicator } from "@/lib/unified-schedule";
import type { WeeklyIntention, PlanningStep, UsePlanningFlowOptions, UsePlanningFlowReturn } from "./types";

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
  const [step, setStep] = React.useState<PlanningStep>("intentions");

  // Reset draft and step when planning mode is deactivated
  React.useEffect(() => {
    if (!isActive) {
      setDraftIntentions([]);
      setStep("intentions");
    }
  }, [isActive]);

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------
  
  // Collect all task IDs from intentions using specific-tasks indicator
  const highlightedTaskIds = React.useMemo(() => {
    const taskIds: string[] = [];
    for (const intention of draftIntentions) {
      if (intention.targetTaskIds && intention.targetTaskIds.length > 0) {
        taskIds.push(...intention.targetTaskIds);
      }
    }
    return taskIds;
  }, [draftIntentions]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const setIntention = React.useCallback(
    (
      goalId: string,
      target: number,
      targetTaskIds?: string[],
      progressIndicatorOverride?: ProgressIndicator
    ) => {
      setDraftIntentions((prev) => {
        const filtered = prev.filter((i) => i.goalId !== goalId);
        return [
          ...filtered,
          {
            goalId,
            target,
            targetTaskIds,
            progressIndicatorOverride,
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
    setStep("intentions");
    onCancel?.();
  }, [onCancel]);

  const reset = React.useCallback(
    (initialIntentions: WeeklyIntention[] = []) => {
      setDraftIntentions(initialIntentions);
      setStep("intentions");
    },
    []
  );

  // -------------------------------------------------------------------------
  // Step Navigation
  // -------------------------------------------------------------------------
  const continueToSchedule = React.useCallback(() => {
    setStep("schedule");
  }, []);

  const backToIntentions = React.useCallback(() => {
    setStep("intentions");
  }, []);

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
    // Step management
    step,
    continueToSchedule,
    backToIntentions,
    highlightedTaskIds,
  };
}
