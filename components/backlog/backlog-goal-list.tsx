"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiFolderLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { GoalStats } from "@/lib/unified-schedule";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { BacklogItem, NewGoalData } from "./backlog-types";
import { InlineGoalCreator } from "./inline-creators";

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
  /** Callback for creating a new goal */
  onCreateGoal?: (goal: NewGoalData) => void;
  /** Life areas for goal creation */
  lifeAreas?: LifeArea[];
  /** Available icons for goal creation */
  goalIcons?: GoalIconOption[];
  /** Callback to browse templates */
  onBrowseTemplates?: () => void;
  className?: string;
}

export function BacklogGoalList({
  goals,
  selectedGoalId,
  onSelectGoal,
  getGoalStats,
  onCreateGoal,
  lifeAreas,
  goalIcons,
  onBrowseTemplates,
  className,
}: BacklogGoalListProps) {
  const [isCreating, setIsCreating] = React.useState(false);

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

        {/* Inline goal creator */}
        {isCreating && onCreateGoal && lifeAreas && goalIcons && (
          <InlineGoalCreator
            lifeAreas={lifeAreas}
            goalIcons={goalIcons}
            onSave={(goal) => {
              onCreateGoal(goal);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-border px-3 py-2">
        <div className="flex flex-col gap-0.5">
          {/* New goal button */}
          {onCreateGoal && lifeAreas && goalIcons && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <RiAddLine className="size-4" />
              <span>New goal</span>
            </button>
          )}

          {/* Browse templates button */}
          {onBrowseTemplates && (
            <button
              onClick={onBrowseTemplates}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <RiFolderLine className="size-4" />
              <span>Browse templates</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
