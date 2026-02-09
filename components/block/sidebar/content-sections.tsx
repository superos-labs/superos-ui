/**
 * =============================================================================
 * File: content-sections.tsx
 * =============================================================================
 *
 * Sidebar content sections for editing and inspecting a single Block.
 *
 * Provides focused, self-contained sections used inside the Block Sidebar:
 * - Date & Time editing / display
 * - Notes and Subtasks (for task-type blocks)
 *
 * These sections are purely presentational + event-forwarding.
 * They do not own block persistence or domain state.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render editable or read-only date/time fields for a block.
 * - Render editable notes field.
 * - Render and manage inline creation of subtasks.
 * - Forward user intent via callbacks.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or saving block data.
 * - Validating schedules.
 * - Deciding block type.
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Pluggable sidebar panels for block metadata."
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine } from "@remixicon/react";
import { SubtaskRow, type SubtaskRowData } from "@/components/ui";
import type { BlockSidebarData } from "./sidebar-utils";
import {
  formatDateShort,
  formatTimeDisplay,
  formatFocusTime,
  parseFocusTimeInput,
  isOvernightBlock,
  AutoResizeTextarea,
} from "./sidebar-utils";


// =============================================================================
// Property Row – Notion/Linear-style 2-column layout
// =============================================================================

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function PropertyRow({ label, children, className }: PropertyRowProps) {
  return (
    <div className={cn("flex items-center min-h-[36px]", className)}>
      <span className="w-[108px] shrink-0 text-[13px] text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// =============================================================================
// Date Property Row (click-to-edit)
// =============================================================================

interface DatePropertyRowProps {
  block: BlockSidebarData;
  onDateChange?: (date: string) => void;
}

export function DatePropertyRow({ block, onDateChange }: DatePropertyRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <PropertyRow label="Date">
      {isEditing && onDateChange ? (
        <input
          type="date"
          value={block.date}
          onChange={(e) => onDateChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsEditing(false);
              e.currentTarget.blur();
            }
          }}
          autoFocus
          className={cn(
            "w-full rounded-md bg-muted/60 px-2 py-1 text-sm text-foreground",
            "outline-none focus:bg-muted",
          )}
        />
      ) : (
        <button
          onClick={() => onDateChange && setIsEditing(true)}
          disabled={!onDateChange}
          className={cn(
            "rounded-md px-2 py-1 text-sm text-foreground transition-colors text-left",
            onDateChange
              ? "hover:bg-muted/60 cursor-pointer"
              : "cursor-default",
          )}
        >
          {formatDateShort(block.date)}
        </button>
      )}
    </PropertyRow>
  );
}

// =============================================================================
// Time Property Row (click-to-edit)
// =============================================================================

interface TimePropertyRowProps {
  block: BlockSidebarData;
  onStartTimeChange?: (startTime: string) => void;
  onEndTimeChange?: (endTime: string) => void;
}

export function TimePropertyRow({
  block,
  onStartTimeChange,
  onEndTimeChange,
}: TimePropertyRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const canEdit = !!onStartTimeChange && !!onEndTimeChange;

  return (
    <PropertyRow label="Time">
      {isEditing && canEdit ? (
        <div className="flex items-center gap-1.5">
          <input
            type="time"
            value={block.startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEditing(false);
                e.currentTarget.blur();
              }
            }}
            autoFocus
            className={cn(
              "w-[100px] rounded-md bg-muted/60 px-2 py-1 text-sm text-foreground",
              "outline-none focus:bg-muted",
            )}
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="time"
            value={block.endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEditing(false);
                e.currentTarget.blur();
              }
            }}
            className={cn(
              "w-[100px] rounded-md bg-muted/60 px-2 py-1 text-sm text-foreground",
              "outline-none focus:bg-muted",
            )}
          />
          {isOvernightBlock(block) && (
            <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
              +1
            </span>
          )}
        </div>
      ) : (
        <button
          onClick={() => canEdit && setIsEditing(true)}
          disabled={!canEdit}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-foreground transition-colors text-left",
            canEdit ? "hover:bg-muted/60 cursor-pointer" : "cursor-default",
          )}
        >
          <span>
            {formatTimeDisplay(block.startTime)} –{" "}
            {formatTimeDisplay(block.endTime)}
          </span>
          {isOvernightBlock(block) && (
            <span className="text-[10px] text-muted-foreground/60">
              (+1 day)
            </span>
          )}
        </button>
      )}
    </PropertyRow>
  );
}

// =============================================================================
// Focus Time Property Row (click-to-edit, shows "Track time" when 0)
// =============================================================================

interface FocusTimePropertyRowProps {
  focusedMinutes: number;
  onFocusedMinutesChange?: (minutes: number) => void;
}

export function FocusTimePropertyRow({
  focusedMinutes,
  onFocusedMinutesChange,
}: FocusTimePropertyRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!onFocusedMinutesChange) return;
    setInputValue(Math.round(focusedMinutes).toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const parsed = parseFocusTimeInput(inputValue);
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

  const displayText =
    focusedMinutes > 0 ? formatFocusTime(focusedMinutes) : "Track time";

  return (
    <PropertyRow label="Focus time">
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
              "flex-1 rounded-md bg-muted/60 px-2 py-1 text-sm text-foreground",
              "outline-none focus:bg-muted",
            )}
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      ) : (
        <button
          onClick={handleStartEdit}
          disabled={!onFocusedMinutesChange}
          className={cn(
            "rounded-md px-2 py-1 text-sm transition-colors text-left",
            focusedMinutes > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
            onFocusedMinutesChange
              ? "hover:bg-muted/60 cursor-pointer"
              : "cursor-default",
          )}
        >
          {displayText}
        </button>
      )}
    </PropertyRow>
  );
}

// =============================================================================
// Notes & Subtasks Section (for task blocks)
// =============================================================================

interface NotesSubtasksSectionProps {
  block: BlockSidebarData;
  isTaskBlock: boolean;
  onNotesChange?: (notes: string) => void;
  onAddSubtask?: (label: string) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onUpdateSubtask?: (subtaskId: string, text: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
}

export function NotesSubtasksSection({
  block,
  isTaskBlock,
  onNotesChange,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: NotesSubtasksSectionProps) {
  // Inline subtask creation state (owned by this component)
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
    <div className="flex flex-col gap-3">
      {/* Notes / description */}
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

      {/* Subtasks (only for task blocks) */}
      {isTaskBlock && (
        <>
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
  );
}
