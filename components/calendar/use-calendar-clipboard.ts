/**
 * =============================================================================
 * File: use-calendar-clipboard.ts
 * =============================================================================
 *
 * In-memory clipboard for calendar events.
 *
 * Enables copy and paste of CalendarEvent objects within the calendar
 * without touching the system clipboard.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Store a copied event.
 * - Produce a new event instance on paste.
 * - Normalize status when pasting.
 * - Expose clipboard state and helpers.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting pasted events.
 * - Generating business-level defaults.
 * - Interacting with the system clipboard.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses crypto.randomUUID for new IDs.
 * - Pasted events do not carry task assignment metadata.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useCalendarClipboard
 * - UseCalendarClipboardReturn
 * - CalendarClipboard
 */

"use client";

import * as React from "react";
import { statusOnPaste, type CalendarEvent } from "./calendar-types";

interface CalendarClipboard {
  event: CalendarEvent | null;
}

interface UseCalendarClipboardReturn {
  /** Current clipboard state */
  clipboard: CalendarClipboard;
  /** Copy an event to the clipboard */
  copy: (event: CalendarEvent) => void;
  /** Create a pasted event at the specified position (returns new event with new ID) */
  paste: (dayIndex: number, startMinutes: number) => CalendarEvent | null;
  /** Whether the clipboard has content */
  hasContent: boolean;
  /** Clear the clipboard */
  clear: () => void;
}

/**
 * Hook for managing calendar event clipboard state.
 * Provides in-memory copy/paste functionality for calendar events.
 */
function useCalendarClipboard(): UseCalendarClipboardReturn {
  const [clipboard, setClipboard] = React.useState<CalendarClipboard>({
    event: null,
  });

  const copy = React.useCallback((event: CalendarEvent) => {
    // Deep copy the event to avoid mutations
    setClipboard({ event: { ...event } });
  }, []);

  const paste = React.useCallback(
    (dayIndex: number, startMinutes: number): CalendarEvent | null => {
      if (!clipboard.event) return null;

      // Create a new event with a new ID at the specified position
      // Completed blocks become planned when pasted
      return {
        ...clipboard.event,
        id: crypto.randomUUID(),
        dayIndex,
        startMinutes,
        status: statusOnPaste(clipboard.event.status),
        // Don't copy task assignments to pasted events
        assignedTaskIds: undefined,
        pendingTaskCount: undefined,
        completedTaskCount: undefined,
      };
    },
    [clipboard.event],
  );

  const clear = React.useCallback(() => {
    setClipboard({ event: null });
  }, []);

  const hasContent = clipboard.event !== null;

  return {
    clipboard,
    copy,
    paste,
    hasContent,
    clear,
  };
}

export { useCalendarClipboard };
export type { UseCalendarClipboardReturn, CalendarClipboard };
