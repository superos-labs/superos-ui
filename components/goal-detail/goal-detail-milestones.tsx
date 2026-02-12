/**
 * =============================================================================
 * File: goal-detail-milestones.tsx
 * =============================================================================
 *
 * Compact milestone timeline for the Goal Detail view.
 *
 * Renders milestones as a chronological list of time-based checkpoints,
 * each with a completion toggle, editable label, and optional deadline pill.
 * Milestones are purely temporal markers — they do not contain or group tasks.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Sort milestones by deadline (earliest first; no deadline at end).
 * - Render milestone rows with completion, label, and optional deadline.
 * - Support period-bound deadlines (day / month / quarter) via GranularDatePicker.
 * - Provide inline creator for new milestones.
 * - Manage local editing state for milestone labels.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering tasks (handled by GoalDetailInitiatives).
 * - Persisting milestones.
 * - Fetching goal data.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Milestones are sorted by deadline so temporal pacing is visible at a glance.
 * - Compact single-row layout — no expand/collapse, no nesting.
 * - Timeline dots connect milestones visually.
 * - Inline creator is keyboard-first.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalDetailMilestones
 * - GoalDetailMilestonesProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiCalendarLine,
} from "@remixicon/react";
import type { Milestone, DateGranularity } from "@/lib/unified-schedule";
import { formatGranularDate } from "@/lib/unified-schedule";
import {
  GranularDatePicker,
  type GranularDateValue,
} from "@/components/ui/granular-date-picker";

/**
 * Format an ISO date string for compact milestone display.
 */
function formatDeadlineCompact(
  isoDate: string,
  granularity: DateGranularity = "day",
): string {
  return formatGranularDate(isoDate, granularity);
}

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
        className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 text-left transition-all hover:bg-muted/40"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/30 text-muted-foreground/30 transition-colors group-hover:bg-muted/50 group-hover:text-muted-foreground/50">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
          Add milestone
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/40">
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
        className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/40 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Milestone Row
// =============================================================================

interface MilestoneRowProps {
  milestone: Milestone;
  isLast: boolean;
  onToggle?: () => void;
  onUpdate?: (label: string) => void;
  onUpdateDeadline?: (
    deadline: string | undefined,
    deadlineGranularity: DateGranularity | undefined,
  ) => void;
  onDelete?: () => void;
}

function MilestoneRow({
  milestone,
  isLast: _isLast,
  onToggle,
  onUpdate,
  onUpdateDeadline,
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
    <div className="group flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 transition-colors hover:bg-muted/40">
      {/* Checkpoint dot / toggle */}
      <button
        onClick={onToggle}
        disabled={!onToggle}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full transition-all",
          milestone.completed
            ? "bg-green-500/15 text-green-600"
            : "bg-muted/60 text-muted-foreground/30 hover:bg-muted hover:text-muted-foreground/50",
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
              : "text-foreground/80",
            onUpdate && "cursor-text",
          )}
        >
          {milestone.label}
        </span>
      )}

      {/* Deadline pill */}
      {onUpdateDeadline ? (
        <GranularDatePicker
          value={
            milestone.deadline
              ? {
                  date: milestone.deadline,
                  granularity: milestone.deadlineGranularity ?? "day",
                }
              : undefined
          }
          onChange={(v: GranularDateValue | undefined) =>
            onUpdateDeadline(v?.date, v?.granularity)
          }
          role="end"
          placeholder="Date"
          className="bg-transparent hover:bg-muted/60 text-muted-foreground/40 hover:text-muted-foreground py-0.5 px-1.5 text-[10px]"
        />
      ) : milestone.deadline ? (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
          <RiCalendarLine className="size-2.5" />
          {formatDeadlineCompact(
            milestone.deadline,
            milestone.deadlineGranularity,
          )}
        </span>
      ) : null}

      {/* Delete button */}
      {onDelete && (
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
  onAddMilestone?: (label: string) => void;
  /** Callback to toggle a milestone's completion */
  onToggleMilestone?: (milestoneId: string) => void;
  /** Callback to update a milestone's label */
  onUpdateMilestone?: (milestoneId: string, label: string) => void;
  /** Callback to update a milestone's deadline */
  onUpdateMilestoneDeadline?: (
    milestoneId: string,
    deadline: string | undefined,
    deadlineGranularity: DateGranularity | undefined,
  ) => void;
  /** Callback to delete a milestone */
  onDeleteMilestone?: (milestoneId: string) => void;
  className?: string;
}

export function GoalDetailMilestones({
  milestones,
  onAddMilestone,
  onToggleMilestone,
  onUpdateMilestone,
  onUpdateMilestoneDeadline,
  onDeleteMilestone,
  className,
}: GoalDetailMilestonesProps) {
  // Sort milestones by deadline (earliest first, no deadline at end)
  const sortedMilestones = React.useMemo(() => {
    return [...milestones].sort((a, b) => {
      if (a.deadline && b.deadline) {
        return a.deadline.localeCompare(b.deadline);
      }
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      return 0;
    });
  }, [milestones]);

  const hasMilestones = sortedMilestones.length > 0;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Section header */}
      <div className="mb-0.5 flex items-center gap-2 pl-4.5 pr-3">
        <span className="text-[11px] font-medium text-muted-foreground/50">
          Milestones
        </span>
        {hasMilestones && (
          <span className="text-[10px] text-muted-foreground/30">
            {sortedMilestones.filter((m) => m.completed).length}/
            {sortedMilestones.length}
          </span>
        )}
      </div>

      {/* Timeline */}
      {hasMilestones && (
        <div className="flex flex-col">
          {sortedMilestones.map((milestone, index) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              isLast={index === sortedMilestones.length - 1}
              onToggle={
                onToggleMilestone
                  ? () => onToggleMilestone(milestone.id)
                  : undefined
              }
              onUpdate={
                onUpdateMilestone
                  ? (label) => onUpdateMilestone(milestone.id, label)
                  : undefined
              }
              onUpdateDeadline={
                onUpdateMilestoneDeadline
                  ? (deadline, granularity) =>
                      onUpdateMilestoneDeadline(
                        milestone.id,
                        deadline,
                        granularity,
                      )
                  : undefined
              }
              onDelete={
                onDeleteMilestone
                  ? () => onDeleteMilestone(milestone.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Inline milestone creator */}
      {onAddMilestone && <InlineMilestoneCreator onSave={onAddMilestone} />}
    </div>
  );
}
