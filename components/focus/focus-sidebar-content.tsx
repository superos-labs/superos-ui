/**
 * =============================================================================
 * File: focus-sidebar-content.tsx
 * =============================================================================
 *
 * Primary sidebar content shown during an active focus session.
 *
 * Provides a dedicated, distraction-minimized environment to:
 * - View and control the focus timer.
 * - See the focused block’s title and color context.
 * - Capture notes (description-style, no section title).
 * - Progress tasks or subtasks related to the focused block.
 *
 * Adapts its content based on block type (goal block vs task block).
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render hero timer, title, and focus controls (pause, resume, end).
 * - Display and edit notes (shown as "Add description..." placeholder, no
 *   section header) — uses shared AutoResizeTextarea from sidebar-utils.
 * - For goal blocks:
 *   - List assigned goal tasks (no "No tasks" empty state).
 *   - Toggle, unassign, and expand goal tasks.
 *   - Edit task details and manage subtasks.
 *   - Create new tasks inline.
 * - For task blocks:
 *   - List and manage subtasks (no "No subtasks" empty state).
 *   - Create new subtasks inline.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Owning focus timer state or lifecycle.
 * - Persisting notes, tasks, or subtasks.
 * - Fetching block or goal data.
 * - Enforcing business rules around completion.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Spacing matches BlockSidebar: px-5 paddings, mx-5 divider, border/60.
 * - Section titles removed — notes and tasks flow inline, description first.
 * - Empty-state messages removed; only creators shown when lists are empty.
 * - Desktop-first vertical layout.
 * - Animated color dot reflects running state.
 * - Auto-resizing notes textarea imported from sidebar-utils (no local copy).
 * - Inline creators favor keyboard-first flows.
 * - Goal task expansion behaves like a single-open accordion.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - FocusSidebarContent
 * - FocusSidebarContentProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatElapsedMs } from "@/lib/time-utils";
import {
  RiPauseFill,
  RiPlayFill,
  RiStopFill,
  RiAddLine,
  RiCloseLine,
} from "@remixicon/react";
import { BLOCK_COLORS, BlockGoalTaskRow } from "@/components/block";
import type { BlockSidebarData } from "@/components/block";
import type { ScheduleTask } from "@/lib/unified-schedule";
import { SubtaskRow, type SubtaskRowData } from "@/components/ui/subtask-row";
import { AutoResizeTextarea } from "@/components/block/sidebar/sidebar-utils";

// =============================================================================
// Inline Task Creator (for focus mode)
// =============================================================================

interface InlineFocusTaskCreatorProps {
  onSave: (label: string) => void;
}

function InlineFocusTaskCreator({ onSave }: InlineFocusTaskCreatorProps) {
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
        className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      >
        <RiAddLine className="size-3.5" />
        <span>Add task...</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/40" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Task name..."
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface FocusSidebarContentProps {
  /** Block data */
  block: BlockSidebarData;
  /** Elapsed focus time in milliseconds */
  elapsedMs: number;
  /** Whether the timer is running */
  isRunning: boolean;
  /** Callback to pause the timer */
  onPause?: () => void;
  /** Callback to resume the timer */
  onResume?: () => void;
  /** Callback to end the focus session */
  onEnd?: () => void;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when notes are updated */
  onNotesChange?: (notes: string) => void;

  // Goal task callbacks (for goal blocks)
  onToggleGoalTask?: (taskId: string) => void;
  onCreateTask?: (label: string) => void;
  onUnassignTask?: (taskId: string) => void;

  // Goal task context callbacks (for viewing/editing task details within goal blocks)
  /** Callback to update a goal task's properties (label, description) */
  onUpdateGoalTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  /** Callback to add a subtask to a goal task */
  onAddGoalTaskSubtask?: (taskId: string, label: string) => void;
  /** Callback to toggle a goal task's subtask completion */
  onToggleGoalTaskSubtask?: (taskId: string, subtaskId: string) => void;
  /** Callback to update a goal task's subtask label */
  onUpdateGoalTaskSubtask?: (
    taskId: string,
    subtaskId: string,
    label: string,
  ) => void;
  /** Callback to delete a goal task's subtask */
  onDeleteGoalTaskSubtask?: (taskId: string, subtaskId: string) => void;

  // Subtask callbacks (for task blocks)
  onAddSubtask?: (label: string) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onUpdateSubtask?: (subtaskId: string, text: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
}

