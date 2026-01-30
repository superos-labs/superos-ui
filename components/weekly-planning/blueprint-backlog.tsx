"use client";

/**
 * BlueprintBacklog - Backlog panel for blueprint creation during onboarding.
 *
 * Shows essentials and goals that can be dragged to the calendar to build
 * the user's ideal typical week template.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCalendarLine } from "@remixicon/react";
import { PlanningScheduleView } from "./planning-schedule-view";
import type {
  ScheduleGoal,
  ScheduleEssential,
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";

// =============================================================================
// Types
// =============================================================================

export interface BlueprintBacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Goals available for scheduling */
  goals: ScheduleGoal[];
  /** Essentials for scheduling */
  essentials: ScheduleEssential[];
  /** Callback to save blueprint and continue */
  onSave: () => void;
  /** Whether to show the "Add essentials to calendar" button */
  showAddEssentialsButton?: boolean;
  /** Callback when user clicks "Add essentials to calendar" */
  onAddEssentialsToCalendar?: () => void;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
}

// =============================================================================
// Component
// =============================================================================

export function BlueprintBacklog({
  goals,
  essentials,
  onSave,
  showAddEssentialsButton = false,
  onAddEssentialsToCalendar,
  getTaskSchedule,
  getTaskDeadline,
  className,
  ...props
}: BlueprintBacklogProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-5">
        <div className="flex flex-col gap-3">
          {/* Icon container */}
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <RiCalendarLine className="size-4 text-muted-foreground" />
          </div>
          {/* Title and description */}
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">
              Create your blueprint
            </h2>
            <p className="text-sm text-muted-foreground">
              Design your ideal typical week by dragging essentials and goals to the calendar.
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <PlanningScheduleView
          essentials={essentials}
          goals={goals}
          draggable={true}
          showAddEssentialsButton={showAddEssentialsButton}
          onAddEssentialsToCalendar={onAddEssentialsToCalendar}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
        />

        {/* Action Button - Full width, inside the scrollable content area */}
        <div className="sticky bottom-0 flex flex-col gap-3 bg-background px-4 py-4">
          {/* Info callout */}
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              Your starting point
            </span>
            <span className="text-xs text-muted-foreground">
              This blueprint will be used as a starting point when planning future weeks.
            </span>
          </div>

          <button
            onClick={onSave}
            className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Save & continue
          </button>
        </div>
      </div>
    </div>
  );
}
