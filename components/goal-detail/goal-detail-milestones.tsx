/**
 * =============================================================================
 * File: goal-detail-milestones.tsx
 * =============================================================================
 *
 * Milestones and tasks section for the Goal Detail view.
 *
 * Renders a vertical list of milestones, each containing its associated tasks,
 * with support for:
 * - Creating, editing, completing, and deleting milestones.
 * - Creating, editing, completing, and deleting tasks within milestones.
 * - Managing subtasks inside individual tasks.
 *
 * Designed to express medium-to-large goals as phased progression.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Group tasks by milestone.
 * - Render milestone headers with completion, label, and optional deadline.
 * - Render TaskRow items within each milestone.
 * - Provide inline creators for milestones and tasks.
 * - Manage local expansion state for tasks (accordion).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting milestones, tasks, or subtasks.
 * - Fetching goal data.
 * - Deciding milestone sequencing or semantics.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - First incomplete milestone is treated as the "current" phase.
 * - Milestones default to expanded when incomplete.
 * - Inline creators are keyboard-first.
 * - Compact typography favors dense, scannable lists.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalDetailMilestones
 * - GoalDetailMilestonesProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiArrowRightSLine,
  RiCalendarLine,
} from "@remixicon/react";
import { format, parse, isValid } from "date-fns";
import type {
  Milestone,
  ScheduleTask,
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";
import type { GoalItem } from "@/components/backlog";
import { TaskRow } from "@/components/backlog";
import { DatePicker } from "@/components/ui/date-picker";

/**
 * Format an ISO date string for compact display.
 * e.g., "2026-01-15" -> "Jan 15"
 */
