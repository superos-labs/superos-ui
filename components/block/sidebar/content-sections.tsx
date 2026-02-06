"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCalendarLine,
  RiTimeLine,
  RiFileTextLine,
  RiAddLine,
} from "@remixicon/react";
import {
  SubtaskRow,
  type SubtaskRowData,
} from "@/components/ui";
import type { BlockSubtask } from "../block-types";
import type { BlockSidebarData } from "./sidebar-utils";
import {
  formatDateDisplay,
  formatTimeDisplay,
  isOvernightBlock,
  AutoResizeTextarea,
} from "./sidebar-utils";
import { BlockSidebarSection } from "./sidebar-sections";

// =============================================================================
// Date & Time Section
// =============================================================================

interface DateTimeSectionProps {
  block: BlockSidebarData;
  onDateChange?: (date: string) => void;
  onStartTimeChange?: (startTime: string) => void;
  onEndTimeChange?: (endTime: string) => void;
}

export function DateTimeSection({
  block,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: DateTimeSectionProps) {
  return (
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
  );
}
