"use client";

import * as React from "react";
import { useCalendarClipboard } from "./use-calendar-clipboard";
import { useCalendarKeyboard } from "./use-calendar-keyboard";
import { getWeekDates } from "./calendar-utils";
import { statusOnPaste, type CalendarEvent, type BlockStatus, type HoverPosition } from "./calendar-types";

export interface UseCalendarInteractionsOptions {
  /** Initial events to populate the calendar */
  initialEvents?: CalendarEvent[];
  /** Week dates for positioning (defaults to current week) */
  weekDates?: Date[];
}

export interface UseCalendarInteractionsReturn {
  /** Current events state */
  events: CalendarEvent[];
  /** Set events directly (for controlled scenarios) */
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  /** Whether the clipboard has content for pasting */
  hasClipboardContent: boolean;
  /** Toast message for keyboard shortcut feedback (null when no message) */
  toastMessage: string | null;
  /** All calendar event handlers - spread these onto the Calendar component */
  handlers: {
    onEventResize: (eventId: string, newStartMinutes: number, newDurationMinutes: number) => void;
    onEventResizeEnd: () => void;
    onEventDragEnd: (eventId: string, newDayIndex: number, newStartMinutes: number) => void;
    onEventDuplicate: (sourceEventId: string, newDayIndex: number, newStartMinutes: number) => void;
    onGridDoubleClick: (dayIndex: number, startMinutes: number) => void;
    onGridDragCreate: (dayIndex: number, startMinutes: number, durationMinutes: number) => void;
    onEventCopy: (event: CalendarEvent) => void;
    onEventDelete: (eventId: string) => void;
    onEventStatusChange: (eventId: string, status: BlockStatus) => void;
    onEventPaste: (dayIndex: number, startMinutes: number) => void;
    hasClipboardContent: boolean;
    onEventHover: (event: CalendarEvent | null) => void;
    onGridPositionHover: (position: HoverPosition | null) => void;
  };
}

/**
 * Hook that bundles all calendar interaction state and handlers.
 * 
 * Provides full interactive functionality including:
 * - Resize events
 * - Drag and drop events
 * - Duplicate events (Option+drag)
 * - Double-click to create
 * - Drag to create
 * - Copy/paste events
 * - Delete events
 * - Toggle event status (complete/incomplete)
 * - Keyboard shortcuts
 * 
 * @example
 * ```tsx
 * const { events, handlers, toastMessage } = useCalendarInteractions({
 *   initialEvents: SAMPLE_EVENTS,
 * });
 * 
 * return (
 *   <>
 *     <Calendar events={events} {...handlers} />
 *     <KeyboardToast message={toastMessage} />
 *   </>
 * );
 * ```
 */
