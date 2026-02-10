/**
 * =============================================================================
 * File: quarter-month-column.tsx
 * =============================================================================
 *
 * A single month column in the quarterly view.
 *
 * Renders a vertical column for one month containing:
 * 1. A month header with total completed / planned hours
 * 2. A distribution section (stacked bar + ranked list) with a Goals / Life
 *    Areas toggle — matching the DistributionSection pattern from planning
 * 3. A milestone list showing milestones due that month
 *
 * Columns without any time data show a graceful empty state.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render the month header with current-month highlighting.
 * - Render a stacked distribution bar and ranked list of completed hours.
 * - Toggle between goal-level and life-area-level distribution.
 * - Render milestone list with completed/upcoming visual states and date pills.
 * - Show graceful empty state when no time has been logged and no milestones.
 * - Emit click events for navigation to goal detail.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Computing which goals or milestones belong to this month.
 * - Quarter math or date resolution.
 * - Editing, scheduling, or drag-and-drop.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - QuarterMonthColumn
 * - QuarterMonthColumnProps
 * - MonthGoalStats
 * - MonthMilestone
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  getIconColorClass,
  getIconBgSoftClass,
  getHexColor,
} from "@/lib/colors";
import { RiCheckLine } from "@remixicon/react";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

/** Per-goal time stats for a single month. */
export interface MonthGoalStats {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
  /** Completed (or focused) hours for this goal in this month */
  completedHours: number;
  /** Planned hours for this goal in this month */
  plannedHours: number;
}

/** A milestone to display in the milestones list. */
export interface MonthMilestone {
  id: string;
  label: string;
  completed: boolean;
  goalId: string;
  goalLabel: string;
  goalIcon: IconComponent;
  goalColor: GoalColor;
  /** ISO deadline date (e.g., "2026-02-28") */
  deadline: string;
  /** Granularity of the deadline for display formatting */
  deadlineGranularity?: "day" | "month" | "quarter";
}

/** Generic distribution item for the bar + list. */
interface DistributionItem {
  id: string;
  label: string;
  icon?: IconComponent;
  color: GoalColor;
  hours: number;
}

type DistributionMode = "goals" | "life-areas";

