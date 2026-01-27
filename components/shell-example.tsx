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
  type CalendarEvent,
} from "@/components/calendar";
import type { DeadlineTask } from "@/lib/unified-schedule";
import {
  Backlog,
  GoalInspirationGallery,
  type BacklogItem,
  type NewGoalData,
} from "@/components/backlog";
import { WeeklyAnalytics } from "@/components/weekly-analytics";
import { BlockSidebar, useBlockSidebarHandlers } from "@/components/block";
import { GoalDetail } from "@/components/goal-detail";
import type { ScheduleGoal } from "@/lib/unified-schedule";
import { FocusIndicator } from "@/components/focus";
import { useFocusSession, useFocusNotifications } from "@/lib/focus";
import {
  DragProvider,
  DragGhost,
  useDragContextOptional,
} from "@/components/drag";
import { useUnifiedSchedule, useWeekNavigation, useCommitmentAutoComplete } from "@/lib/unified-schedule";
import { toAnalyticsItems } from "@/lib/adapters";

// Shell-specific hooks (internal demo utilities)
import {
  useShellLayout,
  useShellFocus,
  useExternalDragPreview,
  useToastAggregator,
} from "./use-shell-hooks";

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
import { PreferencesProvider, usePreferences, type WeekStartDay, type ProgressMetric } from "@/lib/preferences";

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
  // UI Layout State (extracted to hook)
  // -------------------------------------------------------------------------
  const layout = useShellLayout();
  const {
    showPlanWeek,
    setShowPlanWeek,
    showCalendar,
    setShowCalendar,
    showSidebar,
    setShowSidebar,
    showRightSidebar,
    setShowRightSidebar,
    showTasks,
    setShowTasks,
    showInspirationGallery,
    calendarMode,
    setCalendarMode,
    backlogMode,
    setBacklogMode,
    selectedEventId,
    setSelectedEventId,
    selectedGoalId,
    setSelectedGoalId,
    goalNotes,
    renderedContent,
    frozenSidebarData,
    isRightSidebarOpen,
    updateFrozenSidebarData,
    isPlanning,
    isGoalDetailMode,
    handleEventClick,
    handleCloseSidebar,
    handleSelectGoal,
    handleCloseGoalDetail,
    handleBrowseInspiration,
    handleCloseInspiration,
    handlePlanWeekClick,
    handleGoalNotesChange,
    handleAnalyticsToggle,
  } = layout;

  // -------------------------------------------------------------------------
  // Preferences
  // -------------------------------------------------------------------------
  const { 
    weekStartsOn, 
    setWeekStartsOn,
    progressMetric,
    setProgressMetric,
    autoCompleteCommitments,
  } = usePreferences();

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
  // Use ref to avoid stale closure in onSessionEnd callback
  const calendarEventsRef = React.useRef(calendarEvents);
  React.useEffect(() => {
    calendarEventsRef.current = calendarEvents;
  }, [calendarEvents]);

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
      // Find the event using ref to get current value (avoid stale closure)
      const event = calendarEventsRef.current.find((e) => e.id === completed.blockId);
      if (!event) return;
      
      // Skip commitments (they don't track focus time)
      if (event.blockType === "commitment") return;
      
      // Accumulate focus time on the event (round to whole minutes)
      const additionalMinutes = Math.round(completed.totalMs / 60000);
      schedule.updateEvent(completed.blockId, {
        focusedMinutes: (event.focusedMinutes ?? 0) + additionalMinutes,
      });
    },
  });

  // -------------------------------------------------------------------------
  // Commitment Auto-Complete
  // -------------------------------------------------------------------------
  useCommitmentAutoComplete({
    events: calendarEvents,
    enabled: autoCompleteCommitments,
    markComplete: schedule.markEventComplete,
  });

  // -------------------------------------------------------------------------
  // Focus Notifications
  // -------------------------------------------------------------------------
  useFocusNotifications({
    session: focusSession,
    events: calendarEvents,
    enabled: true,
    onNotify: () => {
      // Could play a sound here in the future
      console.log("Focus session: block time ended");
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
  // Keyboard Shortcuts & Toast Aggregation
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

  // Toast aggregation (extracted to hook) - must be before useBlockSidebarHandlers
  const toasts = useToastAggregator(calendarToastMessage);
  const { toastMessage } = toasts;

  useDeadlineKeyboard({
    hoveredDeadline,
    onToggleComplete: toggleTaskComplete,
    onUnassign: clearTaskDeadline,
    showToast: toasts.setDeadlineToast,
  });

  // -------------------------------------------------------------------------
  // Focus Mode Computed Values (extracted to hook)
  // -------------------------------------------------------------------------
  const { isSidebarBlockFocused, showFocusIndicator, handleStartFocus, handleNavigateToFocusedBlock } =
    useShellFocus({
      focusSession,
      selectedEventId,
      selectedEvent,
      startFocus,
      onNavigateToBlock: setSelectedEventId,
    });

  // -------------------------------------------------------------------------
  // External Drag & Drop (extracted to hook)
  // -------------------------------------------------------------------------
  const dragContext = useDragContextOptional();
  const { externalDragPreview, handleExternalDrop, handleDeadlineDrop } = useExternalDragPreview({
    dragContext,
    weekDates,
    onDrop: handleDrop,
  });

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
    onToast: toasts.setSidebarToast,
    // End focus session when marking the focused block as complete
    onEndFocus: focusSession?.blockId === selectedEvent?.id ? endFocus : undefined,
  });

  // Update frozen sidebar data for animation
  React.useEffect(() => {
    updateFrozenSidebarData(sidebarData);
  }, [sidebarData, updateFrozenSidebarData]);

  const sidebarDataToRender = selectedEvent ? sidebarData : frozenSidebarData;

  // -------------------------------------------------------------------------
  // Analytics Data
  // -------------------------------------------------------------------------
  const useFocusedHours = progressMetric === "focused";
  const analyticsCommitments = React.useMemo(
    () => toAnalyticsItems(commitments, getCommitmentStats, { useFocusedHours }),
    [commitments, getCommitmentStats, useFocusedHours]
  );
  const analyticsGoals = React.useMemo(
    () => toAnalyticsItems(goals, getGoalStats, { useFocusedHours }),
    [goals, getGoalStats, useFocusedHours]
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
  // Goal Detail Mode Derived Data
  // -------------------------------------------------------------------------
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
  const selectedGoalStats = selectedGoalId ? getGoalStats(selectedGoalId) : { plannedHours: 0, completedHours: 0, focusedHours: 0 };

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
              onClick={handleAnalyticsToggle}
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
                // Focus time tracking (only for goal/task blocks)
                totalFocusedMinutes={
                  selectedEvent?.blockType !== "commitment" 
                    ? (selectedEvent?.focusedMinutes ?? 0) 
                    : undefined
                }
                onFocusedMinutesChange={
                  selectedEvent?.blockType !== "commitment" && selectedEvent
                    ? (minutes) => schedule.updateEvent(selectedEvent.id, { focusedMinutes: minutes })
                    : undefined
                }
                className="h-full w-[380px] max-w-none overflow-y-auto"
              />
            ) : renderedContent === "analytics" ? (
              <WeeklyAnalytics
                commitments={analyticsCommitments}
                goals={analyticsGoals}
                weekLabel={formatWeekRange(weekDates)}
                progressMetric={progressMetric}
                onProgressMetricChange={setProgressMetric}
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
