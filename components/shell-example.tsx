"use client"

import * as React from "react"
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell"
import { Calendar, KeyboardToast, type CalendarMode, type CalendarEvent } from "@/components/calendar"
import { useCalendarClipboard } from "@/components/calendar/use-calendar-clipboard"
import { useCalendarKeyboard, type HoverPosition } from "@/components/calendar/use-calendar-keyboard"
import { Backlog, type BacklogItem } from "@/components/backlog"
import { WeeklyAnalytics, type WeeklyAnalyticsItem } from "@/components/weekly-analytics"
import { DragProvider, DragGhost, useDragContextOptional } from "@/components/drag"
import { useUnifiedSchedule, type ScheduleGoal } from "@/hooks/use-unified-schedule"
import { getDefaultDuration, getDragItemTitle, type DragItem } from "@/lib/drag-types"
import type { GoalColor } from "@/lib/colors"
import { getIconColorClass } from "@/lib/colors"
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
// Single source of truth for all components.

const INITIAL_COMMITMENTS: BacklogItem[] = [
  { id: "sleep", label: "Sleep", icon: RiMoonLine, color: "indigo" },
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "amber" },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "slate" },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "green" },
  { id: "hygiene", label: "Hygiene", icon: RiDropLine, color: "cyan" },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "orange" },
]

const INITIAL_GOALS: ScheduleGoal[] = [
  { 
    id: "superos", 
    label: "Get SuperOS to $1M ARR", 
    icon: RiRocketLine, 
    color: "violet", 
    milestone: "Ship billing integration",
    tasks: [
      { id: "superos-1", label: "Set up Stripe webhook handlers", completed: true, scheduledBlockId: "shell-superos-task-1" },
      { id: "superos-2", label: "Build subscription management UI", completed: false },
      { id: "superos-3", label: "Add invoice generation", completed: false },
    ]
  },
  { 
    id: "marathon", 
    label: "Run a marathon", 
    icon: RiMedalLine, 
    color: "rose", 
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
    color: "teal", 
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
    color: "blue", 
    milestone: "Complete A2 certification",
    tasks: [
      { id: "spanish-1", label: "Complete Duolingo lesson", completed: true },
      { id: "spanish-2", label: "Watch Spanish movie with subtitles", completed: false },
      { id: "spanish-3", label: "Practice conversation with tutor", completed: false },
    ]
  },
]

/** Convert BacklogItem/ScheduleGoal to WeeklyAnalyticsItem */
function toAnalyticsItems(
  items: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; color: GoalColor }>,
  getStats: (id: string) => { plannedHours: number; completedHours: number }
): WeeklyAnalyticsItem[] {
  return items.map((item) => {
    const stats = getStats(item.id)
    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      color: getIconColorClass(item.color),
      plannedHours: stats.plannedHours,
      completedHours: stats.completedHours,
    }
  })
}

// Helper to convert hours to minutes for startMinutes
const hoursToMinutes = (hours: number) => hours * 60

