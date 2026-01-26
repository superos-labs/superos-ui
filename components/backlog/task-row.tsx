"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiTimeLine,
  RiFlagLine,
  RiAddLine,
} from "@remixicon/react";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import type { DragItem } from "@/lib/drag-types";
import type { TaskScheduleInfo, TaskDeadlineInfo, ScheduleTask, Subtask } from "@/lib/unified-schedule";
import type { BacklogItem, BacklogTask } from "./backlog-types";
import { formatScheduledTime, formatDeadlineDate } from "./backlog-utils";
import { SubtaskRow } from "@/components/ui/subtask-row";

// SubtaskRow is imported from @/components/ui/subtask-row
// Re-export for backward compatibility
export { SubtaskRow } from "@/components/ui/subtask-row";

// =============================================================================
// Inline Subtask Creator
// =============================================================================

interface InlineSubtaskCreatorProps {
  onSave: (label: string) => void;
}

function InlineSubtaskCreator({ onSave }: InlineSubtaskCreatorProps) {
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
        className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
      >
        <RiAddLine className="size-3" />
        <span>Add subtask...</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-0.5">
      {/* Empty checkbox to match SubtaskRow appearance */}
      <div className="flex size-3.5 shrink-0 items-center justify-center rounded border border-border bg-transparent" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Subtask..."
        className="h-4 min-w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Expanded Task Detail
// =============================================================================

interface ExpandedTaskDetailProps {
  task: BacklogTask;
  onUpdateTask?: (updates: Partial<ScheduleTask>) => void;
  onAddSubtask?: (label: string) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onUpdateSubtask?: (subtaskId: string, label: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
}

function ExpandedTaskDetail({
  task,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: ExpandedTaskDetailProps) {
  const [descriptionValue, setDescriptionValue] = React.useState(task.description ?? "");

  // Sync description when task changes externally
  React.useEffect(() => {
    setDescriptionValue(task.description ?? "");
  }, [task.description]);

  const handleDescriptionBlur = () => {
    if (descriptionValue !== (task.description ?? "")) {
      onUpdateTask?.({ description: descriptionValue || undefined });
    }
  };

  return (
    <div className="flex flex-col gap-1.5 pb-2 pl-12 pr-3">
      {/* Inline description */}
      <textarea
        value={descriptionValue}
        onChange={(e) => setDescriptionValue(e.target.value)}
        onBlur={handleDescriptionBlur}
        placeholder="Add notes..."
        className="min-h-[24px] resize-none bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none"
      />

      {/* Subtasks */}
      {(task.subtasks?.length || onAddSubtask) && (
        <div className="flex flex-col">
          {task.subtasks?.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              onToggle={onToggleSubtask}
              onTextChange={onUpdateSubtask}
              onDelete={onDeleteSubtask}
              size="compact"
            />
          ))}
          {onAddSubtask && (
            <InlineSubtaskCreator onSave={onAddSubtask} />
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Task Row
// =============================================================================

export interface TaskRowProps {
  task: BacklogTask;
  /** Parent goal (needed for drag context and color inheritance) */
  parentGoal: BacklogItem;
  /** Schedule info if this task is on the calendar */
  scheduleInfo?: TaskScheduleInfo | null;
  /** Deadline info if this task has a deadline */
  deadlineInfo?: TaskDeadlineInfo | null;
  onToggle?: (id: string) => void;
  /** Whether drag is enabled (requires DragProvider) */
  draggable?: boolean;
  /** Whether this task is expanded to show details */
  isExpanded?: boolean;
  /** Callback to toggle expansion */
  onExpand?: (taskId: string) => void;
  /** Callback to update task properties */
  onUpdateTask?: (updates: Partial<ScheduleTask>) => void;
  /** Callback to add a subtask */
  onAddSubtask?: (label: string) => void;
  /** Callback to toggle a subtask's completion */
  onToggleSubtask?: (subtaskId: string) => void;
  /** Callback to update a subtask's label */
  onUpdateSubtask?: (subtaskId: string, label: string) => void;
  /** Callback to delete a subtask */
  onDeleteSubtask?: (subtaskId: string) => void;
  /** Callback to delete this task */
  onDeleteTask?: () => void;
}

export function TaskRow({ 
  task, 
  parentGoal, 
  scheduleInfo, 
  deadlineInfo,
  onToggle, 
  draggable = false,
  isExpanded = false,
  onExpand,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
}: TaskRowProps) {
  // Drag context is optional - only use if within DragProvider
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext && !task.completed;
  
  // Inline title editing state
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(task.label);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  // Sync title value when task.label changes externally
  React.useEffect(() => {
    if (!isEditingTitle) {
      setTitleValue(task.label);
    }
  }, [task.label, isEditingTitle]);

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (titleValue.trim() && titleValue.trim() !== task.label) {
        onUpdateTask?.({ label: titleValue.trim() });
      }
      setIsEditingTitle(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitleValue(task.label);
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    if (titleValue.trim() && titleValue.trim() !== task.label) {
      onUpdateTask?.({ label: titleValue.trim() });
    } else {
      setTitleValue(task.label);
    }
    setIsEditingTitle(false);
  };

  // Hover state for keyboard shortcuts
  const [isHovered, setIsHovered] = React.useState(false);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts when hovered
  React.useEffect(() => {
    if (!isHovered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // ESC to collapse expanded task (if not editing)
      if (e.key === "Escape" && isExpanded && !isEditingTitle && !isInInput) {
        e.preventDefault();
        onExpand?.(task.id);
        return;
      }

      // Delete/Backspace to delete task
      if ((e.key === "Delete" || e.key === "Backspace") && !isEditingTitle && !isInInput && onDeleteTask) {
        e.preventDefault();
        onDeleteTask();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isHovered, isExpanded, isEditingTitle, onDeleteTask, onExpand, task.id]);

  // Handle click outside to collapse expanded task
  React.useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Don't collapse if clicking inside the task container
      if (containerRef.current?.contains(e.target as Node)) return;
      
      onExpand?.(task.id);
    };

    // Use setTimeout to avoid immediate collapse from the click that expanded
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isExpanded, onExpand, task.id]);
  
  const dragItem: DragItem = {
    type: "task",
    goalId: parentGoal.id,
    goalLabel: parentGoal.label,
    goalColor: parentGoal.color,
    taskId: task.id,
    taskLabel: task.label,
    // Include source deadline if this task has one (for dragging from tray)
    sourceDeadline: task.deadline,
  };
  
  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  // Handle click to expand (avoid checkbox, label editing, and during drag)
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't expand if clicking the checkbox
    if ((e.target as HTMLElement).closest('[data-checkbox]')) return;
    // Don't expand if clicking the label (for editing)
    if ((e.target as HTMLElement).closest('[data-label]')) return;
    // Don't expand if this was a drag operation
    if (dragContext?.state.isDragging) return;
    
    onExpand?.(task.id);
  };

  // Handle label click - enter edit mode if expanded, otherwise expand
  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded && onUpdateTask) {
      setIsEditingTitle(true);
    } else {
      onExpand?.(task.id);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col",
        isExpanded && "rounded-lg bg-muted/40",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={rowRef}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 transition-all",
          !isExpanded && "hover:bg-muted/60",
          isDragging && "opacity-50",
          onExpand && "cursor-pointer",
        )}
        onClick={handleRowClick}
        {...(canDrag ? draggableProps : {})}
      >
        <button
          data-checkbox
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(task.id);
          }}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
            task.completed
              ? "bg-muted text-muted-foreground"
              : "bg-muted/60 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground",
          )}
        >
          {task.completed && <RiCheckLine className="size-3" />}
        </button>
        
        {/* Inline editable label */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleTitleBlur}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex-1 min-w-0 bg-transparent text-xs focus:outline-none",
              task.completed
                ? "text-muted-foreground"
                : "text-foreground/80",
            )}
          />
        ) : (
          <span
            data-label
            onClick={handleLabelClick}
            className={cn(
              "flex-1 truncate text-xs",
              task.completed
                ? "text-muted-foreground line-through"
                : "text-foreground/80",
              isExpanded && onUpdateTask && "cursor-text hover:bg-muted/60 rounded px-1 -mx-1",
            )}
          >
            {task.label}
          </span>
        )}
        
        {/* Scheduled time pill (mutually exclusive with deadline) */}
        {scheduleInfo && (
          <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
            <RiTimeLine className="size-3" />
            {formatScheduledTime(scheduleInfo)}
          </span>
        )}
        
        {/* Deadline pill (shown when no schedule, but has deadline) */}
        {!scheduleInfo && deadlineInfo && (
          <span 
            className={cn(
              "flex shrink-0 items-center gap-1 text-[10px] tabular-nums",
              deadlineInfo.isOverdue 
                ? "text-amber-600 dark:text-amber-500" 
                : "text-muted-foreground"
            )}
          >
            <RiFlagLine className="size-3" />
            {formatDeadlineDate(deadlineInfo)}
          </span>
        )}
      </div>
      
      {/* Expanded task detail */}
      {isExpanded && (
        <ExpandedTaskDetail
          task={task}
          onUpdateTask={onUpdateTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      )}
    </div>
  );
}
