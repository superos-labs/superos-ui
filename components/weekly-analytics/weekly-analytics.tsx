"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { IconComponent } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface WeeklyAnalyticsItem {
  id: string;
  label: string;
  icon: IconComponent;
  color: string;
  plannedHours: number;
  completedHours: number;
}

export interface WeeklyAnalyticsSectionData {
  title: string;
  items: WeeklyAnalyticsItem[];
}

// =============================================================================
// Helpers
// =============================================================================

function formatHours(hours: number): string {
  // Format with one decimal place, but remove trailing .0
  const formatted = hours.toFixed(1);
  return formatted.endsWith(".0")
    ? `${Math.round(hours)}h`
    : `${formatted}h`;
}

function getProgress(completed: number, planned: number): number {
  if (planned === 0) return 0;
  return Math.min(Math.round((completed / planned) * 100), 100);
}

// =============================================================================
// ProgressBar Component
// =============================================================================

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  className?: string;
}

function ProgressBar({ progress, colorClass, className }: ProgressBarProps) {
  const isComplete = progress >= 100;

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          isComplete ? "bg-green-500" : colorClass || "bg-foreground/30"
        )}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

// =============================================================================
// DistributionProgressBar Component
// =============================================================================

interface DistributionProgressBarProps {
  items: WeeklyAnalyticsItem[];
  totalPlanned: number;
  onHoverItem?: (id: string | null) => void;
  className?: string;
}

function DistributionProgressBar({
  items,
  totalPlanned,
  onHoverItem,
  className,
}: DistributionProgressBarProps) {
  // Filter to items with completed time, sort by completed hours descending
  const activeItems = items
    .filter((item) => item.completedHours > 0)
    .sort((a, b) => b.completedHours - a.completedHours);

  if (totalPlanned === 0) {
    return <div className={cn("h-2 w-full rounded-full bg-muted", className)} />;
  }

  // Each segment's width is relative to totalPlanned (not totalCompleted)
  // This makes the filled portion = overall progress %
  return (
    <div
      className={cn(
        "flex h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      onMouseLeave={() => onHoverItem?.(null)}
    >
      {activeItems.map((item, index) => {
        const widthPercent = (item.completedHours / totalPlanned) * 100;
        // Map the color class to a background color
        const bgColor = item.color.replace("text-", "bg-");
        return (
          <div
            key={item.id}
            className={cn(
              "h-full cursor-pointer transition-all",
              bgColor,
              index === 0 && "rounded-l-full"
            )}
            style={{ width: `${widthPercent}%` }}
            title={`${item.label}: ${formatHours(item.completedHours)}`}
            onMouseEnter={() => onHoverItem?.(item.id)}
          />
        );
      })}
    </div>
  );
}

// =============================================================================
// WeeklyAnalyticsItemRow Component
// =============================================================================

interface WeeklyAnalyticsItemRowProps {
  item: WeeklyAnalyticsItem;
  isHighlighted?: boolean;
  className?: string;
}

export function WeeklyAnalyticsItemRow({
  item,
  isHighlighted,
  className,
}: WeeklyAnalyticsItemRowProps) {
  const IconComponent = item.icon;
  const isPlanned = item.plannedHours > 0;
  const progress = getProgress(item.completedHours, item.plannedHours);
  const isComplete = item.completedHours >= item.plannedHours && isPlanned;

  // Muted row for items with no planned hours
  if (!isPlanned) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-1.5 opacity-50 transition-colors",
          isHighlighted && "bg-muted/50",
          className
        )}
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/40">
          <IconComponent className={cn("size-3", item.color)} />
        </div>
        <span className="flex-1 truncate text-sm text-muted-foreground">
          {item.label}
        </span>
        <span className="text-xs text-muted-foreground">not planned</span>
      </div>
    );
  }

  // Active row with % and progress bar
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
        isHighlighted && "bg-muted/50",
        className
      )}
    >
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/60">
        <IconComponent className={cn("size-3", item.color)} />
      </div>

      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
        {item.label}
      </span>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "w-8 text-right text-xs tabular-nums",
            isComplete ? "font-medium text-green-600" : "text-foreground"
          )}
        >
          {progress}%
        </span>
        <div className="w-20">
          <ProgressBar progress={progress} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// WeeklyAnalyticsSection Component
