"use client"

import * as React from "react"
import { Calendar, type CalendarView, type CalendarMode, type CalendarEvent, type BlockStyle } from "@/components/calendar"
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
  KnobBoolean,
} from "@/components/knobs"

// Helper to convert hours to minutes for startMinutes
const hoursToMinutes = (hours: number) => hours * 60

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Morning workout", dayIndex: 0, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "emerald", status: "completed" },
  { id: "2", title: "Team standup", dayIndex: 0, startMinutes: hoursToMinutes(9), durationMinutes: 30, color: "violet", status: "completed" },
  { id: "3", title: "Design review", dayIndex: 0, startMinutes: hoursToMinutes(14), durationMinutes: 90, color: "blue", taskCount: 3, status: "completed" },
  { id: "4", title: "1:1 with manager", dayIndex: 1, startMinutes: hoursToMinutes(10), durationMinutes: 60, color: "amber", status: "completed" },
  { id: "5", title: "Lunch break", dayIndex: 1, startMinutes: hoursToMinutes(12), durationMinutes: 60, color: "teal", status: "completed" },
  { id: "6", title: "Sprint planning", dayIndex: 1, startMinutes: hoursToMinutes(15), durationMinutes: 120, color: "indigo", taskCount: 5, status: "completed" },
  { id: "7", title: "Deep work", dayIndex: 2, startMinutes: hoursToMinutes(9), durationMinutes: 180, color: "sky", status: "completed" },
  { id: "8", title: "Product sync", dayIndex: 2, startMinutes: hoursToMinutes(14), durationMinutes: 45, color: "rose", status: "completed" },
  { id: "9", title: "Code review", dayIndex: 3, startMinutes: hoursToMinutes(10), durationMinutes: 60, color: "cyan", taskCount: 2 },
  { id: "10", title: "Team lunch", dayIndex: 3, startMinutes: hoursToMinutes(12), durationMinutes: 90, color: "orange" },
  { id: "11", title: "Interview", dayIndex: 3, startMinutes: hoursToMinutes(16), durationMinutes: 60, color: "pink" },
  { id: "12", title: "Focus time", dayIndex: 4, startMinutes: hoursToMinutes(8), durationMinutes: 120, color: "violet" },
  { id: "13", title: "All-hands", dayIndex: 4, startMinutes: hoursToMinutes(11), durationMinutes: 60, color: "fuchsia" },
  { id: "14", title: "Project retro", dayIndex: 4, startMinutes: hoursToMinutes(15), durationMinutes: 60, color: "green", taskCount: 4 },
  { id: "15", title: "Side project", dayIndex: 5, startMinutes: hoursToMinutes(10), durationMinutes: 180, color: "lime", status: "outlined" },
  { id: "16", title: "Reading", dayIndex: 6, startMinutes: hoursToMinutes(9), durationMinutes: 120, color: "slate", status: "outlined" },
]

export function CalendarExample() {
  const [view, setView] = React.useState<CalendarView>("week")
  const [mode, setMode] = React.useState<CalendarMode>("schedule")
  const [showHourLabels, setShowHourLabels] = React.useState(true)
  const [headerIsVisible, setHeaderIsVisible] = React.useState(true)
  const [showEvents, setShowEvents] = React.useState(false)
  const [blockStyle, setBlockStyle] = React.useState<BlockStyle | "">("")
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_EVENTS)

  // Handle event resize - updates the event's start time and duration
  const handleEventResize = React.useCallback((
    eventId: string, 
    newStartMinutes: number, 
    newDurationMinutes: number
  ) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, startMinutes: newStartMinutes, durationMinutes: newDurationMinutes }
        : event
    ))
  }, [])

  // Handle event drag end - updates the event's day and start time when drag completes
  const handleEventDragEnd = React.useCallback((
    eventId: string,
    newDayIndex: number,
    newStartMinutes: number
  ) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? { ...event, dayIndex: newDayIndex, startMinutes: newStartMinutes }
        : event
    ))
  }, [])

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
        />
      </div>
      
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
  )
}
