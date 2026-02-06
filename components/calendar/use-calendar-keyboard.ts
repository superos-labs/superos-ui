/**
 * =============================================================================
 * File: use-calendar-keyboard.ts
 * =============================================================================
 *
 * Keyboard shortcut handler for calendar interactions.
 *
 * Listens globally for key presses and triggers calendar actions
 * when the user is hovering within the calendar grid, blocks,
 * or day headers.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Detect keyboard shortcuts.
 * - Gate shortcuts based on hover context.
 * - Invoke provided callbacks.
 * - Emit lightweight toast feedback.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing hover state.
 * - Persisting changes.
 * - Rendering UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Ignores input/textarea/contenteditable elements.
 * - Uses Meta/Ctrl interchangeably.
 * - Some actions delegate toast handling to higher-level systems.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useCalendarKeyboard
 * - UseCalendarKeyboardOptions
 * - UseCalendarKeyboardReturn
 * - HoverPosition (re-export)
 */

"use client";

import * as React from "react";
import {
  canMarkComplete,
  type CalendarEvent,
  type HoverPosition,
} from "./calendar-types";

// Re-export HoverPosition for backward compatibility
export type { HoverPosition };

export interface UseCalendarKeyboardOptions {
  /** Currently hovered event (null if none) */
  hoveredEvent: CalendarEvent | null;
  /** Current hover position on grid for paste */
  hoverPosition: HoverPosition | null;
  /** Whether clipboard has content */
  hasClipboardContent: boolean;
  /** Currently hovered day header index (null if none) */
  hoveredDayIndex?: number | null;
  /** Callbacks */
  onCopy?: (event: CalendarEvent) => void;
  onPaste?: (dayIndex: number, startMinutes: number) => void;
  onDuplicate?: (
    eventId: string,
    dayIndex: number,
    startMinutes: number,
  ) => void;
  onDelete?: (eventId: string) => void;
  onToggleComplete?: (
    eventId: string,
    currentStatus: CalendarEvent["status"],
  ) => void;
  /** Called when ⌘Enter is pressed while hovering a day header */
  onMarkDayComplete?: (dayIndex: number) => void;
  /** Called when user zooms in (⌘=) */
  onZoomIn?: () => void;
  /** Called when user zooms out (⌘-) */
  onZoomOut?: () => void;
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
 * - + or =: Zoom in (no modifier needed)
 * - -: Zoom out (no modifier needed)
 */
export function useCalendarKeyboard({
  hoveredEvent,
  hoverPosition,
  hasClipboardContent,
  hoveredDayIndex,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onToggleComplete,
  onMarkDayComplete,
  onZoomIn,
  onZoomOut,
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

      // Only act when hovering within the calendar grid or day header
      const isHoveringBlock = hoveredEvent !== null;
      const isHoveringGrid = hoverPosition !== null;
      const isHoveringDayHeader =
        hoveredDayIndex !== null && hoveredDayIndex !== undefined;
      if (!isHoveringBlock && !isHoveringGrid && !isHoveringDayHeader) return;

      const isMeta = e.metaKey || e.ctrlKey;

      // ⌘C - Copy
      if (isMeta && e.key === "c" && isHoveringBlock && onCopy) {
        e.preventDefault();
        onCopy(hoveredEvent);
        showToast("Block copied");
        return;
      }

      // ⌘V - Paste
      if (
        isMeta &&
        e.key === "v" &&
        isHoveringGrid &&
        hasClipboardContent &&
        onPaste
      ) {
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

      // ⌘Enter on day header - Mark all blocks and deadlines on that day complete
      if (
        isMeta &&
        e.key === "Enter" &&
        !isHoveringBlock &&
        hoveredDayIndex !== null &&
        hoveredDayIndex !== undefined &&
        onMarkDayComplete
      ) {
        e.preventDefault();
        onMarkDayComplete(hoveredDayIndex);
        // Note: Toast is now handled by the undo system
        return;
      }

      // ⌘Enter - Toggle complete
      if (isMeta && e.key === "Enter" && isHoveringBlock && onToggleComplete) {
        e.preventDefault();
        onToggleComplete(hoveredEvent.id, hoveredEvent.status);
        // Note: Toast is now handled by the undo system
        return;
      }

      // Delete/Backspace - Delete
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        isHoveringBlock &&
        onDelete
      ) {
        e.preventDefault();
        onDelete(hoveredEvent.id);
        // Note: Toast is now handled by the undo system
        return;
      }

      // + or = - Zoom in (works when hovering anywhere on calendar, no modifier needed)
      if (!isMeta && (e.key === "=" || e.key === "+") && onZoomIn) {
        e.preventDefault();
        onZoomIn();
        showToast("Zoomed in");
        return;
      }

      // - - Zoom out (works when hovering anywhere on calendar, no modifier needed)
      if (!isMeta && e.key === "-" && onZoomOut) {
        e.preventDefault();
        onZoomOut();
        showToast("Zoomed out");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hoveredEvent,
    hoverPosition,
    hasClipboardContent,
    hoveredDayIndex,
    onCopy,
    onPaste,
    onDuplicate,
    onDelete,
    onToggleComplete,
    onMarkDayComplete,
    onZoomIn,
    onZoomOut,
    showToast,
  ]);

  return { toastMessage };
}
