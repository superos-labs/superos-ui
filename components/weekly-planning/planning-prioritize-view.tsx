/**
 * =============================================================================
 * File: planning-prioritize-view.tsx
 * =============================================================================
 *
 * Step 1 of weekly planning: task prioritization.
 *
 * Allows users to select a small set of focus tasks per goal that will
 * define what they actively work on during the week.
 *
 * Tasks marked as focus are surfaced first and can be quickly toggled.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render goals with their associated tasks.
 * - Support toggling tasks into and out of weekly focus.
 * - Surface focus tasks before non-focus tasks.
 * - Optionally allow inline creation of new tasks (auto-marked as focus).
 * - Respect milestone context by showing only current-milestone tasks when applicable.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting focus state.
 * - Scheduling tasks on the calendar.
 * - Enforcing limits on number of focus tasks.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Focus state is the primary signal in this step.
 * - Completed tasks are visually muted.
 * - Inline task creation is intentionally minimal.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - PlanningPrioritizeView
 * - PlanningPrioritizeViewProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCheckLine, RiAddLine, RiSubtractLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { ScheduleGoal, ScheduleTask } from "@/lib/unified-schedule";
import { getCurrentMilestone } from "@/lib/unified-schedule";

// =============================================================================
// Types
// =============================================================================

export interface PlanningPrioritizeViewProps {
  /** Goals to display (with their tasks) */
  goals: ScheduleGoal[];
  /** Set of task IDs marked as weekly focus */
  weeklyFocusTaskIds: Set<string>;
  /** Add a task to weekly focus */
  onAddToFocus: (taskId: string) => void;
  /** Remove a task from weekly focus */
  onRemoveFromFocus: (taskId: string) => void;
  /** Callback to add a new task to a goal (auto-marked as weekly focus) */
  onAddTask?: (goalId: string, label: string) => string;
  className?: string;
}

// =============================================================================
// Inline Task Creator (simplified for planning)
// =============================================================================

interface InlineTaskCreatorProps {
  goalId: string;
  onSave: (goalId: string, label: string) => void;
  placeholder?: string;
}

function InlineTaskCreator({
  goalId,
  onSave,
  placeholder = "Add a task...",
}: InlineTaskCreatorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (value.trim()) {
      onSave(goalId, value.trim());
      setValue("");
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setValue("");
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex w-full items-center gap-2 rounded-md py-1.5 pl-4 pr-3 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <RiAddLine className="size-3.5" />
        <span>{placeholder}</span>
      </button>
    );
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-md py-1.5 pl-4 pr-3">
      <div className="flex size-4 shrink-0 items-center justify-center rounded bg-muted/60" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Task Row with Focus Toggle
// =============================================================================

interface PrioritizeTaskRowProps {
  task: ScheduleTask;
  isInFocus: boolean;
  onToggleFocus: () => void;
}

function PrioritizeTaskRow({
  task,
  isInFocus,
  onToggleFocus,
}: PrioritizeTaskRowProps) {
  return (
    <button
      onClick={onToggleFocus}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-md py-1.5 pl-4 pr-3 text-left transition-all",
        isInFocus ? "bg-muted/40 hover:bg-muted/60" : "hover:bg-muted/60"
      )}
      aria-label={isInFocus ? "Remove from this week" : "Add to this week"}
    >
      {/* Checkbox (display only) */}
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded transition-colors",
          task.completed
            ? "bg-muted text-muted-foreground"
            : isInFocus
            ? "bg-muted/80 text-muted-foreground/60"
            : "bg-muted/40 text-muted-foreground/30"
        )}
      >
        {task.completed && <RiCheckLine className="size-2.5" />}
      </div>

      {/* Label - primary when in focus, secondary when not */}
      <span
        className={cn(
          "flex-1 truncate text-xs transition-colors",
          task.completed
            ? "text-muted-foreground line-through"
            : isInFocus
            ? "text-foreground"
            : "text-muted-foreground"
        )}
      >
        {task.label}
      </span>

      {/* Focus toggle icon (visible on hover) */}
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded transition-all",
          "opacity-0 group-hover:opacity-100",
          "text-muted-foreground"
        )}
      >
        {isInFocus ? (
          <RiSubtractLine className="size-3.5" />
        ) : (
          <RiAddLine className="size-3.5" />
        )}
      </div>
    </button>
  );
}

