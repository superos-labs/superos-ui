/**
 * =============================================================================
 * File: quarter-view.tsx
 * =============================================================================
 *
 * Read-only, orientation-focused planning surface for the current quarter.
 *
 * Displays three month columns (like day columns in the week view). Each
 * column shows per-goal completed time distribution (matching the
 * WeeklyAnalytics visual pattern) followed by milestones due that month.
 * Completed milestones visually recede; upcoming milestones stay descriptive.
 * No editing, scheduling, or task-level detail.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Compute the current quarter boundaries and month ranges.
 * - Derive per-month, per-goal completed and planned hours from events.
 * - Collect milestones per month with goal context.
 * - Render three month columns with a quarter header.
 * - Emit navigation events for goal detail.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Editing goals, tasks, or milestones.
 * - Scheduling or drag-and-drop.
 * - Quarter navigation (v1 is current quarter only).
 * - Mobile layout (deferred).
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Data computation is inlined via useMemo (per prototyping principles).
 * - Uses existing time-range-utils for all quarter/date math.
 * - Per-month stats are computed from CalendarEvent dates, not from
 *   weekly-scoped getGoalStats (which only covers the current week).
 * - Layout mirrors the week view's day-column pattern at month granularity.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - QuarterView
 * - QuarterViewProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ScheduleGoal, CalendarEvent } from "@/lib/unified-schedule";
import {
  getQuarterForDate,
  resolveMonthDate,
} from "@/lib/unified-schedule";
import type { LifeArea } from "@/lib/types";
import { QuarterMonthColumn } from "./quarter-month-column";
import type { MonthGoalStats, MonthMilestone } from "./quarter-month-column";

// =============================================================================
// Types
// =============================================================================

export interface QuarterViewProps {
  goals: ScheduleGoal[];
  events: CalendarEvent[];
  lifeAreas: LifeArea[];
  onGoalClick: (goalId: string) => void;
  className?: string;
}

/** Computed data for a single month column. */
interface MonthColumnData {
  label: string;
  isCurrent: boolean;
  goalStats: MonthGoalStats[];
  milestones: MonthMilestone[];
}

// =============================================================================
// Full Month Labels
// =============================================================================

const FULL_MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// =============================================================================
// Data Computation
// =============================================================================

/**
 * Determine which month column (0, 1, 2) a date string falls into within a quarter.
 * Returns -1 if outside the quarter.
 */
function getMonthColumnIndex(
  isoDate: string,
  quarterStartMonth: number,
): number {
  const date = new Date(isoDate + "T00:00:00");
  const month = date.getMonth();
  const offset = month - quarterStartMonth;
  if (offset < 0 || offset > 2) return -1;
  return offset;
}

/**
 * Build a goal lookup map for quick access.
 */
function buildGoalMap(goals: ScheduleGoal[]): Map<string, ScheduleGoal> {
  return new Map(goals.map((g) => [g.id, g]));
}

/**
 * Compute per-month, per-goal time stats from calendar events.
 * Returns a 3-element array (one per month column) of goal stats maps.
 */
function computeMonthGoalStats(
  goals: ScheduleGoal[],
  events: CalendarEvent[],
  quarterStartMonth: number,
): [Map<string, { planned: number; completed: number }>, Map<string, { planned: number; completed: number }>, Map<string, { planned: number; completed: number }>] {
  const months: [Map<string, { planned: number; completed: number }>, Map<string, { planned: number; completed: number }>, Map<string, { planned: number; completed: number }>] = [
    new Map(),
    new Map(),
    new Map(),
  ];

  for (const event of events) {
    if (!event.date || !event.sourceGoalId) continue;
    // Skip external events
    if (event.isExternal) continue;

    const col = getMonthColumnIndex(event.date, quarterStartMonth);
    if (col < 0) continue;

    const map = months[col];
    const existing = map.get(event.sourceGoalId) ?? { planned: 0, completed: 0 };
    existing.planned += event.durationMinutes;
    if (event.status === "completed") {
      existing.completed += event.durationMinutes;
    }
    map.set(event.sourceGoalId, existing);
  }

  return months;
}

/**
 * Compute the three month column data sets for the current quarter.
 */
function computeMonthColumns(
  goals: ScheduleGoal[],
  events: CalendarEvent[],
  now: Date,
): {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  columns: [MonthColumnData, MonthColumnData, MonthColumnData];
} {
  const quarter = getQuarterForDate(now);
  const year = now.getFullYear();
  const firstMonth = (quarter - 1) * 3;
  const currentMonth = now.getMonth();
  const goalMap = buildGoalMap(goals);

  // Compute per-month time stats from events
  const monthStats = computeMonthGoalStats(goals, events, firstMonth);

  const columns: [MonthColumnData, MonthColumnData, MonthColumnData] = [
    buildMonthData(0),
    buildMonthData(1),
    buildMonthData(2),
  ];

  return { quarter, year, columns };

  // -----------------------------------------------------------------------
  // Helpers scoped to the closure
  // -----------------------------------------------------------------------

  function buildMonthData(offset: number): MonthColumnData {
    const monthIdx = firstMonth + offset;

    // Build per-goal stats for this month
    const statsMap = monthStats[offset];
    const goalStats: MonthGoalStats[] = [];

    for (const [goalId, stats] of statsMap) {
      const goal = goalMap.get(goalId);
      if (!goal) continue;
      goalStats.push({
        id: goal.id,
        label: goal.label,
        icon: goal.icon,
        color: goal.color,
        lifeAreaId: goal.lifeAreaId,
        completedHours: Math.round((stats.completed / 60) * 10) / 10,
        plannedHours: Math.round((stats.planned / 60) * 10) / 10,
      });
    }

    // Collect milestones due in this month
    const milestones: MonthMilestone[] = [];
    for (const goal of goals) {
      if (!goal.milestones) continue;
      for (const m of goal.milestones) {
        if (!m.deadline) continue;
        const col = getMonthColumnIndex(m.deadline, firstMonth);
        if (col !== offset) continue;
        milestones.push({
          id: m.id,
          label: m.label,
          completed: m.completed,
          goalId: goal.id,
          goalLabel: goal.label,
          goalIcon: goal.icon,
          goalColor: goal.color,
          deadline: m.deadline,
          deadlineGranularity: m.deadlineGranularity,
        });
      }
    }

    // Sort milestones by deadline (earliest first)
    milestones.sort((a, b) => a.deadline.localeCompare(b.deadline));

    return {
      label: FULL_MONTH_LABELS[monthIdx] ?? "",
      isCurrent: monthIdx === currentMonth,
      goalStats,
      milestones,
    };
  }
}

// =============================================================================
// Component
// =============================================================================

export function QuarterView({
  goals,
  events,
  lifeAreas,
  onGoalClick,
  className,
}: QuarterViewProps) {
  const { quarter, year, columns } = React.useMemo(
    () => computeMonthColumns(goals, events, new Date()),
    [goals, events],
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border",
        className,
      )}
    >
      {/* Quarter header */}
      <div className="shrink-0 border-b border-border px-5 py-3">
        <span className="text-sm font-semibold text-foreground">
          Q{quarter} {year}
        </span>
      </div>

      {/* Three month columns */}
      <div className="flex flex-1 min-h-0">
        {columns.map((col, idx) => (
          <QuarterMonthColumn
            key={idx}
            label={col.label}
            isCurrent={col.isCurrent}
            goalStats={col.goalStats}
            lifeAreas={lifeAreas}
            milestones={col.milestones}
            onGoalClick={onGoalClick}
          />
        ))}
      </div>
    </div>
  );
}
