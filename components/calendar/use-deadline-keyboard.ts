"use client";

import * as React from "react";
import type { DeadlineTask } from "@/hooks/use-unified-schedule";

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
        const isCompleted = hoveredDeadline.completed;
        showToast?.(isCompleted ? "Marked incomplete" : "Marked complete");
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
