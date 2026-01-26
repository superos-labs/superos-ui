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
  RiArrowDownSLine,
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
  onUnassign?: (id: string) => void;
}

function BlockGoalTaskRow({ task, onToggle, onUnassign }: BlockGoalTaskRowProps) {
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
      {onUnassign && (
        <button
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

// Inline task creator for goal blocks (matches backlog InlineTaskCreator pattern)
interface InlineBlockTaskCreatorProps {
  onSave: (label: string) => void;
}

function InlineBlockTaskCreator({ onSave }: InlineBlockTaskCreatorProps) {
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
      // Keep focus for rapid entry
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
        className="group flex w-full items-center gap-2.5 rounded-lg py-2 px-2 text-left transition-all hover:bg-muted/60"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground/40 transition-colors group-hover:border-muted-foreground/50 group-hover:text-muted-foreground/60">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-sm text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">
          Add task...
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-2 px-2">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/40 text-muted-foreground/50">
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
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// Collapsible list of available tasks that can be assigned to this block
interface AvailableTasksListProps {
  tasks: BlockGoalTask[];
  onAssign: (taskId: string) => void;
}

function AvailableTasksList({ tasks, onAssign }: AvailableTasksListProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex w-full items-center gap-2.5 rounded-lg py-2 px-2 text-left transition-all hover:bg-muted/60"
      >
        <div className="flex size-5 shrink-0 items-center justify-center">
          <RiArrowDownSLine
            className={cn(
              "size-4 text-muted-foreground/50 transition-transform group-hover:text-muted-foreground/70",
              isExpanded && "rotate-180",
            )}
          />
        </div>
        <span className="text-sm text-muted-foreground/60 transition-colors group-hover:text-muted-foreground/80">
          Show available tasks ({tasks.length})
        </span>
      </button>

      {isExpanded && (
        <div className="flex flex-col">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onAssign(task.id)}
              className="group flex items-center gap-2.5 rounded-lg py-2 px-2 text-left transition-all hover:bg-muted/60"
            >
              <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/20 text-muted-foreground/30 transition-colors group-hover:border-muted-foreground/40 group-hover:text-muted-foreground/50">
                <RiAddLine className="size-3" />
              </div>
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {task.label}
              </span>
            </button>
          ))}
        </div>
      )}
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
  /** Callback to add a new subtask with the given label */
  onAddSubtask?: (label: string) => void;
  /** Callback when a subtask is toggled */
  onToggleSubtask?: (subtaskId: string) => void;
  /** Callback when subtask text is updated */
  onUpdateSubtask?: (subtaskId: string, text: string) => void;
  /** Callback to delete a subtask */
  onDeleteSubtask?: (subtaskId: string) => void;

  // Goal task callbacks (only for goal blocks)
  /** Callback when a goal task is toggled */
  onToggleGoalTask?: (taskId: string) => void;
  /** Callback to create a new task and assign it to this block */
  onCreateTask?: (label: string) => void;
  /** Available tasks from the goal that can be assigned (should be filtered to unscheduled, incomplete tasks) */
  availableGoalTasks?: BlockGoalTask[];
  /** Callback to assign an existing goal task to this block */
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
  onCreateTask,
  availableGoalTasks,
  onAssignTask,
  onUnassignTask,
  className,
  ...props
}: BlockSidebarProps) {
  const isGoalBlock = block.blockType === "goal";
  const isTaskBlock = block.blockType === "task";
  const isCommitmentBlock = block.blockType === "commitment";
  
  // Get the source info (goal or commitment)
  const sourceInfo = block.goal ?? block.commitment;

  // Inline subtask creation state
  const [isCreatingSubtask, setIsCreatingSubtask] = React.useState(false);
  const [newSubtaskLabel, setNewSubtaskLabel] = React.useState("");
  const subtaskInputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when entering creation mode
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
      // Keep focus for rapid entry
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
            {/* Section header */}
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <RiCheckLine className="size-3.5" />
              <span>Tasks</span>
            </div>

            {/* Task list container */}
            <div className="flex flex-col">
              {/* Assigned tasks */}
              {block.goalTasks.length > 0 ? (
                block.goalTasks.map((task) => (
                  <BlockGoalTaskRow
                    key={task.id}
                    task={task}
                    onToggle={onToggleGoalTask}
                    onUnassign={onUnassignTask}
                  />
                ))
              ) : (
                <p className="px-2 py-1 text-xs text-muted-foreground/60">
                  No tasks assigned yet
                </p>
              )}

              {/* Inline task creator */}
              {onCreateTask && <InlineBlockTaskCreator onSave={onCreateTask} />}

              {/* Available tasks from goal (collapsible) */}
              {availableGoalTasks &&
                availableGoalTasks.length > 0 &&
                onAssignTask && (
                  <AvailableTasksList
                    tasks={availableGoalTasks}
                    onAssign={onAssignTask}
                  />
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

                {/* Add subtask - inline creator or button */}
                {onAddSubtask && (
                  isCreatingSubtask ? (
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
                  )
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
