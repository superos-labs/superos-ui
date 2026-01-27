"use client";

/**
 * Hook for managing weekly plans.
 * Uses localStorage for persistence in the demo.
 */

import * as React from "react";
import type { WeeklyPlan, WeeklyIntention, UseWeeklyPlanOptions, UseWeeklyPlanReturn } from "./types";

const DEFAULT_STORAGE_KEY = "superos-weekly-plans";

/**
 * Hook for managing weekly plans across weeks.
 * Provides CRUD operations for weekly plans with localStorage persistence.
 */
export function useWeeklyPlan(
  options: UseWeeklyPlanOptions = {}
): UseWeeklyPlanReturn {
  const { storageKey = DEFAULT_STORAGE_KEY } = options;

  // -------------------------------------------------------------------------
  // State - Map of weekStartDate to WeeklyPlan
  // -------------------------------------------------------------------------
  const [plans, setPlans] = React.useState<Map<string, WeeklyPlan>>(() => {
    if (typeof window === "undefined") return new Map();
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return new Map();
      const parsed = JSON.parse(stored) as [string, WeeklyPlan][];
      return new Map(parsed);
    } catch {
      return new Map();
    }
  });

  // -------------------------------------------------------------------------
  // Persist to localStorage
  // -------------------------------------------------------------------------
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const entries = Array.from(plans.entries());
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // Ignore localStorage errors
    }
  }, [plans, storageKey]);

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
