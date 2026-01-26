"use client";

import * as React from "react";
import type { CalendarEvent } from "@/components/calendar";
import { isOvernightEvent } from "@/components/calendar";
import type {
  ScheduleGoal,
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  DeadlineTask,
} from "./types";

// ============================================================================
// Types
// ============================================================================

export interface UseScheduleStatsOptions {
  goals: ScheduleGoal[];
  events: CalendarEvent[];
  weekDates: Date[];
  enabledCommitmentIds: Set<string>;
}

export interface UseScheduleStatsReturn {
  /** Get computed stats for a goal */
  getGoalStats: (goalId: string) => GoalStats;
  /** Get computed stats for a commitment */
  getCommitmentStats: (commitmentId: string) => GoalStats;
  /** Get schedule info for a task */
  getTaskSchedule: (taskId: string) => TaskScheduleInfo | null;
  /** Get deadline info for a task */
  getTaskDeadline: (taskId: string) => TaskDeadlineInfo | null;
  /** Get all deadlines for a week */
  getWeekDeadlines: (weekDates: Date[]) => Map<string, DeadlineTask[]>;
  /** Events filtered by week and commitment visibility */
  filteredEvents: CalendarEvent[];
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useScheduleStats({
  goals,
  events,
  weekDates,
  enabledCommitmentIds,
}: UseScheduleStatsOptions): UseScheduleStatsReturn {
  // Memoize week boundaries for filtering
  const weekStart = React.useMemo(
    () => weekDates[0].toISOString().split("T")[0],
    [weekDates]
  );
  const weekEnd = React.useMemo(
    () => weekDates[6].toISOString().split("T")[0],
    [weekDates]
  );

  // Calculate the day before weekStart for overnight event inclusion.
  // Overnight events from this day (e.g., Sunday) spill into the current week's Monday.
  const dayBeforeWeekStart = React.useMemo(() => {
    const d = new Date(weekDates[0]);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }, [weekDates]);

  // Filtered events: exclude blocks from disabled commitments AND filter to current week
  const filteredEvents = React.useMemo(
    () =>
      events.filter((event) => {
        // Filter by week (events must have a date in the current week)
        if (event.date && (event.date < weekStart || event.date > weekEnd)) {
          // Exception: include overnight events from the day before weekStart.
          // Their AM portion spills into this week's Monday (dayIndex 0).
          const isOvernightFromPreviousDay =
            event.date === dayBeforeWeekStart && isOvernightEvent(event);
          if (!isOvernightFromPreviousDay) {
            return false;
          }
        }
        // Keep all non-commitment blocks
        if (event.blockType !== "commitment") return true;
        // For commitment blocks, only keep if commitment is enabled
        return event.sourceCommitmentId && enabledCommitmentIds.has(event.sourceCommitmentId);
      }),
    [events, enabledCommitmentIds, weekStart, weekEnd, dayBeforeWeekStart]
  );

  const getGoalStats = React.useCallback(
    (goalId: string): GoalStats => {
      // Filter to goal AND current week
      const goalEvents = events.filter(
        (e) =>
          e.sourceGoalId === goalId &&
          (!e.date || (e.date >= weekStart && e.date <= weekEnd))
      );
      const plannedMinutes = goalEvents.reduce(
        (sum, e) => sum + e.durationMinutes,
        0
      );
      const completedMinutes = goalEvents
        .filter((e) => e.status === "completed")
        .reduce((sum, e) => sum + e.durationMinutes, 0);

      return {
        plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
        completedHours: Math.round((completedMinutes / 60) * 10) / 10,
      };
    },
    [events, weekStart, weekEnd]
  );

  const getCommitmentStats = React.useCallback(
    (commitmentId: string): GoalStats => {
      // filteredEvents already includes week filtering, just filter by commitment
      const commitmentEvents = filteredEvents.filter((e) => e.sourceCommitmentId === commitmentId);
      const plannedMinutes = commitmentEvents.reduce(
        (sum, e) => sum + e.durationMinutes,
        0
      );
      const completedMinutes = commitmentEvents
        .filter((e) => e.status === "completed")
        .reduce((sum, e) => sum + e.durationMinutes, 0);

      return {
        plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
        completedHours: Math.round((completedMinutes / 60) * 10) / 10,
      };
    },
    [filteredEvents]
  );

  const getTaskSchedule = React.useCallback(
    (taskId: string): TaskScheduleInfo | null => {
      // First check for standalone task blocks
      const taskBlock = events.find((e) => e.sourceTaskId === taskId);
      if (taskBlock) {
        return {
          blockId: taskBlock.id,
          dayIndex: taskBlock.dayIndex,
          startMinutes: taskBlock.startMinutes,
          durationMinutes: taskBlock.durationMinutes,
        };
      }

      // Also check for goal blocks where this task is assigned
      const goalBlock = events.find((e) => e.assignedTaskIds?.includes(taskId));
      if (goalBlock) {
        return {
          blockId: goalBlock.id,
          dayIndex: goalBlock.dayIndex,
          startMinutes: goalBlock.startMinutes,
          durationMinutes: goalBlock.durationMinutes,
        };
      }

      return null;
    },
    [events]
  );

  const getTaskDeadline = React.useCallback(
    (taskId: string): TaskDeadlineInfo | null => {
      for (const goal of goals) {
        const task = goal.tasks?.find((t) => t.id === taskId);
        if (task?.deadline) {
          const today = new Date().toISOString().split("T")[0];
          return {
            date: task.deadline,
            isOverdue: task.deadline < today && !task.completed,
          };
        }
      }
      return null;
    },
    [goals]
  );

  const getWeekDeadlines = React.useCallback(
    (weekDates: Date[]): Map<string, DeadlineTask[]> => {
      const result = new Map<string, DeadlineTask[]>();
      
      // Get ISO dates for the week
      const weekISODates = weekDates.map((d) => d.toISOString().split("T")[0]);
      
      for (const goal of goals) {
        if (!goal.tasks) continue;
        
        for (const task of goal.tasks) {
          if (task.deadline && weekISODates.includes(task.deadline)) {
            const existing = result.get(task.deadline) ?? [];
            existing.push({
              taskId: task.id,
              goalId: goal.id,
              label: task.label,
              goalLabel: goal.label,
              goalColor: goal.color,
              completed: task.completed ?? false,
            });
            result.set(task.deadline, existing);
          }
        }
      }
      
      return result;
    },
    [goals]
  );

  return {
    getGoalStats,
    getCommitmentStats,
    getTaskSchedule,
    getTaskDeadline,
    getWeekDeadlines,
    filteredEvents,
  };
}
