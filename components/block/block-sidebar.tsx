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
  RiCheckboxCircleFill,
  RiFocusLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiShareLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { BlockColor } from "./block-colors";
import type { BlockType, BlockStatus, IconComponent } from "@/lib/types";
import type {
  ScheduleTask,
  Subtask,
  BlockSyncState,
  BlockSyncSettings,
} from "@/lib/unified-schedule";
import type { AppearanceOverride } from "@/lib/calendar-sync";
import {
  SubtaskRow,
  InlineSubtaskCreator,
  type SubtaskRowData,
} from "@/components/ui";
import {
  FocusTimer,
  StartFocusButton,
  FocusSidebarContent,
} from "@/components/focus";
import { ProviderBadge } from "@/components/integrations";
import type {
  BlockSubtask,
  BlockSidebarSource,
  GoalSelectorOption,
} from "./block-types";

// Types

/**
 * Goal task - synced from the goal's master task list.
 * This is an alias for ScheduleTask to maintain backward compatibility.
 * Use ScheduleTask directly for new code.
 */
type BlockGoalTask = ScheduleTask;

interface BlockSidebarData {
  id: string;
  title: string;
  /** Block type: 'goal' shows goal tasks section, 'task' shows subtasks, 'essential' shows notes only, 'external' shows calendar source */
  blockType: BlockType;
  /** Block status: 'planned' or 'completed' */
  status?: BlockStatus;
  /** Start date in ISO format (YYYY-MM-DD) */
  date: string;
  /** End date in ISO format (YYYY-MM-DD) - only differs from date for overnight blocks */
  endDate?: string;
  /** Start time in 24h format (HH:MM) */
  startTime: string;
  /** End time in 24h format (HH:MM) - always within 00:00-23:59 */
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
  /** Associated essential (for essential blocks) */
  essential?: BlockSidebarSource;