const SAMPLE_CALENDAR_EVENTS: CalendarEvent[] = [
  // Morning routine (not linked to goals)
  { id: "shell-1", title: "Morning workout", dayIndex: 0, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "emerald", status: "completed" },
  
  // SuperOS goal work sessions (violet = superos color)
  { id: "shell-superos-1", title: "Get SuperOS to $1M ARR", dayIndex: 0, startMinutes: hoursToMinutes(9), durationMinutes: 120, color: "violet", status: "completed", blockType: "goal", sourceGoalId: "superos" },
  { id: "shell-superos-2", title: "Get SuperOS to $1M ARR", dayIndex: 1, startMinutes: hoursToMinutes(9), durationMinutes: 90, color: "violet", status: "completed", blockType: "goal", sourceGoalId: "superos" },
  { id: "shell-superos-3", title: "Get SuperOS to $1M ARR", dayIndex: 2, startMinutes: hoursToMinutes(14), durationMinutes: 120, color: "violet", status: "completed", blockType: "goal", sourceGoalId: "superos" },
  { id: "shell-superos-4", title: "Get SuperOS to $1M ARR", dayIndex: 4, startMinutes: hoursToMinutes(9), durationMinutes: 90, color: "violet", blockType: "goal", sourceGoalId: "superos" },
  
  // SuperOS task blocks
  { id: "shell-superos-task-1", title: "Set up Stripe webhook handlers", dayIndex: 0, startMinutes: hoursToMinutes(14), durationMinutes: 30, color: "violet", status: "completed", blockType: "task", sourceGoalId: "superos", sourceTaskId: "superos-1" },
  
  // Marathon goal work sessions (rose = marathon color)
  { id: "shell-marathon-1", title: "Run a marathon", dayIndex: 1, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "rose", status: "completed", blockType: "goal", sourceGoalId: "marathon" },
  { id: "shell-marathon-2", title: "Run a marathon", dayIndex: 3, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "rose", status: "completed", blockType: "goal", sourceGoalId: "marathon" },
  { id: "shell-marathon-3", title: "Run a marathon", dayIndex: 5, startMinutes: hoursToMinutes(8), durationMinutes: 90, color: "rose", blockType: "goal", sourceGoalId: "marathon" },
  
  // Book goal work sessions (teal = book color)
  { id: "shell-book-1", title: "Write a book", dayIndex: 2, startMinutes: hoursToMinutes(9), durationMinutes: 90, color: "teal", status: "completed", blockType: "goal", sourceGoalId: "book" },
  { id: "shell-book-2", title: "Write a book", dayIndex: 4, startMinutes: hoursToMinutes(14), durationMinutes: 60, color: "teal", status: "completed", blockType: "goal", sourceGoalId: "book" },
  { id: "shell-book-3", title: "Write a book", dayIndex: 6, startMinutes: hoursToMinutes(10), durationMinutes: 120, color: "teal", blockType: "goal", sourceGoalId: "book" },
  
  // Spanish goal work sessions (blue = spanish color)  
  { id: "shell-spanish-1", title: "Become fluent in Spanish", dayIndex: 0, startMinutes: hoursToMinutes(18), durationMinutes: 60, color: "blue", status: "completed", blockType: "goal", sourceGoalId: "spanish" },
  { id: "shell-spanish-2", title: "Become fluent in Spanish", dayIndex: 2, startMinutes: hoursToMinutes(18), durationMinutes: 60, color: "blue", status: "completed", blockType: "goal", sourceGoalId: "spanish" },
  { id: "shell-spanish-3", title: "Become fluent in Spanish", dayIndex: 4, startMinutes: hoursToMinutes(18), durationMinutes: 60, color: "blue", status: "completed", blockType: "goal", sourceGoalId: "spanish" },
  
  // Other calendar events (meetings, etc.)
  { id: "shell-4", title: "1:1 with manager", dayIndex: 1, startMinutes: hoursToMinutes(14), durationMinutes: 60, color: "amber", status: "completed" },
  { id: "shell-5", title: "Lunch break", dayIndex: 1, startMinutes: hoursToMinutes(12), durationMinutes: 60, color: "orange", status: "completed" },
  { id: "shell-6", title: "Team sync", dayIndex: 3, startMinutes: hoursToMinutes(10), durationMinutes: 60, color: "indigo" },
  { id: "shell-7", title: "Team lunch", dayIndex: 3, startMinutes: hoursToMinutes(12), durationMinutes: 90, color: "orange" },
  
  // Blueprint blocks for planning
  { id: "shell-blueprint-1", title: "Deep focus time", dayIndex: 5, startMinutes: hoursToMinutes(14), durationMinutes: 180, color: "sky", status: "blueprint" },
  { id: "shell-blueprint-2", title: "Weekly review", dayIndex: 6, startMinutes: hoursToMinutes(15), durationMinutes: 60, color: "slate", status: "blueprint" },
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

function ShellDemoContent() {
  const [showPlanWeek, setShowPlanWeek] = React.useState(true)
  const [showCalendar, setShowCalendar] = React.useState(true)
  const [showSidebar, setShowSidebar] = React.useState(true)
  const [showRightSidebar, setShowRightSidebar] = React.useState(false)
  const [showTasks, setShowTasks] = React.useState(true)
  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>("schedule")
  const [commitments] = React.useState<BacklogItem[]>(INITIAL_COMMITMENTS)

  // Clipboard for copy/paste (initialized before unified schedule)
  const { copy, paste, hasContent: hasClipboardContent } = useCalendarClipboard()

  // Unified schedule hook manages both goals and events with bidirectional sync
  const {
    goals,
    events: calendarEvents,
    getGoalStats,
    getTaskSchedule,
    toggleTaskComplete,
    handleDrop,
    calendarHandlers,
  } = useUnifiedSchedule({
    initialGoals: INITIAL_GOALS,
    initialEvents: SAMPLE_CALENDAR_EVENTS,
    onCopy: copy,
    onPaste: paste,
    hasClipboardContent,
  })

  // Drag context for external drag preview
  const dragContext = useDragContextOptional()
  
  // Build external drag preview from drag context state
  const externalDragPreview = React.useMemo(() => {
    if (!dragContext?.state.isDragging || !dragContext.state.item || !dragContext.state.previewPosition) {
      return null
    }
    const item = dragContext.state.item
    const pos = dragContext.state.previewPosition
    return {
      dayIndex: pos.dayIndex,
      startMinutes: pos.startMinutes,
      durationMinutes: getDefaultDuration(item.type),
      color: item.goalColor,
      title: getDragItemTitle(item),
    }
  }, [dragContext?.state])
  
  // Handle drop from external drag
  const handleExternalDrop = React.useCallback((dayIndex: number, startMinutes: number) => {
    if (!dragContext?.state.item) return
    handleDrop(dragContext.state.item, dayIndex, startMinutes)
  }, [dragContext?.state.item, handleDrop])
  
  // Hover state for keyboard shortcuts
  const [hoveredEvent, setHoveredEvent] = React.useState<CalendarEvent | null>(null)
  const [hoverPosition, setHoverPosition] = React.useState<HoverPosition | null>(null)
  
  // Keyboard shortcuts
  const { toastMessage } = useCalendarKeyboard({
    hoveredEvent,
    hoverPosition,
    hasClipboardContent: calendarHandlers.hasClipboardContent,
    onCopy: calendarHandlers.onEventCopy,
    onPaste: calendarHandlers.onEventPaste,
    onDuplicate: (eventId, newDayIndex, newStartMinutes) => 
      calendarHandlers.onEventDuplicate(eventId, newDayIndex, newStartMinutes),
    onDelete: (eventId) => calendarHandlers.onEventDelete(eventId),
    onToggleComplete: (eventId, currentStatus) => {
      const newStatus = currentStatus === "completed" ? "planned" : "completed"
      calendarHandlers.onEventStatusChange(eventId, newStatus)
    },
  })

  // Derive analytics data
  const analyticsCommitments = React.useMemo(() => 
    toAnalyticsItems(commitments, () => ({ plannedHours: 0, completedHours: 0 })), 
    [commitments]
  )
  const analyticsGoals = React.useMemo(() => 
    toAnalyticsItems(goals, getGoalStats), 
    [goals, getGoalStats]
  )

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
              goals={goals as BacklogItem[]}
              className="h-full w-[420px] max-w-none overflow-y-auto" 
              showTasks={showTasks}
              showCommitments={false}
              onToggleGoalTask={toggleTaskComplete}
              getGoalStats={getGoalStats}
              getTaskSchedule={getTaskSchedule}
              draggable={true}
            />
          </div>
          <ShellContent className="overflow-hidden">
            {showCalendar && (
              <Calendar 
                events={calendarEvents} 
                mode={calendarMode}
                {...calendarHandlers}
                onEventHover={setHoveredEvent}
                onGridPositionHover={setHoverPosition}
                enableExternalDrop={true}
                onExternalDrop={handleExternalDrop}
                externalDragPreview={externalDragPreview}
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
      <DragGhost />
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

function ShellDemo() {
  return (
    <DragProvider>
      <ShellDemoContent />
    </DragProvider>
  )
}

export function ShellExample() {
  return (
    <KnobsProvider>
      <ShellDemo />
    </KnobsProvider>
  )
}
