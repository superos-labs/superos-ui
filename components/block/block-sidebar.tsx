"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCalendarLine,
  RiTimeLine,
  RiFileTextLine,
  RiCheckLine,
  RiCloseLine,
  RiFlagLine,
  RiAddLine,
} from "@remixicon/react";
import type { BlockColor } from "./block-colors";
import type { BlockType, IconComponent } from "@/lib/types";
import { SubtaskRow, type SubtaskRowData } from "@/components/ui/subtask-row";

// Types

/** Goal task - synced from the goal's master task list */
interface BlockGoalTask {
  id: string;
  label: string;
  completed?: boolean;
}

/** Ephemeral subtask - block-scoped, deleted with block */
interface BlockSubtask {
  id: string;
  text: string;
  done: boolean;
}

/** Associated goal or commitment for the block */
interface BlockSidebarSource {
  id: string;
  label: string;
  icon: IconComponent;
  color: string;
}

/** @deprecated Use BlockSidebarSource instead */
type BlockSidebarGoal = BlockSidebarSource;

interface BlockSidebarData {
  id: string;
  title: string;
  /** Block type: 'goal' shows goal tasks section, 'task' shows subtasks, 'commitment' shows notes only */
  blockType: BlockType;
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Start time in 24h format (HH:MM) */
  startTime: string;
  /** End time in 24h format (HH:MM) */
  endTime: string;
  /** Optional notes for the block */
  notes?: string;
  /** Subtasks for task blocks (synced with the source task) */
  subtasks: BlockSubtask[];
  /** Assigned tasks from the goal (only when blockType === 'goal') */
  goalTasks: BlockGoalTask[];
  /** Color theme for the block */
  color: BlockColor;
  /** Associated goal (for goal/task blocks) */
  goal?: BlockSidebarSource;
  /** Associated commitment (for commitment blocks) */
  commitment?: BlockSidebarSource;
}

// Helper to format date for display
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Helper to format time for display
function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Auto-resizing textarea component
type AutoResizeTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function AutoResizeTextarea({
  className,
  value,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      className={cn("resize-none overflow-hidden", className)}
      {...props}
    />
  );
}

// Goal task row component (prominent checkbox style)
interface BlockGoalTaskRowProps {
  task: BlockGoalTask;
  onToggle?: (id: string) => void;
}

function BlockGoalTaskRow({ task, onToggle }: BlockGoalTaskRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg py-2 px-2 transition-all",
        "hover:bg-muted/60",
      )}
    >
      <button
        onClick={() => onToggle?.(task.id)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
          task.completed
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-background hover:bg-muted",
        )}
      >
        {task.completed && <RiCheckLine className="size-3" />}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          task.completed
            ? "text-muted-foreground line-through"
            : "text-foreground",
        )}
      >
        {task.label}
      </span>
    </div>
  );
}

// Subtask row component (Notion-style subtle checkbox)
interface BlockSubtaskRowProps {
  subtask: BlockSubtask;
  onToggle?: (id: string) => void;
  onChange?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
}

function BlockSubtaskRow({
  subtask,
  onToggle,
  onChange,
  onDelete,
}: BlockSubtaskRowProps) {
  return (
    <div className="group flex items-center gap-2 py-0.5">
      <button
        onClick={() => onToggle?.(subtask.id)}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          subtask.done
            ? "border-muted-foreground/30 bg-muted-foreground/20"
            : "border-muted-foreground/40 hover:border-muted-foreground/60",
        )}
      >
        {subtask.done && (
          <RiCheckLine className="size-2.5 text-muted-foreground" />
        )}
      </button>
      {onChange ? (
        <input
          type="text"
          value={subtask.text}
          onChange={(e) => onChange(subtask.id, e.target.value)}
          className={cn(
            "flex-1 bg-transparent text-sm outline-none",
            subtask.done && "text-muted-foreground line-through",
          )}
          placeholder="Subtask..."
        />
      ) : (
        <span
          className={cn(
            "flex-1 text-sm",
            subtask.done && "text-muted-foreground line-through",
          )}
        >
          {subtask.text}
        </span>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(subtask.id)}
          className="flex size-5 items-center justify-center rounded text-muted-foreground/50 opacity-0 transition-all hover:text-muted-foreground group-hover:opacity-100"
        >
          <RiCloseLine className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// Section header component
interface BlockSidebarSectionProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}

function BlockSidebarSection({
  icon,
  label,
  children,
  className,
}: BlockSidebarSectionProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

// Main component
interface BlockSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Block data to display */
  block: BlockSidebarData;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when title is updated */
  onTitleChange?: (title: string) => void;
  /** Callback when date is updated */
  onDateChange?: (date: string) => void;
  /** Callback when start time is updated */
  onStartTimeChange?: (startTime: string) => void;
  /** Callback when end time is updated */
  onEndTimeChange?: (endTime: string) => void;
  /** Callback when notes are updated */
  onNotesChange?: (notes: string) => void;

  // Subtask callbacks (ephemeral, block-scoped)
  /** Callback to add a new subtask */
  onAddSubtask?: () => void;
  /** Callback when a subtask is toggled */
  onToggleSubtask?: (subtaskId: string) => void;
  /** Callback when subtask text is updated */
  onUpdateSubtask?: (subtaskId: string, text: string) => void;
  /** Callback to delete a subtask */
  onDeleteSubtask?: (subtaskId: string) => void;

  // Goal task callbacks (only for goal blocks)
  /** Callback when a goal task is toggled */
  onToggleGoalTask?: (taskId: string) => void;
  /** Available tasks from the goal that can be assigned */
  availableGoalTasks?: BlockGoalTask[];
  /** Callback to assign a goal task to this block */
  onAssignTask?: (taskId: string) => void;
  /** Callback to unassign a goal task from this block */
  onUnassignTask?: (taskId: string) => void;
}

