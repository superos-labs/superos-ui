"use client"

import * as React from "react"
import { Block, BLOCK_COLORS, type BlockColor, type BlockStatus, type BlockDuration } from "@/components/block"
import { Calendar, type CalendarEvent } from "@/components/calendar"
import { 
  KnobsProvider, 
  KnobsToggle, 
  KnobsPanel, 
  KnobSelect,
  KnobInput,
  KnobBoolean
} from "@/components/knobs"

const colorOptions = Object.keys(BLOCK_COLORS).map((key) => ({
  label: key.charAt(0).toUpperCase() + key.slice(1),
  value: key as BlockColor,
}))

const durationOptions: { label: string; value: string; endTime: string }[] = [
  { label: "30 min", value: "30", endTime: "9:30" },
  { label: "1 hour", value: "60", endTime: "10:00" },
  { label: "4 hours", value: "240", endTime: "13:00" },
]

export function BlockExample() {
  const [color, setColor] = React.useState<BlockColor>("indigo")
  const [status, setStatus] = React.useState<BlockStatus>("planned")
  const [title, setTitle] = React.useState("Deep work")
  const [duration, setDuration] = React.useState<string>("60")
  const [showTasks, setShowTasks] = React.useState(false)
  const [displayCalendar, setDisplayCalendar] = React.useState(false)
  
  // State for calendar resize
  const [startMinutes, setStartMinutes] = React.useState(9 * 60) // 9:00 AM
  const [calendarDuration, setCalendarDuration] = React.useState(60)

  const selectedDuration = durationOptions.find(d => d.value === duration)

  // Calculate today's day index (0 = Monday, 6 = Sunday)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const todayDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  // Sync duration when knob changes (only when not in calendar mode)
  React.useEffect(() => {
    if (!displayCalendar) {
      setCalendarDuration(parseInt(duration, 10))
    }
  }, [duration, displayCalendar])

  const blockAsEvent: CalendarEvent = {
    id: "preview-block",
    title,
    dayIndex: todayDayIndex,
    startMinutes,
    durationMinutes: calendarDuration,
    color,
    taskCount: showTasks ? 3 : undefined,
  }

  const handleEventResize = React.useCallback((
    _eventId: string,
    newStartMinutes: number,
    newDurationMinutes: number
  ) => {
    setStartMinutes(newStartMinutes)
    setCalendarDuration(newDurationMinutes)
  }, [])

  return (
    <KnobsProvider>
      {displayCalendar ? (
        <div className="h-[600px] w-full max-w-3xl rounded-lg border overflow-hidden">
          <Calendar 
            view="day"
            events={[blockAsEvent]}
            setBlockStyle={status}
            onEventResize={handleEventResize}
          />
        </div>
      ) : (
        <div className="w-72">
          <Block 
            title={title}
            startTime="9:00" 
            endTime={selectedDuration?.endTime ?? "9:30"}
            color={color}
            status={status}
            duration={parseInt(duration, 10) as BlockDuration}
            taskCount={showTasks ? 3 : undefined}
          />
        </div>
      )}
      
      <KnobsToggle />
      <KnobsPanel>
        <KnobInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Block title"
        />
        <KnobSelect
          label="Duration"
          value={duration}
          onChange={setDuration}
          options={durationOptions}
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
          label="Display calendar"
          value={displayCalendar}
          onChange={setDisplayCalendar}
        />
      </KnobsPanel>
    </KnobsProvider>
  )
}
