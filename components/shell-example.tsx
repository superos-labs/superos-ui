"use client"

import * as React from "react"
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell"
import {
  Calendar,
  KeyboardToast,
  useCalendarClipboard,
  useCalendarKeyboard,
  useDeadlineKeyboard,
  getWeekDates,
  type CalendarMode,
  type CalendarEvent,
} from "@/components/calendar"
import type { DeadlineTask } from "@/lib/unified-schedule"
import { Backlog, type BacklogItem, type BacklogMode, type NewGoalData } from "@/components/backlog"
import { WeeklyAnalytics } from "@/components/weekly-analytics"
import { BlockSidebar } from "@/components/block"
import { DragProvider, DragGhost, useDragContextOptional } from "@/components/drag"
import { useUnifiedSchedule } from "@/lib/unified-schedule"
import { getDefaultDuration, getDragItemTitle, getDragItemColor } from "@/lib/drag-types"
import type { GoalColor } from "@/lib/colors"
import type { IconComponent } from "@/lib/types"

// Adapters for data conversion
import { 
  eventToBlockSidebarData, 
  parseTimeToMinutes,
  toAnalyticsItems,
} from "@/lib/adapters"

// Sample data from fixtures
import {
  DATA_SETS,
  ALL_COMMITMENTS,
  LIFE_AREAS,
  GOAL_ICONS,
  type DataSetId,
} from "@/lib/fixtures/shell-data"

import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
  KnobSelect,
} from "@/components/_playground/knobs"
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
// Components
// =============================================================================

interface ShellDemoContentProps {
  dataSetId: DataSetId;
  onDataSetChange: (id: DataSetId) => void;
}

