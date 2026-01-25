"use client"

import * as React from "react"
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell"
import {
  Calendar,
  KeyboardToast,
  useCalendarClipboard,
  useCalendarKeyboard,
  type CalendarMode,
} from "@/components/calendar"
import { Backlog, type BacklogItem } from "@/components/backlog"
import { WeeklyAnalytics, type WeeklyAnalyticsItem } from "@/components/weekly-analytics"
import { DragProvider, DragGhost, useDragContextOptional } from "@/components/drag"
import { useUnifiedSchedule } from "@/hooks/use-unified-schedule"
import { getDefaultDuration, getDragItemTitle } from "@/lib/drag-types"
import type { GoalColor } from "@/lib/colors"
import { getIconColorClass } from "@/lib/colors"
import type { IconComponent } from "@/lib/types"

// Sample data from fixtures
import {
  SHELL_COMMITMENTS,
  SHELL_GOALS,
  SHELL_CALENDAR_EVENTS,
} from "@/lib/fixtures/shell-data"

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

// =============================================================================
// Helpers
// =============================================================================

/** Convert BacklogItem/ScheduleGoal to WeeklyAnalyticsItem */
function toAnalyticsItems(
  items: Array<{ id: string; label: string; icon: IconComponent; color: GoalColor }>,
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

// =============================================================================
// Components
// =============================================================================

function ShellDemoContent() {
  const [showPlanWeek, setShowPlanWeek] = React.useState(true)
  const [showCalendar, setShowCalendar] = React.useState(true)
  const [showSidebar, setShowSidebar] = React.useState(true)
  const [showRightSidebar, setShowRightSidebar] = React.useState(false)
  const [showTasks, setShowTasks] = React.useState(true)
  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>("schedule")
  const [commitments] = React.useState<BacklogItem[]>(SHELL_COMMITMENTS)

  // Clipboard for copy/paste
  const { copy, paste, hasContent: hasClipboardContent } = useCalendarClipboard()

  // Unified schedule hook manages both goals and events with bidirectional sync
  // Also provides hover state for keyboard shortcuts
  const {
    goals,
    events: calendarEvents,
    getGoalStats,
    getTaskSchedule,
    toggleTaskComplete,
    handleDrop,
    hoveredEvent,
    hoverPosition,
    calendarHandlers,
  } = useUnifiedSchedule({
    initialGoals: SHELL_GOALS,
    initialEvents: SHELL_CALENDAR_EVENTS,
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
  
  // Keyboard shortcuts - uses hover state from useUnifiedSchedule
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