function formatDeadlineCompact(isoDate: string): string {
  const date = parse(isoDate, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return isoDate;
  return format(date, "MMM d");
}

// =============================================================================
// Inline Milestone Creator
// =============================================================================

interface InlineMilestoneCreatorProps {
  onSave: (label: string) => void;
}

function InlineMilestoneCreator({ onSave }: InlineMilestoneCreatorProps) {
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
        className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 text-left transition-all hover:bg-muted/60"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-transparent text-muted-foreground/40 transition-colors group-hover:border-muted-foreground/50 group-hover:bg-muted/60">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-xs text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">
          Milestone
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground/50">
        <RiAddLine className="size-3" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Milestone name..."
        className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Inline Task Creator (for within milestones)
// =============================================================================

interface InlineTaskCreatorProps {
  milestoneId: string;
  onSave: (label: string, milestoneId: string) => void;
}

function InlineTaskCreator({ milestoneId, onSave }: InlineTaskCreatorProps) {
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
      onSave(value.trim(), milestoneId);
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
      onSave(value.trim(), milestoneId);
    }
    setValue("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-[18px] pr-3 text-left transition-all hover:bg-muted/60"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground/40 transition-colors group-hover:bg-muted/60 group-hover:text-muted-foreground/60">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-xs text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">
          Add task...
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-1.5 pl-[18px] pr-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground/50">
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
        className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Milestone Section (with tasks)
// =============================================================================

interface MilestoneSectionProps {
  milestone: Milestone;
  tasks: ScheduleTask[];
  isCurrent: boolean;
  parentGoal: GoalItem;
  expandedTaskId: string | null;
  onExpandTask: (taskId: string) => void;
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  onToggleMilestone?: () => void;
  onUpdateMilestone?: (label: string) => void;
  onUpdateMilestoneDeadline?: (deadline: string | undefined) => void;
  onDeleteMilestone?: () => void;
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (label: string, milestoneId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  onAddSubtask?: (taskId: string, label: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, label: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

function MilestoneSection({
  milestone,
  tasks,
  isCurrent,
  parentGoal,
  expandedTaskId,
  onExpandTask,
  getTaskSchedule,
  getTaskDeadline,
  onToggleMilestone,
  onUpdateMilestone,
  onUpdateMilestoneDeadline,
  onDeleteMilestone,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
}: MilestoneSectionProps) {
  const [isOpen, setIsOpen] = React.useState(!milestone.completed);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(milestone.label);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editValue.trim() && editValue.trim() !== milestone.label) {
        onUpdateMilestone?.(editValue.trim());
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditValue(milestone.label);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (editValue.trim() && editValue.trim() !== milestone.label) {
      onUpdateMilestone?.(editValue.trim());
    } else {
      setEditValue(milestone.label);
    }
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    if (onUpdateMilestone) {
      setIsEditing(true);
    }
  };

  // Count completed tasks
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="flex flex-col">
      {/* Milestone header */}
      <div
        className={cn(
          "group flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 transition-all",
          isCurrent && !milestone.completed && "bg-muted/40",
          !isCurrent && !milestone.completed && "opacity-70",
        )}
      >
        {/* Checkbox */}
        <button
          onClick={onToggleMilestone}
          disabled={!onToggleMilestone}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
            milestone.completed
              ? "border-green-500/50 bg-green-500/10 text-green-600"
              : isCurrent
                ? "border-border hover:border-muted-foreground/50 hover:bg-muted/60"
                : "border-border/50 hover:border-muted-foreground/30",
            !onToggleMilestone && "cursor-default",
          )}
        >
          {milestone.completed && <RiCheckLine className="size-3" />}
        </button>

        {/* Label */}
        {isEditing ? (
          <div className="relative h-5 min-w-[2ch]">
            {/* Hidden span to measure text width */}
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
              "min-w-0 truncate text-xs",
              milestone.completed
                ? "text-muted-foreground line-through"
                : isCurrent
                  ? "font-medium text-foreground"
                  : "text-foreground/80",
              onUpdateMilestone && "cursor-text",
            )}
          >
            {milestone.label}
          </span>
        )}

        {/* Expand/collapse chevron */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:text-muted-foreground"
        >
          <RiArrowRightSLine
            className={cn("size-4 transition-transform", isOpen && "rotate-90")}
          />
        </button>

        {/* Spacer to push deadline and delete to the right */}
        <div className="flex-1" />

        {/* Deadline pill */}
        {onUpdateMilestoneDeadline ? (
          <DatePicker
            value={milestone.deadline}
            onChange={onUpdateMilestoneDeadline}
            placeholder="Target"
            className="bg-transparent hover:bg-muted/60 text-muted-foreground/60 hover:text-muted-foreground py-1 px-2"
          />
        ) : milestone.deadline ? (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <RiCalendarLine className="size-3" />
            {formatDeadlineCompact(milestone.deadline)}
          </span>
        ) : null}

        {/* Delete button */}
        {onDeleteMilestone && (
          <button
            onClick={onDeleteMilestone}
            className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
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
            <InlineTaskCreator milestoneId={milestone.id} onSave={onAddTask} />
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalDetailMilestonesProps {
  /** Milestones for this goal */
  milestones: Milestone[];
  /** Tasks for this goal */
  tasks: ScheduleTask[];
  /** Parent goal for task row context */
  parentGoal: GoalItem;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Callback to add a new milestone */
  onAddMilestone?: (label: string) => void;
  /** Callback to toggle a milestone's completion */
  onToggleMilestone?: (milestoneId: string) => void;
  /** Callback to update a milestone's label */
  onUpdateMilestone?: (milestoneId: string, label: string) => void;
  /** Callback to update a milestone's deadline */
  onUpdateMilestoneDeadline?: (
    milestoneId: string,
    deadline: string | undefined,
  ) => void;
  /** Callback to delete a milestone */
  onDeleteMilestone?: (milestoneId: string) => void;
  /** Callback when a task is toggled */
  onToggleTask?: (taskId: string) => void;
  /** Callback to add a new task */
  onAddTask?: (label: string, milestoneId?: string) => void;
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

export function GoalDetailMilestones({
  milestones,
  tasks,
  parentGoal,
  getTaskSchedule,
  getTaskDeadline,
  onAddMilestone,
  onToggleMilestone,
  onUpdateMilestone,
  onUpdateMilestoneDeadline,
  onDeleteMilestone,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
  className,
}: GoalDetailMilestonesProps) {
  // Find the current milestone (first incomplete)
  const currentMilestoneId = milestones.find((m) => !m.completed)?.id;

  // Task expansion state (accordion - one at a time)
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(
    null,
  );

  const handleExpandTask = React.useCallback((taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  // Group tasks by milestone
  const tasksByMilestone = React.useMemo(() => {
    const grouped = new Map<string, ScheduleTask[]>();

    // Initialize with empty arrays for each milestone
    milestones.forEach((m) => {
      grouped.set(m.id, []);
    });

    // Group tasks
    tasks.forEach((task) => {
      if (task.milestoneId && grouped.has(task.milestoneId)) {
        grouped.get(task.milestoneId)!.push(task);
      }
    });

    return grouped;
  }, [milestones, tasks]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {milestones.map((milestone) => (
        <MilestoneSection
          key={milestone.id}
          milestone={milestone}
          tasks={tasksByMilestone.get(milestone.id) ?? []}
          isCurrent={milestone.id === currentMilestoneId}
          parentGoal={parentGoal}
          expandedTaskId={expandedTaskId}
          onExpandTask={handleExpandTask}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
          onToggleMilestone={
            onToggleMilestone
              ? () => onToggleMilestone(milestone.id)
              : undefined
          }
          onUpdateMilestone={
            onUpdateMilestone
              ? (label) => onUpdateMilestone(milestone.id, label)
              : undefined
          }
          onUpdateMilestoneDeadline={
            onUpdateMilestoneDeadline
              ? (deadline) => onUpdateMilestoneDeadline(milestone.id, deadline)
              : undefined
          }
          onDeleteMilestone={
            onDeleteMilestone
              ? () => onDeleteMilestone(milestone.id)
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
      ))}

      {/* Inline milestone creator */}
      {onAddMilestone && <InlineMilestoneCreator onSave={onAddMilestone} />}
    </div>
  );
}
