"use client";

/**
 * Hook for managing weekly plans.
 * Session-only (in-memory) - plans are not persisted across page refreshes.
 */

import * as React from "react";
import type {
  WeeklyPlan,
  UseWeeklyPlanOptions,
  UseWeeklyPlanReturn,
} from "./types";

/**
 * Hook for managing weekly plans across weeks.
 * Provides CRUD operations for weekly plans (session-only, no persistence).
 */
export function useWeeklyPlan(
  _options: UseWeeklyPlanOptions = {},
): UseWeeklyPlanReturn {
  // -------------------------------------------------------------------------
  // State - Map of weekStartDate to WeeklyPlan (session-only)
  // -------------------------------------------------------------------------
  const [plans, setPlans] = React.useState<Map<string, WeeklyPlan>>(
    () => new Map(),
  );

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const getWeeklyPlan = React.useCallback(
    (weekStartDate: string): WeeklyPlan | null => {
      return plans.get(weekStartDate) ?? null;
    },
    [plans],
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

  const hasWeeklyPlan = React.useCallback(
    (weekStartDate: string): boolean => {
      return plans.has(weekStartDate);
    },
    [plans],
  );

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    getWeeklyPlan,
    saveWeeklyPlan,
    hasWeeklyPlan,
  };
}
