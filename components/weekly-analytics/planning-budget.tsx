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
import type { GoalColor } from "@/lib/colors";
import { LIFE_AREAS } from "@/lib/life-areas";
import type { IconComponent, LifeArea } from "@/lib/types";
import { RiTimeLine } from "@remixicon/react";
import { DistributionSection } from "./planning-budget-distribution";

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
  /** All life areas (default + custom) for distribution view */
  lifeAreas?: LifeArea[];
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
  scheduledGoalHours: number;
  remainingHours: number;
  isSleepConfigured: boolean;
  weekLabel: string;
}

function BudgetHeader({
  sleepHours,
  essentialsHours,
  scheduledGoalHours,
  remainingHours,
  isSleepConfigured,
}: BudgetHeaderProps) {
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

  // Goals shown as violet
  if (scheduledGoalHours > 0) {
    segments.push({
      id: "goals",
      label: "Goals",
      hours: scheduledGoalHours,
      color: "bg-violet-500/60",
    });
  }

  // Unallocated shown as empty/muted
  if (remainingHours > 0) {
    segments.push({
      id: "unallocated",
      label: "Unallocated",
      hours: remainingHours,
      color: "bg-muted",
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Title */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">Your time availability</h2>
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
          {scheduledGoalHours > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-violet-500/60" />
              <span>Goals {formatHours(scheduledGoalHours)}h</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted ring-1 ring-inset ring-border" />
            <span>Unallocated {formatHours(Math.max(0, remainingHours))}h</span>
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
  scheduledGoalHours: number;
  remainingHours: number;
  /** Total hours available for goals (168 - sleep - essentials) */
  goalBudgetHours: number;
}

function BudgetTracker({
  scheduledGoalHours,
  remainingHours,
  goalBudgetHours,
}: BudgetTrackerProps) {
  const scheduledPercent =
    goalBudgetHours > 0 ? (scheduledGoalHours / goalBudgetHours) * 100 : 0;

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
          <span>of {formatHours(goalBudgetHours)}h budget</span>
        </div>
      </div>

      {/* Over budget warning */}
      {isOverBudget && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-500">
          <RiTimeLine className="size-3.5 shrink-0" />
          <span>
            {formatHours(Math.abs(remainingHours))}h over budget
          </span>
        </div>
      )}
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
  lifeAreas = LIFE_AREAS,
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
        scheduledGoalHours={scheduledGoalHours}
        remainingHours={remainingHours}
        isSleepConfigured={isSleepConfigured}
        weekLabel={weekLabel}
      />

      {/* Tracker: Scheduled vs remaining */}
      <BudgetTracker
        scheduledGoalHours={scheduledGoalHours}
        remainingHours={remainingHours}
        goalBudgetHours={availableHours}
      />

      {/* Distribution: Goals or life areas */}
      <DistributionSection
        goals={goals}
        scheduledGoalHours={scheduledGoalHours}
        lifeAreas={lifeAreas}
      />
    </div>
  );
}
