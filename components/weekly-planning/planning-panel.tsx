"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  ScheduleGoal,
  ScheduleEssential,
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";
import type { Blueprint } from "@/lib/blueprint";
import { formatWeekRange } from "@/components/calendar";
import { PlanningScheduleView } from "./planning-schedule-view";
import { RiCalendarLine, RiCloseLine, RiHistoryLine } from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

export interface PlanningPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Goals available for scheduling */
  goals: ScheduleGoal[];
  /** Essentials for scheduling */
  essentials?: ScheduleEssential[];
  /** Blueprint template (if exists, enables "Duplicate last week" button) */
  blueprint: Blueprint | null;
  /** Current week dates */
  weekDates: Date[];
  /** Callback to duplicate last week's schedule */
  onDuplicateLastWeek?: () => void;
  /** Callback when planning is confirmed */
  onConfirm: () => void;
  /** Callback when planning is cancelled */
  onCancel: () => void;
  /** Whether this is the first time planning (no blueprint exists) */
  isFirstPlan?: boolean;

  // Schedule data accessors
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
}

// =============================================================================
// Component
// =============================================================================

export function PlanningPanel({
  goals,
  essentials = [],
  blueprint,
  weekDates,
  onDuplicateLastWeek,
  onConfirm,
  onCancel,
  isFirstPlan = false,
  // Schedule data accessors
  getTaskSchedule,
  getTaskDeadline,
  className,
  ...props
}: PlanningPanelProps) {
  const weekLabel = formatWeekRange(weekDates);
  const hasBlueprint = blueprint !== null;

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Header - Simplified for single-step flow */}
      <div className="flex items-start justify-between border-b border-border px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RiCalendarLine className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Plan Your Week</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Drag goals to the calendar to set your week ahead
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RiCloseLine className="size-5" />
        </button>
      </div>

      {/* Schedule Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Duplicate last week button - shown when blueprint exists */}
        {hasBlueprint && onDuplicateLastWeek && (
          <div className="border-b border-border px-4 py-3">
            <button
              onClick={onDuplicateLastWeek}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground"
            >
              <RiHistoryLine className="size-4" />
              <span>Duplicate last week&apos;s planning</span>
            </button>
          </div>
        )}

        <PlanningScheduleView
          essentials={essentials}
          goals={goals}
          highlightedTaskIds={[]}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
          draggable={true}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
        <button
          onClick={onCancel}
          className="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="shrink-0 whitespace-nowrap rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          {isFirstPlan ? "Start week" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