export function FocusSidebarContent({
  block,
  elapsedMs,
  isRunning,
  onPause,
  onResume,
  onEnd,
  onClose,
  onNotesChange,
  onToggleGoalTask,
  onCreateTask,
  onUnassignTask,
  // Goal task context callbacks
  onUpdateGoalTask,
  onAddGoalTaskSubtask,
  onToggleGoalTaskSubtask,
  onUpdateGoalTaskSubtask,
  onDeleteGoalTaskSubtask,
  // Subtask callbacks
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: FocusSidebarContentProps) {
  const colorConfig = BLOCK_COLORS[block.color];
  const dotColorClass = colorConfig.text
    .replace("text-", "bg-")
    .replace("-600", "-500");

  const isGoalBlock = block.blockType === "goal";
  const isTaskBlock = block.blockType === "task";

  // Goal task expansion state (accordion - one at a time)
  const [expandedGoalTaskId, setExpandedGoalTaskId] = React.useState<
    string | null
  >(null);

  const handleGoalTaskExpand = React.useCallback((taskId: string) => {
    setExpandedGoalTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  // Inline subtask creation state (for task blocks)
  const [isCreatingSubtask, setIsCreatingSubtask] = React.useState(false);
  const [newSubtaskLabel, setNewSubtaskLabel] = React.useState("");
  const subtaskInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isCreatingSubtask) {
      subtaskInputRef.current?.focus();
    }
  }, [isCreatingSubtask]);

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSubtaskLabel.trim()) {
      e.preventDefault();
      onAddSubtask?.(newSubtaskLabel.trim());
      setNewSubtaskLabel("");
      subtaskInputRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewSubtaskLabel("");
      setIsCreatingSubtask(false);
    }
  };

  const handleSubtaskBlur = () => {
    if (newSubtaskLabel.trim()) {
      onAddSubtask?.(newSubtaskLabel.trim());
    }
    setNewSubtaskLabel("");
    setIsCreatingSubtask(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Close button */}
      {onClose && (
        <div className="flex justify-end px-5 pt-5">
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>
      )}

      {/* Hero Timer Section */}
      <div className="flex flex-col items-center gap-4 px-5 pb-5 pt-2">
        {/* Timer */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-3 rounded-full",
              dotColorClass,
              isRunning && "animate-pulse",
            )}
          />
          <span
            className={cn(
              "font-mono text-4xl font-semibold tabular-nums tracking-tight",
              isRunning ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {formatElapsedMs(elapsedMs)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-medium text-foreground">
          {block.title}
        </h2>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={isRunning ? onPause : onResume}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "bg-muted text-foreground hover:bg-muted/80",
            )}
          >
            {isRunning ? (
              <>
                <RiPauseFill className="size-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <RiPlayFill className="size-4" />
                <span>Resume</span>
              </>
            )}
          </button>
          <button
            onClick={onEnd}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            )}
          >
            <RiStopFill className="size-4" />
            <span>End</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-border/60" />

      {/* Content – notes first, then tasks, no section titles */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5 pt-4">
        {/* Notes / description */}
        {onNotesChange ? (
          <AutoResizeTextarea
            value={block.notes || ""}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add description..."
            className={cn(
              "w-full bg-transparent text-sm text-foreground leading-relaxed",
              "outline-none placeholder:text-muted-foreground/60",
            )}
          />
        ) : (
          block.notes && (
            <p className="text-sm text-foreground leading-relaxed">
              {block.notes}
            </p>
          )
        )}

        {/* Goal Tasks (for goal blocks) */}
        {isGoalBlock && block.goal && (
          <div className="flex flex-col">
            {block.goalTasks.length > 0 &&
              block.goalTasks.map((task) => (
                <BlockGoalTaskRow
                  key={task.id}
                  task={task}
                  isExpanded={expandedGoalTaskId === task.id}
                  onExpand={handleGoalTaskExpand}
                  onToggle={onToggleGoalTask}
                  onUnassign={onUnassignTask}
                  onUpdateTask={
                    onUpdateGoalTask
                      ? (updates) => onUpdateGoalTask(task.id, updates)
                      : undefined
                  }
                  onAddSubtask={
                    onAddGoalTaskSubtask
                      ? (label) => onAddGoalTaskSubtask(task.id, label)
                      : undefined
                  }
                  onToggleSubtask={
                    onToggleGoalTaskSubtask
                      ? (subtaskId) =>
                          onToggleGoalTaskSubtask(task.id, subtaskId)
                      : undefined
                  }
                  onUpdateSubtask={
                    onUpdateGoalTaskSubtask
                      ? (subtaskId, label) =>
                          onUpdateGoalTaskSubtask(task.id, subtaskId, label)
                      : undefined
                  }
                  onDeleteSubtask={
                    onDeleteGoalTaskSubtask
                      ? (subtaskId) =>
                          onDeleteGoalTaskSubtask(task.id, subtaskId)
                      : undefined
                  }
                />
              ))}
            {onCreateTask && <InlineFocusTaskCreator onSave={onCreateTask} />}
          </div>
        )}

        {/* Subtasks (for task blocks) */}
        {isTaskBlock && (
          <div className="flex flex-col gap-3">
            {block.subtasks.length > 0 && (
              <div className="flex flex-col gap-0.5">
                {block.subtasks.map((subtask) => {
                  const rowData: SubtaskRowData = {
                    id: subtask.id,
                    label: subtask.text,
                    completed: subtask.done,
                  };
                  return (
                    <SubtaskRow
                      key={subtask.id}
                      subtask={rowData}
                      onToggle={onToggleSubtask}
                      onTextChange={onUpdateSubtask}
                      onDelete={onDeleteSubtask}
                    />
                  );
                })}
              </div>
            )}
            {onAddSubtask &&
              (isCreatingSubtask ? (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="flex size-4 shrink-0 items-center justify-center rounded border border-muted-foreground/40" />
                  <input
                    ref={subtaskInputRef}
                    type="text"
                    value={newSubtaskLabel}
                    onChange={(e) => setNewSubtaskLabel(e.target.value)}
                    onKeyDown={handleSubtaskKeyDown}
                    onBlur={handleSubtaskBlur}
                    placeholder="Subtask..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingSubtask(true)}
                  className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                >
                  <RiAddLine className="size-3.5" />
                  <span>Add subtask</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
