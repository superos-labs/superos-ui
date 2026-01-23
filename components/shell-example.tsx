"use client"

import * as React from "react"
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell"
import { Calendar, type CalendarMode } from "@/components/calendar"
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
} from "@/components/knobs"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMoreFill,
  RiSideBarLine,
} from "@remixicon/react"

function ShellDemo() {
  const [showPlanWeek, setShowPlanWeek] = React.useState(true)
  const [showCalendar, setShowCalendar] = React.useState(true)
  const [showSidebar, setShowSidebar] = React.useState(false)
  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>("schedule")

  const isPlanning = calendarMode === "blueprint"

  const handlePlanWeekClick = () => {
    setCalendarMode(isPlanning ? "schedule" : "blueprint")
  }

  return (
    <>
      <Shell>
        <ShellToolbar>
          <div className="flex items-center">
            <button 
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <RiSideBarLine className="size-4" />
            </button>
          </div>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <RiArrowLeftSLine className="size-4" />
            </button>
            <button className="flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              Today
            </button>
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <RiArrowRightSLine className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {showPlanWeek && (
              <button 
                className="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
                onClick={handlePlanWeekClick}
              >
                {isPlanning ? "Confirm" : "Plan week"}
              </button>
            )}
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <RiMoreFill className="size-4" />
            </button>
          </div>
        </ShellToolbar>
        <div className={`flex min-h-0 flex-1 ${showSidebar ? "gap-4" : "gap-0"}`}>
          <div 
            className={`shrink-0 overflow-hidden rounded-xl bg-background shadow-sm ring-1 ring-border transition-all duration-300 ease-out ${
              showSidebar ? "w-72 opacity-100" : "w-0 opacity-0 ring-0 shadow-none"
            }`}
          >
            <div className="w-72 p-4">
              {/* Sidebar content */}
            </div>
          </div>
          <ShellContent className="overflow-hidden">
            {showCalendar && <Calendar sampleData={true} mode={calendarMode} />}
          </ShellContent>
        </div>
      </Shell>
      <KnobsToggle />
      <KnobsPanel>
        <KnobBoolean
          label="Show Sidebar"
          value={showSidebar}
          onChange={setShowSidebar}
        />
        <KnobBoolean
          label="Show Plan Week button"
          value={showPlanWeek}
          onChange={setShowPlanWeek}
        />
        <KnobBoolean
          label="Show Calendar"
          value={showCalendar}
          onChange={setShowCalendar}
        />
      </KnobsPanel>
    </>
  )
}

export function ShellExample() {
  return (
    <KnobsProvider>
      <ShellDemo />
    </KnobsProvider>
  )
}
