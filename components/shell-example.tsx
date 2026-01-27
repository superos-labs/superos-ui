"use client";

import * as React from "react";
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell";
import {
  Calendar,
  KeyboardToast,
  useCalendarClipboard,
  useCalendarKeyboard,
  useDeadlineKeyboard,
  getWeekDates,
  formatWeekRange,
  type CalendarMode,
  type CalendarEvent,
} from "@/components/calendar";
import type { DeadlineTask } from "@/lib/unified-schedule";
import {
  Backlog,
  GoalInspirationGallery,
  type BacklogItem,
  type BacklogMode,
  type NewGoalData,
} from "@/components/backlog";
import { WeeklyAnalytics } from "@/components/weekly-analytics";
import { BlockSidebar, useBlockSidebarHandlers, type UseBlockSidebarHandlersReturn } from "@/components/block";
import { GoalDetail } from "@/components/goal-detail";
import type { ScheduleGoal } from "@/lib/unified-schedule";
import { FocusIndicator } from "@/components/focus";
import { useFocusSession } from "@/lib/focus";
import {
  DragProvider,
  DragGhost,
  useDragContextOptional,
} from "@/components/drag";
import { useUnifiedSchedule, useWeekNavigation } from "@/lib/unified-schedule";
import {
  getDefaultDuration,
  getDragItemTitle,
  getDragItemColor,
} from "@/lib/drag-types";
import { toAnalyticsItems } from "@/lib/adapters";

// Sample data from fixtures
import {
  DATA_SETS,
  ALL_COMMITMENTS,
  LIFE_AREAS,
  GOAL_ICONS,
  type DataSetId,
} from "@/lib/fixtures/shell-data";
import { INSPIRATION_CATEGORIES } from "@/lib/fixtures/goal-inspiration-data";

import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
  KnobSelect,
} from "@/components/_playground/knobs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMoreFill,
  RiSideBarLine,
  RiCheckLine,
  RiPieChartLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import { PreferencesProvider, usePreferences, type WeekStartDay } from "@/lib/preferences";

// =============================================================================
// Components
// =============================================================================

interface ShellDemoContentProps {
  dataSetId: DataSetId;
  onDataSetChange: (id: DataSetId) => void;
}