function BlockSidebar({
  block,
  onClose,
  onTitleChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onNotesChange,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleGoalTask,
  availableGoalTasks,
  onAssignTask,
  onUnassignTask: _onUnassignTask,
  className,
  ...props
}: BlockSidebarProps) {
  // Note: _onUnassignTask is reserved for future use (unassign task from block)
  const isGoalBlock = block.blockType === "goal";
  const isTaskBlock = block.blockType === "task";
  const isCommitmentBlock = block.blockType === "commitment";
  
  // Get the source info (goal or commitment)
  const sourceInfo = block.goal ?? block.commitment;
  
  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
        {/* Close button row */}
        {onClose && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RiCloseLine className="size-4" />
            </button>
          </div>
        )}

        {/* Title row */}
        {onTitleChange ? (
          <input
            type="text"
            value={block.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={cn(
              "w-full bg-transparent text-lg font-semibold text-foreground leading-tight",
              "outline-none placeholder:text-muted-foreground/60",
              "focus:outline-none",
            )}
            placeholder="Block title..."
          />
        ) : (
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            {block.title}
          </h2>
        )}

        {/* Associated goal or commitment */}
        {sourceInfo && (
          <div className="flex items-center gap-2">
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
              <sourceInfo.icon className={cn("size-3", sourceInfo.color)} />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <RiFlagLine className="size-3" />
              <span>{sourceInfo.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 p-4">
        {/* Date & Time */}
        <BlockSidebarSection
          icon={<RiCalendarLine className="size-3.5" />}
          label="Date & Time"
        >
          <div className="flex flex-col gap-2">
            {onDateChange ? (
              <input
                type="date"
                value={block.date}
                onChange={(e) => onDateChange(e.target.value)}
                className={cn(
                  "w-full rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                  "outline-none focus:bg-muted",
                )}
              />
            ) : (
              <span className="text-sm font-medium text-foreground">
                {formatDateDisplay(block.date)}
              </span>
            )}
            <div className="flex items-center gap-2">
              {onStartTimeChange && onEndTimeChange ? (
                <>
                  <input
                    type="time"
                    value={block.startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className={cn(
                      "flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                      "outline-none focus:bg-muted",
                    )}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={block.endTime}
                    onChange={(e) => onEndTimeChange(e.target.value)}
                    className={cn(
                      "flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                      "outline-none focus:bg-muted",
                    )}
                  />
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <RiTimeLine className="size-3.5" />
                  <span>
                    {formatTimeDisplay(block.startTime)} –{" "}
                    {formatTimeDisplay(block.endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </BlockSidebarSection>

        {/* Goal Tasks (only for goal blocks) - shown before notes */}
        {isGoalBlock && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <RiCheckLine className="size-3.5" />
                <span>Tasks</span>
              </div>
              {onAssignTask && availableGoalTasks && availableGoalTasks.length > 0 && (
                <button
                  onClick={() => {
                    // For now, assign the first available task
                    // In a full implementation, this would open a picker
                    const firstUnassigned = availableGoalTasks[0];
                    if (firstUnassigned) {
                      onAssignTask(firstUnassigned.id);
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RiAddLine className="size-3" />
                  <span>Assign</span>
                </button>
              )}
            </div>
            <div className="flex flex-col">
              {block.goalTasks.length > 0 ? (
                block.goalTasks.map((task) => (
                  <BlockGoalTaskRow
                    key={task.id}
                    task={task}
                    onToggle={onToggleGoalTask}
                  />
                ))
              ) : (
                <p className="pl-5 text-sm text-muted-foreground">
                  No tasks assigned
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <BlockSidebarSection
          icon={<RiFileTextLine className="size-3.5" />}
          label="Notes"
        >
          <div className="flex flex-col gap-2">
            {onNotesChange ? (
              <AutoResizeTextarea
                value={block.notes || ""}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add notes..."
                className={cn(
                  "w-full min-h-[24px] bg-transparent text-sm text-foreground leading-relaxed",
                  "outline-none placeholder:text-muted-foreground/60",
                )}
              />
            ) : (
              <p className="text-sm text-foreground leading-relaxed">
                {block.notes || "No notes"}
              </p>
            )}

            {/* Subtasks (only for task blocks) */}
            {isTaskBlock && (
              <>
                {block.subtasks.length > 0 && (
                  <div className="flex flex-col gap-0.5 pt-1">
                    {block.subtasks.map((subtask) => {
                      // Map BlockSubtask to SubtaskRowData
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

                {/* Add subtask button */}
                {onAddSubtask && (
                  <button
                    onClick={onAddSubtask}
                    className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                  >
                    <RiAddLine className="size-3.5" />
                    <span>Add subtask</span>
                  </button>
                )}
              </>
            )}
          </div>
        </BlockSidebarSection>
      </div>
    </div>
  );
}

export { BlockSidebar, BlockGoalTaskRow, BlockSubtaskRow, BlockSidebarSection };
export type {
  BlockSidebarProps,
  BlockSidebarData,
  BlockGoalTask,
  BlockSubtask,
  BlockSidebarSource,
  BlockSidebarGoal,
};
// Re-export BlockType for backward compatibility
export type { BlockType } from "@/lib/types";
