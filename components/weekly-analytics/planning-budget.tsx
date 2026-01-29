"use client";

/**
 * PlanningBudget - Time budget analytics for weekly planning mode.
 *
 * Shows time as a diminishing resource:
 * - 168h total week → essentials consumed → available for goals
 * - Real-time updates as items are scheduled
 * - Distribution by goals or life areas (toggle)
 */

import * as React from "react";
import { cn, formatHours, formatHoursWithUnit } from "@/lib/utils";
import { getIconColorClass, getHexColor, type GoalColor } from "@/lib/colors";
import { getLifeArea, LIFE_AREAS } from "@/lib/life-areas";
import type { IconComponent } from "@/lib/types";
import { RiMoonLine, RiTimeLine } from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

export interface PlanningBudgetGoal {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
  /** Hours scheduled this week */
  scheduledHours: number;
}

export interface PlanningBudgetEssential {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** Hours scheduled this week */
  scheduledHours: number;
}

export interface PlanningBudgetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Goals with their scheduled hours */
  goals: PlanningBudgetGoal[];
  /** Essentials with their scheduled hours (from calendar blocks) */
  essentials: PlanningBudgetEssential[];
  /** Wake up time in minutes from midnight */
  wakeUpMinutes: number;
  /** Wind down time in minutes from midnight */
  windDownMinutes: number;
  /** Whether sleep is configured */
  isSleepConfigured: boolean;
  /** Week label for display */
  weekLabel?: string;
}

// =============================================================================
// Constants
// =============================================================================

const TOTAL_WEEKLY_HOURS = 168;

// =============================================================================
// Helpers
// =============================================================================

/**
 * Calculate sleep hours from wake up and wind down times.
 * Assumes wind down is in the evening and wake up is in the morning.
 */
function calculateSleepHours(
  wakeUpMinutes: number,
  windDownMinutes: number,
): number {
  // Time from midnight to wake up
  const morningMinutes = wakeUpMinutes;
  // Time from wind down to midnight
  const eveningMinutes = 24 * 60 - windDownMinutes;
  // Total sleep per day
  const sleepMinutesPerDay = morningMinutes + eveningMinutes;
  // Weekly total (7 days)
  return (sleepMinutesPerDay * 7) / 60;
}

// =============================================================================
// WaterfallBar Component - Visual breakdown of time allocation
// =============================================================================

interface WaterfallSegment {
  id: string;
  label: string;
  hours: number;
  color: string; // Tailwind bg class or hex
  textColor?: string;
}

interface WaterfallBarProps {
  segments: WaterfallSegment[];
  totalHours: number;
  className?: string;
}

function WaterfallBar({ segments, totalHours, className }: WaterfallBarProps) {
  return (
    <div
      className={cn(
        "flex h-3 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      {segments.map((segment) => {
        const widthPercent = (segment.hours / totalHours) * 100;
        if (widthPercent <= 0) return null;
        return (
          <div
            key={segment.id}
            className={cn("h-full transition-all duration-300", segment.color)}
            style={{ width: `${widthPercent}%` }}
            title={`${segment.label}: ${formatHoursWithUnit(segment.hours)}`}
          />
        );
      })}
    </div>
  );
}

// =============================================================================
// BudgetHeader Component - Shows 168h breakdown
// =============================================================================

interface BudgetHeaderProps {
  sleepHours: number;
  essentialsHours: number;
  availableHours: number;
  isSleepConfigured: boolean;
  weekLabel: string;
}

