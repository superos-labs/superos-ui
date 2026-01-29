"use client";

/**
 * Hook for computing progress towards weekly intentions.
 */

import * as React from "react";
import type {
  CalendarEvent,
  ScheduleGoal,
  ProgressIndicator,
} from "@/lib/unified-schedule";
import { PROGRESS_INDICATOR_UNITS } from "@/lib/unified-schedule";
import type { WeeklyPlan, WeeklyIntention, IntentionProgress } from "./types";

// ============================================================================
// Types
// ============================================================================

export interface UseIntentionProgressOptions {
  /** Goals with their progress indicators */
  goals: ScheduleGoal[];
  /** Calendar events for the week */
  events: CalendarEvent[];
  /** The weekly plan (null if none) */
  weeklyPlan: WeeklyPlan | null;
  /** Week dates for filtering */
  weekDates: Date[];
}

export interface UseIntentionProgressReturn {
  /** Get progress for a specific goal */
  getProgress: (goalId: string) => IntentionProgress | null;
  /** Get all progress entries */
  allProgress: IntentionProgress[];
  /** Overall progress percentage (average of all goals with intentions) */
  overallProgress: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compute the actual progress value based on the indicator type.
 */
function computeActual(
  goalId: string,
  indicator: ProgressIndicator,
  events: CalendarEvent[],
  goals: ScheduleGoal[],
  intention: WeeklyIntention,
): { actual: number; completedTaskIds?: string[] } {
  const goalEvents = events.filter((e) => e.sourceGoalId === goalId);
  const completedEvents = goalEvents.filter((e) => e.status === "completed");

  switch (indicator) {
    case "completed-time": {
      const minutes = completedEvents.reduce(
        (sum, e) => sum + e.durationMinutes,
        0,
      );
      return { actual: Math.round((minutes / 60) * 10) / 10 };
    }

    case "focused-time": {
      const minutes = goalEvents.reduce(
        (sum, e) => sum + (e.focusedMinutes ?? 0),
        0,
      );
      return { actual: Math.round((minutes / 60) * 10) / 10 };
    }

    case "blocks-completed": {
      return { actual: completedEvents.length };
    }

    case "days-with-blocks": {
      const uniqueDays = new Set(completedEvents.map((e) => e.date));
      return { actual: uniqueDays.size };
    }

    case "specific-tasks": {
      const goal = goals.find((g) => g.id === goalId);
      const targetTaskIds = intention.targetTaskIds ?? [];
      const targetTasks =
        goal?.tasks?.filter((t) => targetTaskIds.includes(t.id)) ?? [];
      const completedTaskIds = targetTasks
        .filter((t) => t.completed)
        .map((t) => t.id);
      return {
        actual: completedTaskIds.length,
        completedTaskIds,
      };
    }

    default:
      return { actual: 0 };
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useIntentionProgress({
  goals,
  events,
  weeklyPlan,
  weekDates,
}: UseIntentionProgressOptions): UseIntentionProgressReturn {
  // Filter events to current week
  const weekStart = weekDates[0]?.toISOString().split("T")[0] ?? "";
  const weekEnd = weekDates[6]?.toISOString().split("T")[0] ?? "";

  const weekEvents = React.useMemo(
    () =>
      events.filter((e) => {
        if (!e.date) return false;
        return e.date >= weekStart && e.date <= weekEnd;
      }),
    [events, weekStart, weekEnd],
  );

  // Compute progress for all goals with intentions
  const allProgress = React.useMemo((): IntentionProgress[] => {
    if (!weeklyPlan) return [];

    const results: IntentionProgress[] = [];

    for (const intention of weeklyPlan.intentions) {
      const goal = goals.find((g) => g.id === intention.goalId);
      if (!goal) continue;

      const indicator = goal.progressIndicator ?? "completed-time";
      const { actual, completedTaskIds } = computeActual(
        intention.goalId,
        indicator,
        weekEvents,
        goals,
        intention,
      );

      const progress =
        intention.target > 0
          ? Math.round((actual / intention.target) * 100)
          : 0;

      results.push({
        goalId: intention.goalId,
        indicator,
        intended: intention.target,
        actual,
        progress,
        unit: PROGRESS_INDICATOR_UNITS[indicator],
        completedTaskIds,
        targetTaskIds: intention.targetTaskIds,
      });
    }

    return results;
  }, [goals, weekEvents, weeklyPlan]);

  // Get progress for a specific goal
  const getProgress = React.useCallback(
    (goalId: string): IntentionProgress | null => {
      return allProgress.find((p) => p.goalId === goalId) ?? null;
    },
    [allProgress],
  );

  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    if (allProgress.length === 0) return 0;
    const total = allProgress.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / allProgress.length);
  }, [allProgress]);

  return {
    getProgress,
    allProgress,
    overallProgress,
  };
}
