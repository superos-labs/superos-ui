/**
 * =============================================================================
 * File: goal-task-row.tsx
 * =============================================================================
 *
 * Expandable row used inside the Block sidebar to display
 * a goal-assigned task.
 *
 * Supports:
 * - Toggle completion
 * - Inline title editing
 * - Expand/collapse to show notes and subtasks
 * - Unassigning the task from the block
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a compact task row optimized for sidebar usage.
 * - Manage inline title editing UX.
 * - Manage expanded state interactions (click, ESC, outside click).
 * - Forward task and subtask mutations via callbacks.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or persisting task data.
 * - Computing scheduling or deadline metadata.
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "This block contains this specific task. Let me refine it in place."
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import type { ScheduleTask } from "@/lib/unified-schedule";
import { SubtaskRow, InlineSubtaskCreator } from "@/components/ui";

// =============================================================================
// Expanded Goal Task Detail
// =============================================================================

interface ExpandedGoalTaskDetailProps {
  task: ScheduleTask;
  onUpdateTask?: (updates: Partial<ScheduleTask>) => void;
  onAddSubtask?: (label: string) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onUpdateSubtask?: (subtaskId: string, label: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
}

function ExpandedGoalTaskDetail({
  task,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: ExpandedGoalTaskDetailProps) {
  const [descriptionValue, setDescriptionValue] = React.useState(
    task.description ?? "",
  );

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
    <div className="flex flex-col gap-2 pb-2 pl-7 pr-2">
      {/* Notes textarea */}
      <textarea
        value={descriptionValue}
        onChange={(e) => setDescriptionValue(e.target.value)}
        onBlur={handleDescriptionBlur}
        placeholder="Add notes..."
        className="min-h-[32px] resize-none rounded-md bg-muted/40 px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-border"
      />

      {/* Subtasks list */}
      {(task.subtasks?.length || onAddSubtask) && (
        <div className="flex flex-col gap-0.5">
          {task.subtasks?.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              onToggle={onToggleSubtask}
              onTextChange={onUpdateSubtask}
              onDelete={onDeleteSubtask}
              size="default"
            />
          ))}
          {onAddSubtask && <InlineSubtaskCreator onSave={onAddSubtask} />}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Goal Task Row (expandable with inline editing)
// =============================================================================

export interface BlockGoalTaskRowProps {
  task: ScheduleTask;
  /** Whether this task is expanded to show details */
  isExpanded?: boolean;
  /** Callback to toggle expansion */
  onExpand?: (taskId: string) => void;
  onToggle?: (id: string) => void;
  onUnassign?: (id: string) => void;
  // Task context callbacks
  onUpdateTask?: (updates: Partial<ScheduleTask>) => void;
  onAddSubtask?: (label: string) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onUpdateSubtask?: (subtaskId: string, label: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
}

export function BlockGoalTaskRow({
  task,
  isExpanded = false,
  onExpand,
  onToggle,
  onUnassign,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: BlockGoalTaskRowProps) {
  // Inline title editing state
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(task.label);
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const commitTitleChange = () => {
    if (titleValue.trim() && titleValue.trim() !== task.label) {
      onUpdateTask?.({ label: titleValue.trim() });
    } else {
      setTitleValue(task.label);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTitleChange();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitleValue(task.label);
      setIsEditingTitle(false);
    }
  };

  // Click row to expand, click label when expanded to edit
  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-checkbox]")) return;
    if ((e.target as HTMLElement).closest("[data-label]")) return;
    if ((e.target as HTMLElement).closest("[data-unassign]")) return;
    onExpand?.(task.id);
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded && onUpdateTask) {
      setIsEditingTitle(true);
    } else {
      onExpand?.(task.id);
    }
  };

  // Handle click outside to collapse expanded task
  React.useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
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

  // Handle ESC to collapse expanded task
  React.useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isEditingTitle) {
        onExpand?.(task.id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, isEditingTitle, onExpand, task.id]);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col", isExpanded && "rounded-lg bg-muted/30")}
    >
      {/* Task header row */}
      <div
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg py-2 px-2 transition-all",
          !isExpanded && "hover:bg-muted/60",
          onExpand && "cursor-pointer",
        )}
        onClick={handleRowClick}
      >
        {/* Checkbox */}
        <button
          data-checkbox
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(task.id);
          }}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
            task.completed
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background hover:bg-muted",
          )}
        >
          {task.completed && <RiCheckLine className="size-3" />}
        </button>

        {/* Label (editable when expanded) */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={commitTitleChange}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex-1 min-w-0 bg-transparent text-sm outline-none",
              task.completed ? "text-muted-foreground" : "text-foreground",
            )}
          />
        ) : (
          <span
            data-label
            onClick={handleLabelClick}
            className={cn(
              "flex-1 text-sm",
              task.completed
                ? "text-muted-foreground line-through"
                : "text-foreground",
              isExpanded &&
                onUpdateTask &&
                "cursor-text hover:bg-muted/60 rounded px-1 -mx-1",
            )}
          >
            {task.label}
          </span>
        )}

        {/* Unassign button */}
        {onUnassign && (
          <button
            data-unassign
            onClick={(e) => {
              e.stopPropagation();
              onUnassign(task.id);
            }}
            className="flex size-5 items-center justify-center rounded text-muted-foreground/50 opacity-0 transition-all hover:text-muted-foreground group-hover:opacity-100"
          >
            <RiCloseLine className="size-3.5" />
          </button>
        )}
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <ExpandedGoalTaskDetail
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