  // --- External Calendar Integration (blockType === 'external') ---
  /** Provider for external events (google, apple, outlook) */
  sourceProvider?: import("@/lib/calendar-sync").CalendarProvider;
  /** Source calendar name (for display) */
  sourceCalendarName?: string;
  /** Source calendar color (hex) */
  sourceCalendarColor?: string;
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

// Helper to check if block spans overnight (ends on a different day)
function isOvernightBlock(block: BlockSidebarData): boolean {
  return !!block.endDate && block.endDate !== block.date;
}

// Helper to format time for display
function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Helper to format focus time (minutes) for display
function formatFocusTime(minutes: number): string {
  // Round to whole minutes for display
  const roundedMinutes = Math.round(minutes);
  if (roundedMinutes === 0) return "0m";
  const hours = Math.floor(roundedMinutes / 60);
  const mins = roundedMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Helper to parse focus time input to minutes
function parseFocusTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return 0;

  // Try parsing as plain number (minutes) - use parseFloat to handle decimals
  const asNumber = parseFloat(trimmed);
  if (!isNaN(asNumber) && asNumber >= 0) {
    // Round to whole minutes
    return Math.round(asNumber);
  }

  // Try parsing as "Xh Ym" or "Xh" or "Ym"
  const hourMatch = trimmed.match(/(\d+)\s*h/i);
  const minMatch = trimmed.match(/(\d+)\s*m/i);

  if (hourMatch || minMatch) {
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
    return hours * 60 + mins;
  }

  return null; // Invalid input
}

// Auto-resizing textarea component
type AutoResizeTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

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
    task.description ?? ""
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
          onExpand && "cursor-pointer"
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
              : "border border-border bg-background hover:bg-muted"
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
              task.completed ? "text-muted-foreground" : "text-foreground"
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
                "cursor-text hover:bg-muted/60 rounded px-1 -mx-1"
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

// =============================================================================
// Focus Time Section (editable focus time display)
// =============================================================================

interface FocusTimeSectionProps {
  /** Total focus time in minutes */
  focusedMinutes: number;
  /** Callback when focus time is edited (minutes) */
  onFocusedMinutesChange?: (minutes: number) => void;
}

function FocusTimeSection({
  focusedMinutes,
  onFocusedMinutesChange,
}: FocusTimeSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!onFocusedMinutesChange) return;
    // Show rounded value in editor
    setInputValue(Math.round(focusedMinutes).toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const parsed = parseFocusTimeInput(inputValue);
    // Only save if value changed and is valid
    if (
      parsed !== null &&
      onFocusedMinutesChange &&
      parsed !== Math.round(focusedMinutes)
    ) {
      onFocusedMinutesChange(parsed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  return (
    <BlockSidebarSection
      icon={<RiFocusLine className="size-3.5" />}
      label="Focus Time"
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="e.g., 90 or 1h 30m"
            className={cn(
              "flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
              "outline-none focus:bg-muted"
            )}
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      ) : (
        <button
          onClick={handleStartEdit}
          disabled={!onFocusedMinutesChange}
          className={cn(
            "group flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
            onFocusedMinutesChange
              ? "hover:bg-muted/60 cursor-pointer"
              : "cursor-default"
          )}
        >
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatFocusTime(focusedMinutes)}
          </span>
          {onFocusedMinutesChange && (
            <RiPencilLine className="size-3 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      )}
    </BlockSidebarSection>
  );
}

// =============================================================================
// External Calendar Sync Section
// =============================================================================

/** Appearance options for block sync */
const APPEARANCE_OPTIONS: {
  value: AppearanceOverride;
  label: string;
}[] = [
  { value: "use_default", label: "Use goal setting" },
  { value: "busy", label: "Busy" },
  { value: "goal_name", label: "Goal name" },
  { value: "block_title", label: "Block title" },
];

interface ExternalCalendarSyncSectionProps {
  /** Computed sync state for this block */
  syncState: BlockSyncState;
  /** Current block-level sync settings */
  blockSyncSettings?: BlockSyncSettings;
  /** Callback to update block sync appearance override */
  onSyncAppearanceChange?: (appearance: AppearanceOverride) => void;
}

function ExternalCalendarSyncSection({
  syncState,
  blockSyncSettings,
  onSyncAppearanceChange,
}: ExternalCalendarSyncSectionProps) {
  const currentAppearance =
    blockSyncSettings?.appearanceOverride ?? "use_default";

  // Format the "synced as" display text
  const getSyncedAsLabel = (syncedAs: string | undefined): string => {
    switch (syncedAs) {
      case "busy":
        return "Busy";
      case "goal_name":
        return "Goal name";
      case "block_title":
        return "Block title";
      default:
        return "Not shared";
    }
  };

  return (
    <BlockSidebarSection
      icon={<RiShareLine className="size-3.5" />}
      label="External Calendar"
    >
      <div className="flex flex-col gap-3">
        {/* Sync status indicator */}
        {syncState.isSynced ? (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 px-3 py-2">
            <RiCheckLine className="size-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-700 dark:text-blue-300">
              Shared as: <strong>{getSyncedAsLabel(syncState.syncedAs)}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Not shared to external calendar
            </span>
          </div>
        )}

        {/* Appearance override selector */}
        {onSyncAppearanceChange && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Override appearance:
            </p>
            <div className="flex flex-col gap-0.5">
              {APPEARANCE_OPTIONS.map((option) => {
                const isSelected = currentAppearance === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSyncAppearanceChange(option.value)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg py-1.5 px-2 text-left",
                      "transition-colors duration-150 hover:bg-muted/60",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-[16px] shrink-0 items-center justify-center rounded-full transition-all duration-150",
                        isSelected
                          ? "bg-foreground"
                          : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20"
                      )}
                    >
                      {isSelected && (
                        <span className="size-1.5 rounded-full bg-background" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BlockSidebarSection>
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
              isExpanded && "rotate-180"
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
  /** Callback when block is deleted (removed from calendar) */
  onDelete?: () => void;
  /** Callback when block is marked complete */
  onMarkComplete?: () => void;
  /** Callback when block is marked incomplete */
  onMarkIncomplete?: () => void;
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
  onUpdateGoalTaskSubtask?: (
    taskId: string,
    subtaskId: string,
    label: string
  ) => void;
  /** Callback to delete a goal task's subtask */
  onDeleteGoalTaskSubtask?: (taskId: string, subtaskId: string) => void;

  // Goal selection (for newly created blocks without a goal)
  /** Available goals for selection (shown when block has no goal assigned) */
  availableGoals?: GoalSelectorOption[];
  /** Callback when user selects a goal for this block (one-time) */
  onGoalSelect?: (goalId: string) => void;

  // Focus mode props
  /** Whether this block is currently being focused on */
  isFocused?: boolean;
  /** Whether the focus timer is running (not paused) */
  focusIsRunning?: boolean;
  /** Elapsed focus time in milliseconds */
  focusElapsedMs?: number;
  /** Called when user clicks Start Focus button */
  onStartFocus?: () => void;
  /** Called when user clicks Pause button */
  onPauseFocus?: () => void;
  /** Called when user clicks Resume button */
  onResumeFocus?: () => void;
  /** Called when user clicks Stop button to end focus */
  onEndFocus?: () => void;
  /** Whether another block is currently being focused on (disables Start Focus button) */
  focusDisabled?: boolean;

  // Focus time tracking (accumulated time from focus sessions)
  /** Total accumulated focus time for this block (in minutes) */
  totalFocusedMinutes?: number;
  /** Callback when focus time is manually edited */
  onFocusedMinutesChange?: (minutes: number) => void;

  // External calendar sync (only for goal/task blocks when sync is enabled)
  /** Computed sync state for this block */
  syncState?: BlockSyncState;
  /** Current block-level sync settings */
  blockSyncSettings?: BlockSyncSettings;
  /** Callback to update block sync appearance override */
  onSyncAppearanceChange?: (appearance: AppearanceOverride) => void;
}

function BlockSidebar({
  block,
  onClose,
  onDelete,
  onMarkComplete,
  onMarkIncomplete,
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
  // Focus mode
  isFocused,
  focusIsRunning,
  focusElapsedMs,
  onStartFocus,
  onPauseFocus,
  onResumeFocus,
  onEndFocus,
  focusDisabled,
  // Focus time tracking
  totalFocusedMinutes,
  onFocusedMinutesChange,
  // External calendar sync
  syncState,
  blockSyncSettings,
  onSyncAppearanceChange,
  className,
  ...props
}: BlockSidebarProps) {
  const isGoalBlock = block.blockType === "goal";
  const isTaskBlock = block.blockType === "task";
  const isEssentialBlock = block.blockType === "essential";
  const isExternalBlock = block.blockType === "external";

  // Get the source info (goal or essential)
  const sourceInfo = block.goal ?? block.essential;

  // Goal task expansion state (accordion - one at a time)
  const [expandedGoalTaskId, setExpandedGoalTaskId] = React.useState<
    string | null
  >(null);

  const handleGoalTaskExpand = React.useCallback((taskId: string) => {
    setExpandedGoalTaskId((prev) => (prev === taskId ? null : taskId));
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

  // Render focus mode layout when this block is being focused
  if (isFocused) {
    return (
      <div
        className={cn(
          "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
          className
        )}
        {...props}
      >
        <FocusSidebarContent
          block={block}
          elapsedMs={focusElapsedMs ?? 0}
          isRunning={focusIsRunning ?? false}
          onPause={onPauseFocus}
          onResume={onResumeFocus}
          onEnd={onEndFocus}
          onClose={onClose}
          onNotesChange={onNotesChange}
          onToggleGoalTask={onToggleGoalTask}
          onCreateTask={onCreateTask}
          onUnassignTask={onUnassignTask}
          // Goal task context callbacks
          onUpdateGoalTask={onUpdateGoalTask}
          onAddGoalTaskSubtask={onAddGoalTaskSubtask}
          onToggleGoalTaskSubtask={onToggleGoalTaskSubtask}
          onUpdateGoalTaskSubtask={onUpdateGoalTaskSubtask}
          onDeleteGoalTaskSubtask={onDeleteGoalTaskSubtask}
          // Subtask callbacks
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
        {/* Header actions row */}
        {(onClose ||
          onDelete ||
          (block.status === "completed" && onMarkIncomplete)) && (
          <div className="flex justify-end gap-1">
            {/* Mark incomplete button - only when completed (not for essentials, allowed for external) */}
            {!isEssentialBlock &&
              block.status === "completed" &&
              onMarkIncomplete && (
                <button
                  onClick={onMarkIncomplete}
                  aria-label="Mark incomplete"
                  title="Mark incomplete"
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RiCheckboxCircleFill className="size-4" />
                </button>
              )}
            {/* Delete button */}
            {onDelete && (
              <button
                onClick={onDelete}
                aria-label="Delete block"
                title="Delete block"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <RiDeleteBinLine className="size-4" />
              </button>
            )}
            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* Title row */}
        {onTitleChange ? (
          <input
            type="text"
            value={block.title}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className={cn(
              "w-full bg-transparent text-lg font-semibold text-foreground leading-tight",
              "outline-none placeholder:text-muted-foreground/60",
              "focus:outline-none"
            )}
            placeholder="Block title..."
          />
        ) : (
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            {block.title}
          </h2>
        )}

        {/* Associated goal or essential / Goal selector / External source */}
        {isExternalBlock && block.sourceProvider ? (
          // External block: show provider badge + calendar name (read-only)
          <div className="flex items-center gap-2">
            <ProviderBadge provider={block.sourceProvider} size="md" />
            <span className="text-sm text-muted-foreground">
              {block.sourceCalendarName ?? "External Calendar"}
            </span>
          </div>
        ) : sourceInfo ? (
          <div className="flex items-center gap-2">
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
              <sourceInfo.icon className={cn("size-3", sourceInfo.color)} />
            </div>
            <span className={cn("text-sm font-medium", sourceInfo.color)}>
              {sourceInfo.label}
            </span>
          </div>
        ) : (
          isGoalBlock &&
          availableGoals &&
          availableGoals.length > 0 &&
          onGoalSelect && (
            <GoalSelector goals={availableGoals} onSelect={onGoalSelect} />
          )
        )}

        {/* Mark Complete action - for goal, task, and external blocks (not essentials) */}
        {!isEssentialBlock &&
          block.status !== "completed" &&
          onMarkComplete && (
            <button
              onClick={onMarkComplete}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <RiCheckLine className="size-4" />
              <span>Mark complete</span>
            </button>
          )}

        {/* Focus mode: show timer when focused, or start button when not */}
        {/* Hide focus controls for completed blocks and essentials (allow for external) */}
        {!isEssentialBlock &&
          (isFocused ? (
            <FocusTimer
              elapsedMs={focusElapsedMs ?? 0}
              isRunning={focusIsRunning ?? false}
              color={block.color}
              onPause={onPauseFocus}
              onResume={onResumeFocus}
              onStop={onEndFocus}
            />
          ) : onStartFocus && block.status !== "completed" ? (
            <StartFocusButton onClick={onStartFocus} disabled={focusDisabled} />
          ) : null)}
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
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                className={cn(
                  "w-full rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                  "outline-none focus:bg-muted"
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
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    className={cn(
                      "flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                      "outline-none focus:bg-muted"
                    )}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <div className="flex flex-1 items-center gap-1.5">
                    <input
                      type="time"
                      value={block.endTime}
                      onChange={(e) => onEndTimeChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      className={cn(
                        "flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                        "outline-none focus:bg-muted"
                      )}
                    />
                    {isOvernightBlock(block) && (
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        +1
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <RiTimeLine className="size-3.5" />
                  <span>
                    {formatTimeDisplay(block.startTime)} –{" "}
                    {formatTimeDisplay(block.endTime)}
                    {isOvernightBlock(block) && (
                      <span className="ml-1 text-xs text-muted-foreground/60">
                        (+1 day)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </BlockSidebarSection>

        {/* Focus Time (for goal, task, and external blocks - not essentials) */}
        {!isEssentialBlock && totalFocusedMinutes !== undefined && (
          <FocusTimeSection
            focusedMinutes={totalFocusedMinutes}
            onFocusedMinutesChange={onFocusedMinutesChange}
          />
        )}

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
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Add notes..."
                className={cn(
                  "w-full min-h-[24px] bg-transparent text-sm text-foreground leading-relaxed",
                  "outline-none placeholder:text-muted-foreground/60"
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
              </>
            )}
          </div>
        </BlockSidebarSection>

        {/* External Calendar Sync Section - only for goal/task blocks, not external blocks */}
        {(isGoalBlock || isTaskBlock) && !isExternalBlock && syncState && (
          <ExternalCalendarSyncSection
            syncState={syncState}
            blockSyncSettings={blockSyncSettings}
            onSyncAppearanceChange={onSyncAppearanceChange}
          />
        )}
      </div>
    </div>
  );
}

export { BlockSidebar, BlockGoalTaskRow, BlockSidebarSection };
export type {
  BlockSidebarProps,
  BlockSidebarData,
  BlockGoalTask,
  BlockSubtask,
  BlockSidebarSource,
  GoalSelectorOption,
};
// Re-export BlockType for backward compatibility
export type { BlockType } from "@/lib/types";
