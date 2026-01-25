"use client";

import * as React from "react";
import { Calendar } from "./calendar";
import { useCalendarClipboard } from "./use-calendar-clipboard";
import {
  useCalendarKeyboard,
  type HoverPosition,
} from "./use-calendar-keyboard";
import { KeyboardToast } from "./keyboard-toast";
import {
  statusOnPaste,
  type CalendarView,
  type CalendarMode,
  type CalendarEvent,
  type BlockStyle,
  type BlockStatus,
} from "./calendar-types";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
  KnobBoolean,
} from "@/components/knobs";

// Helper to convert hours to minutes for startMinutes
const hoursToMinutes = (hours: number) => hours * 60;

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Morning workout",
    dayIndex: 0,
    startMinutes: hoursToMinutes(7),
    durationMinutes: 60,
    color: "emerald",
    status: "completed",
  },
  {
    id: "2",
    title: "Team standup",
    dayIndex: 0,
    startMinutes: hoursToMinutes(9),
    durationMinutes: 30,
    color: "violet",
    status: "completed",
  },
  {
    id: "3",
    title: "Design review",
    dayIndex: 0,
    startMinutes: hoursToMinutes(14),
    durationMinutes: 90,
    color: "blue",
    taskCount: 3,
    status: "completed",
  },
  {
    id: "4",
    title: "1:1 with manager",
    dayIndex: 1,
    startMinutes: hoursToMinutes(10),
    durationMinutes: 60,
    color: "amber",
    status: "completed",
  },
  {
    id: "5",
    title: "Lunch break",
    dayIndex: 1,
    startMinutes: hoursToMinutes(12),
    durationMinutes: 60,
    color: "teal",
    status: "completed",
  },
  {
    id: "6",
    title: "Sprint planning",
    dayIndex: 1,
    startMinutes: hoursToMinutes(15),
    durationMinutes: 120,
    color: "indigo",
    taskCount: 5,
    status: "completed",
  },
  {
    id: "7",
    title: "Deep work",
    dayIndex: 2,
    startMinutes: hoursToMinutes(9),
    durationMinutes: 180,
    color: "sky",
    status: "completed",
  },
  {
    id: "8",
    title: "Product sync",
    dayIndex: 2,
    startMinutes: hoursToMinutes(14),
    durationMinutes: 45,
    color: "rose",
    status: "completed",
  },
  {
    id: "9",
    title: "Code review",
    dayIndex: 3,
    startMinutes: hoursToMinutes(10),
    durationMinutes: 60,
    color: "cyan",
    taskCount: 2,
  },
  {
    id: "10",
    title: "Team lunch",
    dayIndex: 3,
    startMinutes: hoursToMinutes(12),
    durationMinutes: 90,
    color: "orange",
  },
  {
    id: "11",
    title: "Interview",
    dayIndex: 3,
    startMinutes: hoursToMinutes(16),
    durationMinutes: 60,
    color: "pink",
  },
  {
    id: "12",
    title: "Focus time",
    dayIndex: 4,
    startMinutes: hoursToMinutes(8),
    durationMinutes: 120,
    color: "violet",
  },
  {
    id: "13",
    title: "All-hands",
    dayIndex: 4,
    startMinutes: hoursToMinutes(11),
    durationMinutes: 60,
    color: "fuchsia",
  },
  {
    id: "14",
    title: "Project retro",
    dayIndex: 4,
    startMinutes: hoursToMinutes(15),
    durationMinutes: 60,
    color: "green",
    taskCount: 4,
  },
  {
    id: "15",
    title: "Side project",
    dayIndex: 5,
    startMinutes: hoursToMinutes(10),
    durationMinutes: 180,
    color: "lime",
    status: "blueprint",
  },
  {
    id: "16",
    title: "Reading",
    dayIndex: 6,
    startMinutes: hoursToMinutes(9),
    durationMinutes: 120,
    color: "slate",
    status: "blueprint",
  },
];

