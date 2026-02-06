/**
 * =============================================================================
 * File: subtask-row.tsx
 * =============================================================================
 *
 * Subtask row display and editing primitive.
 *
 * Used in backlog task lists and block sidebars to render a single subtask
 * with completion toggle, optional inline text editing, and delete affordance.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a checkbox-style completion toggle.
 * - Display subtask label or editable input.
 * - Emit callbacks for toggle, text change, and delete.
 * - Support compact and default size variants.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting subtask changes.
 * - Generating IDs.
 * - Managing parent task state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Delete button appears on hover.
 * - Completed subtasks render with muted color and strikethrough.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - SubtaskRow
 * - SubtaskRowProps
 * - SubtaskRowData
 */

"use client";

import { cn } from "@/lib/utils";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";

export interface SubtaskRowData {
  id: string;
  label: string;
  completed: boolean;
}

export interface SubtaskRowProps {
  subtask: SubtaskRowData;
  /** Called when checkbox is clicked */
  onToggle?: (subtaskId: string) => void;
  /** Called when text is edited (enables inline editing mode) */
  onTextChange?: (subtaskId: string, newLabel: string) => void;
  /** Called when delete button is clicked */
  onDelete?: (subtaskId: string) => void;
  /** Size variant - 'compact' for backlog, 'default' for sidebar */
  size?: "compact" | "default";
}

/**
 * Shared subtask row component used by both the backlog and block sidebar.
 * Displays a checkbox, label (optionally editable), and delete button.
 */
export function SubtaskRow({
  subtask,
  onToggle,
  onTextChange,
  onDelete,
  size = "default",
}: SubtaskRowProps) {
  const isCompact = size === "compact";
  const checkboxSize = isCompact ? "size-3.5" : "size-4";
  const deleteSize = isCompact ? "size-4" : "size-5";
  const deleteIconSize = isCompact ? "size-3" : "size-3.5";
  const textSize = isCompact ? "text-xs" : "text-sm";

  return (
    <div className="group flex items-center gap-2 py-0.5">
      <button
        onClick={() => onToggle?.(subtask.id)}
        className={cn(
          "flex shrink-0 items-center justify-center rounded border transition-colors",
          checkboxSize,
          subtask.completed
            ? "border-muted-foreground/30 bg-muted text-muted-foreground"
            : "border-muted-foreground/40 hover:border-muted-foreground/60",
        )}
      >
        {subtask.completed && <RiCheckLine className="size-2.5" />}
      </button>
      {onTextChange ? (
        <input
          type="text"
          value={subtask.label}
          onChange={(e) => onTextChange(subtask.id, e.target.value)}
          className={cn(
            "flex-1 bg-transparent outline-none",
            textSize,
            subtask.completed && "text-muted-foreground line-through",
          )}
          placeholder="Subtask..."
        />
      ) : (
        <span
          className={cn(
            "flex-1",
            textSize,
            subtask.completed && "text-muted-foreground line-through",
          )}
        >
          {subtask.label}
        </span>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(subtask.id)}
          className={cn(
            "flex items-center justify-center rounded text-muted-foreground/50 opacity-0 transition-all hover:text-muted-foreground group-hover:opacity-100",
            deleteSize,
          )}
        >
          <RiCloseLine className={deleteIconSize} />
        </button>
      )}
    </div>
  );
}
