"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ScheduleGoal, ScheduleCommitment, ProgressIndicator, TaskScheduleInfo, TaskDeadlineInfo } from "@/lib/unified-schedule";
import type { WeeklyIntention, PlanningStep } from "@/lib/weekly-planning";
import type { Blueprint } from "@/lib/blueprint";
import { formatWeekRange } from "@/components/calendar";
import { IntentionRow } from "./intention-row";
import { PlanningScheduleView } from "./planning-schedule-view";
import { RiCalendarLine, RiDownloadLine, RiCloseLine, RiArrowLeftLine } from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

export interface PlanningPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Goals to set intentions for */
  goals: ScheduleGoal[];
  /** Commitments for scheduling step */
  commitments?: ScheduleCommitment[];
  /** Blueprint template (if exists) */
  blueprint: Blueprint | null;
  /** Current week dates */
  weekDates: Date[];
  /** Current draft intentions */
  intentions: WeeklyIntention[];
  /** Callback when an intention is set */
  onSetIntention: (
    goalId: string,
    target: number,
    targetTaskIds?: string[],
    progressIndicatorOverride?: ProgressIndicator
  ) => void;
  /** Callback when an intention is cleared */
  onClearIntention: (goalId: string) => void;
  /** Callback to import blueprint blocks */
  onImportBlueprint?: () => void;
  /** Callback when planning is confirmed */
  onConfirm: () => void;
  /** Callback when planning is cancelled */
  onCancel: () => void;
  /** Whether this is the first time planning (no blueprint exists) */
  isFirstPlan?: boolean;
  /** Callback to add a new task to a goal */
  onAddTask?: (goalId: string, label: string) => void;
  
  // Step management
  /** Current wizard step */
  step?: PlanningStep;
  /** Callback to continue to schedule step */
  onContinue?: () => void;
  /** Callback to go back to intentions step */
  onBack?: () => void;
  /** Task IDs to highlight in schedule step */
  highlightedTaskIds?: string[];
  
  // Schedule step data accessors
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
  commitments = [],
  blueprint,
  weekDates,
  intentions,
  onSetIntention,
  onClearIntention,
  onImportBlueprint,
  onConfirm,
  onCancel,
  isFirstPlan = false,
  onAddTask,
  // Step management
  step = "intentions",
  onContinue,
  onBack,
  highlightedTaskIds = [],
  // Schedule step data accessors
  getTaskSchedule,
  getTaskDeadline,
  className,
  ...props
}: PlanningPanelProps) {
  const weekLabel = formatWeekRange(weekDates);
  const isIntentionsStep = step === "intentions";
  const isScheduleStep = step === "schedule";

  // Get intention for a specific goal
  const getIntention = (goalId: string): WeeklyIntention | undefined => {
    return intentions.find((i) => i.goalId === goalId);
  };

  // Get default intention from blueprint
  const getDefaultIntention = (goalId: string): number | undefined => {
    if (!blueprint) return undefined;
    const intention = blueprint.intentions.find((i) => i.goalId === goalId);
    return intention?.target;
  };

  // Count goals with intentions set
  const goalsWithIntentions = intentions.filter((i) => i.target > 0).length;

  // Step indicator text
  const stepLabel = isIntentionsStep ? "Step 1 of 2" : "Step 2 of 2";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {isScheduleStep && onBack && (
              <button
                onClick={onBack}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RiArrowLeftLine className="size-4" />
              </button>
            )}
            <RiCalendarLine className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Plan Your Week</h2>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{weekLabel}</p>
            <span className="text-xs text-muted-foreground/50">•</span>
            <p className="text-xs text-muted-foreground/70">{stepLabel}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RiCloseLine className="size-5" />
        </button>
      </div>

      {/* Step 1: Intentions */}
      {isIntentionsStep && (
        <>
          {/* Blueprint import button */}
          {blueprint && onImportBlueprint && (
            <div className="border-b border-border px-4 py-3">
              <button
                onClick={onImportBlueprint}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground"
              >
                <RiDownloadLine className="size-4" />
                <span>Import from blueprint</span>
              </button>
            </div>
          )}

          {/* Goals section */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-1 px-2 py-3">
              <div className="px-2 pb-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Set Intentions
                </h3>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Define what progress means for each goal this week
                </p>
              </div>

              {goals.map((goal) => (
                <IntentionRow
                  key={goal.id}
                  goal={goal}
                  intention={getIntention(goal.id)}
                  defaultTarget={getDefaultIntention(goal.id)}
                  onIntentionChange={(target, taskIds, indicatorOverride) =>
                    onSetIntention(goal.id, target, taskIds, indicatorOverride)
                  }
                  onIntentionClear={() => onClearIntention(goal.id)}
                  availableTasks={goal.tasks?.filter((t) => !t.completed)}
                  onAddTask={onAddTask ? (label) => onAddTask(goal.id, label) : undefined}
                />
              ))}

              {goals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No goals to plan.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Create goals first to set weekly intentions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {goalsWithIntentions} of {goals.length} goals planned
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={onCancel}
                className="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={onContinue}
                className="shrink-0 whitespace-nowrap rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 2: Schedule */}
      {isScheduleStep && (
        <>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <PlanningScheduleView
              commitments={commitments}
              goals={goals}
              highlightedTaskIds={highlightedTaskIds}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              draggable={true}
            />
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              Drag items to schedule
            </div>
            <div className="flex shrink-0 items-center gap-2">
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
        </>
      )}
    </div>
  );
}
