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

const SAMPLE_EVENTS: CalendarEvent[] = [
  { title: "Morning workout", dayIndex: 0, startHour: 7, durationMinutes: 60, color: "emerald", status: "completed" },
  { title: "Team standup", dayIndex: 0, startHour: 9, durationMinutes: 30, color: "violet", status: "completed" },
  { title: "Design review", dayIndex: 0, startHour: 14, durationMinutes: 90, color: "blue", taskCount: 3, status: "completed" },
  { title: "1:1 with manager", dayIndex: 1, startHour: 10, durationMinutes: 60, color: "amber", status: "completed" },
  { title: "Lunch break", dayIndex: 1, startHour: 12, durationMinutes: 60, color: "teal", status: "completed" },
  { title: "Sprint planning", dayIndex: 1, startHour: 15, durationMinutes: 120, color: "indigo", taskCount: 5, status: "completed" },
  { title: "Deep work", dayIndex: 2, startHour: 9, durationMinutes: 180, color: "sky", status: "completed" },
  { title: "Product sync", dayIndex: 2, startHour: 14, durationMinutes: 45, color: "rose", status: "completed" },
  { title: "Code review", dayIndex: 3, startHour: 10, durationMinutes: 60, color: "cyan", taskCount: 2 },
  { title: "Team lunch", dayIndex: 3, startHour: 12, durationMinutes: 90, color: "orange" },
  { title: "Interview", dayIndex: 3, startHour: 16, durationMinutes: 60, color: "pink" },
  { title: "Focus time", dayIndex: 4, startHour: 8, durationMinutes: 120, color: "violet" },
  { title: "All-hands", dayIndex: 4, startHour: 11, durationMinutes: 60, color: "fuchsia" },
  { title: "Project retro", dayIndex: 4, startHour: 15, durationMinutes: 60, color: "green", taskCount: 4 },
  { title: "Side project", dayIndex: 5, startHour: 10, durationMinutes: 180, color: "lime", status: "outlined" },
  { title: "Reading", dayIndex: 6, startHour: 9, durationMinutes: 120, color: "slate", status: "outlined" },
]

export function CalendarExample() {
  const [view, setView] = React.useState<CalendarView>("week")
  const [mode, setMode] = React.useState<CalendarMode>("schedule")
  const [showHourLabels, setShowHourLabels] = React.useState(true)
  const [headerIsVisible, setHeaderIsVisible] = React.useState(true)
  const [showEvents, setShowEvents] = React.useState(false)
  const [blockStyle, setBlockStyle] = React.useState<BlockStyle | "">("")

  return (
    <KnobsProvider>
      <div className="h-screen w-full">
        <Calendar 
          view={view} 
          mode={mode}
          showHourLabels={showHourLabels} 
          headerIsVisible={headerIsVisible} 
          events={showEvents ? SAMPLE_EVENTS : []}
          setBlockStyle={blockStyle || undefined}
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
