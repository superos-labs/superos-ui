/**
 * =============================================================================
 * File: goal-detail-stats.tsx
 * =============================================================================
 *
 * Lightweight progress visualization for a goal.
 *
 * Displays:
 * - Completed hours.
 * - Planned hours.
 * - A simple progress bar derived from the ratio between them.
 *
 * Used inside the Goal Detail view to provide quick feedback on momentum.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Compute progress percentage from provided stats.
 * - Render progress bar and formatted hour values.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Computing stats.
 * - Persisting or mutating data.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Caps progress at 100%.
 * - Minimal visual treatment to avoid competing with core content.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalDetailStats
 * - GoalDetailStatsProps
 */

"use client";

import { cn, formatHoursWithUnit } from "@/lib/utils";
import type { GoalStats } from "@/lib/unified-schedule";

export interface GoalDetailStatsProps {
  /** Computed stats for the goal */
  stats: GoalStats;
  className?: string;
}

export function GoalDetailStats({ stats, className }: GoalDetailStatsProps) {
  const { plannedHours, completedHours } = stats;
  const progress =
    plannedHours > 0
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
          {formatHoursWithUnit(completedHours)}
        </span>
        {" completed · "}
        <span>{formatHoursWithUnit(plannedHours)} planned</span>
      </p>
    </div>
  );
}
