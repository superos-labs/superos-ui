"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Types
type IconComponent = React.ComponentType<{ className?: string }>;

interface WeeklyAnalyticsItem {
  id: string;
  label: string;
  icon: IconComponent;
  color: string;
  plannedHours: number;
  completedHours: number;
}

interface WeeklyAnalyticsSectionData {
  title: string;
  items: WeeklyAnalyticsItem[];
}

// Helper to format hours
function formatHours(hours: number): string {
  return `${hours}h`;
}

// Helper to calculate progress percentage
function getProgress(completed: number, planned: number): number {
  if (planned === 0) return 0;
  return Math.min(Math.round((completed / planned) * 100), 100);
}

// Progress bar component
interface ProgressBarProps {
  completed: number;
  planned: number;
  className?: string;
}

function ProgressBar({ completed, planned, className }: ProgressBarProps) {
  const progress = getProgress(completed, planned);
  const isComplete = completed >= planned;

  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          isComplete ? "bg-green-500" : "bg-foreground/30"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Item row component
interface WeeklyAnalyticsItemRowProps {
  item: WeeklyAnalyticsItem;
  className?: string;
}

function WeeklyAnalyticsItemRow({ item, className }: WeeklyAnalyticsItemRowProps) {
  const IconComponent = item.icon;
  const progress = getProgress(item.completedHours, item.plannedHours);
  const isComplete = item.completedHours >= item.plannedHours;

  return (
    <div className={cn("flex flex-col gap-1.5 px-3 py-2", className)}>
      <div className="flex items-center gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <IconComponent className={cn("size-3.5", item.color)} />
        </div>

        <span className="flex-1 truncate text-sm text-foreground">
          {item.label}
        </span>

        <div className="flex shrink-0 items-center gap-1.5 text-xs">
          <span
            className={cn(
              "tabular-nums",
              isComplete ? "text-green-600" : "text-foreground"
            )}
          >
            {formatHours(item.completedHours)}
          </span>
          <span className="text-muted-foreground/50">/</span>
          <span className="tabular-nums text-muted-foreground">
            {formatHours(item.plannedHours)}
          </span>
        </div>
      </div>

      <div className="pl-10">
        <ProgressBar completed={item.completedHours} planned={item.plannedHours} />
      </div>
    </div>
  );
}

// Section component
interface WeeklyAnalyticsSectionProps {
  title: string;
  items: WeeklyAnalyticsItem[];
  className?: string;
}

function WeeklyAnalyticsSection({ title, items, className }: WeeklyAnalyticsSectionProps) {
  const totalPlanned = items.reduce((sum, item) => sum + item.plannedHours, 0);
  const totalCompleted = items.reduce((sum, item) => sum + item.completedHours, 0);
  const isComplete = totalCompleted >= totalPlanned;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "tabular-nums font-medium",
              isComplete ? "text-green-600" : "text-foreground"
            )}
          >
            {formatHours(totalCompleted)}
          </span>
          <span className="text-muted-foreground/50">/</span>
          <span className="tabular-nums text-muted-foreground">
            {formatHours(totalPlanned)}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        {items.map((item) => (
          <WeeklyAnalyticsItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// Summary header component
interface WeeklyAnalyticsHeaderProps {
  totalPlanned: number;
  totalCompleted: number;
  weekLabel?: string;
  className?: string;
}

function WeeklyAnalyticsHeader({
  totalPlanned,
  totalCompleted,
  weekLabel = "This Week",
  className,
}: WeeklyAnalyticsHeaderProps) {
  const progress = getProgress(totalCompleted, totalPlanned);
  const remaining = Math.max(totalPlanned - totalCompleted, 0);

  return (
    <div className={cn("flex flex-col gap-3 px-4 py-4", className)}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">{weekLabel}</h2>
        <span className="text-xs text-muted-foreground">{progress}% complete</span>
      </div>

      <div className="flex flex-col gap-2">
        <ProgressBar completed={totalCompleted} planned={totalPlanned} />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Completed:</span>
              <span className="tabular-nums font-medium text-foreground">
                {formatHours(totalCompleted)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Planned:</span>
              <span className="tabular-nums font-medium text-foreground">
                {formatHours(totalPlanned)}
              </span>
            </div>
          </div>
          {remaining > 0 && (
            <span className="text-muted-foreground">
              {formatHours(remaining)} remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component
interface WeeklyAnalyticsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of commitment items */
  commitments: WeeklyAnalyticsItem[];
  /** Array of goal items */
  goals: WeeklyAnalyticsItem[];
  /** Label for the week (e.g., "This Week", "Jan 20-26") */
  weekLabel?: string;
  /** Whether to show the summary header */
  showSummary?: boolean;
}

function WeeklyAnalytics({
  commitments,
  goals,
  weekLabel = "This Week",
  showSummary = true,
  className,
  ...props
}: WeeklyAnalyticsProps) {
  const totalCommitmentPlanned = commitments.reduce(
    (sum, item) => sum + item.plannedHours,
    0
  );
  const totalCommitmentCompleted = commitments.reduce(
    (sum, item) => sum + item.completedHours,
    0
  );
  const totalGoalPlanned = goals.reduce(
    (sum, item) => sum + item.plannedHours,
    0
  );
  const totalGoalCompleted = goals.reduce(
    (sum, item) => sum + item.completedHours,
    0
  );

  const totalPlanned = totalCommitmentPlanned + totalGoalPlanned;
  const totalCompleted = totalCommitmentCompleted + totalGoalCompleted;

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      {showSummary && (
        <WeeklyAnalyticsHeader
          totalPlanned={totalPlanned}
          totalCompleted={totalCompleted}
          weekLabel={weekLabel}
          className="border-b border-border"
        />
      )}

      <div className="flex flex-col divide-y divide-border">
        <WeeklyAnalyticsSection
          title="Commitments"
          items={commitments}
          className="py-2"
        />

        <WeeklyAnalyticsSection title="Goals" items={goals} className="py-2" />
      </div>
    </div>
  );
}

export { WeeklyAnalytics, WeeklyAnalyticsSection, WeeklyAnalyticsItemRow, WeeklyAnalyticsHeader };
export type { WeeklyAnalyticsProps, WeeklyAnalyticsItem, WeeklyAnalyticsSectionData };
