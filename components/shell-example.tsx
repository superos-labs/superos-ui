"use client"

import * as React from "react"
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell"
import { Calendar, useCalendarInteractions, KeyboardToast, type CalendarMode, type CalendarEvent } from "@/components/calendar"
import { Backlog, type BacklogItem } from "@/components/backlog"
import { WeeklyAnalytics, type WeeklyAnalyticsItem } from "@/components/weekly-analytics"
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

// =============================================================================
// Sample Data
// =============================================================================
// Single source of truth for all components. BacklogItem is the canonical type
// since it's a superset of WeeklyAnalyticsItem.

const INITIAL_COMMITMENTS: BacklogItem[] = [
  { id: "sleep", label: "Sleep", icon: RiMoonLine, color: "text-indigo-500", plannedHours: 56, completedHours: 48 },
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "text-amber-500", plannedHours: 14, completedHours: 12 },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "text-slate-500", plannedHours: 10, completedHours: 8 },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "text-green-500", plannedHours: 5, completedHours: 3 },
  { id: "hygiene", label: "Hygiene", icon: RiDropLine, color: "text-cyan-500", plannedHours: 7, completedHours: 7 },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "text-orange-500", plannedHours: 4, completedHours: 2 },
]

const INITIAL_GOALS: BacklogItem[] = [
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

/** Convert BacklogItem[] to WeeklyAnalyticsItem[] by extracting core fields */
function toAnalyticsItems(items: BacklogItem[]): WeeklyAnalyticsItem[] {
  return items.map(({ id, label, icon, color, plannedHours, completedHours }) => ({
    id,
    label,
    icon,
    color,
    plannedHours: plannedHours ?? 0,
    completedHours: completedHours ?? 0,
  }))
}

// Helper to convert hours to minutes for startMinutes
const hoursToMinutes = (hours: number) => hours * 60

const SAMPLE_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "shell-1", title: "Morning workout", dayIndex: 0, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "emerald", status: "completed" },
  { id: "shell-2", title: "Team standup", dayIndex: 0, startMinutes: hoursToMinutes(9), durationMinutes: 30, color: "violet", status: "completed" },
  { id: "shell-3", title: "Design review", dayIndex: 0, startMinutes: hoursToMinutes(14), durationMinutes: 90, color: "blue", taskCount: 3, status: "completed" },
  { id: "shell-4", title: "1:1 with manager", dayIndex: 1, startMinutes: hoursToMinutes(10), durationMinutes: 60, color: "amber", status: "completed" },
  { id: "shell-5", title: "Lunch break", dayIndex: 1, startMinutes: hoursToMinutes(12), durationMinutes: 60, color: "teal", status: "completed" },
  { id: "shell-6", title: "Sprint planning", dayIndex: 1, startMinutes: hoursToMinutes(15), durationMinutes: 120, color: "indigo", taskCount: 5, status: "completed" },
  { id: "shell-7", title: "Deep work", dayIndex: 2, startMinutes: hoursToMinutes(9), durationMinutes: 180, color: "sky", status: "completed" },
  { id: "shell-8", title: "Product sync", dayIndex: 2, startMinutes: hoursToMinutes(14), durationMinutes: 45, color: "rose", status: "completed" },
  { id: "shell-9", title: "Code review", dayIndex: 3, startMinutes: hoursToMinutes(10), durationMinutes: 60, color: "cyan", taskCount: 2 },
  { id: "shell-10", title: "Team lunch", dayIndex: 3, startMinutes: hoursToMinutes(12), durationMinutes: 90, color: "orange" },
  { id: "shell-11", title: "Interview", dayIndex: 3, startMinutes: hoursToMinutes(16), durationMinutes: 60, color: "pink" },
  { id: "shell-12", title: "Focus time", dayIndex: 4, startMinutes: hoursToMinutes(8), durationMinutes: 120, color: "violet" },
  { id: "shell-13", title: "All-hands", dayIndex: 4, startMinutes: hoursToMinutes(11), durationMinutes: 60, color: "fuchsia" },
  { id: "shell-14", title: "Project retro", dayIndex: 4, startMinutes: hoursToMinutes(15), durationMinutes: 60, color: "green", taskCount: 4 },
  { id: "shell-15", title: "Side project", dayIndex: 5, startMinutes: hoursToMinutes(10), durationMinutes: 180, color: "lime", status: "blueprint" },
  { id: "shell-16", title: "Reading", dayIndex: 6, startMinutes: hoursToMinutes(9), durationMinutes: 120, color: "slate", status: "blueprint" },
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
  RiPieChartLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

function ShellDemo() {
  const [showPlanWeek, setShowPlanWeek] = React.useState(true)
  const [showCalendar, setShowCalendar] = React.useState(true)
  const [showSidebar, setShowSidebar] = React.useState(false)
  const [showRightSidebar, setShowRightSidebar] = React.useState(false)
  const [showTasks, setShowTasks] = React.useState(true)
  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>("schedule")
  const [commitments] = React.useState<BacklogItem[]>(INITIAL_COMMITMENTS)
  const [goals, setGoals] = React.useState<BacklogItem[]>(INITIAL_GOALS)

  // Use the interactions hook for all calendar event handling
  const { events: calendarEvents, handlers: calendarHandlers, toastMessage } = useCalendarInteractions({
    initialEvents: SAMPLE_CALENDAR_EVENTS,
  })

  // Derive analytics data from the same source
  const analyticsCommitments = React.useMemo(() => toAnalyticsItems(commitments), [commitments])
  const analyticsGoals = React.useMemo(() => toAnalyticsItems(goals), [goals])

  const handleToggleGoalTask = React.useCallback((goalId: string, taskId: string) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId
          ? {
              ...goal,
              tasks: goal.tasks?.map(task =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              )
            }
          : goal
      )
    )
  }, [])

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
            <button 
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
                showRightSidebar ? "text-foreground" : "text-muted-foreground"
              )}
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              title="Toggle analytics"
            >
              <RiPieChartLine className="size-4" />
            </button>
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <RiMoreFill className="size-4" />
            </button>
          </div>
        </ShellToolbar>
        <div className={`flex min-h-0 flex-1 ${showSidebar || showRightSidebar ? "gap-4" : "gap-0"}`}>
          <div 
            className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              showSidebar ? "w-[420px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <Backlog 
              commitments={commitments}
              goals={goals}
              className="h-full w-[420px] max-w-none overflow-y-auto" 
              showTasks={showTasks}
              showCommitments={false}
              onToggleGoalTask={handleToggleGoalTask}
            />
          </div>
          <ShellContent className="overflow-hidden">
            {showCalendar && (
              <Calendar 
                events={calendarEvents} 
                mode={calendarMode} 
                {...calendarHandlers}
              />
            )}
          </ShellContent>
          <div 
            className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              showRightSidebar ? "w-[340px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <WeeklyAnalytics 
              commitments={analyticsCommitments}
              goals={analyticsGoals}
              weekLabel="Jan 20 – 26"
              className="h-full w-[340px] max-w-none overflow-y-auto" 
            />
          </div>
        </div>
      </Shell>
      <KeyboardToast message={toastMessage} />
      <KnobsToggle />
      <KnobsPanel>
        <KnobBoolean
          label="Show Sidebar"
          value={showSidebar}
          onChange={setShowSidebar}
        />
        <KnobBoolean
          label="Show Analytics"
          value={showRightSidebar}
          onChange={setShowRightSidebar}
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
