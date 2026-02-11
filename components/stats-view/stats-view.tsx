/**
 * =============================================================================
 * File: stats-view.tsx
 * =============================================================================
 *
 * Full-screen stats dashboard for completed vs planned time distribution.
 *
 * Replaces the main content area (calendar) when active. Shows a pie chart
 * and goal-by-goal (or life-area) breakdown of time tracked, across
 * configurable time horizons: all time, this week, or this month.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Compute goal stats for the selected time horizon from raw events.
 * - Aggregate stats by life area when in life-areas distribution mode.
 * - Render time horizon tabs (All time / This week / This month).
 * - Render distribution mode tabs (Goals / Life Areas).
 * - Render a pie chart showing completed time distribution.
 * - Render a ranked list of goals/areas with progress bars.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting analytics data.
 * - Managing shell layout state (toggle handled by parent).
 * - Computing focused hours (uses completed hours only).
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Stats are computed inline via useMemo (per prototyping principles).
 * - Hex colors for the pie chart are derived from GoalColor tokens.
 * - Reuses WeeklyAnalyticsItemRow and DistributionProgressBar from the
 *   weekly-analytics module for visual consistency.
 * - Week boundaries come from weekDates prop; month boundaries are computed
 *   from the current date.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - StatsView
 * - StatsViewProps
 * - TimeHorizon
 */

"use client";

import * as React from "react";
import { cn, formatHours } from "@/lib/utils";
import type { ScheduleGoal, CalendarEvent } from "@/lib/unified-schedule";
import type { LifeArea } from "@/lib/types";
import { getIconColorClass, getHexColor } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import {
  WeeklyAnalyticsItemRow,
  DistributionProgressBar,
  getProgress,
} from "@/components/weekly-analytics";
import type {
  WeeklyAnalyticsItem,
  DistributionMode,
} from "@/components/weekly-analytics";
import { StatsPieChart } from "./stats-pie-chart";
import type { PieChartItem } from "./stats-pie-chart";

// =============================================================================
// Types
// =============================================================================

export type TimeHorizon = "all-time" | "this-week" | "this-month";

export interface StatsViewProps {
  goals: ScheduleGoal[];
  events: CalendarEvent[];
  lifeAreas: LifeArea[];
  weekDates: Date[];
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Compute per-goal stats from events, filtered by time horizon.
 */
function computeGoalStatsForHorizon(
  events: CalendarEvent[],
  goalIds: string[],
  horizon: TimeHorizon,
  weekStart: string,
  weekEnd: string,
  monthStart: string,
  monthEnd: string,
): Map<string, { planned: number; completed: number }> {
  const stats = new Map<string, { planned: number; completed: number }>();

  // Initialize all goals
  for (const id of goalIds) {
    stats.set(id, { planned: 0, completed: 0 });
  }

  for (const event of events) {
    if (!event.sourceGoalId) continue;
    if (event.isExternal) continue;
    if (!stats.has(event.sourceGoalId)) continue;

    // Apply time horizon filter
    if (horizon !== "all-time" && event.date) {
      if (horizon === "this-week") {
        if (event.date < weekStart || event.date > weekEnd) continue;
      } else if (horizon === "this-month") {
        if (event.date < monthStart || event.date > monthEnd) continue;
      }
    }

    const current = stats.get(event.sourceGoalId)!;
    current.planned += event.durationMinutes;
    if (event.status === "completed") {
      current.completed += event.durationMinutes;
    }
  }

  return stats;
}

/**
 * Convert minutes to hours rounded to 1 decimal place.
 */
function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

/**
 * Get ISO date string for start of current month.
 */
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
}

/**
 * Get ISO date string for end of current month.
 */
function getMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
}