function ShellDemoContent({ dataSetId, onDataSetChange }: ShellDemoContentProps) {
  const [showPlanWeek, setShowPlanWeek] = React.useState(true)
  const [showCalendar, setShowCalendar] = React.useState(true)
  const [showSidebar, setShowSidebar] = React.useState(true)
  const [showRightSidebar, setShowRightSidebar] = React.useState(false)
  const [showTasks, setShowTasks] = React.useState(true)
  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>("schedule")
  const [backlogMode, setBacklogMode] = React.useState<BacklogMode>("view")
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null)

  // Get the data set based on the ID
  const dataSet = DATA_SETS[dataSetId]

  // Clipboard for copy/paste
  const { copy, paste, hasContent: hasClipboardContent } = useCalendarClipboard()

  // Unified schedule hook manages goals, commitments, and events with bidirectional sync
  // Also provides hover state for keyboard shortcuts
  const {
    goals,
    commitments,
    allCommitments,
    events: calendarEvents,
    // Commitment visibility management
    enabledCommitmentIds,
    draftEnabledCommitmentIds,
    mandatoryCommitmentIds,
    toggleCommitmentEnabled,
    startEditingCommitments,
    saveCommitmentChanges,
    cancelCommitmentChanges,
    // Stats and other
    getGoalStats,
    getCommitmentStats,
    getTaskSchedule,
    getTaskDeadline,
    getWeekDeadlines,
    addGoal,
    toggleTaskComplete,
    // Task CRUD
    addTask,
    updateTask,
    deleteTask,
    // Subtask CRUD
    addSubtask,
    updateSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
    clearTaskDeadline,
    handleDrop,
    hoveredEvent,
    hoverPosition,
    calendarHandlers,
    updateEvent,
    assignTaskToBlock,
    unassignTaskFromBlock,
  } = useUnifiedSchedule({
    initialGoals: dataSet.goals,
    allCommitments: ALL_COMMITMENTS,
    initialEnabledCommitmentIds: dataSetId === "empty" ? [] : undefined,
    initialEvents: dataSet.events,
    onCopy: copy,
    onPaste: paste,
    hasClipboardContent,
    onEventCreated: (event) => setSelectedEventId(event.id),
  })

  // Hover state for deadline keyboard shortcuts
  const [hoveredDeadline, setHoveredDeadline] = React.useState<DeadlineTask | null>(null)

  // Compute week dates and deadlines for calendar display
  const weekDates = React.useMemo(() => getWeekDates(new Date()), [])
  const weekDeadlines = React.useMemo(
    () => getWeekDeadlines(weekDates),
    [getWeekDeadlines, weekDates]
  )

  // Derive selected event from ID (auto-syncs when events change)
  const selectedEvent = selectedEventId
    ? calendarEvents.find((e) => e.id === selectedEventId) ?? null
    : null

  // Compute sidebar data for the selected event (memoized)
  const sidebarData = React.useMemo(() => {
    if (!selectedEvent) return null
    return eventToBlockSidebarData(selectedEvent, goals, commitments, weekDates)
  }, [selectedEvent, goals, commitments, weekDates])

  // Handle event click - select the block to show sidebar
  const handleEventClick = React.useCallback((event: CalendarEvent) => {
    setSelectedEventId(event.id)
  }, [])

  // Handle closing the block sidebar
  const handleCloseSidebar = React.useCallback(() => {
    setSelectedEventId(null)
  }, [])

  // Close sidebar on ESC key
  React.useEffect(() => {
    if (!selectedEventId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEventId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedEventId])

  // Sidebar callbacks for editing block properties
  const handleSidebarTitleChange = React.useCallback(
    (title: string) => {
      if (!selectedEvent) return
      updateEvent(selectedEvent.id, { title })
      // If task block, also update the task label
      if (selectedEvent.sourceTaskId && selectedEvent.sourceGoalId) {
        updateTask(selectedEvent.sourceGoalId, selectedEvent.sourceTaskId, { label: title })
      }
    },
    [selectedEvent, updateEvent, updateTask]
  )

  const handleSidebarDateChange = React.useCallback(
    (newDate: string) => {
      if (!selectedEvent) return
      const newDayIndex = weekDates.findIndex(
        (d) => d.toISOString().split("T")[0] === newDate
      )
      if (newDayIndex >= 0) {
        updateEvent(selectedEvent.id, { dayIndex: newDayIndex })
      }
    },
    [selectedEvent, weekDates, updateEvent]
  )

  const handleSidebarStartTimeChange = React.useCallback(
    (startTime: string) => {
      if (!selectedEvent) return
      const newStartMinutes = parseTimeToMinutes(startTime)
      updateEvent(selectedEvent.id, { startMinutes: newStartMinutes })
    },
    [selectedEvent, updateEvent]
  )

  const handleSidebarEndTimeChange = React.useCallback(
    (endTime: string) => {
      if (!selectedEvent) return
      const newEndMinutes = parseTimeToMinutes(endTime)
      const newDuration = newEndMinutes - selectedEvent.startMinutes
      if (newDuration > 0) {
        updateEvent(selectedEvent.id, { durationMinutes: newDuration })
      }
    },
    [selectedEvent, updateEvent]
  )

  const handleSidebarNotesChange = React.useCallback(
    (notes: string) => {
      if (!selectedEvent) return
      updateEvent(selectedEvent.id, { notes })
      // Sync notes to task description for task blocks
      if (selectedEvent.blockType === "task" && selectedEvent.sourceGoalId && selectedEvent.sourceTaskId) {
        updateTask(selectedEvent.sourceGoalId, selectedEvent.sourceTaskId, { description: notes })
      }
    },
    [selectedEvent, updateEvent, updateTask]
  )

  const handleSidebarToggleGoalTask = React.useCallback(
    (taskId: string) => {
      if (!selectedEvent?.sourceGoalId) return
      toggleTaskComplete(selectedEvent.sourceGoalId, taskId)
    },
    [selectedEvent, toggleTaskComplete]
  )

  // Subtask handlers for task blocks
  const handleSidebarAddSubtask = React.useCallback(
    (label: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return
      addSubtask(selectedEvent.sourceGoalId, selectedEvent.sourceTaskId, label)
    },
    [selectedEvent, addSubtask]
  )

  const handleSidebarToggleSubtask = React.useCallback(
    (subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return
      toggleSubtaskComplete(
        selectedEvent.sourceGoalId,
        selectedEvent.sourceTaskId,
        subtaskId
      )
    },
    [selectedEvent, toggleSubtaskComplete]
  )

  const handleSidebarUpdateSubtask = React.useCallback(
    (subtaskId: string, label: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return
      updateSubtask(
        selectedEvent.sourceGoalId,
        selectedEvent.sourceTaskId,
        subtaskId,
        label
      )
    },
    [selectedEvent, updateSubtask]
  )

  const handleSidebarDeleteSubtask = React.useCallback(
    (subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return
      deleteSubtask(
        selectedEvent.sourceGoalId,
        selectedEvent.sourceTaskId,
        subtaskId
      )
    },
    [selectedEvent, deleteSubtask]
  )

  // Task assignment handlers for goal blocks
  const handleSidebarAssignTask = React.useCallback(
    (taskId: string) => {
      if (!selectedEvent) return
      assignTaskToBlock(selectedEvent.id, taskId)
    },
    [selectedEvent, assignTaskToBlock]
  )

  const handleSidebarUnassignTask = React.useCallback(
    (taskId: string) => {
      if (!selectedEvent) return
      unassignTaskFromBlock(selectedEvent.id, taskId)
    },
    [selectedEvent, unassignTaskFromBlock]
  )

  // Create a new task and assign it to the current block
  const handleSidebarCreateTask = React.useCallback(
    (label: string) => {
      if (!selectedEvent?.sourceGoalId) return
      // Create the task in the goal
      const newTaskId = addTask(selectedEvent.sourceGoalId, label)
      // Assign it to this block
      if (newTaskId) {
        assignTaskToBlock(selectedEvent.id, newTaskId)
      }
    },
    [selectedEvent, addTask, assignTaskToBlock]
  )

  // Goal task context handlers (for expanding tasks in goal blocks)
  const handleSidebarUpdateGoalTask = React.useCallback(
    (taskId: string, updates: Partial<{ label: string; description?: string }>) => {
      if (!selectedEvent?.sourceGoalId) return
      updateTask(selectedEvent.sourceGoalId, taskId, updates)
    },
    [selectedEvent, updateTask]
  )

  const handleSidebarAddGoalTaskSubtask = React.useCallback(
    (taskId: string, label: string) => {
      if (!selectedEvent?.sourceGoalId) return
      addSubtask(selectedEvent.sourceGoalId, taskId, label)
    },
    [selectedEvent, addSubtask]
  )

  const handleSidebarToggleGoalTaskSubtask = React.useCallback(
    (taskId: string, subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId) return
      toggleSubtaskComplete(selectedEvent.sourceGoalId, taskId, subtaskId)
    },
    [selectedEvent, toggleSubtaskComplete]
  )

  const handleSidebarUpdateGoalTaskSubtask = React.useCallback(
    (taskId: string, subtaskId: string, label: string) => {
      if (!selectedEvent?.sourceGoalId) return
      updateSubtask(selectedEvent.sourceGoalId, taskId, subtaskId, label)
    },
    [selectedEvent, updateSubtask]
  )

  const handleSidebarDeleteGoalTaskSubtask = React.useCallback(
    (taskId: string, subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId) return
      deleteSubtask(selectedEvent.sourceGoalId, taskId, subtaskId)
    },
    [selectedEvent, deleteSubtask]
  )

  // Drag context for external drag preview
  const dragContext = useDragContextOptional()
  
  // Destructure drag state for React Compiler compatibility
  // (The compiler needs explicit primitive/object dependencies, not optional chaining)
  const dragState = dragContext?.state ?? null
  const isDragging = dragState?.isDragging ?? false
  const dragItem = dragState?.item ?? null
  const previewPosition = dragState?.previewPosition ?? null
  
  // Build external drag preview from drag context state (only for time-grid drops)
  const externalDragPreview = React.useMemo(() => {
    if (!isDragging || !dragItem || !previewPosition) {
      return null
    }
    // Only show preview for time-grid drops, not header drops
    if (previewPosition.dropTarget !== "time-grid") {
      return null
    }
    const color = getDragItemColor(dragItem)
    // Bail if we can't determine the color
    if (!color) return null
    return {
      dayIndex: previewPosition.dayIndex,
      startMinutes: previewPosition.startMinutes ?? 0,
      durationMinutes: getDefaultDuration(dragItem.type),
      color,
      title: getDragItemTitle(dragItem),
    }
  }, [isDragging, dragItem, previewPosition])
  
  // Handle drop from external drag (time-grid or existing-block)
  const handleExternalDrop = React.useCallback((dayIndex: number, startMinutes: number) => {
    if (!dragItem) return
    
    // Use the preview position from drag context if it's a block drop
    const position = previewPosition && previewPosition.dropTarget === "existing-block"
      ? previewPosition
      : { dayIndex, startMinutes, dropTarget: "time-grid" as const }
    
    handleDrop(dragItem, position, weekDates)
  }, [dragItem, previewPosition, handleDrop, weekDates])
  
  // Handle deadline drop (header)
  const handleDeadlineDrop = React.useCallback((dayIndex: number) => {
    if (!dragItem || !dragContext) return
    handleDrop(dragItem, { dayIndex, dropTarget: "day-header" }, weekDates)
    dragContext.endDrag()
  }, [dragItem, dragContext, handleDrop, weekDates])
  
  // Keyboard shortcuts - uses hover state from useUnifiedSchedule
  const { toastMessage: calendarToastMessage } = useCalendarKeyboard({
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

  // Deadline toast state (separate from calendar toast)
  const [deadlineToastMessage, setDeadlineToastMessage] = React.useState<string | null>(null)
  
  // Auto-clear deadline toast
  React.useEffect(() => {
    if (deadlineToastMessage) {
      const timer = setTimeout(() => setDeadlineToastMessage(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [deadlineToastMessage])

  // Deadline keyboard shortcuts
  useDeadlineKeyboard({
    hoveredDeadline,
    onToggleComplete: toggleTaskComplete,
    onUnassign: clearTaskDeadline,
    showToast: setDeadlineToastMessage,
  })

  // Combined toast message (calendar takes precedence)
  const toastMessage = calendarToastMessage ?? deadlineToastMessage

  // Derive analytics data
  const analyticsCommitments = React.useMemo(() => 
    toAnalyticsItems(commitments, getCommitmentStats), 
    [commitments, getCommitmentStats]
  )
  const analyticsGoals = React.useMemo(() => 
    toAnalyticsItems(goals, getGoalStats), 
    [goals, getGoalStats]
  )

  // Handle goal creation from the backlog
  const handleCreateGoal = React.useCallback((data: NewGoalData) => {
    addGoal({
      id: crypto.randomUUID(),
      label: data.label,
      icon: data.icon,
      color: data.color,
      tasks: [],
    })
  }, [addGoal])

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
                showRightSidebar || selectedEvent ? "text-foreground" : "text-muted-foreground"
              )}
              onClick={() => {
                if (selectedEvent) {
                  // If block is selected, close it and show analytics
                  setSelectedEventId(null)
                  setShowRightSidebar(true)
                } else {
                  // Toggle analytics
                  setShowRightSidebar(!showRightSidebar)
                }
              }}
              title="Toggle analytics"
            >
              <RiPieChartLine className="size-4" />
            </button>
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <RiMoreFill className="size-4" />
            </button>
          </div>
        </ShellToolbar>
        <div className={`flex min-h-0 flex-1 ${showSidebar || showRightSidebar || selectedEvent ? "gap-4" : "gap-0"}`}>
          <div 
            className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              showSidebar ? "w-[420px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <Backlog 
              commitments={commitments as BacklogItem[]}
              goals={goals as BacklogItem[]}
              className="h-full w-[420px] max-w-none" 
              showTasks={showTasks}
              showCommitments={true}
              onToggleGoalTask={toggleTaskComplete}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtaskComplete}
              onUpdateSubtask={updateSubtask}
              onDeleteSubtask={deleteSubtask}
              onDeleteTask={deleteTask}
              getGoalStats={getGoalStats}
              getCommitmentStats={getCommitmentStats}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              draggable={true}
              // Commitment editing props
              mode={backlogMode}
              allCommitments={allCommitments as BacklogItem[]}
              enabledCommitmentIds={draftEnabledCommitmentIds ?? enabledCommitmentIds}
              mandatoryCommitmentIds={mandatoryCommitmentIds}
              onToggleCommitmentEnabled={toggleCommitmentEnabled}
              onEditCommitments={() => {
                startEditingCommitments()
                setBacklogMode("edit-commitments")
              }}
              onSaveCommitments={() => {
                saveCommitmentChanges()
                setBacklogMode("view")
              }}
              onCancelEditCommitments={() => {
                cancelCommitmentChanges()
                setBacklogMode("view")
              }}
              // Goal creation props
              onCreateGoal={handleCreateGoal}
              lifeAreas={LIFE_AREAS}
              goalIcons={GOAL_ICONS}
            />
          </div>
          <ShellContent className="overflow-hidden">
            {showCalendar && (
              <Calendar 
                events={calendarEvents} 
                mode={calendarMode}
                {...calendarHandlers}
                onEventClick={handleEventClick}
                enableExternalDrop={true}
                onExternalDrop={handleExternalDrop}
                externalDragPreview={externalDragPreview}
                onDeadlineDrop={handleDeadlineDrop}
                deadlines={weekDeadlines}
                onDeadlineToggleComplete={toggleTaskComplete}
                onDeadlineUnassign={clearTaskDeadline}
                onDeadlineHover={setHoveredDeadline}
              />
            )}
          </ShellContent>
          <div 
            className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              selectedEvent || showRightSidebar ? "w-[380px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            {selectedEvent && sidebarData ? (
              <BlockSidebar
                block={sidebarData.block}
                onClose={handleCloseSidebar}
                onTitleChange={handleSidebarTitleChange}
                onDateChange={handleSidebarDateChange}
                onStartTimeChange={handleSidebarStartTimeChange}
                onEndTimeChange={handleSidebarEndTimeChange}
                onNotesChange={handleSidebarNotesChange}
                onToggleGoalTask={handleSidebarToggleGoalTask}
                onCreateTask={handleSidebarCreateTask}
                onAddSubtask={handleSidebarAddSubtask}
                onToggleSubtask={handleSidebarToggleSubtask}
                onUpdateSubtask={handleSidebarUpdateSubtask}
                onDeleteSubtask={handleSidebarDeleteSubtask}
                availableGoalTasks={sidebarData.availableGoalTasks}
                onAssignTask={handleSidebarAssignTask}
                onUnassignTask={handleSidebarUnassignTask}
                // Goal task context callbacks
                onUpdateGoalTask={handleSidebarUpdateGoalTask}
                onAddGoalTaskSubtask={handleSidebarAddGoalTaskSubtask}
                onToggleGoalTaskSubtask={handleSidebarToggleGoalTaskSubtask}
                onUpdateGoalTaskSubtask={handleSidebarUpdateGoalTaskSubtask}
                onDeleteGoalTaskSubtask={handleSidebarDeleteGoalTaskSubtask}
                className="h-full w-[380px] max-w-none overflow-y-auto"
              />
            ) : (
              <WeeklyAnalytics 
                commitments={analyticsCommitments}
                goals={analyticsGoals}
                weekLabel="Jan 20 – 26"
                className="h-full w-[380px] max-w-none overflow-y-auto" 
              />
            )}
          </div>
        </div>
      </Shell>
      <KeyboardToast message={toastMessage} />
      <DragGhost />
      <KnobsToggle />
      <KnobsPanel>
        <KnobSelect
          label="Data Set"
          value={dataSetId}
          onChange={onDataSetChange}
          options={[
            { label: "Sample Data", value: "sample" },
            { label: "Empty", value: "empty" },
          ]}
        />
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
  const [dataSetId, setDataSetId] = React.useState<DataSetId>("sample")

  return (
    <DragProvider>
      {/* Key forces remount when data set changes, resetting all state */}
      <ShellDemoContent 
        key={dataSetId}
        dataSetId={dataSetId}
        onDataSetChange={setDataSetId}
      />
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
