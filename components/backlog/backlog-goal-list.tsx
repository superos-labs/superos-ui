"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiSparklingLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { GoalStats } from "@/lib/unified-schedule";
import type { BacklogItem } from "./backlog-types";

// =============================================================================
// Goal List Item
// =============================================================================

interface GoalListItemProps {
  goal: BacklogItem;
  isSelected?: boolean;
  stats?: GoalStats;
  onClick?: () => void;
}

function GoalListItem({
  goal,
  isSelected,
  stats,
  onClick,
}: GoalListItemProps) {
  const Icon = goal.icon;
  const progress = stats && stats.plannedHours > 0
    ? Math.min(Math.round((stats.completedHours / stats.plannedHours) * 100), 100)
    : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
        isSelected
          ? "bg-muted"
          : "hover:bg-muted/60",
      )}
    >
      {/* Icon - muted background with colored icon */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isSelected ? "bg-muted" : "bg-muted/60",
        )}
      >
        <Icon
          className={cn(
            "size-4",
            getIconColorClass(goal.color),
          )}
        />
      </div>

      {/* Label and progress */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-sm font-medium",
            isSelected ? "text-foreground" : "text-foreground/80",
          )}
        >
          {goal.label}
        </span>
        {stats && stats.plannedHours > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progress >= 100 ? "bg-green-500" : "bg-foreground/20",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface BacklogGoalListProps {
  /** Array of goal items to display */
  goals: BacklogItem[];
  /** Currently selected goal ID */
  selectedGoalId?: string | null;
  /** Callback when a goal is selected */
  onSelectGoal?: (goalId: string) => void;
  /** Function to get computed stats for a goal */
  getGoalStats?: (goalId: string) => GoalStats;
  /** Callback to create a new goal and immediately select it */
  onCreateAndSelectGoal?: () => void;
  /** Callback to browse inspiration gallery */
  onBrowseInspiration?: () => void;
  /** Whether the inspiration gallery is currently active */
  isInspirationActive?: boolean;
  className?: string;
}

export function BacklogGoalList({
  goals,
  selectedGoalId,
  onSelectGoal,
  getGoalStats,
  onCreateAndSelectGoal,
  onBrowseInspiration,
  isInspirationActive,
  className,
}: BacklogGoalListProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Goals</h3>
      </div>

      {/* Goal list */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-2">
        {goals.map((goal) => (
          <GoalListItem
            key={goal.id}
            goal={goal}
            isSelected={selectedGoalId === goal.id}
            stats={getGoalStats?.(goal.id)}
            onClick={() => onSelectGoal?.(goal.id)}
          />
        ))}

        {/* New goal button - inline with goal list */}
        {onCreateAndSelectGoal && (
          <button
            onClick={onCreateAndSelectGoal}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted/60"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <RiAddLine className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">New goal</span>
          </button>
        )}

        {/* Browse inspiration button - inline with goal list */}
        {onBrowseInspiration && (
          <button
            onClick={onBrowseInspiration}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
              isInspirationActive ? "bg-muted" : "hover:bg-muted/60",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                isInspirationActive ? "bg-muted" : "bg-muted/60",
              )}
            >
              <RiSparklingLine className="size-4 text-muted-foreground" />
            </div>
            <span
              className={cn(
                "text-sm",
                isInspirationActive ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              Browse inspiration
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