// =============================================================================

interface WeeklyAnalyticsSectionProps {
  title: string;
  items: WeeklyAnalyticsItem[];
  hoveredItemId?: string | null;
  className?: string;
}

export function WeeklyAnalyticsSection({
  title,
  items,
  hoveredItemId,
  className,
}: WeeklyAnalyticsSectionProps) {
  // Calculate section totals (only from items with planned hours)
  const plannedItems = items.filter((i) => i.plannedHours > 0);
  const totalPlanned = plannedItems.reduce(
    (sum, item) => sum + item.plannedHours,
    0
  );
  const totalCompleted = plannedItems.reduce(
    (sum, item) => sum + item.completedHours,
    0
  );
  const sectionProgress = getProgress(totalCompleted, totalPlanned);

  // Sort: items with planned hours first (by % desc), then not planned
  const sortedItems = React.useMemo(() => {
    const planned = items
      .filter((i) => i.plannedHours > 0)
      .sort(
        (a, b) =>
          getProgress(b.completedHours, b.plannedHours) -
          getProgress(a.completedHours, a.plannedHours)
      );
    const notPlanned = items.filter((i) => i.plannedHours === 0);
    return [...planned, ...notPlanned];
  }, [items]);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        {totalPlanned > 0 && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {sectionProgress}%
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-2">
        {sortedItems.map((item) => (
          <WeeklyAnalyticsItemRow
            key={item.id}
            item={item}
            isHighlighted={hoveredItemId === item.id}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// WeeklyAnalyticsHeader Component
// =============================================================================

interface WeeklyAnalyticsHeaderProps {
  totalPlanned: number;
  totalCompleted: number;
  allItems: WeeklyAnalyticsItem[];
  weekLabel?: string;
  onHoverItem?: (id: string | null) => void;
  className?: string;
}

export function WeeklyAnalyticsHeader({
  totalPlanned,
  totalCompleted,
  allItems,
  weekLabel = "This Week",
  onHoverItem,
  className,
}: WeeklyAnalyticsHeaderProps) {
  const progress = getProgress(totalCompleted, totalPlanned);

  return (
    <div className={cn("flex flex-col gap-3 px-4 py-4", className)}>
      {/* Hero: Week label + % */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">{weekLabel}</h2>
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {progress}%
        </span>
      </div>

      {/* Unified progress + distribution bar */}
      <div className="flex flex-col gap-1.5">
        <DistributionProgressBar
          items={allItems}
          totalPlanned={totalPlanned}
          onHoverItem={onHoverItem}
        />
        <p className="text-xs text-muted-foreground">
          {formatHours(totalCompleted)} completed · {formatHours(totalPlanned)}{" "}
          planned
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface WeeklyAnalyticsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of commitment items */
  commitments: WeeklyAnalyticsItem[];
  /** Array of goal items */
  goals: WeeklyAnalyticsItem[];
  /** Label for the week (e.g., "This Week", "Jan 20-26") */
  weekLabel?: string;
  /** Whether to show the summary header */
  showSummary?: boolean;
}

export function WeeklyAnalytics({
  commitments,
  goals,
  weekLabel = "This Week",
  showSummary = true,
  className,
  ...props
}: WeeklyAnalyticsProps) {
  // Hover state for distribution bar → row highlighting
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  // Calculate totals only from items with planned hours
  const allItems = [...commitments, ...goals];
  const plannedItems = allItems.filter((i) => i.plannedHours > 0);

  const totalPlanned = plannedItems.reduce(
    (sum, item) => sum + item.plannedHours,
    0
  );
  const totalCompleted = plannedItems.reduce(
    (sum, item) => sum + item.completedHours,
    0
  );

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
          allItems={allItems}
          weekLabel={weekLabel}
          onHoverItem={setHoveredItemId}
          className="border-b border-border"
        />
      )}

      <div className="flex flex-col divide-y divide-border">
        <WeeklyAnalyticsSection
          title="Commitments"
          items={commitments}
          hoveredItemId={hoveredItemId}
          className="py-2"
        />

        <WeeklyAnalyticsSection
          title="Goals"
          items={goals}
          hoveredItemId={hoveredItemId}
          className="py-2"
        />
      </div>
    </div>
  );
}
