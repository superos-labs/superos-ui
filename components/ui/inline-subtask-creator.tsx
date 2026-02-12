/**
 * =============================================================================
 * File: inline-subtask-creator.tsx
 * =============================================================================
 *
 * Inline creator for adding subtasks.
 *
 * Renders as a lightweight “Add subtask” button that transforms into
 * a text input when activated.
 *
 * Shared between backlog task rows and block sidebar contexts.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Toggle between idle button and editable input.
 * - Capture subtask label and emit onSave.
 * - Handle Enter to save, Escape to cancel, and blur to commit.
 * - Support compact and default size variants.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting subtasks.
 * - Generating IDs.
 * - Validating business rules.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Auto-focuses input when entering edit mode.
 * - Keeps focus after saving to allow rapid entry.
 * - Renders an empty circular checkbox for visual alignment with SubtaskRow.
 * - Button has improved visibility (py-1 vs py-0.5) and hover opacity boost.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - InlineSubtaskCreator
 * - InlineSubtaskCreatorProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine } from "@remixicon/react";

export interface InlineSubtaskCreatorProps {
  /** Called when a subtask is saved (Enter pressed or blur with value) */
  onSave: (label: string) => void;
  /** Size variant - 'compact' for backlog, 'default' for sidebar */
  size?: "compact" | "default";
  /** Placeholder text for the input */
  placeholder?: string;
  /** Button label when not editing */
  buttonLabel?: string;
  className?: string;
}

/**
 * Shared inline creator for subtasks.
 * Shows a button when idle, transforms to an input when clicked.
 * Used by both the backlog TaskRow and the BlockSidebar.
 */
export function InlineSubtaskCreator({
  onSave,
  size = "default",
  placeholder = "Subtask...",
  buttonLabel = "Add subtask...",
  className,
}: InlineSubtaskCreatorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isCompact = size === "compact";
  const checkboxSize = isCompact ? "size-3.5" : "size-4";
  const inputHeight = isCompact ? "h-4" : "h-5";
  const textSize = isCompact ? "text-xs" : "text-sm";
  const iconSize = isCompact ? "size-3" : "size-3";
  const borderStyle = isCompact
    ? "border-border bg-transparent"
    : "border-muted-foreground/40";

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
        className={cn(
          "flex items-center gap-2 py-1 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground/80",
          className,
        )}
      >
        <RiAddLine className={iconSize} />
        <span>{buttonLabel}</span>
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 py-0.5", className)}>
      {/* Empty checkbox to match SubtaskRow appearance */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border",
          checkboxSize,
          borderStyle,
        )}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none",
          inputHeight,
          textSize,
        )}
      />
    </div>
  );
}
