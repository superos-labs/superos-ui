"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ScheduleGoal, ScheduleTask } from "@/lib/unified-schedule";
import { PROGRESS_INDICATOR_LABELS, PROGRESS_INDICATOR_UNITS } from "@/lib/unified-schedule";
import type { WeeklyIntention } from "@/lib/weekly-planning";
import { RiSubtractLine, RiArrowDownSLine, RiArrowRightSLine, RiAddLine, RiCheckLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";

// =============================================================================
// Types
// =============================================================================

export interface IntentionRowProps {
  /** The goal to set intention for */
  goal: ScheduleGoal;
  /** Current intention value (if any) */
  intention?: WeeklyIntention;
  /** Callback when intention is changed */
  onIntentionChange?: (target: number, targetTaskIds?: string[]) => void;
  /** Callback when intention is cleared */
  onIntentionClear?: () => void;
  /** Default value from blueprint (shown as placeholder) */
  defaultTarget?: number;
  /** Whether the row is readonly */
  readonly?: boolean;
  /** Available tasks for specific-tasks indicator (incomplete only) */
  availableTasks?: ScheduleTask[];
  /** Callback to add a new task to the goal */
  onAddTask?: (label: string) => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function IntentionRow({
  goal,
  intention,
  onIntentionChange,
  onIntentionClear,
  defaultTarget,
  readonly = false,
  availableTasks = [],
  onAddTask,
  className,
}: IntentionRowProps) {
  const Icon = goal.icon;
  const indicator = goal.progressIndicator ?? "completed-time";
  const unit = PROGRESS_INDICATOR_UNITS[indicator];
  const colorClass = getIconColorClass(goal.color);

  // Local input state for number inputs
  const [inputValue, setInputValue] = React.useState<string>(
    intention?.target?.toString() ?? ""
  );

  // Expansion state for specific-tasks
  const [isExpanded, setIsExpanded] = React.useState(false);

  // New task input state
  const [newTaskLabel, setNewTaskLabel] = React.useState("");

  // Sync with external intention
  React.useEffect(() => {
    setInputValue(intention?.target?.toString() ?? "");
  }, [intention?.target]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      onIntentionClear?.();
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onIntentionChange?.(numValue);
      }
    }
  };

  const handleInputBlur = () => {
    // Clean up the input on blur
    if (inputValue === "") return;
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0) {
      setInputValue(intention?.target?.toString() ?? "");
    } else {
      setInputValue(numValue.toString());
    }
  };

  const hasIntention = intention !== undefined && intention.target > 0;

  // For specific-tasks, show an expandable UI
  if (indicator === "specific-tasks") {
    const selectedTaskIds = intention?.targetTaskIds ?? [];
    const taskCount = selectedTaskIds.length;

    const handleTaskToggle = (taskId: string) => {
      const isSelected = selectedTaskIds.includes(taskId);
      let newSelectedIds: string[];
      
      if (isSelected) {
        newSelectedIds = selectedTaskIds.filter((id) => id !== taskId);
      } else {
        newSelectedIds = [...selectedTaskIds, taskId];
      }
      
      onIntentionChange?.(newSelectedIds.length, newSelectedIds);
    };

    const handleAddNewTask = () => {
      const trimmed = newTaskLabel.trim();
      if (!trimmed || !onAddTask) return;
      onAddTask(trimmed);
      setNewTaskLabel("");
    };

    const handleNewTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddNewTask();
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col rounded-lg bg-muted/50 transition-colors",
          className
        )}
      >
        {/* Header row - clickable to expand/collapse */}
        <button
          type="button"
          onClick={() => !readonly && setIsExpanded(!isExpanded)}
          disabled={readonly}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 text-left",
            !readonly && "cursor-pointer"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className={cn("size-4", colorClass)} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{goal.label}</span>
            <span className="text-xs text-muted-foreground">
              {PROGRESS_INDICATOR_LABELS[indicator]}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {taskCount > 0 ? (
              <span className="text-sm tabular-nums text-muted-foreground">
                {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/60">
                Select tasks
              </span>
            )}
            {!readonly && (
              isExpanded ? (
                <RiArrowDownSLine className="size-4 text-muted-foreground" />
              ) : (
                <RiArrowRightSLine className="size-4 text-muted-foreground" />
              )
            )}
          </div>
        </button>

        {/* Expanded content - task list */}
        {isExpanded && !readonly && (
          <div className="flex flex-col gap-0.5 px-3 pb-3">
            {availableTasks.length === 0 && !onAddTask && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                No incomplete tasks available
              </p>
            )}
            
            {availableTasks.map((task) => {
              const isSelected = selectedTaskIds.includes(task.id);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleTaskToggle(task.id)}
                  className="group flex items-center gap-2.5 rounded-md py-1 pl-2 pr-3 text-left transition-colors hover:bg-muted/60"
                >
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
                      isSelected
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground/50 group-hover:bg-muted group-hover:text-muted-foreground"
                    )}
                  >
                    {isSelected && <RiCheckLine className="size-3" />}
                  </div>
                  <span className={cn(
                    "truncate text-xs",
                    isSelected ? "text-foreground/80" : "text-muted-foreground"
                  )}>
                    {task.label}
                  </span>
                </button>
              );
            })}

            {/* Add new task inline */}
            {onAddTask && (
              <div className="flex items-center gap-2.5 py-1 pl-2 pr-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground/50">
                  <RiAddLine className="size-3" />
                </div>
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  onKeyDown={handleNewTaskKeyDown}
                  onBlur={() => {
                    if (newTaskLabel.trim()) {
                      handleAddNewTask();
                    }
                  }}
                  placeholder="Add a task..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
        hasIntention ? "bg-muted/50" : "hover:bg-muted/30",
        className
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          hasIntention ? "bg-muted" : "bg-muted/60"
        )}
      >
        <Icon className={cn("size-4", colorClass)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{goal.label}</span>
        <span className="text-xs text-muted-foreground">
          {PROGRESS_INDICATOR_LABELS[indicator]}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {readonly ? (
          <span className="text-sm tabular-nums">
            {intention?.target ?? 0} {unit}
          </span>
        ) : (
          <>
            <input
              type="number"
              min="0"
              step={indicator === "completed-time" || indicator === "focused-time" ? "0.5" : "1"}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder={defaultTarget?.toString() ?? "0"}
              className={cn(
                "w-16 rounded-md border border-border bg-background px-2 py-1 text-right text-sm tabular-nums",
                "placeholder:text-muted-foreground/40",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
            <span className="w-10 text-xs text-muted-foreground">{unit}</span>
          </>
        )}

        {!readonly && hasIntention && onIntentionClear && (
          <button
            onClick={onIntentionClear}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Clear intention"
          >
            <RiSubtractLine className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
