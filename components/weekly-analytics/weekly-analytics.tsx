/**
 * =============================================================================
 * File: weekly-analytics.tsx
 * =============================================================================
 *
 * Weekly progress analytics card for goals.
 *
 * Shows how much of the user's planned goal time has been completed,
 * both in aggregate and per-goal, with ranked rows and lightweight progress bars.
 * Supports viewing by individual goals or aggregated by life areas.
 *
 * Designed to support fast reflection on weekly execution quality.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define WeeklyAnalytics data types.
 * - Compute progress percentages from planned vs completed hours.
 * - Render title bar with icon and close button for dismissing the analytics panel.
 * - Render an optional summary header with unified progress and distribution.
 * - Render a ranked list of goals or life areas with per-item progress.
 * - Support toggling between "Goals" and "Life Areas" distribution modes.
 * - Aggregate goal data by life area when in life-areas mode.
 * - Coordinate hover state between distribution bar and rows.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting analytics data.
 * - Computing planned or completed hours.
 * - Providing recommendations or coaching.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Items with no planned hours are visually muted and listed last.
 * - Distribution bar segments represent contribution to total completed time,
 *   scaled against total planned hours.
 * - Over-100% progress is clamped.
 * - Goals/Life Areas toggle is positioned above the list for visual association.
 * - Title bar icon (RiPieChartLine) matches the analytics toggle in toolbar.
 * - Title bar and close button match IntegrationsSidebar pattern.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - WeeklyAnalytics
 * - WeeklyAnalyticsProps
 * - WeeklyAnalyticsItem
 * - WeeklyAnalyticsSection
 * - WeeklyAnalyticsItemRow
 * - WeeklyAnalyticsHeader
 * - ProgressBar
 * - DistributionProgressBar
 * - getProgress
 */

"use client";

import * as React from "react";
import { cn, formatHours, formatHoursWithUnit } from "@/lib/utils";
import type { IconComponent, LifeArea } from "@/lib/types";
import { getIconColorClass } from "@/lib/colors";
import { RiCloseLine, RiPieChartLine } from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

export interface WeeklyAnalyticsItem {
  id: string;
  label: string;
  icon: IconComponent;
  color: string;
  /** Life area this goal belongs to */
  lifeAreaId: string;
  /** Planned hours for this week */
  plannedHours: number;
  /** Completed hours (or focused hours, depending on metric) */
  completedHours: number;
}

export type DistributionMode = "goals" | "life-areas";

export interface WeeklyAnalyticsSectionData {
  title: string;
  items: WeeklyAnalyticsItem[];
}

// =============================================================================
// Helpers
// =============================================================================

export function getProgress(completed: number, planned: number): number {
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

export function ProgressBar({ progress, colorClass, className }: ProgressBarProps) {
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

export function DistributionProgressBar({
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
    return (
      <div className={cn("h-2 w-full rounded-full bg-muted", className)} />
    );
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
            title={`${item.label}: ${formatHoursWithUnit(item.completedHours)}`}
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

  // Active row with %, progress bar, and hours detail
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg px-2 py-2.5 transition-colors",
        isHighlighted && "bg-muted/50",
        className
      )}
    >
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/60 mt-0.5">
        <IconComponent className={cn("size-3", item.color)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-foreground">
            {item.label}
          </span>
          <span
            className={cn(
              "shrink-0 text-right text-xs tabular-nums",
              isComplete ? "font-medium text-green-600" : "text-foreground"
            )}
          >
            {progress}%
          </span>
        </div>
        <ProgressBar progress={progress} />
        <div className="flex items-center justify-between">
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatHours(item.completedHours)}h completed
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatHours(item.plannedHours)}h planned
          </span>
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
        <span className="text-sm font-medium text-foreground">{weekLabel}</span>
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
        <div className="flex items-center justify-between">
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatHours(totalCompleted)}h completed
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatHours(totalPlanned)}h planned
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface WeeklyAnalyticsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of goal items */
  goals: WeeklyAnalyticsItem[];
  /** Available life areas for aggregation in the life-areas distribution view */
  lifeAreas?: LifeArea[];
  /** Label for the week (e.g., "This Week", "Jan 20-26") */
  weekLabel?: string;
  /** Whether to show the summary header */
  showSummary?: boolean;
  /** Callback when user closes the analytics panel */
  onClose?: () => void;
}

export function WeeklyAnalytics({
  goals,
  lifeAreas = [],
  weekLabel = "This Week",
  showSummary = true,
  onClose,
  className,
  ...props
}: WeeklyAnalyticsProps) {
  // Hover state for distribution bar → row highlighting
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  // Toggle between goals and life-areas distribution
  const [mode, setMode] = React.useState<DistributionMode>("goals");

  // Calculate totals only from goals with planned hours
  // (Essentials excluded — they provide no actionable insight for weekly progress)
  const plannedGoals = goals.filter((i) => i.plannedHours > 0);

  const totalPlanned = plannedGoals.reduce(
    (sum, item) => sum + item.plannedHours,
    0
  );
  const totalCompleted = plannedGoals.reduce(
    (sum, item) => sum + item.completedHours,
    0
  );

  // Sort: items with planned hours first (by % desc), then not planned
  const sortedGoals = React.useMemo(() => {
    const planned = goals
      .filter((i) => i.plannedHours > 0)
      .sort(
        (a, b) =>
          getProgress(b.completedHours, b.plannedHours) -
          getProgress(a.completedHours, a.plannedHours)
      );
    const notPlanned = goals.filter((i) => i.plannedHours === 0);
    return [...planned, ...notPlanned];
  }, [goals]);

  // Aggregate goals into life-area-level items
  const lifeAreaItems: WeeklyAnalyticsItem[] = React.useMemo(() => {
    const areaStats = new Map<
      string,
      { planned: number; completed: number }
    >();
    for (const g of goals) {
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
  }, [goals, lifeAreas]);

  // Sort life area items: planned first (by % desc), then not planned
  const sortedLifeAreaItems = React.useMemo(() => {
    const planned = lifeAreaItems
      .filter((i) => i.plannedHours > 0)
      .sort(
        (a, b) =>
          getProgress(b.completedHours, b.plannedHours) -
          getProgress(a.completedHours, a.plannedHours)
      );
    const notPlanned = lifeAreaItems.filter((i) => i.plannedHours === 0);
    return [...planned, ...notPlanned];
  }, [lifeAreaItems]);

  const displayItems = mode === "goals" ? sortedGoals : sortedLifeAreaItems;
  const showToggle = lifeAreas.length > 0;

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      {/* Title bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
            <RiPieChartLine className="size-4 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Weekly analytics
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg",
              "text-muted-foreground transition-colors duration-150",
              "hover:bg-muted hover:text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Close"
          >
            <RiCloseLine className="size-4" />
          </button>
        )}
      </div>

      {showSummary && (
        <WeeklyAnalyticsHeader
          totalPlanned={totalPlanned}
          totalCompleted={totalCompleted}
          allItems={mode === "goals" ? goals : lifeAreaItems}
          weekLabel={weekLabel}
          onHoverItem={setHoveredItemId}
        />
      )}

      {/* Goal / life-area list with optional mode toggle */}
      <div className="flex flex-col gap-1 px-2 pb-3 pt-1">
        {/* Goals / Life Areas toggle */}
        {showToggle && (
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Show by
            </span>
            <div className="flex rounded-md bg-muted p-0.5">
              <button
                onClick={() => setMode("goals")}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                  mode === "goals"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Life Areas
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {displayItems.map((item) => (
            <WeeklyAnalyticsItemRow
              key={item.id}
              item={item}
              isHighlighted={hoveredItemId === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