function BudgetHeader({
  sleepHours,
  essentialsHours,
  availableHours,
  isSleepConfigured,
  weekLabel,
}: BudgetHeaderProps) {
  const committedHours = sleepHours + essentialsHours;

  const segments: WaterfallSegment[] = [];

  if (isSleepConfigured && sleepHours > 0) {
    segments.push({
      id: "sleep",
      label: "Sleep",
      hours: sleepHours,
      color: "bg-indigo-500/60",
    });
  }

  if (essentialsHours > 0) {
    segments.push({
      id: "essentials",
      label: "Essentials",
      hours: essentialsHours,
      color: "bg-slate-400/60",
    });
  }

  // Available shown as empty/muted
  segments.push({
    id: "available",
    label: "Available",
    hours: availableHours,
    color: "bg-muted",
  });

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Title */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">{weekLabel}</h2>
        <span className="text-xs text-muted-foreground">
          {formatHours(TOTAL_WEEKLY_HOURS)}h total
        </span>
      </div>

      {/* Waterfall bar */}
      <div className="flex flex-col gap-2">
        <WaterfallBar segments={segments} totalHours={TOTAL_WEEKLY_HOURS} />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {isSleepConfigured && sleepHours > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-indigo-500/60" />
              <span>Sleep {formatHours(sleepHours)}h</span>
            </div>
          )}
          {essentialsHours > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-slate-400/60" />
              <span>Essentials {formatHours(essentialsHours)}h</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted ring-1 ring-inset ring-border" />
            <span>Available {formatHours(availableHours)}h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BudgetTracker Component - Shows scheduled vs remaining
// =============================================================================

interface BudgetTrackerProps {
  availableHours: number;
  scheduledGoalHours: number;
  remainingHours: number;
}

function BudgetTracker({
  availableHours,
  scheduledGoalHours,
  remainingHours,
}: BudgetTrackerProps) {
  const scheduledPercent =
    availableHours > 0 ? (scheduledGoalHours / availableHours) * 100 : 0;

  const isOverBudget = remainingHours < 0;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4">
      {/* Hero number */}
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Time for Goals
        </span>
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums",
              isOverBudget ? "text-amber-600" : "text-foreground",
            )}
          >
            {formatHours(Math.max(0, remainingHours))}h
          </span>
          <span className="text-sm text-muted-foreground">remaining</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isOverBudget
                ? "bg-amber-500"
                : scheduledPercent > 80
                  ? "bg-emerald-500"
                  : "bg-foreground/70",
            )}
            style={{ width: `${Math.min(scheduledPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatHours(scheduledGoalHours)}h scheduled</span>
          <span>{formatHours(availableHours)}h available</span>
        </div>
      </div>

      {/* Over budget warning */}
      {isOverBudget && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-500">
          <RiTimeLine className="size-3.5 shrink-0" />
          <span>
            {formatHours(Math.abs(remainingHours))}h over your available time
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DistributionBar Component - Stacked bar for goals/life areas
// =============================================================================

interface DistributionItem {
  id: string;
  label: string;
  icon?: IconComponent;
  color: GoalColor;
  hours: number;
}

interface DistributionBarProps {
  items: DistributionItem[];
  totalHours: number;
  onHoverItem?: (id: string | null) => void;
  className?: string;
}

function DistributionBar({
  items,
  totalHours,
  onHoverItem,
  className,
}: DistributionBarProps) {
  // Sort by hours descending
  const sortedItems = [...items]
    .filter((item) => item.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  if (totalHours <= 0 || sortedItems.length === 0) {
    return (
      <div className={cn("h-2.5 w-full rounded-full bg-muted", className)} />
    );
  }

  return (
    <div
      className={cn(
        "flex h-2.5 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      onMouseLeave={() => onHoverItem?.(null)}
    >
      {sortedItems.map((item, index) => {
        const widthPercent = (item.hours / totalHours) * 100;
        const bgColor = `bg-${item.color}-500`;
        return (
          <div
            key={item.id}
            className={cn(
              "h-full cursor-pointer transition-all",
              bgColor,
              index === 0 && "rounded-l-full",
              index === sortedItems.length - 1 && "rounded-r-full",
            )}
            style={{
              width: `${widthPercent}%`,
              backgroundColor: getHexColor(item.color),
            }}
            title={`${item.label}: ${formatHoursWithUnit(item.hours)}`}
            onMouseEnter={() => onHoverItem?.(item.id)}
          />
        );
      })}
    </div>
  );
}

// =============================================================================
// DistributionList Component - Item rows with hours
// =============================================================================

interface DistributionListProps {
  items: DistributionItem[];
  totalHours: number;
  hoveredItemId?: string | null;
}

function DistributionList({
  items,
  totalHours,
  hoveredItemId,
}: DistributionListProps) {
  // Sort by hours descending, filter out zero-hour items
  const sortedItems = [...items]
    .filter((item) => item.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-sm text-muted-foreground">No goals scheduled yet.</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Drag goals to the calendar to allocate time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {sortedItems.map((item) => {
        const IconComponent = item.icon;
        const percent = totalHours > 0 ? (item.hours / totalHours) * 100 : 0;
        const isHighlighted = hoveredItemId === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
              isHighlighted && "bg-muted/50",
            )}
          >
            {/* Icon */}
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/60">
              {IconComponent && (
                <IconComponent
                  className={cn("size-3", getIconColorClass(item.color))}
                />
              )}
            </div>

            {/* Label */}
            <span className="flex-1 truncate text-sm text-foreground">
              {item.label}
            </span>

            {/* Hours and percent */}
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm tabular-nums text-foreground">
                {formatHours(item.hours)}h
              </span>
              <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                {Math.round(percent)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// DistributionSection Component - With toggle for goals/life areas
// =============================================================================

type DistributionMode = "goals" | "life-areas";

interface DistributionSectionProps {
  goals: PlanningBudgetGoal[];
  scheduledGoalHours: number;
}

function DistributionSection({
  goals,
  scheduledGoalHours,
}: DistributionSectionProps) {
  const [mode, setMode] = React.useState<DistributionMode>("goals");
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  // Build goal items
  const goalItems: DistributionItem[] = goals
    .filter((g) => g.scheduledHours > 0)
    .map((goal) => ({
      id: goal.id,
      label: goal.label,
      icon: goal.icon,
      color: goal.color,
      hours: goal.scheduledHours,
    }));

  // Build life area items by aggregating goals
  const lifeAreaItems: DistributionItem[] = React.useMemo(() => {
    const areaHours = new Map<string, number>();

    goals.forEach((goal) => {
      if (goal.scheduledHours > 0) {
        const current = areaHours.get(goal.lifeAreaId) ?? 0;
        areaHours.set(goal.lifeAreaId, current + goal.scheduledHours);
      }
    });

    return Array.from(areaHours.entries())
      .map(([areaId, hours]) => {
        const area = getLifeArea(areaId);
        if (!area) return null;
        return {
          id: areaId,
          label: area.label,
          icon: area.icon,
          color: area.color,
          hours,
        };
      })
      .filter((item): item is DistributionItem => item !== null);
  }, [goals]);

  const items = mode === "goals" ? goalItems : lifeAreaItems;

  if (scheduledGoalHours <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Distribution
        </span>
        <div className="flex rounded-md bg-muted p-0.5">
          <button
            onClick={() => setMode("goals")}
            className={cn(
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
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
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
              mode === "life-areas"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Life Areas
          </button>
        </div>
      </div>

      {/* Distribution bar */}
      <DistributionBar
        items={items}
        totalHours={scheduledGoalHours}
        onHoverItem={setHoveredItemId}
      />

      {/* Distribution list */}
      <DistributionList
        items={items}
        totalHours={scheduledGoalHours}
        hoveredItemId={hoveredItemId}
      />
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PlanningBudget({
  goals,
  essentials,
  wakeUpMinutes,
  windDownMinutes,
  isSleepConfigured,
  weekLabel = "Your Week",
  className,
  ...props
}: PlanningBudgetProps) {
  // Calculate time budget
  const sleepHours = isSleepConfigured
    ? calculateSleepHours(wakeUpMinutes, windDownMinutes)
    : 0;

  const essentialsHours = essentials.reduce(
    (sum, e) => sum + e.scheduledHours,
    0,
  );
  const committedHours = sleepHours + essentialsHours;
  const availableHours = TOTAL_WEEKLY_HOURS - committedHours;

  const scheduledGoalHours = goals.reduce(
    (sum, g) => sum + g.scheduledHours,
    0,
  );
  const remainingHours = availableHours - scheduledGoalHours;

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Header: 168h breakdown */}
      <BudgetHeader
        sleepHours={sleepHours}
        essentialsHours={essentialsHours}
        availableHours={availableHours}
        isSleepConfigured={isSleepConfigured}
        weekLabel={weekLabel}
      />

      {/* Tracker: Scheduled vs remaining */}
      <BudgetTracker
        availableHours={availableHours}
        scheduledGoalHours={scheduledGoalHours}
        remainingHours={remainingHours}
      />

      {/* Distribution: Goals or life areas */}
      <DistributionSection
        goals={goals}
        scheduledGoalHours={scheduledGoalHours}
      />
    </div>
  );
}
