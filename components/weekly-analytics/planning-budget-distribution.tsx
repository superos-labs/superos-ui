"use client";

/**
 * PlanningBudget Distribution Components
 *
 * Breakdown of scheduled goal hours by individual goals or life areas,
 * with a stacked bar and sortable list. Used inside PlanningBudget.
 */

import * as React from "react";
import { cn, formatHours, formatHoursWithUnit } from "@/lib/utils";
import { getIconColorClass, getHexColor, type GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea } from "@/lib/types";
import type { PlanningBudgetGoal } from "./planning-budget";

// =============================================================================
// Types
// =============================================================================

interface DistributionItem {
  id: string;
  label: string;
  icon?: IconComponent;
  color: GoalColor;
  hours: number;
}

type DistributionMode = "goals" | "life-areas";

// =============================================================================
// DistributionBar Component - Stacked bar for goals/life areas
// =============================================================================

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

interface DistributionSectionProps {
  goals: PlanningBudgetGoal[];
  scheduledGoalHours: number;
  lifeAreas: LifeArea[];
}

export function DistributionSection({
  goals,
  scheduledGoalHours,
  lifeAreas,
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

    // Create a lookup map from the passed lifeAreas
    const lifeAreaMap = new Map(lifeAreas.map((area) => [area.id, area]));

    return Array.from(areaHours.entries()).flatMap(([areaId, hours]) => {
      const area = lifeAreaMap.get(areaId);
      if (!area) return [];
      return [
        {
          id: areaId,
          label: area.label,
          icon: area.icon,
          color: area.color,
          hours,
        },
      ];
    });
  }, [goals, lifeAreas]);

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
