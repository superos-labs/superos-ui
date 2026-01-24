"use client";

import * as React from "react";
import { BLOCK_COLORS, type BlockColor } from "./block-colors";
import type { BlockStatus } from "./block";
import { Calendar, type CalendarEvent } from "@/components/calendar";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
  KnobInput,
  KnobBoolean,
} from "@/components/knobs";

const colorOptions = Object.keys(BLOCK_COLORS).map((key) => ({
  label: key.charAt(0).toUpperCase() + key.slice(1),
  value: key as BlockColor,
}));

export function BlockExample() {
  const [color, setColor] = React.useState<BlockColor>("indigo");
  const [status, setStatus] = React.useState<BlockStatus>("planned");
  const [title, setTitle] = React.useState("Deep work");
  const [showTasks, setShowTasks] = React.useState(false);
  const [showSecondBlock, setShowSecondBlock] = React.useState(false);

  // State for calendar resize
  const [startMinutes, setStartMinutes] = React.useState(9 * 60); // 9:00 AM
  const [calendarDuration, setCalendarDuration] = React.useState(60);

  // Second block state
  const [secondStartMinutes, setSecondStartMinutes] = React.useState(11 * 60); // 11:00 AM
  const [secondDuration, setSecondDuration] = React.useState(90);

  // Calculate today's day index (0 = Monday, 6 = Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const primaryBlock: CalendarEvent = {
    id: "preview-block",
    title,
    dayIndex: todayDayIndex,
    startMinutes,
    durationMinutes: calendarDuration,
    color,
    taskCount: showTasks ? 3 : undefined,
  };

  const secondBlock: CalendarEvent = {
    id: "second-block",
    title: "Meeting",
    dayIndex: todayDayIndex,
    startMinutes: secondStartMinutes,
    durationMinutes: secondDuration,
    color: "emerald",
    taskCount: undefined,
  };

  const events = showSecondBlock ? [primaryBlock, secondBlock] : [primaryBlock];

  const handleEventResize = React.useCallback(
    (eventId: string, newStartMinutes: number, newDurationMinutes: number) => {
      if (eventId === "preview-block") {
        setStartMinutes(newStartMinutes);
        setCalendarDuration(newDurationMinutes);
      } else if (eventId === "second-block") {
        setSecondStartMinutes(newStartMinutes);
        setSecondDuration(newDurationMinutes);
      }
    },
    [],
  );

  return (
    <KnobsProvider>
      <div className="h-[600px] w-full max-w-3xl rounded-lg border overflow-hidden">
        <Calendar
          view="day"
          events={events}
          setBlockStyle={status}
          onEventResize={handleEventResize}
        />
      </div>

      <KnobsToggle />
      <KnobsPanel>
        <KnobInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Block title"
        />
        <KnobSelect
          label="Variant"
          value={status}
          onChange={setStatus}
          options={[
            { label: "Planned", value: "planned" },
            { label: "Completed", value: "completed" },
            { label: "Blueprint", value: "blueprint" },
          ]}
        />
        <KnobSelect
          label="Color"
          value={color}
          onChange={setColor}
          options={colorOptions}
        />
        {status !== "blueprint" && (
          <KnobBoolean
            label="Show Tasks"
            value={showTasks}
            onChange={setShowTasks}
          />
        )}
        <KnobBoolean
          label="Show Second Block"
          value={showSecondBlock}
          onChange={setShowSecondBlock}
        />
      </KnobsPanel>
    </KnobsProvider>
  );
}
