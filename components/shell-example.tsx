"use client"

import * as React from "react"
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell"
import { Calendar, type CalendarMode, type CalendarEvent } from "@/components/calendar"
import { Backlog, type BacklogItem } from "@/components/backlog"
import {
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiDropLine,
  RiHome4Line,
  RiRocketLine,
  RiCodeLine,
  RiMedalLine,
  RiPenNibLine,
} from "@remixicon/react"

const SAMPLE_COMMITMENTS: BacklogItem[] = [
  { id: "sleep", label: "Sleep", icon: RiMoonLine, color: "text-indigo-500", plannedHours: 56, completedHours: 48 },
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "text-amber-500", plannedHours: 14, completedHours: 12 },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "text-slate-500", plannedHours: 10, completedHours: 8 },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "text-green-500", plannedHours: 5, completedHours: 3 },
  { id: "hygiene", label: "Hygiene", icon: RiDropLine, color: "text-cyan-500", plannedHours: 7, completedHours: 7 },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "text-orange-500", plannedHours: 4, completedHours: 2 },
]

const SAMPLE_GOALS: BacklogItem[] = [
  { 
    id: "superos", 
    label: "Get SuperOS to $1M ARR", 
    icon: RiRocketLine, 
    color: "text-violet-500", 
    plannedHours: 20, 
    completedHours: 12, 
    milestone: "Ship billing integration",
    tasks: [
      { id: "superos-1", label: "Set up Stripe webhook handlers", completed: true },
      { id: "superos-2", label: "Build subscription management UI", completed: false },
      { id: "superos-3", label: "Add invoice generation", completed: false },
    ]
  },
  { 
    id: "marathon", 
    label: "Run a marathon", 
    icon: RiMedalLine, 
    color: "text-rose-500", 
    plannedHours: 6, 
    completedHours: 4, 
    milestone: "Complete 10K under 50min",
    tasks: [
      { id: "marathon-1", label: "Run 5K three times this week", completed: true },
      { id: "marathon-2", label: "Do interval training on Saturday", completed: false },
    ]
  },
  { 
    id: "book", 
    label: "Write a book", 
    icon: RiPenNibLine, 
    color: "text-teal-500", 
    plannedHours: 7, 
    completedHours: 5, 
    milestone: "Finish chapter 3 draft",
    tasks: [
      { id: "book-1", label: "Outline the main conflict", completed: true },
      { id: "book-2", label: "Write the opening scene", completed: true },
      { id: "book-3", label: "Develop supporting characters", completed: false },
    ]
  },
  { 
    id: "spanish", 
    label: "Become fluent in Spanish", 
    icon: RiCodeLine, 
    color: "text-blue-500", 
    plannedHours: 5, 
    completedHours: 5, 
    milestone: "Complete A2 certification",
    tasks: [
      { id: "spanish-1", label: "Complete Duolingo lesson", completed: true },
      { id: "spanish-2", label: "Watch Spanish movie with subtitles", completed: false },
      { id: "spanish-3", label: "Practice conversation with tutor", completed: false },
    ]
  },
]

const SAMPLE_CALENDAR_EVENTS: CalendarEvent[] = [
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
  RiCheckLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

function ShellDemo() {
  const [showPlanWeek, setShowPlanWeek] = React.useState(true)
  const [showCalendar, setShowCalendar] = React.useState(true)
  const [showSidebar, setShowSidebar] = React.useState(false)
  const [showTasks, setShowTasks] = React.useState(true)
  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>("schedule")

  const isPlanning = calendarMode === "blueprint"

  const handlePlanWeekClick = () => {
    setCalendarMode(isPlanning ? "schedule" : "blueprint")
  }

  return (
    <>
      <Shell>
        <ShellToolbar>
          <div className="flex items-center gap-1">
            <button 
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
                showSidebar ? "text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <RiSideBarLine className="size-4" />
            </button>
            {showSidebar && (
              <button 
                className={cn(
                  "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
                  showTasks ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setShowTasks(!showTasks)}
                title="Toggle tasks"
              >
                <RiCheckLine className="size-4" />
              </button>
            )}
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
            className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              showSidebar ? "w-[420px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <Backlog 
              commitments={SAMPLE_COMMITMENTS}
              goals={SAMPLE_GOALS}
              className="h-full w-[420px] max-w-none overflow-y-auto" 
              showTasks={showTasks}
            />
          </div>
          <ShellContent className="overflow-hidden">
            {showCalendar && <Calendar events={SAMPLE_CALENDAR_EVENTS} mode={calendarMode} />}
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
