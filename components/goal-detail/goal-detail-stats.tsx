"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GoalStats } from "@/lib/unified-schedule";

export interface GoalDetailStatsProps {
  /** Computed stats for the goal */
  stats: GoalStats;
  className?: string;
}

function formatHours(hours: number): string {
  if (hours === 0) return "0h";
  // Format with one decimal place, but remove trailing .0
  const formatted = hours.toFixed(1);
  return formatted.endsWith(".0")
    ? `${Math.round(hours)}h`
    : `${formatted}h`;
}

export function GoalDetailStats({
  stats,
  className,
}: GoalDetailStatsProps) {
  const { plannedHours, completedHours } = stats;
  const progress = plannedHours > 0 
    ? Math.min(Math.round((completedHours / plannedHours) * 100), 100) 
    : 0;

  return (
    <div className={cn("flex flex-col gap-2 px-6 py-4", className)}>
      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            progress >= 100 ? "bg-green-500" : "bg-foreground/30",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats text */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {formatHours(completedHours)}
        </span>
        {" completed · "}
        <span>{formatHours(plannedHours)} planned</span>
      </p>
    </div>
  );
}
