/**
 * =============================================================================
 * File: goal-detail-initiatives.tsx
 * =============================================================================
 *
 * Initiative sections and tasks for the Goal Detail view.
 *
 * Renders collapsible initiative groups, each containing its associated tasks.
 * Tasks belong directly to the goal and are grouped by their initiativeId.
 * When no initiatives exist, tasks render as a flat list. When initiatives
 * exist, each initiative is a collapsible section with its own inline task
 * creator, plus an inline initiative creator at the bottom.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Group tasks by initiative.
 * - Render initiative headers with label, optional date range, and controls.
 * - Render TaskRow items within each initiative section.
 * - Provide inline creators for initiatives and tasks.
 * - Manage local expansion state for initiatives and tasks (accordion).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting initiatives, tasks, or subtasks.
 * - Fetching goal data.
 * - Milestone timeline rendering (handled by GoalDetailMilestones).
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - "General" initiative is auto-created for ungrouped tasks (handled by hook).
 * - Initiatives default to expanded.
 * - Compact typography favors dense, scannable lists.
 * - Inline creators are keyboard-first.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalDetailInitiatives
 * - GoalDetailInitiativesProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import type {
  Initiative,
  ScheduleTask,
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";
import {
  GranularDatePicker,
  type GranularDateValue,
} from "@/components/ui/granular-date-picker";
import type { GoalItem } from "@/components/backlog";
import { TaskRow } from "@/components/backlog";

// =============================================================================
// Inline Initiative Creator
// =============================================================================

interface InlineInitiativeCreatorProps {
  onSave: (label: string) => void;
}

function InlineInitiativeCreator({ onSave }: InlineInitiativeCreatorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onSave(value.trim());
      setValue("");
      inputRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue("");
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onSave(value.trim());
    }
    setValue("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 text-left transition-all hover:bg-muted/40"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/30 text-muted-foreground/30 transition-colors group-hover:bg-muted/50 group-hover:text-muted-foreground/50">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
          Add initiative
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/40">
        <RiAddLine className="size-3" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Initiative name..."
        className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/40 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Inline Task Creator (for within initiatives)
// =============================================================================

interface InlineTaskCreatorProps {
  initiativeId: string;
  onSave: (label: string, initiativeId: string) => void;
}

function InlineTaskCreator({ initiativeId, onSave }: InlineTaskCreatorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onSave(value.trim(), initiativeId);
      setValue("");
      inputRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue("");
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onSave(value.trim(), initiativeId);
    }
    setValue("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-[18px] pr-3 text-left transition-all hover:bg-muted/40"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/30 text-muted-foreground/30 transition-colors group-hover:bg-muted/50 group-hover:text-muted-foreground/50">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
          Add task...
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-1.5 pl-[18px] pr-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground/40">
        <RiAddLine className="size-3" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Task name..."
        className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/40 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Initiative Section (with tasks)
// =============================================================================

interface InitiativeSectionProps {
  initiative: Initiative;
  tasks: ScheduleTask[];
  parentGoal: GoalItem;
  expandedTaskId: string | null;
  onExpandTask: (taskId: string) => void;
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  onUpdateInitiative?: (updates: Partial<Initiative>) => void;
  onDeleteInitiative?: () => void;
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (label: string, initiativeId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  onAddSubtask?: (taskId: string, label: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, label: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

function InitiativeSection({
  initiative,
  tasks,
  parentGoal,
  expandedTaskId,
  onExpandTask,
  getTaskSchedule,
  getTaskDeadline,
  onUpdateInitiative,
  onDeleteInitiative,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
}: InitiativeSectionProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(initiative.label);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isGeneral = initiative.label === "General";

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editValue.trim() && editValue.trim() !== initiative.label) {
        onUpdateInitiative?.({ label: editValue.trim() });
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditValue(initiative.label);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (editValue.trim() && editValue.trim() !== initiative.label) {
      onUpdateInitiative?.({ label: editValue.trim() });
    } else {
      setEditValue(initiative.label);
    }
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    if (onUpdateInitiative) {
      setIsEditing(true);
    }
  };

  // Date range change handlers
  const handleStartDateChange = React.useCallback(
    (v: GranularDateValue | undefined) => {
      onUpdateInitiative?.({ startDate: v?.date });
    },
    [onUpdateInitiative],
  );

  const handleEndDateChange = React.useCallback(
    (v: GranularDateValue | undefined) => {
      onUpdateInitiative?.({ endDate: v?.date });
    },
    [onUpdateInitiative],
  );

  // Count tasks
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="flex flex-col">
      {/* Initiative header */}
      <div
        className="group flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 transition-all"
      >
        {/* Expand/collapse chevron */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground/60"
        >
          <RiArrowRightSLine
            className={cn("size-3.5 transition-transform", isOpen && "rotate-90")}
          />
        </button>

        {/* Label */}
        {isEditing ? (
          <div className="relative h-5 min-w-[2ch]">
            <span className="invisible whitespace-pre text-xs font-medium leading-5">
              {editValue || " "}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="absolute inset-0 h-5 w-full bg-transparent text-xs font-medium leading-5 text-foreground focus:outline-none"
            />
          </div>
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className={cn(
              "min-w-0 truncate text-xs font-medium text-foreground/70",
              onUpdateInitiative && !isGeneral && "cursor-text",
            )}
          >
            {initiative.label}
          </span>
        )}

        {/* Task count */}
        {totalCount > 0 && (
          <span className="text-[10px] text-muted-foreground/30">
            {completedCount}/{totalCount}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date range pickers (not for General) */}
        {!isGeneral && onUpdateInitiative && (
          <div className={cn(
            "flex items-center gap-0.5 transition-opacity",
            !initiative.startDate && !initiative.endDate && "opacity-0 group-hover:opacity-100",
          )}>
            <GranularDatePicker
              value={
                initiative.startDate
                  ? { date: initiative.startDate, granularity: "day" }
                  : undefined
              }
              onChange={handleStartDateChange}
              role="start"
              placeholder="Start"
              className="bg-transparent hover:bg-muted/60 text-muted-foreground/40 hover:text-muted-foreground py-0.5 px-1.5 text-[10px]"
            />
            <span className="text-[10px] text-muted-foreground/20">–</span>
            <GranularDatePicker
              value={
                initiative.endDate
                  ? { date: initiative.endDate, granularity: "day" }
                  : undefined
              }
              onChange={handleEndDateChange}
              role="end"
              placeholder="End"
              className="bg-transparent hover:bg-muted/60 text-muted-foreground/40 hover:text-muted-foreground py-0.5 px-1.5 text-[10px]"
            />
          </div>
        )}

        {/* Delete button (not for General) */}
        {onDeleteInitiative && !isGeneral && (
          <button
            onClick={onDeleteInitiative}
            className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          >
            <RiDeleteBinLine className="size-3" />
          </button>
        )}
      </div>

      {/* Tasks */}
      {isOpen && (
        <div className="flex w-full flex-col gap-0.5">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              parentGoal={parentGoal}
              scheduleInfo={getTaskSchedule?.(task.id)}
              deadlineInfo={getTaskDeadline?.(task.id)}
              isExpanded={expandedTaskId === task.id}
              onToggle={onToggleTask}
              onExpand={onExpandTask}
              onUpdateTask={
                onUpdateTask
                  ? (updates) => onUpdateTask(task.id, updates)
                  : undefined
              }
              onAddSubtask={
                onAddSubtask
                  ? (label) => onAddSubtask(task.id, label)
                  : undefined
              }
              onToggleSubtask={
                onToggleSubtask
                  ? (subtaskId) => onToggleSubtask(task.id, subtaskId)
                  : undefined
              }
              onUpdateSubtask={
                onUpdateSubtask
                  ? (subtaskId, label) =>
                      onUpdateSubtask(task.id, subtaskId, label)
                  : undefined
              }
              onDeleteSubtask={
                onDeleteSubtask
                  ? (subtaskId) => onDeleteSubtask(task.id, subtaskId)
                  : undefined
              }
              onDeleteTask={
                onDeleteTask ? () => onDeleteTask(task.id) : undefined
              }
              draggable={false}
            />
          ))}

          {/* Inline task creator */}
          {onAddTask && (
            <InlineTaskCreator initiativeId={initiative.id} onSave={onAddTask} />
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalDetailInitiativesProps {
  /** Initiatives for this goal */
  initiatives: Initiative[];
  /** Tasks for this goal */
  tasks: ScheduleTask[];
  /** Parent goal for task row context */
  parentGoal: GoalItem;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Callback to add a new initiative */
  onAddInitiative?: (label: string) => void;
  /** Callback to update an initiative */
  onUpdateInitiative?: (
    initiativeId: string,
    updates: Partial<Initiative>,
  ) => void;
  /** Callback to delete an initiative */
  onDeleteInitiative?: (initiativeId: string) => void;
  /** Callback when a task is toggled */
  onToggleTask?: (taskId: string) => void;
  /** Callback to add a new task */
  onAddTask?: (label: string, initiativeId?: string) => void;
  /** Callback to update a task */
  onUpdateTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  /** Callback to add a subtask */
  onAddSubtask?: (taskId: string, label: string) => void;
  /** Callback to toggle a subtask */
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  /** Callback to update a subtask */
  onUpdateSubtask?: (taskId: string, subtaskId: string, label: string) => void;
  /** Callback to delete a subtask */
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  /** Callback to delete a task */
  onDeleteTask?: (taskId: string) => void;
  className?: string;
}

export function GoalDetailInitiatives({
  initiatives,
  tasks,
  parentGoal,
  getTaskSchedule,
  getTaskDeadline,
  onAddInitiative,
  onUpdateInitiative,
  onDeleteInitiative,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
  className,
}: GoalDetailInitiativesProps) {
  // Task expansion state (accordion - one at a time)
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(
    null,
  );

  const handleExpandTask = React.useCallback((taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  // Group tasks by initiative
  const tasksByInitiative = React.useMemo(() => {
    const grouped = new Map<string, ScheduleTask[]>();

    // Initialize with empty arrays for each initiative
    initiatives.forEach((i) => {
      grouped.set(i.id, []);
    });

    // Group tasks
    tasks.forEach((task) => {
      if (task.initiativeId && grouped.has(task.initiativeId)) {
        grouped.get(task.initiativeId)!.push(task);
      }
    });

    return grouped;
  }, [initiatives, tasks]);

  // Order: "General" initiative last, others in creation order
  const orderedInitiatives = React.useMemo(() => {
    const general = initiatives.filter((i) => i.label === "General");
    const others = initiatives.filter((i) => i.label !== "General");
    return [...others, ...general];
  }, [initiatives]);

  const hasInitiatives = initiatives.length > 0;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Section header */}
      <div className="mb-0.5 flex items-center gap-2 pl-4.5 pr-3">
        <span className="text-[11px] font-medium text-muted-foreground/50">
          Tasks
        </span>
        {tasks.length > 0 && (
          <span className="text-[10px] text-muted-foreground/30">
            {tasks.filter((t) => t.completed).length}/{tasks.length}
          </span>
        )}
      </div>

      {hasInitiatives ? (
        /* Initiative-grouped view */
        orderedInitiatives.map((initiative) => (
          <InitiativeSection
            key={initiative.id}
            initiative={initiative}
            tasks={tasksByInitiative.get(initiative.id) ?? []}
            parentGoal={parentGoal}
            expandedTaskId={expandedTaskId}
            onExpandTask={handleExpandTask}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            onUpdateInitiative={
              onUpdateInitiative
                ? (updates) => onUpdateInitiative(initiative.id, updates)
                : undefined
            }
            onDeleteInitiative={
              onDeleteInitiative
                ? () => onDeleteInitiative(initiative.id)
                : undefined
            }
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onUpdateSubtask={onUpdateSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onDeleteTask={onDeleteTask}
          />
        ))
      ) : (
        /* Flat task list when no initiatives */
        <div className="flex flex-col gap-0.5">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              parentGoal={parentGoal}
              scheduleInfo={getTaskSchedule?.(task.id)}
              deadlineInfo={getTaskDeadline?.(task.id)}
              isExpanded={expandedTaskId === task.id}
              onToggle={onToggleTask}
              onExpand={handleExpandTask}
              onUpdateTask={
                onUpdateTask
                  ? (updates) => onUpdateTask(task.id, updates)
                  : undefined
              }
              onAddSubtask={
                onAddSubtask
                  ? (label) => onAddSubtask(task.id, label)
                  : undefined
              }
              onToggleSubtask={
                onToggleSubtask
                  ? (subtaskId) => onToggleSubtask(task.id, subtaskId)
                  : undefined
              }
              onUpdateSubtask={
                onUpdateSubtask
                  ? (subtaskId, label) =>
                      onUpdateSubtask(task.id, subtaskId, label)
                  : undefined
              }
              onDeleteSubtask={
                onDeleteSubtask
                  ? (subtaskId) => onDeleteSubtask(task.id, subtaskId)
                  : undefined
              }
              onDeleteTask={
                onDeleteTask ? () => onDeleteTask(task.id) : undefined
              }
              draggable={false}
            />
          ))}

          {/* Inline task creator (flat mode) */}
          {onAddTask && (
            <button
              onClick={() => onAddTask("")}
              className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-[18px] pr-3 text-left transition-all hover:bg-muted/40"
            >
              <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/30 text-muted-foreground/30 transition-colors group-hover:bg-muted/50 group-hover:text-muted-foreground/50">
                <RiAddLine className="size-3" />
              </div>
              <span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
                Add task...
              </span>
            </button>
          )}
        </div>
      )}

      {/* Inline initiative creator */}
      {onAddInitiative && (
        <InlineInitiativeCreator onSave={onAddInitiative} />
      )}
    </div>
  );
}