export interface QuarterMonthColumnProps {
  /** Full month label (e.g., "January") */
  label: string;
  /** Whether this is the current month */
  isCurrent: boolean;
  /** Per-goal completed time stats for this month */
  goalStats: MonthGoalStats[];
  /** Life areas for the life-area distribution view */
  lifeAreas: LifeArea[];
  /** Milestones due in this month */
  milestones: MonthMilestone[];
  /** Click on a goal row or milestone */
  onGoalClick: (goalId: string) => void;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function formatHoursCompact(hours: number): string {
  if (hours === 0) return "0h";
  const formatted = hours.toFixed(1);
  return (formatted.endsWith(".0") ? Math.round(hours).toString() : formatted) + "h";
}

/** Short month names for date pill formatting */
const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format a milestone deadline as a compact pill label.
 * - "month" or "quarter" granularity → "End of mo."
 * - "day" or unset → "Jan 15" style
 */
function formatMilestoneDatePill(
  isoDate: string,
  granularity?: "day" | "month" | "quarter",
): string {
  if (granularity === "month" || granularity === "quarter") {
    return "End of mo.";
  }
  const d = new Date(isoDate + "T00:00:00");
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// =============================================================================
// Distribution Bar
// =============================================================================

function DistributionBar({
  items,
  totalHours,
  onHoverItem,
}: {
  items: DistributionItem[];
  totalHours: number;
  onHoverItem: (id: string | null) => void;
}) {
  const sorted = [...items]
    .filter((i) => i.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  if (totalHours <= 0 || sorted.length === 0) {
    return <div className="h-2 w-full rounded-full bg-muted" />;
  }

  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
      onMouseLeave={() => onHoverItem(null)}
    >
      {sorted.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "h-full cursor-pointer transition-opacity",
            index === 0 && "rounded-l-full",
            index === sorted.length - 1 && "rounded-r-full",
          )}
          style={{
            width: `${(item.hours / totalHours) * 100}%`,
            backgroundColor: getHexColor(item.color),
          }}
          title={`${item.label}: ${formatHoursCompact(item.hours)}`}
          onMouseEnter={() => onHoverItem(item.id)}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Distribution List
// =============================================================================

function DistributionList({
  items,
  totalHours,
  hoveredItemId,
  onGoalClick,
}: {
  items: DistributionItem[];
  totalHours: number;
  hoveredItemId: string | null;
  onGoalClick?: (id: string) => void;
}) {
  const sorted = [...items]
    .filter((i) => i.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  return (
    <div className="flex flex-col gap-0.5">
      {sorted.map((item) => {
        const Icon = item.icon;
        const pct = totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0;

        return (
          <button
            key={item.id}
            onClick={() => onGoalClick?.(item.id)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50",
              hoveredItemId === item.id && "bg-muted/50",
            )}
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
              {Icon && (
                <Icon className={cn("size-3", getIconColorClass(item.color))} />
              )}
            </div>

            <span className="flex-1 truncate text-xs text-foreground">
              {item.label}
            </span>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatHoursCompact(item.hours)}
              </span>
              <span className="w-7 text-right text-xs tabular-nums text-muted-foreground/70">
                {pct}%
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function QuarterMonthColumn({
  label,
  isCurrent,
  goalStats,
  lifeAreas,
  milestones,
  onGoalClick,
  className,
}: QuarterMonthColumnProps) {
  const [mode, setMode] = React.useState<DistributionMode>("goals");
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  const totalCompleted = goalStats.reduce((s, g) => s + g.completedHours, 0);
  const totalPlanned = goalStats.reduce((s, g) => s + g.plannedHours, 0);
  const hasTime = totalCompleted > 0 || totalPlanned > 0;
  const hasMilestones = milestones.length > 0;

  // Build goal-level distribution items
  const goalItems: DistributionItem[] = React.useMemo(
    () =>
      goalStats
        .filter((g) => g.completedHours > 0)
        .map((g) => ({
          id: g.id,
          label: g.label,
          icon: g.icon,
          color: g.color,
          hours: g.completedHours,
        })),
    [goalStats],
  );

  // Build life-area-level distribution items
  const lifeAreaItems: DistributionItem[] = React.useMemo(() => {
    const areaHours = new Map<string, number>();
    for (const g of goalStats) {
      if (g.completedHours > 0) {
        areaHours.set(g.lifeAreaId, (areaHours.get(g.lifeAreaId) ?? 0) + g.completedHours);
      }
    }
    const laMap = new Map(lifeAreas.map((la) => [la.id, la]));
    return Array.from(areaHours.entries()).flatMap(([areaId, hours]) => {
      const la = laMap.get(areaId);
      if (!la) return [];
      return [{ id: areaId, label: la.label, icon: la.icon, color: la.color, hours }];
    });
  }, [goalStats, lifeAreas]);

  const items = mode === "goals" ? goalItems : lifeAreaItems;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col min-w-0 border-r border-border last:border-r-0",
        className,
      )}
    >
      {/* Month header */}
      <div
        className={cn(
          "shrink-0 border-b border-border px-4 py-3",
          isCurrent ? "bg-muted/40" : "bg-transparent",
        )}
      >
        <div className="flex items-baseline justify-between">
          <span
            className={cn(
              "text-sm font-medium",
              isCurrent ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
          {hasTime && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatHoursCompact(totalCompleted)}
              {totalPlanned > 0 && (
                <span className="text-muted-foreground/50">
                  {" "}/ {formatHoursCompact(totalPlanned)}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Distribution section */}
        {hasTime && items.length > 0 ? (
          <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
            {/* Toggle header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                Distribution
              </span>
              <div className="flex rounded-md bg-muted p-0.5">
                <button
                  onClick={() => setMode("goals")}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                    mode === "goals"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Goals
                </button>
                <button
                  onClick={() => setMode("life-areas")}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                    mode === "life-areas"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Life Areas
                </button>
              </div>
            </div>

            {/* Stacked bar */}
            <DistributionBar
              items={items}
              totalHours={totalCompleted}
              onHoverItem={setHoveredItemId}
            />

            {/* Ranked list */}
            <DistributionList
              items={items}
              totalHours={totalCompleted}
              hoveredItemId={hoveredItemId}
              onGoalClick={mode === "goals" ? onGoalClick : undefined}
            />
          </div>
        ) : (
          /* Empty state — only show if no milestones either */
          !hasMilestones && (
            <div className="flex flex-1 items-center justify-center p-6">
              <span className="text-xs text-muted-foreground/40">
                No activity yet
              </span>
            </div>
          )
        )}

        {/* Divider */}
        {hasTime && items.length > 0 && hasMilestones && (
          <div className="mx-4 border-t border-border" />
        )}

        {/* Milestones section */}
        {hasMilestones && (
          <div className="flex flex-col gap-0.5 px-2 pt-4 pb-4">
            <span className="mb-1.5 px-2 text-[11px] font-medium text-muted-foreground">
              Milestones
            </span>
            {milestones.map((m) => (
              <button
                key={m.id}
                onClick={() => onGoalClick(m.goalId)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/50",
                  m.completed && "opacity-40",
                )}
              >
                {/* Status indicator */}
                {m.completed ? (
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full",
                      getIconBgSoftClass(m.goalColor),
                    )}
                  >
                    <RiCheckLine
                      className={cn(
                        "size-2.5",
                        getIconColorClass(m.goalColor),
                      )}
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "size-2 shrink-0 rotate-45 rounded-[1px]",
                      getIconBgSoftClass(m.goalColor),
                      "ring-1 ring-inset ring-current",
                      getIconColorClass(m.goalColor),
                    )}
                  />
                )}

                {/* Milestone label */}
                <div className="flex flex-1 flex-col min-w-0">
                  <span
                    className={cn(
                      "truncate text-xs",
                      m.completed
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {m.label}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground/70">
                    {m.goalLabel}
                  </span>
                </div>

                {/* Date pill */}
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {formatMilestoneDatePill(m.deadline, m.deadlineGranularity)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