export function CalendarExample() {
  const [view, setView] = React.useState<CalendarView>("week");
  const [mode, setMode] = React.useState<CalendarMode>("schedule");
  const [showHourLabels, setShowHourLabels] = React.useState(true);
  const [headerIsVisible, setHeaderIsVisible] = React.useState(true);
  const [showEvents, setShowEvents] = React.useState(false);
  const [blockStyle, setBlockStyle] = React.useState<BlockStyle | "">("");
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_EVENTS);

  // Clipboard for copy/paste functionality
  const { copy, paste, hasContent: hasClipboardContent } = useCalendarClipboard();

  // Hover state for keyboard shortcuts
  const [hoveredEvent, setHoveredEvent] = React.useState<CalendarEvent | null>(
    null,
  );
  const [hoverPosition, setHoverPosition] =
    React.useState<HoverPosition | null>(null);

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
          taskCount: undefined,
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
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e)),
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
            : event,
        ),
      );
    },
    [],
  );

  // Handle event drag end - updates the event's day and start time when drag completes
  const handleEventDragEnd = React.useCallback(
    (eventId: string, newDayIndex: number, newStartMinutes: number) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, dayIndex: newDayIndex, startMinutes: newStartMinutes }
            : event,
        ),
      );
    },
    [],
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
          dayIndex: newDayIndex,
          startMinutes: newStartMinutes,
          // Completed/blueprint blocks become planned when duplicated
          status: statusOnPaste(source.status),
          // Strip task-related properties
          taskCount: undefined,
        };
        return [...prev, duplicate];
      });
    },
    [],
  );

  // Handle double-click on empty grid area - creates a new 1-hour block
  const handleGridDoubleClick = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: "New Block",
        dayIndex,
        startMinutes,
        durationMinutes: 60,
        color: "indigo",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [],
  );

  // Handle drag-to-create on empty grid area - creates a block with dragged duration
  const handleGridDragCreate = React.useCallback(
    (dayIndex: number, startMinutes: number, durationMinutes: number) => {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: "New Block",
        dayIndex,
        startMinutes,
        durationMinutes,
        color: "indigo",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [],
  );

  // Handle event copy - copies event to clipboard
  const handleEventCopy = React.useCallback(
    (event: CalendarEvent) => {
      copy(event);
    },
    [copy],
  );

  // Handle event delete - removes the event
  const handleEventDelete = React.useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  // Handle event status change - toggles complete/incomplete
  const handleEventStatusChange = React.useCallback(
    (eventId: string, status: BlockStatus) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status } : e)),
      );
    },
    [],
  );

  // Handle event paste - creates a new event from clipboard at specified position
  const handleEventPaste = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      const pastedEvent = paste(dayIndex, startMinutes);
      if (pastedEvent) {
        setEvents((prev) => [...prev, pastedEvent]);
      }
    },
    [paste],
  );

  return (
    <KnobsProvider>
      <div className="h-screen w-full">
        <Calendar
          view={view}
          mode={mode}
          showHourLabels={showHourLabels}
          headerIsVisible={headerIsVisible}
          events={showEvents ? events : []}
          setBlockStyle={blockStyle || undefined}
          onEventResize={handleEventResize}
          onEventDragEnd={handleEventDragEnd}
          onEventDuplicate={handleEventDuplicate}
          onGridDoubleClick={handleGridDoubleClick}
          onGridDragCreate={handleGridDragCreate}
          onEventCopy={handleEventCopy}
          onEventDelete={handleEventDelete}
          onEventStatusChange={handleEventStatusChange}
          onEventPaste={handleEventPaste}
          hasClipboardContent={hasClipboardContent}
          onEventHover={setHoveredEvent}
          onGridPositionHover={setHoverPosition}
        />
      </div>

      {/* Keyboard shortcut feedback toast */}
      <KeyboardToast message={toastMessage} />

      <KnobsToggle />
      <KnobsPanel>
        <KnobSelect
          label="View"
          value={view}
          onChange={setView}
          options={[
            { label: "Week", value: "week" },
            { label: "Day", value: "day" },
          ]}
        />
        <KnobSelect
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Schedule", value: "schedule" },
            { label: "Blueprint", value: "blueprint" },
          ]}
        />
        <KnobBoolean
          label="Show Events"
          value={showEvents}
          onChange={setShowEvents}
        />
        {view === "day" && showEvents && (
          <KnobSelect
            label="Block Style"
            value={blockStyle}
            onChange={setBlockStyle}
            options={[
              { label: "Default", value: "" },
              { label: "Planned", value: "planned" },
              { label: "Completed", value: "completed" },
              { label: "Blueprint", value: "blueprint" },
            ]}
          />
        )}
        <KnobBoolean
          label="Show Hour Labels"
          value={showHourLabels}
          onChange={setShowHourLabels}
        />
        {view === "day" && (
          <KnobBoolean
            label="Header Visible"
            value={headerIsVisible}
            onChange={setHeaderIsVisible}
          />
        )}
      </KnobsPanel>
    </KnobsProvider>
  );
}
