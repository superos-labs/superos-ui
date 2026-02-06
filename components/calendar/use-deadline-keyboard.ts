/**
 * =============================================================================
 * File: use-deadline-keyboard.ts
 * =============================================================================
 *
 * Keyboard shortcut handler for deadline pills in the calendar deadline tray.
 *
 * Enables quick actions on hovered deadlines without requiring
 * context menus or mouse interaction.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Listen for keyboard shortcuts when a deadline pill is hovered.
 * - Invoke toggle-complete and unassign callbacks.
 * - Optionally trigger toast feedback.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing hover state.
 * - Rendering UI.
 * - Persisting changes.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Ignores input/textarea/contenteditable elements.
 * - Uses Meta/Ctrl interchangeably.
 * - Toast for completion is delegated to undo/feedback systems.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useDeadlineKeyboard
 * - UseDeadlineKeyboardOptions
 */

"use client";

import * as React from "react";
import type { DeadlineTask } from "@/lib/unified-schedule";

export interface UseDeadlineKeyboardOptions {
  /** Currently hovered deadline (null if none) */
  hoveredDeadline: DeadlineTask | null;
  /** Toggle completion status */
  onToggleComplete?: (goalId: string, taskId: string) => void;
  /** Remove deadline (unassign) */
  onUnassign?: (goalId: string, taskId: string) => void;
  /** Show toast feedback */
  showToast?: (message: string) => void;
}

/**
 * Hook for handling keyboard shortcuts on deadline pills in the tray.
 * Shortcuts only fire when hovering over a deadline pill.
 *
 * Shortcuts:
 * - ⌘Enter: Toggle complete on hovered deadline
 * - Delete/Backspace: Remove deadline (unassign)
 */
export function useDeadlineKeyboard({
  hoveredDeadline,
  onToggleComplete,
  onUnassign,
  showToast,
}: UseDeadlineKeyboardOptions): void {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire if an input/textarea is focused
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      // Only act when hovering over a deadline
      if (!hoveredDeadline) return;

      const isMeta = e.metaKey || e.ctrlKey;

      // ⌘Enter - Toggle complete
      if (isMeta && e.key === "Enter" && onToggleComplete) {
        e.preventDefault();
        onToggleComplete(hoveredDeadline.goalId, hoveredDeadline.taskId);
        // Note: Toast is now handled by the undo system
        return;
      }

      // Delete/Backspace - Remove deadline
      if ((e.key === "Delete" || e.key === "Backspace") && onUnassign) {
        e.preventDefault();
        onUnassign(hoveredDeadline.goalId, hoveredDeadline.taskId);
        showToast?.("Deadline removed");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredDeadline, onToggleComplete, onUnassign, showToast]);
}
