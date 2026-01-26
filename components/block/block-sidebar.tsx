"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCalendarLine,
  RiTimeLine,
  RiFileTextLine,
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { BlockColor } from "./block-colors";
import type { BlockType, IconComponent } from "@/lib/types";
import type { ScheduleTask, Subtask } from "@/lib/unified-schedule";
import { SubtaskRow, type SubtaskRowData } from "@/components/ui/subtask-row";

// Types

/**
 * Goal task - synced from the goal's master task list.
 * This is an alias for ScheduleTask to maintain backward compatibility.
 * Use ScheduleTask directly for new code.
 */
type BlockGoalTask = ScheduleTask;

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

// =============================================================================
// Inline Subtask Creator (for expanded goal task detail)
// =============================================================================

interface InlineGoalSubtaskCreatorProps {
  onSave: (label: string) => void;
}

function InlineGoalSubtaskCreator({ onSave }: InlineGoalSubtaskCreatorProps) {
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
      <div className="flex size-4 shrink-0 items-center justify-center rounded border border-muted-foreground/40" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Subtask..."
        className="h-5 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

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
          {onAddSubtask && (
            <InlineGoalSubtaskCreator onSave={onAddSubtask} />
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Goal Task Row (expandable with inline editing)
// =============================================================================

interface BlockGoalTaskRowProps {
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

function BlockGoalTaskRow({ 
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
    if ((e.target as HTMLElement).closest('[data-checkbox]')) return;
    if ((e.target as HTMLElement).closest('[data-label]')) return;
    if ((e.target as HTMLElement).closest('[data-unassign]')) return;
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
      className={cn(
        "flex flex-col",
        isExpanded && "rounded-lg bg-muted/30",
      )}
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
              isExpanded && onUpdateTask && "cursor-text hover:bg-muted/60 rounded px-1 -mx-1",
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

// =============================================================================
// Goal Selector Dropdown (for unassigned blocks)
// =============================================================================

/** Goal option for the selector dropdown */
interface GoalSelectorOption {
  id: string;
  label: string;
  icon: IconComponent;
  color: string;
}

interface GoalSelectorProps {
  goals: GoalSelectorOption[];
  onSelect: (goalId: string) => void;
}

function GoalSelector({ goals, onSelect }: GoalSelectorProps) {
  if (goals.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 transition-colors">
          <div className="flex size-5 shrink-0 items-center justify-center rounded border border-dashed border-muted-foreground/40 text-muted-foreground/50 transition-colors group-hover:border-muted-foreground/60 group-hover:text-muted-foreground/70">
            <RiAddLine className="size-3" />
          </div>
          <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            Select goal...
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[240px]">
        {goals.map((goal) => (
          <DropdownMenuItem
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            className="gap-2.5 py-2"
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
              <goal.icon className={cn("size-3", goal.color)} />
            </div>
            <span className="font-medium">{goal.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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

  // Goal task context callbacks (for viewing/editing task details within goal blocks)
  /** Callback to update a goal task's properties (label, description) */
  onUpdateGoalTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  /** Callback to add a subtask to a goal task */
  onAddGoalTaskSubtask?: (taskId: string, label: string) => void;
  /** Callback to toggle a goal task's subtask completion */
  onToggleGoalTaskSubtask?: (taskId: string, subtaskId: string) => void;
  /** Callback to update a goal task's subtask label */
  onUpdateGoalTaskSubtask?: (taskId: string, subtaskId: string, label: string) => void;
  /** Callback to delete a goal task's subtask */
  onDeleteGoalTaskSubtask?: (taskId: string, subtaskId: string) => void;

  // Goal selection (for newly created blocks without a goal)
  /** Available goals for selection (shown when block has no goal assigned) */
  availableGoals?: GoalSelectorOption[];
  /** Callback when user selects a goal for this block (one-time) */
  onGoalSelect?: (goalId: string) => void;
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
  // Goal task context callbacks
  onUpdateGoalTask,
  onAddGoalTaskSubtask,
  onToggleGoalTaskSubtask,
  onUpdateGoalTaskSubtask,
  onDeleteGoalTaskSubtask,
  // Goal selection
  availableGoals,
  onGoalSelect,
  className,
  ...props
}: BlockSidebarProps) {
  const isGoalBlock = block.blockType === "goal";
  const isTaskBlock = block.blockType === "task";
  const isCommitmentBlock = block.blockType === "commitment";
  
  // Get the source info (goal or commitment)
  const sourceInfo = block.goal ?? block.commitment;

  // Goal task expansion state (accordion - one at a time)
  const [expandedGoalTaskId, setExpandedGoalTaskId] = React.useState<string | null>(null);

  const handleGoalTaskExpand = React.useCallback((taskId: string) => {
    setExpandedGoalTaskId(prev => prev === taskId ? null : taskId);
  }, []);

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

        {/* Associated goal or commitment / Goal selector */}
        {sourceInfo ? (
          <div className="flex items-center gap-2">
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
              <sourceInfo.icon className={cn("size-3", sourceInfo.color)} />
            </div>
            <span className={cn("text-sm font-medium", sourceInfo.color)}>
              {sourceInfo.label}
            </span>
          </div>
        ) : (
          isGoalBlock && availableGoals && availableGoals.length > 0 && onGoalSelect && (
            <GoalSelector goals={availableGoals} onSelect={onGoalSelect} />
          )
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

        {/* Goal Tasks (only for goal blocks with assigned goal) - shown before notes */}
        {isGoalBlock && block.goal && (
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
                    isExpanded={expandedGoalTaskId === task.id}
                    onExpand={handleGoalTaskExpand}
                    onToggle={onToggleGoalTask}
                    onUnassign={onUnassignTask}
                    onUpdateTask={onUpdateGoalTask ? (updates) => onUpdateGoalTask(task.id, updates) : undefined}
                    onAddSubtask={onAddGoalTaskSubtask ? (label) => onAddGoalTaskSubtask(task.id, label) : undefined}
                    onToggleSubtask={onToggleGoalTaskSubtask ? (subtaskId) => onToggleGoalTaskSubtask(task.id, subtaskId) : undefined}
                    onUpdateSubtask={onUpdateGoalTaskSubtask ? (subtaskId, label) => onUpdateGoalTaskSubtask(task.id, subtaskId, label) : undefined}
                    onDeleteSubtask={onDeleteGoalTaskSubtask ? (subtaskId) => onDeleteGoalTaskSubtask(task.id, subtaskId) : undefined}
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
  GoalSelectorOption,
};
// Re-export BlockType for backward compatibility
export type { BlockType } from "@/lib/types";