export function useCalendarInteractions({
  initialEvents = [],
  weekDates: weekDatesInput,
}: UseCalendarInteractionsOptions = {}): UseCalendarInteractionsReturn {
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);

  // Default to current week if not provided
  const weekDates = React.useMemo(
    () => weekDatesInput ?? getWeekDates(new Date()),
    [weekDatesInput]
  );

  // Clipboard for copy/paste functionality
  const { copy, paste, hasContent: hasClipboardContent } = useCalendarClipboard();

  // Hover state for keyboard shortcuts
  const [hoveredEvent, setHoveredEvent] = React.useState<CalendarEvent | null>(null);
  const [hoverPosition, setHoverPosition] = React.useState<HoverPosition | null>(null);

  // Keyboard shortcuts hook
  const { toastMessage } = useCalendarKeyboard({
    hoveredEvent,
    hoverPosition,
    hasClipboardContent,
    onCopy: (event) => copy(event),
    onPaste: (dayIndex, startMinutes) => {
      const pastedEvent = paste(dayIndex, startMinutes);
      if (pastedEvent) {
        setEvents((prev) => [...prev, pastedEvent]);
      }
    },
    onDuplicate: (eventId, newDayIndex, newStartMinutes) => {
      setEvents((prev) => {
        const source = prev.find((e) => e.id === eventId);
        if (!source) return prev;
        const duplicate: CalendarEvent = {
          ...source,
          id: crypto.randomUUID(),
          dayIndex: newDayIndex,
          startMinutes: newStartMinutes,
          status: statusOnPaste(source.status),
          // Don't copy task assignments to duplicates
          assignedTaskIds: undefined,
          pendingTaskCount: undefined,
          completedTaskCount: undefined,
        };
        return [...prev, duplicate];
      });
    },
    onDelete: (eventId) => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    },
    onToggleComplete: (eventId, currentStatus) => {
      const newStatus = currentStatus === "completed" ? "planned" : "completed";
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
      );
    },
  });

  // Handle event resize - updates the event's start time and duration
  const handleEventResize = React.useCallback(
    (eventId: string, newStartMinutes: number, newDurationMinutes: number) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                startMinutes: newStartMinutes,
                durationMinutes: newDurationMinutes,
              }
            : event
        )
      );
    },
    []
  );

  // Handle event resize end - no-op for now, but available for persistence
  const handleEventResizeEnd = React.useCallback(() => {
    // Available for consumers who need to persist on resize end
  }, []);

  // Handle event drag end - updates the event's day and start time when drag completes
  const handleEventDragEnd = React.useCallback(
    (eventId: string, newDayIndex: number, newStartMinutes: number) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                date: weekDates[newDayIndex].toISOString().split("T")[0],
                dayIndex: newDayIndex,
                startMinutes: newStartMinutes,
              }
            : event
        )
      );
    },
    [weekDates]
  );

  // Handle event duplicate - creates a copy of the event at the new position (Option+drag)
  const handleEventDuplicate = React.useCallback(
    (sourceEventId: string, newDayIndex: number, newStartMinutes: number) => {
      setEvents((prev) => {
        const source = prev.find((e) => e.id === sourceEventId);
        if (!source) return prev;

        const duplicate: CalendarEvent = {
          ...source,
          id: crypto.randomUUID(),
          date: weekDates[newDayIndex].toISOString().split("T")[0],
          dayIndex: newDayIndex,
          startMinutes: newStartMinutes,
          // Completed blocks become planned when duplicated
          status: statusOnPaste(source.status),
          // Don't copy task assignments to duplicates
          assignedTaskIds: undefined,
          pendingTaskCount: undefined,
          completedTaskCount: undefined,
        };
        return [...prev, duplicate];
      });
    },
    [weekDates]
  );

  // Handle double-click on empty grid area - creates a new 1-hour block
  const handleGridDoubleClick = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: "New Block",
        date: weekDates[dayIndex].toISOString().split("T")[0],
        dayIndex,
        startMinutes,
        durationMinutes: 60,
        color: "indigo",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [weekDates]
  );

  // Handle drag-to-create on empty grid area - creates a block with dragged duration
  const handleGridDragCreate = React.useCallback(
    (dayIndex: number, startMinutes: number, durationMinutes: number) => {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: "New Block",
        date: weekDates[dayIndex].toISOString().split("T")[0],
        dayIndex,
        startMinutes,
        durationMinutes,
        color: "indigo",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [weekDates]
  );

  // Handle event copy - copies event to clipboard
  const handleEventCopy = React.useCallback(
    (event: CalendarEvent) => {
      copy(event);
    },
    [copy]
  );

  // Handle event delete - removes the event
  const handleEventDelete = React.useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  // Handle event status change - updates the status
  const handleEventStatusChange = React.useCallback(
    (eventId: string, status: BlockStatus) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status } : e))
      );
    },
    []
  );

  // Handle event paste - creates a new event from clipboard at specified position
  const handleEventPaste = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      const pastedEvent = paste(dayIndex, startMinutes);
      if (pastedEvent) {
        // Add the date for the target position
        const eventWithDate: CalendarEvent = {
          ...pastedEvent,
          date: weekDates[dayIndex].toISOString().split("T")[0],
        };
        setEvents((prev) => [...prev, eventWithDate]);
      }
    },
    [paste, weekDates]
  );

  return {
    events,
    setEvents,
    hasClipboardContent,
    toastMessage,
    handlers: {
      onEventResize: handleEventResize,
      onEventResizeEnd: handleEventResizeEnd,
      onEventDragEnd: handleEventDragEnd,
      onEventDuplicate: handleEventDuplicate,
      onGridDoubleClick: handleGridDoubleClick,
      onGridDragCreate: handleGridDragCreate,
      onEventCopy: handleEventCopy,
      onEventDelete: handleEventDelete,
      onEventStatusChange: handleEventStatusChange,
      onEventPaste: handleEventPaste,
      hasClipboardContent,
      onEventHover: setHoveredEvent,
      onGridPositionHover: setHoverPosition,
    },
  };
}
