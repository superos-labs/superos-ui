"use client";

import * as React from "react";
import type { CalendarEvent, BlockStatus, HoverPosition } from "./types";
import { statusOnPaste } from "@/components/calendar";

// ============================================================================
// Types
// ============================================================================

export interface UseEventStateOptions {
  initialEvents: CalendarEvent[];
  weekDates: Date[];
  onCopy?: (event: CalendarEvent) => void;
  onPaste?: (dayIndex: number, startMinutes: number) => CalendarEvent | null;
  hasClipboardContent?: boolean;
  onEventCreated?: (event: CalendarEvent) => void;
}

export interface UseEventStateReturn {
  /** All events (unfiltered) */
  allEvents: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  /** Hovered event for keyboard shortcuts */
  hoveredEvent: CalendarEvent | null;
  /** Hover position for paste operations */
  hoverPosition: HoverPosition | null;
  /** Hovered day header index (for day-complete shortcut) */
  hoveredDayIndex: number | null;
  /** Event CRUD operations */
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => CalendarEvent | undefined;
  markEventComplete: (eventId: string) => CalendarEvent | undefined;
  markEventIncomplete: (eventId: string) => CalendarEvent | undefined;
  /** Replace all events with a new array (for blueprint edit mode) */
  replaceEvents: (events: CalendarEvent[]) => void;
  /** Standard calendar handlers (spread onto Calendar component) */
  calendarHandlers: {
    onEventResize: (
      eventId: string,
      newStartMinutes: number,
      newDurationMinutes: number,
    ) => void;
    onEventResizeEnd: () => void;
    onEventDragEnd: (
      eventId: string,
      newDayIndex: number,
      newStartMinutes: number,
    ) => void;
    onEventDuplicate: (
      sourceEventId: string,
      newDayIndex: number,
      newStartMinutes: number,
    ) => void;
    onGridDoubleClick: (dayIndex: number, startMinutes: number) => void;
    onGridDragCreate: (
      dayIndex: number,
      startMinutes: number,
      durationMinutes: number,
    ) => void;
    onEventCopy: (event: CalendarEvent) => void;
    onEventDelete: (eventId: string) => void;
    onEventStatusChange: (eventId: string, status: BlockStatus) => void;
    onEventPaste: (dayIndex: number, startMinutes: number) => void;
    hasClipboardContent: boolean;
    onEventHover: (event: CalendarEvent | null) => void;
    onGridPositionHover: (position: HoverPosition | null) => void;
    onDayHeaderHover: (dayIndex: number | null) => void;
    onMarkDayComplete: (dayIndex: number) => void;
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useEventState({
  initialEvents,
  weekDates,
  onCopy,
  onPaste,
  hasClipboardContent = false,
  onEventCreated,
}: UseEventStateOptions): UseEventStateReturn {
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);
  const [hoveredEvent, setHoveredEvent] = React.useState<CalendarEvent | null>(
    null,
  );
  const [hoverPosition, setHoverPosition] =
    React.useState<HoverPosition | null>(null);
  const [hoveredDayIndex, setHoveredDayIndex] = React.useState<number | null>(
    null,
  );

  const addEvent = React.useCallback((event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const updateEvent = React.useCallback(
    (eventId: string, updates: Partial<CalendarEvent>) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
      );
    },
    [],
  );

  const deleteEvent = React.useCallback(
    (eventId: string): CalendarEvent | undefined => {
      let deleted: CalendarEvent | undefined;
      setEvents((currentEvents) => {
        deleted = currentEvents.find((e) => e.id === eventId);
        return currentEvents.filter((e) => e.id !== eventId);
      });
      return deleted;
    },
    [],
  );

  const markEventComplete = React.useCallback(
    (eventId: string): CalendarEvent | undefined => {
      let event: CalendarEvent | undefined;
      setEvents((currentEvents) => {
        event = currentEvents.find((e) => e.id === eventId);
        return currentEvents.map((e) =>
          e.id === eventId ? { ...e, status: "completed" as BlockStatus } : e,
        );
      });
      return event;
    },
    [],
  );

  const markEventIncomplete = React.useCallback(
    (eventId: string): CalendarEvent | undefined => {
      let event: CalendarEvent | undefined;
      setEvents((currentEvents) => {
        event = currentEvents.find((e) => e.id === eventId);
        return currentEvents.map((e) =>
          e.id === eventId ? { ...e, status: "planned" as BlockStatus } : e,
        );
      });
      return event;
    },
    [],
  );

  const replaceEvents = React.useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
  }, []);

  // Calendar handlers
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
            : event,
        ),
      );
    },
    [],
  );

  const handleEventResizeEnd = React.useCallback(() => {
    // Available for persistence
  }, []);

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
            : event,
        ),
      );
    },
    [weekDates],
  );

  const handleEventDuplicate = React.useCallback(
    (sourceEventId: string, newDayIndex: number, newStartMinutes: number) => {
      setEvents((prev) => {
        const source = prev.find((e) => e.id === sourceEventId);
        if (!source) return prev;

        const newDate = weekDates[newDayIndex].toISOString().split("T")[0];

        // Only goal blocks can be duplicated (tasks can only have one instance)
        if (source.blockType === "task") {
          // Move instead of duplicate for tasks
          return prev.map((e) =>
            e.id === sourceEventId
              ? {
                  ...e,
                  date: newDate,
                  dayIndex: newDayIndex,
                  startMinutes: newStartMinutes,
                }
              : e,
          );
        }

        const duplicate: CalendarEvent = {
          ...source,
          id: crypto.randomUUID(),
          date: newDate,
          dayIndex: newDayIndex,
          startMinutes: newStartMinutes,
          status: statusOnPaste(source.status),
          // Don't copy task assignments to duplicates - they start fresh
          assignedTaskIds: undefined,
          pendingTaskCount: undefined,
          completedTaskCount: undefined,
        };
        return [...prev, duplicate];
      });
    },
    [weekDates],
  );

  const handleGridDoubleClick = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      // Create a generic block (not linked to any goal)
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
      onEventCreated?.(newEvent);
    },
    [onEventCreated, weekDates],
  );

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
      onEventCreated?.(newEvent);
    },
    [onEventCreated, weekDates],
  );

  const handleEventCopy = React.useCallback(
    (event: CalendarEvent) => {
      onCopy?.(event);
    },
    [onCopy],
  );

  const handleEventPaste = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      const pastedEvent = onPaste?.(dayIndex, startMinutes);
      if (pastedEvent) {
        // Add the date for the target position
        const eventWithDate: CalendarEvent = {
          ...pastedEvent,
          date: weekDates[dayIndex].toISOString().split("T")[0],
        };
        setEvents((prev) => [...prev, eventWithDate]);
      }
    },
    [onPaste, weekDates],
  );

  const handleEventStatusChange = React.useCallback(
    (eventId: string, status: BlockStatus) => {
      if (status === "completed") {
        markEventComplete(eventId);
      } else {
        markEventIncomplete(eventId);
      }
    },
    [markEventComplete, markEventIncomplete],
  );

  const handleEventDelete = React.useCallback(
    (eventId: string) => {
      deleteEvent(eventId);
    },
    [deleteEvent],
  );

  // Handle marking all blocks on a day as complete
  const handleMarkDayComplete = React.useCallback(
    (dayIndex: number) => {
      const targetDate = weekDates[dayIndex].toISOString().split("T")[0];
      setEvents((prev) => {
        // Check if there are any incomplete blocks on this day
        const hasIncomplete = prev.some(
          (event) => event.date === targetDate && event.status !== "completed",
        );
        if (!hasIncomplete) return prev;

        // Mark all blocks on this day as complete
        return prev.map((event) =>
          event.date === targetDate
            ? { ...event, status: "completed" as const }
            : event,
        );
      });
    },
    [weekDates],
  );

  const calendarHandlers = React.useMemo(
    () => ({
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
      onDayHeaderHover: setHoveredDayIndex,
      onMarkDayComplete: handleMarkDayComplete,
    }),
    [
      handleEventResize,
      handleEventResizeEnd,
      handleEventDragEnd,
      handleEventDuplicate,
      handleGridDoubleClick,
      handleGridDragCreate,
      handleEventCopy,
      handleEventDelete,
      handleEventStatusChange,
      handleEventPaste,
      hasClipboardContent,
      handleMarkDayComplete,
    ],
  );

  return {
    allEvents: events,
    setEvents,
    hoveredEvent,
    hoverPosition,
    hoveredDayIndex,
    addEvent,
    updateEvent,
    deleteEvent,
    markEventComplete,
    markEventIncomplete,
    replaceEvents,
    calendarHandlers,
  };
}