function ShellDemoContent({
  dataSetId,
  onDataSetChange,
}: ShellDemoContentProps) {
  // -------------------------------------------------------------------------
  // UI State
  // -------------------------------------------------------------------------
  const [showPlanWeek, setShowPlanWeek] = React.useState(true);
  const [showCalendar, setShowCalendar] = React.useState(true);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [showRightSidebar, setShowRightSidebar] = React.useState(false);
  const [showTasks, setShowTasks] = React.useState(true);
  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>("schedule");
  const [backlogMode, setBacklogMode] = React.useState<BacklogMode>("view");
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  
  // Goal detail mode state
  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(null);
  const [goalNotes, setGoalNotes] = React.useState<Record<string, string>>({});

  // -------------------------------------------------------------------------
  // Preferences
  // -------------------------------------------------------------------------
  const { weekStartsOn, setWeekStartsOn } = usePreferences();

  // -------------------------------------------------------------------------
  // Week Navigation
  // -------------------------------------------------------------------------
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());

  const weekDates = React.useMemo(
    () => getWeekDates(selectedDate, weekStartsOn),
    [selectedDate, weekStartsOn]
  );

  const goToPreviousWeek = React.useCallback(() => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const goToNextWeek = React.useCallback(() => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const goToToday = React.useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  useWeekNavigation({
    onPreviousWeek: goToPreviousWeek,
    onNextWeek: goToNextWeek,
    onToday: goToToday,
  });

  // -------------------------------------------------------------------------
  // Right Sidebar Content State
  // -------------------------------------------------------------------------
  const [renderedContent, setRenderedContent] = React.useState<"block" | "analytics" | null>(null);
  const [frozenSidebarData, setFrozenSidebarData] = React.useState<UseBlockSidebarHandlersReturn["sidebarData"]>(null);

  // -------------------------------------------------------------------------
  // Data & State
  // -------------------------------------------------------------------------
  const dataSet = DATA_SETS[dataSetId];

  const { copy, paste, hasContent: hasClipboardContent } = useCalendarClipboard();

  const schedule = useUnifiedSchedule({
    initialGoals: dataSet.goals,
    allCommitments: ALL_COMMITMENTS,
    initialEnabledCommitmentIds: dataSetId === "empty" ? [] : undefined,
    initialEvents: dataSet.events,
    weekDates,
    onCopy: copy,
    onPaste: paste,
    hasClipboardContent,
    onEventCreated: (event) => setSelectedEventId(event.id),
  });

  const {
    goals,
    commitments,
    allCommitments,
    events: calendarEvents,
    enabledCommitmentIds,
    draftEnabledCommitmentIds,
    mandatoryCommitmentIds,
    toggleCommitmentEnabled,
    startEditingCommitments,
    saveCommitmentChanges,
    cancelCommitmentChanges,
    getGoalStats,
    getCommitmentStats,
    getTaskSchedule,
    getTaskDeadline,
    getWeekDeadlines,
    addGoal,
    updateGoal,
    toggleTaskComplete,
    addTask,
    updateTask,
    addSubtask,
    toggleSubtaskComplete,
    updateSubtask,
    deleteSubtask,
    deleteTask,
    clearTaskDeadline,
    // Milestone CRUD
    addMilestone,
    updateMilestone,
    toggleMilestoneComplete,
    deleteMilestone,
    handleDrop,
    hoveredEvent,
    hoverPosition,
    calendarHandlers,
  } = schedule;

  // -------------------------------------------------------------------------
  // Deadline Hover State
  // -------------------------------------------------------------------------
  const [hoveredDeadline, setHoveredDeadline] = React.useState<DeadlineTask | null>(null);

  // -------------------------------------------------------------------------
  // Focus Mode
  // -------------------------------------------------------------------------
  const {
    session: focusSession,
    isRunning: focusIsRunning,
    elapsedMs: focusElapsedMs,
    start: startFocus,
    pause: pauseFocus,
    resume: resumeFocus,
    end: endFocus,
  } = useFocusSession({
    onSessionEnd: (completed) => {
      console.log("Focus session completed:", {
        blockId: completed.blockId,
        totalMs: completed.totalMs,
        segments: completed.segments.length,
      });
    },
  });

  // -------------------------------------------------------------------------
  // Derived Data
  // -------------------------------------------------------------------------
  const weekDeadlines = React.useMemo(
    () => getWeekDeadlines(weekDates),
    [getWeekDeadlines, weekDates]
  );

  const selectedEvent = selectedEventId
    ? (calendarEvents.find((e) => e.id === selectedEventId) ?? null)
    : null;

  // -------------------------------------------------------------------------
  // Toast State
  // -------------------------------------------------------------------------
  const [sidebarToastMessage, setSidebarToastMessage] = React.useState<string | null>(null);
  const [deadlineToastMessage, setDeadlineToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (sidebarToastMessage) {
      const timer = setTimeout(() => setSidebarToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [sidebarToastMessage]);

  React.useEffect(() => {
    if (deadlineToastMessage) {
      const timer = setTimeout(() => setDeadlineToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [deadlineToastMessage]);

  // -------------------------------------------------------------------------
  // Block Sidebar Handlers (extracted to hook)
  // -------------------------------------------------------------------------
  const { sidebarData, availableGoals, handlers: sidebarHandlers } = useBlockSidebarHandlers({
    selectedEvent,
    goals,
    commitments,
    weekDates,
    schedule: {
      updateEvent: schedule.updateEvent,
      updateTask,
      toggleTaskComplete,
      addTask,
      addSubtask,
      toggleSubtaskComplete,
      updateSubtask,
      deleteSubtask,
      assignTaskToBlock: schedule.assignTaskToBlock,
      unassignTaskFromBlock: schedule.unassignTaskFromBlock,
      calendarHandlers,
    },
    onToast: setSidebarToastMessage,
    // End focus session when marking the focused block as complete
    onEndFocus: focusSession?.blockId === selectedEvent?.id ? endFocus : undefined,
  });

  // -------------------------------------------------------------------------
  // Right Sidebar Content Management
  // -------------------------------------------------------------------------
  const targetContent: "block" | "analytics" | null = selectedEvent
    ? "block"
    : showRightSidebar
      ? "analytics"
      : null;

  React.useEffect(() => {
    if (targetContent !== null) {
      setRenderedContent(targetContent);
    }
  }, [targetContent]);

  React.useEffect(() => {
    if (sidebarData) {
      setFrozenSidebarData(sidebarData);
    }
  }, [sidebarData]);

  const isRightSidebarOpen = targetContent !== null;
  const sidebarDataToRender = selectedEvent ? sidebarData : frozenSidebarData;

  // -------------------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------------------
  const handleEventClick = React.useCallback((event: CalendarEvent) => {
    setSelectedEventId(event.id);
  }, []);

  const handleCloseSidebar = React.useCallback(() => {
    setSelectedEventId(null);
  }, []);

  // ESC key to close sidebar
  React.useEffect(() => {
    if (!selectedEventId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEventId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEventId]);

  // -------------------------------------------------------------------------
  // Focus Mode Handlers
  // -------------------------------------------------------------------------
  const handleStartFocus = React.useCallback(() => {
    if (!selectedEvent) return;
    startFocus(selectedEvent.id, selectedEvent.title, selectedEvent.color);
  }, [selectedEvent, startFocus]);

  const handleNavigateToFocusedBlock = React.useCallback(() => {
    if (focusSession) {
      setSelectedEventId(focusSession.blockId);
    }
  }, [focusSession]);

  const isSidebarBlockFocused = focusSession?.blockId === selectedEventId;
  const showFocusIndicator = focusSession !== null && selectedEventId !== focusSession.blockId;

  // -------------------------------------------------------------------------
  // External Drag & Drop
  // -------------------------------------------------------------------------
  const dragContext = useDragContextOptional();
  const dragState = dragContext?.state ?? null;
  const isDragging = dragState?.isDragging ?? false;
  const dragItem = dragState?.item ?? null;
  const previewPosition = dragState?.previewPosition ?? null;

  const externalDragPreview = React.useMemo(() => {
    if (!isDragging || !dragItem || !previewPosition) return null;
    if (previewPosition.dropTarget !== "time-grid") return null;
    
    const color = getDragItemColor(dragItem);
    if (!color) return null;
    
    return {
      dayIndex: previewPosition.dayIndex,
      startMinutes: previewPosition.startMinutes ?? 0,
      durationMinutes: getDefaultDuration(dragItem.type),
      color,
      title: getDragItemTitle(dragItem),
    };
  }, [isDragging, dragItem, previewPosition]);

  const handleExternalDrop = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      if (!dragItem) return;
      const position =
        previewPosition && previewPosition.dropTarget === "existing-block"
          ? previewPosition
          : { dayIndex, startMinutes, dropTarget: "time-grid" as const };
      handleDrop(dragItem, position, weekDates);
    },
    [dragItem, previewPosition, handleDrop, weekDates]
  );

  const handleDeadlineDrop = React.useCallback(
    (dayIndex: number) => {
      if (!dragItem || !dragContext) return;
      handleDrop(dragItem, { dayIndex, dropTarget: "day-header" }, weekDates);
      dragContext.endDrag();
    },
    [dragItem, dragContext, handleDrop, weekDates]
  );

  // -------------------------------------------------------------------------
  // Keyboard Shortcuts
  // -------------------------------------------------------------------------
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
      const newStatus = currentStatus === "completed" ? "planned" : "completed";
      calendarHandlers.onEventStatusChange(eventId, newStatus);
    },
  });

  useDeadlineKeyboard({
    hoveredDeadline,
    onToggleComplete: toggleTaskComplete,
    onUnassign: clearTaskDeadline,
    showToast: setDeadlineToastMessage,
  });

  const toastMessage = calendarToastMessage ?? sidebarToastMessage ?? deadlineToastMessage;

  // -------------------------------------------------------------------------
  // Analytics Data
  // -------------------------------------------------------------------------
  const analyticsCommitments = React.useMemo(
    () => toAnalyticsItems(commitments, getCommitmentStats),
    [commitments, getCommitmentStats]
  );
  const analyticsGoals = React.useMemo(
    () => toAnalyticsItems(goals, getGoalStats),
    [goals, getGoalStats]
  );

  // -------------------------------------------------------------------------
  // Goal Creation
  // -------------------------------------------------------------------------
  const handleCreateGoal = React.useCallback(
    (data: NewGoalData) => {
      const newGoalId = crypto.randomUUID();
      addGoal({
        id: newGoalId,
        label: data.label,
        icon: data.icon,
        color: data.color,
        lifeAreaId: data.lifeAreaId,
        tasks: [],
      });
      // Optionally select the newly created goal
      if (backlogMode === "goal-detail") {
        setSelectedGoalId(newGoalId);
      }
    },
    [addGoal, backlogMode]
  );

  // -------------------------------------------------------------------------
  // Inspiration Gallery State (separate from backlog mode)
  // -------------------------------------------------------------------------
  const [showInspirationGallery, setShowInspirationGallery] = React.useState(false);

  const handleBrowseInspiration = React.useCallback(() => {
    setShowInspirationGallery(true);
    // Clear selected goal so nothing appears active in the goal list
    setSelectedGoalId(null);
  }, []);

  const handleCloseInspiration = React.useCallback(() => {
    setShowInspirationGallery(false);
  }, []);

  // -------------------------------------------------------------------------
  // Goal Detail Mode
  // -------------------------------------------------------------------------
  const isGoalDetailMode = backlogMode === "goal-detail";
  
  // Get the currently selected goal
  const selectedGoal = selectedGoalId
    ? (goals.find((g) => g.id === selectedGoalId) as ScheduleGoal | undefined)
    : undefined;

  // Look up life area for the selected goal
  const selectedGoalLifeArea = React.useMemo(() => {
    if (!selectedGoal?.lifeAreaId) return undefined;
    return LIFE_AREAS.find((area) => area.id === selectedGoal.lifeAreaId);
  }, [selectedGoal]);

  // Get stats for selected goal
  const selectedGoalStats = selectedGoalId ? getGoalStats(selectedGoalId) : { plannedHours: 0, completedHours: 0 };

  // Enter goal detail mode
  const handleSelectGoal = React.useCallback((goalId: string) => {
    setSelectedGoalId(goalId);
    setBacklogMode("goal-detail");
    // Close inspiration gallery if open
    setShowInspirationGallery(false);
    // Close any open right sidebar content
    setSelectedEventId(null);
    setShowRightSidebar(false);
  }, []);

  // Exit goal detail mode
  const handleCloseGoalDetail = React.useCallback(() => {
    setSelectedGoalId(null);
    setBacklogMode("view");
  }, []);

  // Handle goal notes change
  const handleGoalNotesChange = React.useCallback((notes: string) => {
    if (selectedGoalId) {
      setGoalNotes((prev) => ({ ...prev, [selectedGoalId]: notes }));
    }
  }, [selectedGoalId]);

  // -------------------------------------------------------------------------
  // Plan Week Toggle
  // -------------------------------------------------------------------------
  const isPlanning = calendarMode === "blueprint";

  const handlePlanWeekClick = () => {
    setCalendarMode(isPlanning ? "schedule" : "blueprint");
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
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
            <button
              onClick={goToPreviousWeek}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              title="Previous week (←)"
            >
              <RiArrowLeftSLine className="size-4" />
            </button>
            <button
              onClick={goToToday}
              className="flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              title="Go to today (T)"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              title="Next week (→)"
            >
              <RiArrowRightSLine className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {showFocusIndicator && focusSession && (
              <FocusIndicator
                blockTitle={focusSession.blockTitle}
                blockColor={focusSession.blockColor}
                elapsedMs={focusElapsedMs}
                isRunning={focusIsRunning}
                onPause={pauseFocus}
                onResume={resumeFocus}
                onClick={handleNavigateToFocusedBlock}
              />
            )}
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
                showRightSidebar || selectedEvent
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => {
                if (selectedEvent) {
                  setSelectedEventId(null);
                  setShowRightSidebar(true);
                } else {
                  setShowRightSidebar(!showRightSidebar);
                }
              }}
              title="Toggle analytics"
            >
              <RiPieChartLine className="size-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
                  <RiMoreFill className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Week starts on</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={weekStartsOn.toString()}
                  onValueChange={(v) => setWeekStartsOn(Number(v) as WeekStartDay)}
                >
                  <DropdownMenuRadioItem value="1">Monday</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="0">Sunday</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ShellToolbar>

        <div className={`flex min-h-0 flex-1 ${showSidebar || isRightSidebarOpen ? "gap-4" : "gap-0"}`}>
          {/* Left Sidebar - Backlog */}
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
              mode={backlogMode}
              allCommitments={allCommitments as BacklogItem[]}
              enabledCommitmentIds={draftEnabledCommitmentIds ?? enabledCommitmentIds}
              mandatoryCommitmentIds={mandatoryCommitmentIds}
              onToggleCommitmentEnabled={toggleCommitmentEnabled}
              onEditCommitments={() => {
                startEditingCommitments();
                setBacklogMode("edit-commitments");
              }}
              onSaveCommitments={() => {
                saveCommitmentChanges();
                setBacklogMode("view");
              }}
              onCancelEditCommitments={() => {
                cancelCommitmentChanges();
                setBacklogMode("view");
              }}
              onCreateGoal={handleCreateGoal}
              lifeAreas={LIFE_AREAS}
              goalIcons={GOAL_ICONS}
              // Goal detail mode props
              selectedGoalId={selectedGoalId}
              onSelectGoal={handleSelectGoal}
              onBrowseInspiration={handleBrowseInspiration}
              isInspirationActive={showInspirationGallery}
            />
          </div>

          {/* Main Content - Calendar, Goal Detail, or Inspiration Gallery */}
          <ShellContent className="overflow-hidden">
            {showInspirationGallery ? (
              <GoalInspirationGallery
                categories={INSPIRATION_CATEGORIES}
                onAddGoal={handleCreateGoal}
                onClose={handleCloseInspiration}
                className="h-full"
              />
            ) : isGoalDetailMode && selectedGoal ? (
              <GoalDetail
                goal={selectedGoal}
                lifeArea={selectedGoalLifeArea}
                stats={selectedGoalStats}
                notes={goalNotes[selectedGoal.id] ?? ""}
                onNotesChange={handleGoalNotesChange}
                onTitleChange={(title) => updateGoal(selectedGoal.id, { label: title })}
                getTaskSchedule={getTaskSchedule}
                getTaskDeadline={getTaskDeadline}
                onToggleTask={(taskId) => toggleTaskComplete(selectedGoal.id, taskId)}
                onAddTask={(label) => addTask(selectedGoal.id, label)}
                onUpdateTask={(taskId, updates) => updateTask(selectedGoal.id, taskId, updates)}
                onDeleteTask={(taskId) => deleteTask(selectedGoal.id, taskId)}
                onAddSubtask={(taskId, label) => addSubtask(selectedGoal.id, taskId, label)}
                onToggleSubtask={(taskId, subtaskId) => toggleSubtaskComplete(selectedGoal.id, taskId, subtaskId)}
                onUpdateSubtask={(taskId, subtaskId, label) => updateSubtask(selectedGoal.id, taskId, subtaskId, label)}
                onDeleteSubtask={(taskId, subtaskId) => deleteSubtask(selectedGoal.id, taskId, subtaskId)}
                onAddMilestone={(label) => addMilestone(selectedGoal.id, label)}
                onToggleMilestone={(milestoneId) => toggleMilestoneComplete(selectedGoal.id, milestoneId)}
                onUpdateMilestone={(milestoneId, label) => updateMilestone(selectedGoal.id, milestoneId, label)}
                onDeleteMilestone={(milestoneId) => deleteMilestone(selectedGoal.id, milestoneId)}
                onClose={handleCloseGoalDetail}
                className="h-full"
              />
            ) : showCalendar ? (
              <Calendar
                selectedDate={selectedDate}
                events={calendarEvents}
                mode={calendarMode}
                weekStartsOn={weekStartsOn}
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
            ) : null}
          </ShellContent>

          {/* Right Sidebar - Block Details / Analytics */}
          <div
            className={cn(
              "shrink-0 overflow-hidden transition-all duration-300 ease-out",
              isRightSidebarOpen ? "w-[380px] opacity-100" : "w-0 opacity-0"
            )}
          >
            {renderedContent === "block" && sidebarDataToRender ? (
              <BlockSidebar
                block={sidebarDataToRender.block}
                availableGoalTasks={sidebarDataToRender.availableGoalTasks}
                availableGoals={availableGoals}
                onClose={handleCloseSidebar}
                {...sidebarHandlers}
                isFocused={isSidebarBlockFocused}
                focusIsRunning={focusIsRunning}
                focusElapsedMs={focusElapsedMs}
                onStartFocus={handleStartFocus}
                onPauseFocus={pauseFocus}
                onResumeFocus={resumeFocus}
                onEndFocus={endFocus}
                focusDisabled={focusSession !== null && !isSidebarBlockFocused}
                className="h-full w-[380px] max-w-none overflow-y-auto"
              />
            ) : renderedContent === "analytics" ? (
              <WeeklyAnalytics
                commitments={analyticsCommitments}
                goals={analyticsGoals}
                weekLabel={formatWeekRange(weekDates)}
                className="h-full w-[380px] max-w-none overflow-y-auto"
              />
            ) : null}
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
        <KnobBoolean label="Show Sidebar" value={showSidebar} onChange={setShowSidebar} />
        <KnobBoolean label="Show Analytics" value={showRightSidebar} onChange={setShowRightSidebar} />
        <KnobBoolean label="Show Plan Week button" value={showPlanWeek} onChange={setShowPlanWeek} />
        <KnobBoolean label="Show Calendar" value={showCalendar} onChange={setShowCalendar} />
      </KnobsPanel>
    </>
  );
}

function ShellDemo() {
  const [dataSetId, setDataSetId] = React.useState<DataSetId>("sample");

  return (
    <PreferencesProvider>
      <DragProvider>
        <ShellDemoContent
          key={dataSetId}
          dataSetId={dataSetId}
          onDataSetChange={setDataSetId}
        />
      </DragProvider>
    </PreferencesProvider>
  );
}

export function ShellExample() {
  return (
    <KnobsProvider>
      <ShellDemo />
    </KnobsProvider>
  );
}
