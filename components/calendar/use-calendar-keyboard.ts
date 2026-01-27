"use client";

import * as React from "react";
import { canMarkComplete, type CalendarEvent, type HoverPosition } from "./calendar-types";

// Re-export HoverPosition for backward compatibility
export type { HoverPosition };

export interface UseCalendarKeyboardOptions {
  /** Currently hovered event (null if none) */
  hoveredEvent: CalendarEvent | null;
  /** Current hover position on grid for paste */
  hoverPosition: HoverPosition | null;
  /** Whether clipboard has content */
  hasClipboardContent: boolean;
  /** Callbacks */
  onCopy?: (event: CalendarEvent) => void;
  onPaste?: (dayIndex: number, startMinutes: number) => void;
  onDuplicate?: (eventId: string, dayIndex: number, startMinutes: number) => void;
  onDelete?: (eventId: string) => void;
  onToggleComplete?: (eventId: string, currentStatus: CalendarEvent["status"]) => void;
}

export interface UseCalendarKeyboardReturn {
  /** Toast message to display (auto-clears) */
  toastMessage: string | null;
}

/**
 * Hook for handling keyboard shortcuts on calendar blocks.
 * Shortcuts only fire when hovering over the calendar grid.
 *
 * Shortcuts:
 * - ⌘C: Copy hovered block
 * - ⌘V: Paste at hover position
 * - ⌘D: Duplicate hovered block to next day
 * - ⌘Enter: Toggle complete on hovered block
 * - Delete/Backspace: Delete hovered block
 */
export function useCalendarKeyboard({
  hoveredEvent,
  hoverPosition,
  hasClipboardContent,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onToggleComplete,
}: UseCalendarKeyboardOptions): UseCalendarKeyboardReturn {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Auto-clear toast after delay
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message);
  }, []);

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

      // Only act when hovering within the calendar grid
      const isHoveringBlock = hoveredEvent !== null;
      const isHoveringGrid = hoverPosition !== null;
      if (!isHoveringBlock && !isHoveringGrid) return;

      const isMeta = e.metaKey || e.ctrlKey;

      // ⌘C - Copy
      if (isMeta && e.key === "c" && isHoveringBlock && onCopy) {
        e.preventDefault();
        onCopy(hoveredEvent);
        showToast("Block copied");
        return;
      }

      // ⌘V - Paste
      if (isMeta && e.key === "v" && isHoveringGrid && hasClipboardContent && onPaste) {
        e.preventDefault();
        onPaste(hoverPosition.dayIndex, hoverPosition.startMinutes);
        showToast("Block pasted");
        return;
      }

      // ⌘D - Duplicate
      if (isMeta && e.key === "d" && isHoveringBlock && onDuplicate) {
        e.preventDefault();
        // Duplicate to same time on next day (matches context menu behavior)
        const nextDay = (hoveredEvent.dayIndex + 1) % 7;
        onDuplicate(hoveredEvent.id, nextDay, hoveredEvent.startMinutes);
        showToast("Block duplicated");
        return;
      }

      // ⌘Enter - Toggle complete
      if (isMeta && e.key === "Enter" && isHoveringBlock && onToggleComplete) {
        e.preventDefault();
        const isCompleted = hoveredEvent.status === "completed";
        onToggleComplete(hoveredEvent.id, hoveredEvent.status);
        showToast(isCompleted ? "Marked incomplete" : "Marked complete");
        return;
      }

      // Delete/Backspace - Delete
      if ((e.key === "Delete" || e.key === "Backspace") && isHoveringBlock && onDelete) {
        e.preventDefault();
        onDelete(hoveredEvent.id);
        showToast("Block deleted");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hoveredEvent,
    hoverPosition,
    hasClipboardContent,
    onCopy,
    onPaste,
    onDuplicate,
    onDelete,
    onToggleComplete,
    showToast,
  ]);

  return { toastMessage };
}
