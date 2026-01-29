"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiArrowLeftSLine, RiSparklingLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { GoalItem } from "./goal-types";

// =============================================================================
// Goal List Item
// =============================================================================

interface GoalListItemProps {
  goal: GoalItem;
  isSelected?: boolean;
  onClick?: () => void;
}

function GoalListItem({ goal, isSelected, onClick }: GoalListItemProps) {
  const Icon = goal.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
        isSelected ? "bg-muted" : "hover:bg-muted/60",
      )}
    >
      {/* Icon - muted background with colored icon */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isSelected ? "bg-muted" : "bg-muted/60",
        )}
      >
        <Icon className={cn("size-4", getIconColorClass(goal.color))} />
      </div>

      {/* Label */}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm font-medium",
          isSelected ? "text-foreground" : "text-foreground/80",
        )}
      >
        {goal.label}
      </span>
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalListProps {
  /** Array of goal items to display */
  goals: GoalItem[];
  /** Currently selected goal ID */
  selectedGoalId?: string | null;
  /** Callback when a goal is selected */
  onSelectGoal?: (goalId: string) => void;
  /** Callback to go back (close goal detail mode) */
  onBack?: () => void;
  /** Callback to create a new goal and immediately select it */
  onCreateAndSelectGoal?: () => void;
  /** Callback to browse inspiration gallery */
  onBrowseInspiration?: () => void;
  /** Whether the inspiration gallery is currently active */
  isInspirationActive?: boolean;
  className?: string;
}

export function GoalList({
  goals,
  selectedGoalId,
  onSelectGoal,
  onBack,
  onCreateAndSelectGoal,
  onBrowseInspiration,
  isInspirationActive,
  className,
}: GoalListProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-1 px-2 py-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Go back"
          >
            <RiArrowLeftSLine className="size-5" />
          </button>
        )}
        <h3 className="text-sm font-semibold text-foreground">Goals</h3>
      </div>

      {/* Goal list */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-2">
        {goals.map((goal) => (
          <GoalListItem
            key={goal.id}
            goal={goal}
            isSelected={selectedGoalId === goal.id}
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
                isInspirationActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
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

/**
 * @deprecated Use GoalList instead. Kept for backward compatibility.
 */
export const BacklogGoalList = GoalList;
