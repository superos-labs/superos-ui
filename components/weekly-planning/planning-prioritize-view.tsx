"use client";

/**
 * PlanningPrioritizeView - Step 1 of weekly planning.
 *
 * Shows goals with their tasks split into:
 * - "This week": Tasks marked as weekly focus
 * - "Other tasks": Remaining tasks
 *
 * Users can hover over tasks to see +/- buttons to toggle weekly focus status.
 * For goals with no tasks, adding a task automatically marks it as weekly focus.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCheckLine, RiAddLine, RiSubtractLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { ScheduleGoal, ScheduleTask } from "@/lib/unified-schedule";

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
        className="flex items-center gap-2 rounded-md py-1.5 pl-4 pr-3 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <RiAddLine className="size-3.5" />
        <span>{placeholder}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5 pl-4 pr-3">
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
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-md py-1.5 pl-4 pr-3 transition-all",
        "hover:bg-muted/60",
      )}
    >
      {/* Checkbox (display only) */}
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded transition-colors",
          task.completed
            ? "bg-muted text-muted-foreground"
            : "bg-muted/60 text-muted-foreground/50",
        )}
      >
        {task.completed && <RiCheckLine className="size-2.5" />}
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 truncate text-xs",
          task.completed
            ? "text-muted-foreground line-through"
            : "text-foreground/80",
        )}
      >
        {task.label}
      </span>

      {/* Focus toggle button (visible on hover) */}
      <button
        onClick={onToggleFocus}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded transition-all",
          "opacity-0 group-hover:opacity-100",
          isInFocus
            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-label={isInFocus ? "Remove from this week" : "Add to this week"}
      >
        {isInFocus ? (
          <RiSubtractLine className="size-3.5" />
        ) : (
          <RiAddLine className="size-3.5" />
        )}
      </button>
    </div>
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
  const tasks = goal.tasks ?? [];

  // Split tasks into focus and other
  const focusTasks = tasks.filter((t) => weeklyFocusTaskIds.has(t.id));
  const otherTasks = tasks.filter((t) => !weeklyFocusTaskIds.has(t.id));

  // Determine if we should show subsections
  // Show subsections if there's at least one focus task, OR if there are any tasks at all
  const showSubsections = tasks.length > 0;

  // Handle adding a new task - auto-mark as weekly focus
  const handleAddTask = React.useCallback(
    (goalId: string, label: string) => {
      if (onAddTask) {
        const newTaskId = onAddTask(goalId, label);
        // Auto-mark new tasks as weekly focus
        onAddToFocus(newTaskId);
      }
    },
    [onAddTask, onAddToFocus],
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

      {/* Task subsections */}
      {showSubsections ? (
        <div className="flex flex-col gap-2 pl-2">
          {/* This week section */}
          <div className="flex flex-col">
            <div className="px-2 py-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                This week
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {focusTasks.length > 0 ? (
                focusTasks.map((task) => (
                  <PrioritizeTaskRow
                    key={task.id}
                    task={task}
                    isInFocus={true}
                    onToggleFocus={() => onRemoveFromFocus(task.id)}
                  />
                ))
              ) : (
                <div className="px-4 py-1.5 text-xs text-muted-foreground/50 italic">
                  No tasks selected
                </div>
              )}
            </div>
          </div>

          {/* Other tasks section */}
          <div className="flex flex-col">
            <div className="px-2 py-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                Other tasks
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
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
        </div>
      ) : (
        // No tasks yet - show add task button
        <div className="pl-2">
          {onAddTask && (
            <InlineTaskCreator goalId={goal.id} onSave={handleAddTask} />
          )}
        </div>
      )}
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
            <h4 className="text-xs font-medium text-muted-foreground">Goals</h4>
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
