/**
 * =============================================================================
 * File: upcoming-deadlines-section.tsx
 * =============================================================================
 *
 * Inline section variant of upcoming deadlines.
 *
 * Displays a lightweight list of goal, milestone, and task deadlines,
 * collapsed to a near-term window by default, with optional expansion.
 *
 * Intended for embedding inside larger views (e.g., sidebars, panels)
 * rather than as a standalone card.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a list of upcoming deadlines.
 * - Format deadline dates into human-friendly labels.
 * - Collapse to a near-term window by default.
 * - Allow toggling between collapsed and expanded views.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching, filtering, or sorting deadlines.
 * - Persisting expansion state.
 * - Determining urgency or priority.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Mirrors behavior of UpcomingDeadlinesCard in a section form factor.
 * - 30-day window chosen as a sensible default horizon.
 * - Icon varies by deadline type (goal, milestone, task).
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - UpcomingDeadlinesSection
 * - UpcomingDeadlinesSectionProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiFlagLine, RiPokerDiamondsLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { QuarterDeadlineItem } from "@/lib/unified-schedule";

// =============================================================================
// Constants
// =============================================================================

/** Number of days to show in collapsed mode */
const DEFAULT_DAYS_LIMIT = 30;

// =============================================================================
// Types
// =============================================================================

export interface UpcomingDeadlinesSectionProps {
  /** Deadline items to display (already filtered and sorted) */
  deadlines: QuarterDeadlineItem[];
  /** Current week's start date for determining relative timing */
  weekStartDate: Date;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Format a deadline date for display.
 * Shows "Today", "Tomorrow", day of week for this week,
 * or formatted date for later dates.
 */
function formatDeadlineDate(deadline: string, weekStartDate: Date): string {
  const deadlineDate = new Date(deadline + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Calculate week end (6 days after week start)
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  if (deadlineDate.getTime() === today.getTime()) {
    return "Today";
  }

  if (deadlineDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }

  // If within this week, show day name
  if (deadlineDate >= weekStartDate && deadlineDate <= weekEnd) {
    return deadlineDate.toLocaleDateString("en-US", { weekday: "short" });
  }

  // Otherwise show abbreviated date
  return deadlineDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Filter deadlines to only those within the next N days from today.
 */
function filterDeadlinesWithinDays(
  deadlines: QuarterDeadlineItem[],
  days: number
): QuarterDeadlineItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() + days);
  const cutoffISO = cutoffDate.toISOString().split("T")[0];

  return deadlines.filter((d) => d.deadline <= cutoffISO);
}

// =============================================================================
// Deadline Row Component
// =============================================================================

interface DeadlineRowProps {
  deadline: QuarterDeadlineItem;
  formattedDate: string;
}

function DeadlineRow({ deadline, formattedDate }: DeadlineRowProps) {
  const GoalIcon = deadline.goalIcon;

  // Determine the icon based on type
  const renderIcon = () => {
    switch (deadline.type) {
      case "goal":
        return (
          <GoalIcon
            className={cn("size-3", getIconColorClass(deadline.goalColor))}
          />
        );
      case "milestone":
        return (
          <RiPokerDiamondsLine
            className={cn("size-3", getIconColorClass(deadline.goalColor))}
          />
        );
      case "task":
        return (
          <RiFlagLine
            className={cn("size-3", getIconColorClass(deadline.goalColor))}
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-md px-3 py-1.5">
      {/* Icon */}
      <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
        {renderIcon()}
      </div>

      {/* Label */}
      <span className="flex-1 truncate text-xs text-foreground">
        {deadline.label}
      </span>

      {/* Date */}
      <span className="shrink-0 text-xs text-muted-foreground">
        {formattedDate}
      </span>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function UpcomingDeadlinesSection({
  deadlines,
  weekStartDate,
  className,
}: UpcomingDeadlinesSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Get deadlines within the 30-day limit
  const deadlinesWithinLimit = React.useMemo(
    () => filterDeadlinesWithinDays(deadlines, DEFAULT_DAYS_LIMIT),
    [deadlines]
  );

  // Check if there are deadlines beyond the 30-day limit
  const hasDeadlinesBeyondLimit =
    deadlines.length > deadlinesWithinLimit.length;

  // Check if there are any deadlines within the limit
  const hasDeadlinesWithinLimit = deadlinesWithinLimit.length > 0;

  // Determine which deadlines to show:
  // - If no deadlines within limit, show all (no point in limiting)
  // - If expanded, show all
  // - Otherwise, show only within limit
  const filteredDeadlines = React.useMemo(() => {
    if (!hasDeadlinesWithinLimit || isExpanded) {
      return deadlines;
    }
    return deadlinesWithinLimit;
  }, [deadlines, deadlinesWithinLimit, hasDeadlinesWithinLimit, isExpanded]);

  if (deadlines.length === 0) {
    return null;
  }

  // Only show toggle when there are BOTH deadlines within limit AND beyond
  const showToggle = hasDeadlinesWithinLimit && hasDeadlinesBeyondLimit;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Section header */}
      <div className="flex items-center justify-between px-4 pb-1">
        <h4 className="text-xs font-medium text-muted-foreground">
          Upcoming deadlines
        </h4>
        {showToggle && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {isExpanded ? "Show less" : "Show all"}
          </button>
        )}
      </div>

      {/* Deadline list */}
      <div className="flex flex-col gap-0.5 px-2">
        {filteredDeadlines.map((deadline) => (
          <DeadlineRow
            key={`${deadline.type}-${deadline.id}`}
            deadline={deadline}
            formattedDate={formatDeadlineDate(deadline.deadline, weekStartDate)}
          />
        ))}
      </div>
    </div>
  );
}
