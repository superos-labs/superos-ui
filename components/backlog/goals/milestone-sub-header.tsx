/**
 * =============================================================================
 * File: milestone-sub-header.tsx
 * =============================================================================
 *
 * Lightweight sub-header row for rendering an active milestone inside the
 * backlog goal panel. Shows milestone label and optional deadline badge.
 *
 * Used within GoalItemRow when a goal has milestones enabled and is expanded,
 * rendering one sub-header per active milestone followed by its tasks.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render milestone label with a subtle visual indicator.
 * - Show optional deadline in compact format.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Milestone CRUD actions (those live in goal-detail).
 * - Task rendering (handled by the parent GoalItemRow).
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Intentionally minimal: no interactivity beyond label display.
 * - Matches the visual density of task rows for a cohesive list feel.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - MilestoneSubHeader
 * - MilestoneSubHeaderProps
 */

import { cn } from "@/lib/utils";
import { formatGranularDate } from "@/lib/unified-schedule";
import type { DateGranularity } from "@/lib/unified-schedule";

export interface MilestoneSubHeaderProps {
  label: string;
  deadline?: string;
  deadlineGranularity?: DateGranularity;
  className?: string;
}

export function MilestoneSubHeader({
  label,
  deadline,
  deadlineGranularity = "day",
  className,
}: MilestoneSubHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 pb-0.5 pt-3",
        className,
      )}
    >
      <span className="min-w-0 truncate text-[11px] font-medium text-muted-foreground/60">
        {label}
      </span>
      {deadline && (
        <span className="shrink-0 text-[10px] text-muted-foreground/40">
          · {formatGranularDate(deadline, deadlineGranularity)}
        </span>
      )}
    </div>
  );
}