// =============================================================================
// Goal Row with Task Subsections
// =============================================================================

interface GoalWithSubsectionsProps {
  goal: ScheduleGoal;
  weeklyFocusTaskIds: Set<string>;
  onAddToFocus: (taskId: string) => void;
  onRemoveFromFocus: (taskId: string) => void;
  onAddTask?: (goalId: string, label: string) => string;
}

function GoalWithSubsections({
  goal,
  weeklyFocusTaskIds,
  onAddToFocus,
  onRemoveFromFocus,
  onAddTask,
}: GoalWithSubsectionsProps) {
  const IconComponent = goal.icon;
  const allTasks = goal.tasks ?? [];

  // When milestones are enabled, filter to only show tasks for the current milestone
  const milestonesEnabled =
    goal.milestonesEnabled ?? (goal.milestones && goal.milestones.length > 0);
  const currentMilestone = milestonesEnabled
    ? getCurrentMilestone(goal)
    : undefined;
  const tasks =
    milestonesEnabled && currentMilestone
      ? allTasks.filter((t) => t.milestoneId === currentMilestone.id)
      : allTasks;

  // Split tasks into focus and other (focus tasks render first)
  const focusTasks = tasks.filter((t) => weeklyFocusTaskIds.has(t.id));
  const otherTasks = tasks.filter((t) => !weeklyFocusTaskIds.has(t.id));

  // Handle adding a new task - auto-mark as weekly focus
  const handleAddTask = React.useCallback(
    (goalId: string, label: string) => {
      if (onAddTask) {
        const newTaskId = onAddTask(goalId, label);
        // Auto-mark new tasks as weekly focus
        onAddToFocus(newTaskId);
      }
    },
    [onAddTask, onAddToFocus]
  );

  return (
    <div className="flex flex-col">
      {/* Goal header */}
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
          <IconComponent
            className={cn("size-3.5", getIconColorClass(goal.color))}
          />
        </div>
        <span className="truncate text-sm font-medium text-foreground">
          {goal.label}
        </span>
      </div>

      {/* Tasks list - focus tasks first, then other tasks */}
      <div className="flex flex-col gap-0.5 pl-2">
        {focusTasks.map((task) => (
          <PrioritizeTaskRow
            key={task.id}
            task={task}
            isInFocus={true}
            onToggleFocus={() => onRemoveFromFocus(task.id)}
          />
        ))}
        {otherTasks.map((task) => (
          <PrioritizeTaskRow
            key={task.id}
            task={task}
            isInFocus={false}
            onToggleFocus={() => onAddToFocus(task.id)}
          />
        ))}
        {onAddTask && (
          <InlineTaskCreator goalId={goal.id} onSave={handleAddTask} />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Planning Prioritize View
// =============================================================================

export function PlanningPrioritizeView({
  goals,
  weeklyFocusTaskIds,
  onAddToFocus,
  onRemoveFromFocus,
  onAddTask,
  className,
}: PlanningPrioritizeViewProps) {
  return (
    <div className={cn("flex flex-col gap-4 py-3", className)}>
      {/* Goals section */}
      {goals.length > 0 ? (
        <div className="flex flex-col">
          <div className="px-4 pb-1">
            <h4 className="text-xs font-medium text-muted-foreground">
              Your goals
            </h4>
          </div>
          <div className="flex flex-col gap-3 px-2">
            {goals.map((goal) => (
              <GoalWithSubsections
                key={goal.id}
                goal={goal}
                weeklyFocusTaskIds={weeklyFocusTaskIds}
                onAddToFocus={onAddToFocus}
                onRemoveFromFocus={onRemoveFromFocus}
                onAddTask={onAddTask}
              />
            ))}
          </div>
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">No goals to plan.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Add goals to start planning your week.
          </p>
        </div>
      )}
    </div>
  );
}
