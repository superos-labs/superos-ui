"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine } from "@remixicon/react";
import type {
  ScheduleTask,
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";
import type { GoalItem } from "@/components/backlog";
import { TaskRow } from "@/components/backlog";

// =============================================================================
// Inline Task Creator (simplified version for goal detail)
// =============================================================================

interface InlineTaskCreatorProps {
  onSave: (label: string) => void;
}

function InlineTaskCreator({ onSave }: InlineTaskCreatorProps) {
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
    <div className="flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3">
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
// Task Row (styled for goal detail context)
// =============================================================================

interface GoalDetailTaskRowProps {
  task: ScheduleTask;
  parentGoal: GoalItem;
  scheduleInfo?: TaskScheduleInfo | null;
  deadlineInfo?: TaskDeadlineInfo | null;
  isExpanded?: boolean;
  onToggle?: (taskId: string) => void;
  onExpand?: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  onAddSubtask?: (taskId: string, label: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, label: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

function GoalDetailTaskRow({
  task,
  parentGoal,
  scheduleInfo,
  deadlineInfo,
  isExpanded,
  onToggle,
  onExpand,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
}: GoalDetailTaskRowProps) {
  return (
    <TaskRow
      task={task}
      parentGoal={parentGoal}
      scheduleInfo={scheduleInfo}
      deadlineInfo={deadlineInfo}
      isExpanded={isExpanded}
      onToggle={onToggle}
      onExpand={onExpand}
      onUpdateTask={
        onUpdateTask ? (updates) => onUpdateTask(task.id, updates) : undefined
      }
      onAddSubtask={
        onAddSubtask ? (label) => onAddSubtask(task.id, label) : undefined
      }
      onToggleSubtask={
        onToggleSubtask
          ? (subtaskId) => onToggleSubtask(task.id, subtaskId)
          : undefined
      }
      onUpdateSubtask={
        onUpdateSubtask
          ? (subtaskId, label) => onUpdateSubtask(task.id, subtaskId, label)
          : undefined
      }
      onDeleteSubtask={
        onDeleteSubtask
          ? (subtaskId) => onDeleteSubtask(task.id, subtaskId)
          : undefined
      }
      onDeleteTask={onDeleteTask ? () => onDeleteTask(task.id) : undefined}
      draggable={false}
    />
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalDetailTasksProps {
  /** Tasks for this goal */
  tasks: ScheduleTask[];
  /** Parent goal (for context) */
  parentGoal: GoalItem;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Callback when a task is toggled */
  onToggleTask?: (taskId: string) => void;
  /** Callback to add a new task */
  onAddTask?: (label: string) => void;
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

export function GoalDetailTasks({
  tasks,
  parentGoal,
  getTaskSchedule,
  getTaskDeadline,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
  className,
}: GoalDetailTasksProps) {
  // Task expansion state (accordion - one at a time)
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(
    null,
  );

  const handleExpand = React.useCallback((taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  // Sort: incomplete first, then completed
  const sortedTasks = React.useMemo(() => {
    const incomplete = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);
    return [...incomplete, ...completed];
  }, [tasks]);

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {sortedTasks.length === 0 && !onAddTask && (
        <p className="py-2 text-sm text-muted-foreground/60">No tasks yet</p>
      )}

      {sortedTasks.map((task) => (
        <GoalDetailTaskRow
          key={task.id}
          task={task}
          parentGoal={parentGoal}
          scheduleInfo={getTaskSchedule?.(task.id)}
          deadlineInfo={getTaskDeadline?.(task.id)}
          isExpanded={expandedTaskId === task.id}
          onToggle={onToggleTask}
          onExpand={handleExpand}
          onUpdateTask={onUpdateTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onDeleteTask={onDeleteTask}
        />
      ))}

      {/* Inline task creator */}
      {onAddTask && <InlineTaskCreator onSave={onAddTask} />}
    </div>
  );
}
