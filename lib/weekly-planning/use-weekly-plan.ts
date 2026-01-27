"use client";

/**
 * Hook for managing weekly plans.
 * Session-only (in-memory) - plans are not persisted across page refreshes.
 */

import * as React from "react";
import type { WeeklyPlan, WeeklyIntention, UseWeeklyPlanOptions, UseWeeklyPlanReturn } from "./types";

/**
 * Hook for managing weekly plans across weeks.
 * Provides CRUD operations for weekly plans (session-only, no persistence).
 */
export function useWeeklyPlan(
  _options: UseWeeklyPlanOptions = {}
): UseWeeklyPlanReturn {
  // -------------------------------------------------------------------------
  // State - Map of weekStartDate to WeeklyPlan (session-only)
  // -------------------------------------------------------------------------
  const [plans, setPlans] = React.useState<Map<string, WeeklyPlan>>(
    () => new Map()
  );

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const getWeeklyPlan = React.useCallback(
    (weekStartDate: string): WeeklyPlan | null => {
      return plans.get(weekStartDate) ?? null;
    },
    [plans]
  );

  const saveWeeklyPlan = React.useCallback((plan: WeeklyPlan) => {
    setPlans((prev) => {
      const next = new Map(prev);
      next.set(plan.weekStartDate, {
        ...plan,
        plannedAt: new Date().toISOString(),
      });
      return next;
    });
  }, []);

  const updateIntention = React.useCallback(
    (
      weekStartDate: string,
      goalId: string,
      target: number,
      targetTaskIds?: string[]
    ) => {
      setPlans((prev) => {
        const next = new Map(prev);
        const existing = next.get(weekStartDate);

        const newIntention: WeeklyIntention = {
          goalId,
          target,
          targetTaskIds,
        };

        if (existing) {
          // Update existing plan
          const intentions = existing.intentions.filter(
            (i) => i.goalId !== goalId
          );
          intentions.push(newIntention);
          next.set(weekStartDate, {
            ...existing,
            intentions,
            plannedAt: new Date().toISOString(),
          });
        } else {
          // Create new plan
          next.set(weekStartDate, {
            weekStartDate,
            intentions: [newIntention],
            plannedAt: new Date().toISOString(),
          });
        }

        return next;
      });
    },
    []
  );

  const clearIntention = React.useCallback(
    (weekStartDate: string, goalId: string) => {
      setPlans((prev) => {
        const next = new Map(prev);
        const existing = next.get(weekStartDate);

        if (existing) {
          const intentions = existing.intentions.filter(
            (i) => i.goalId !== goalId
          );
          if (intentions.length === 0) {
            next.delete(weekStartDate);
          } else {
            next.set(weekStartDate, {
              ...existing,
              intentions,
              plannedAt: new Date().toISOString(),
            });
          }
        }

        return next;
      });
    },
    []
  );

  const hasWeeklyPlan = React.useCallback(
    (weekStartDate: string): boolean => {
      return plans.has(weekStartDate);
    },
    [plans]
  );

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    getWeeklyPlan,
    saveWeeklyPlan,
    updateIntention,
    clearIntention,
    hasWeeklyPlan,
  };
}
