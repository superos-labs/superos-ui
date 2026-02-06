/**
 * =============================================================================
 * File: lib/weekly-planning/use-weekly-plan.ts
 * =============================================================================
 *
 * Client-side hook for managing WeeklyPlan records in memory.
 *
 * Stores and retrieves weekly planning completion metadata
 * keyed by week start date.
 *
 * Intended as a lightweight, session-only store that can later
 * be replaced or augmented with persistence.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Hold weekly plans in an in-memory map.
 * - Provide get, save, and existence checks.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - No persistence across page refreshes.
 * - plannedAt is set at save time.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useWeeklyPlan
 */

"use client";

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
