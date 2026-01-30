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
import type { PlanningStep } from "@/lib/weekly-planning";
import { PlanningScheduleView } from "./planning-schedule-view";
import { PlanningPrioritizeView } from "./planning-prioritize-view";
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
  /** Callback when planning is cancelled */
  onCancel: () => void;
  /** Whether this is the first time planning (no blueprint exists) */
  isFirstPlan?: boolean;

  // Two-step planning flow
  /** Current planning step */
  step: PlanningStep;
  /** Callback to advance to next step (prioritize → schedule) */
  onNextStep: () => void;
  /** Callback when planning is confirmed (saveAsBlueprint indicates user preference) */
  onConfirm: (saveAsBlueprint: boolean) => void;
  /** Set of task IDs marked as weekly focus */
  weeklyFocusTaskIds: Set<string>;
  /** Add a task to weekly focus */
  onAddToFocus: (taskId: string) => void;
  /** Remove a task from weekly focus */
  onRemoveFromFocus: (taskId: string) => void;

  // Task management
  /** Callback to add a new task to a goal */
  onAddTask?: (goalId: string, label: string) => string;

  // Schedule data accessors
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;

  // Add essentials to calendar (for planning without blueprint)
  /** Whether to show the "Add essentials to calendar" button */
  showAddEssentialsButton?: boolean;
  /** Callback when user clicks "Add essentials to calendar" */
  onAddEssentialsToCalendar?: () => void;
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
  onCancel,
  isFirstPlan = false,
  // Two-step planning flow
  step,
  onNextStep,
  onConfirm,
  weeklyFocusTaskIds,
  onAddToFocus,
  onRemoveFromFocus,
  // Task management
  onAddTask,
  // Schedule data accessors
  getTaskSchedule,
  getTaskDeadline,
  // Add essentials to calendar
  showAddEssentialsButton = false,
  onAddEssentialsToCalendar,
  className,
  ...props
}: PlanningPanelProps) {
  const hasBlueprint = blueprint !== null;
  const isPrioritizeStep = step === "prioritize";
  const isScheduleStep = step === "schedule";

  // Blueprint save preference (default on, only shown when no blueprint exists)
  const [saveAsBlueprint, setSaveAsBlueprint] = React.useState(true);

  // Header content based on step
  const headerTitle = isPrioritizeStep ? "Prioritize tasks" : "Plan your week";
  const headerDescription = isPrioritizeStep
    ? "Select 2-3 tasks for each goal that move it forward this week."
    : "Drag your goals and tasks to the calendar to make time for them throughout the week.";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-5">
        <div className="flex flex-col gap-3">
          {/* Icon container */}
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <RiCalendarLine className="size-4 text-muted-foreground" />
          </div>
          {/* Title and description */}
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">
              {headerTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{headerDescription}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RiCloseLine className="size-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Duplicate last week button - shown when blueprint exists (only in schedule step) */}
        {isScheduleStep && hasBlueprint && onDuplicateLastWeek && (
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

        {/* Step 1: Prioritize - Show goals with task subsections */}
        {isPrioritizeStep && (
          <PlanningPrioritizeView
            goals={goals}
            weeklyFocusTaskIds={weeklyFocusTaskIds}
            onAddToFocus={onAddToFocus}
            onRemoveFromFocus={onRemoveFromFocus}
            onAddTask={onAddTask}
          />
        )}

        {/* Step 2: Schedule - Show only focus tasks for dragging */}
        {isScheduleStep && (
          <PlanningScheduleView
            essentials={essentials}
            goals={goals}
            weeklyFocusTaskIds={weeklyFocusTaskIds}
            highlightedTaskIds={[]}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            draggable={true}
            showAddEssentialsButton={showAddEssentialsButton}
            onAddEssentialsToCalendar={onAddEssentialsToCalendar}
          />
        )}

        {/* Action Button - Full width, inside the scrollable content area */}
        <div className="sticky bottom-0 flex flex-col gap-3 bg-background px-4 py-4">
          {/* Blueprint save callout - shown in schedule step when no blueprint exists */}
          {isScheduleStep && !hasBlueprint && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  Reuse this week?
                </span>
                <span className="text-xs text-muted-foreground">
                  Save this plan as a starting point for future weeks.
                </span>
              </div>
              <button
                role="switch"
                aria-checked={saveAsBlueprint}
                onClick={() => setSaveAsBlueprint(!saveAsBlueprint)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                  saveAsBlueprint ? "bg-foreground" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform",
                    saveAsBlueprint ? "translate-x-[22px]" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
          )}

          {isPrioritizeStep ? (
            <button
              onClick={onNextStep}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => onConfirm(saveAsBlueprint)}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Finish planning
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
