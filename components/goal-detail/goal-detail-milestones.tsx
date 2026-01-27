"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiCheckLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import type { Milestone } from "@/lib/unified-schedule";

// =============================================================================
// Inline Milestone Creator
// =============================================================================

interface InlineMilestoneCreatorProps {
  onSave: (label: string) => void;
}

function InlineMilestoneCreator({ onSave }: InlineMilestoneCreatorProps) {
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
          Add milestone...
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
        placeholder="Milestone name..."
        className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Milestone Row
// =============================================================================

interface MilestoneRowProps {
  milestone: Milestone;
  isCurrent: boolean;
  onToggle?: () => void;
  onUpdate?: (label: string) => void;
  onDelete?: () => void;
}

function MilestoneRow({
  milestone,
  isCurrent,
  onToggle,
  onUpdate,
  onDelete,
}: MilestoneRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(milestone.label);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editValue.trim() && editValue.trim() !== milestone.label) {
        onUpdate?.(editValue.trim());
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditValue(milestone.label);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (editValue.trim() && editValue.trim() !== milestone.label) {
      onUpdate?.(editValue.trim());
    } else {
      setEditValue(milestone.label);
    }
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    if (onUpdate) {
      setIsEditing(true);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-2 transition-all",
        isCurrent && !milestone.completed && "bg-muted/40",
        !isCurrent && !milestone.completed && "opacity-70",
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={!onToggle}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
          milestone.completed
            ? "border-green-500/50 bg-green-500/10 text-green-600"
            : isCurrent
              ? "border-border hover:border-muted-foreground/50 hover:bg-muted/60"
              : "border-border/50 hover:border-muted-foreground/30",
          !onToggle && "cursor-default",
        )}
      >
        {milestone.completed && <RiCheckLine className="size-3" />}
      </button>

      {/* Label */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground focus:outline-none"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={cn(
            "min-w-0 flex-1 truncate text-xs",
            milestone.completed
              ? "text-muted-foreground line-through"
              : isCurrent
                ? "font-medium text-foreground"
                : "text-foreground/80",
            onUpdate && "cursor-text",
          )}
        >
          {milestone.label}
        </span>
      )}

      {/* Delete button */}
      {onDelete && !isEditing && (
        <button
          onClick={onDelete}
          className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <RiDeleteBinLine className="size-3" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalDetailMilestonesProps {
  /** Milestones for this goal */
  milestones: Milestone[];
  /** Callback to add a new milestone */
  onAdd?: (label: string) => void;
  /** Callback to toggle a milestone's completion */
  onToggle?: (milestoneId: string) => void;
  /** Callback to update a milestone's label */
  onUpdate?: (milestoneId: string, label: string) => void;
  /** Callback to delete a milestone */
  onDelete?: (milestoneId: string) => void;
  className?: string;
}

export function GoalDetailMilestones({
  milestones,
  onAdd,
  onToggle,
  onUpdate,
  onDelete,
  className,
}: GoalDetailMilestonesProps) {
  // Find the current milestone (first incomplete)
  const currentMilestoneId = milestones.find((m) => !m.completed)?.id;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {milestones.map((milestone) => (
        <MilestoneRow
          key={milestone.id}
          milestone={milestone}
          isCurrent={milestone.id === currentMilestoneId}
          onToggle={onToggle ? () => onToggle(milestone.id) : undefined}
          onUpdate={onUpdate ? (label) => onUpdate(milestone.id, label) : undefined}
          onDelete={onDelete ? () => onDelete(milestone.id) : undefined}
        />
      ))}

      {/* Inline milestone creator */}
      {onAdd && <InlineMilestoneCreator onSave={onAdd} />}
    </div>
  );
}