// =============================================================================
// Tab Button Component
// =============================================================================

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function StatsView({
  goals,
  events,
  lifeAreas,
  weekDates,
  className,
}: StatsViewProps) {
  const [horizon, setHorizon] = React.useState<TimeHorizon>("all-time");
  const [mode, setMode] = React.useState<DistributionMode>("goals");
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  // Memoize week boundaries
  const weekStart = React.useMemo(
    () => weekDates[0]?.toISOString().split("T")[0] ?? "",
    [weekDates],
  );
  const weekEnd = React.useMemo(
    () => weekDates[6]?.toISOString().split("T")[0] ?? "",
    [weekDates],
  );

  // Memoize month boundaries
  const monthStart = React.useMemo(() => getMonthStart(), []);
  const monthEnd = React.useMemo(() => getMonthEnd(), []);

  // Compute per-goal stats for the selected horizon
  const goalIds = React.useMemo(() => goals.map((g) => g.id), [goals]);
  const rawStats = React.useMemo(
    () =>
      computeGoalStatsForHorizon(
        events,
        goalIds,
        horizon,
        weekStart,
        weekEnd,
        monthStart,
        monthEnd,
      ),
    [events, goalIds, horizon, weekStart, weekEnd, monthStart, monthEnd],
  );

  // Convert to WeeklyAnalyticsItem[] for the goal list
  const goalItems: WeeklyAnalyticsItem[] = React.useMemo(
    () =>
      goals.map((goal) => {
        const stats = rawStats.get(goal.id) ?? { planned: 0, completed: 0 };
        return {
          id: goal.id,
          label: goal.label,
          icon: goal.icon,
          color: getIconColorClass(goal.color),
          lifeAreaId: goal.lifeAreaId,
          plannedHours: minutesToHours(stats.planned),
          completedHours: minutesToHours(stats.completed),
        };
      }),
    [goals, rawStats],
  );

  // Aggregate goals into life-area-level items
  const lifeAreaItems: WeeklyAnalyticsItem[] = React.useMemo(() => {
    const areaStats = new Map<
      string,
      { planned: number; completed: number }
    >();
    for (const g of goalItems) {
      const current = areaStats.get(g.lifeAreaId) ?? {
        planned: 0,
        completed: 0,
      };
      areaStats.set(g.lifeAreaId, {
        planned: current.planned + g.plannedHours,
        completed: current.completed + g.completedHours,
      });
    }
    const laMap = new Map(lifeAreas.map((la) => [la.id, la]));
    return Array.from(areaStats.entries()).flatMap(([areaId, hours]) => {
      const la = laMap.get(areaId);
      if (!la) return [];
      return [
        {
          id: areaId,
          label: la.label,
          icon: la.icon,
          color: getIconColorClass(la.color),
          lifeAreaId: areaId,
          plannedHours: hours.planned,
          completedHours: hours.completed,
        },
      ];
    });
  }, [goalItems, lifeAreas]);

  // Sorted items: planned first (by % desc), then not planned
  const sortedGoals = React.useMemo(() => {
    const planned = goalItems
      .filter((i) => i.plannedHours > 0)
      .sort(
        (a, b) =>
          getProgress(b.completedHours, b.plannedHours) -
          getProgress(a.completedHours, a.plannedHours),
      );
    const notPlanned = goalItems.filter((i) => i.plannedHours === 0);
    return [...planned, ...notPlanned];
  }, [goalItems]);

  const sortedLifeAreaItems = React.useMemo(() => {
    const planned = lifeAreaItems
      .filter((i) => i.plannedHours > 0)
      .sort(
        (a, b) =>
          getProgress(b.completedHours, b.plannedHours) -
          getProgress(a.completedHours, a.plannedHours),
      );
    const notPlanned = lifeAreaItems.filter((i) => i.plannedHours === 0);
    return [...planned, ...notPlanned];
  }, [lifeAreaItems]);

  const displayItems = mode === "goals" ? sortedGoals : sortedLifeAreaItems;
  const rawDisplayItems = mode === "goals" ? goalItems : lifeAreaItems;

  // Compute totals (only from items with planned hours)
  const plannedItems = rawDisplayItems.filter((i) => i.plannedHours > 0);
  const totalPlanned = plannedItems.reduce(
    (sum, item) => sum + item.plannedHours,
    0,
  );
  const totalCompleted = plannedItems.reduce(
    (sum, item) => sum + item.completedHours,
    0,
  );
  const overallProgress = getProgress(totalCompleted, totalPlanned);

  // Build pie chart data with hex colors
  const pieChartItems: PieChartItem[] = React.useMemo(() => {
    // Build a color lookup from source data
    const goalColorMap = new Map<string, GoalColor>(
      goals.map((g) => [g.id, g.color]),
    );
    const laColorMap = new Map<string, GoalColor>(
      lifeAreas.map((la) => [la.id, la.color]),
    );

    return displayItems
      .filter((item) => item.completedHours > 0)
      .map((item) => {
        const sourceColor =
          mode === "goals"
            ? goalColorMap.get(item.id)
            : laColorMap.get(item.id);
        return {
          id: item.id,
          label: item.label,
          completedHours: item.completedHours,
          hexColor: sourceColor ? getHexColor(sourceColor) : "#64748b",
        };
      });
  }, [displayItems, goals, lifeAreas, mode]);

  const showToggle = lifeAreas.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col items-center overflow-y-auto bg-background",
        className,
      )}
    >
      <div className="flex w-full max-w-lg flex-col gap-6 px-6 py-8">
        {/* Title */}
        <h1 className="text-lg font-semibold text-foreground">Stats</h1>

        {/* Tab groups */}
        <div className="flex items-center justify-between">
          {/* Time horizon tabs */}
          <div className="flex rounded-md bg-muted p-0.5">
            <TabButton
              label="All time"
              active={horizon === "all-time"}
              onClick={() => setHorizon("all-time")}
            />
            <TabButton
              label="This week"
              active={horizon === "this-week"}
              onClick={() => setHorizon("this-week")}
            />
            <TabButton
              label="This month"
              active={horizon === "this-month"}
              onClick={() => setHorizon("this-month")}
            />
          </div>

          {/* Distribution mode tabs */}
          {showToggle && (
            <div className="flex rounded-md bg-muted p-0.5">
              <TabButton
                label="Goals"
                active={mode === "goals"}
                onClick={() => setMode("goals")}
              />
              <TabButton
                label="Life Areas"
                active={mode === "life-areas"}
                onClick={() => setMode("life-areas")}
              />
            </div>
          )}
        </div>

        {/* Pie chart */}
        <StatsPieChart
          items={pieChartItems}
          totalCompleted={totalCompleted}
          totalPlanned={totalPlanned}
          onHoverItem={setHoveredItemId}
        />

        {/* Overall progress header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">
              {horizon === "all-time"
                ? "All time"
                : horizon === "this-week"
                  ? "This week"
                  : "This month"}
            </span>
            <span className="text-xl font-semibold tabular-nums text-foreground">
              {overallProgress}%
            </span>
          </div>

          <DistributionProgressBar
            items={rawDisplayItems}
            totalPlanned={totalPlanned}
            onHoverItem={setHoveredItemId}
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {formatHours(totalCompleted)}h completed
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {formatHours(totalPlanned)}h planned
            </span>
          </div>
        </div>

        {/* Goal / life-area list */}
        <div className="flex flex-col gap-0.5">
          {displayItems.map((item) => (
            <WeeklyAnalyticsItemRow
              key={item.id}
              item={item}
              isHighlighted={hoveredItemId === item.id}
            />
          ))}
          {displayItems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No data for the selected time period.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
