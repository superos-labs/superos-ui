"use client";

/**
 * ShellContent - The core shell component for orchestrating the full application UI.
 *
 * This component handles the rendering of the calendar, backlog, analytics,
 * focus mode, and planning features. It manages its own UI layout state
 * (panel visibility, selections) while accepting business data and handlers via props.
 *
 * This is a feature component - it does NOT contain sample data or demo logic.
 *
 * Responsive behavior:
 * - Mobile/Tablet Portrait: Day view, bottom sheet for block details, full-screen overlay for backlog
 * - Tablet Landscape: Week view, bottom sheet for block details, full-screen overlay for backlog
 * - Desktop: Week view, inline sidebars for backlog and block details
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shell,
  ShellContent as ShellContentPrimitive,
} from "@/components/ui/shell";
import {
  BottomSheet,
  FullScreenOverlay,
  KeyboardShortcuts,
} from "@/components/ui";
import {
  Calendar,
  useCalendarKeyboard,
  useDeadlineKeyboard,
  formatWeekRange,
  type CalendarEvent,
} from "@/components/calendar";
import { UndoToast, SimpleToast } from "@/components/ui";
import { useUndoOptional, useUndoKeyboard } from "@/lib/undo";
import {
  Backlog,
  GoalInspirationGallery,
  OnboardingGoalsCard,
  type BacklogItem,
  type InspirationCategory,
} from "@/components/backlog";
import { ONBOARDING_GOAL_SUGGESTIONS } from "@/lib/fixtures/onboarding-goals";
import { WeeklyAnalytics, PlanningBudget } from "@/components/weekly-analytics";
import { buildPlanningBudgetData } from "@/lib/adapters";
import { BlockSidebar, useBlockSidebarHandlers } from "@/components/block";
import { GoalDetail } from "@/components/goal-detail";
import { FocusIndicator } from "@/components/focus";
import { DragGhost, useDragContextOptional } from "@/components/drag";
import {
  PlanningPanel,
  BlueprintBacklog,
  PlanWeekPromptCard,
  UpcomingDeadlinesCard,
} from "@/components/weekly-planning";
import {
  LifeAreaCreatorModal,
  LifeAreaManagerModal,
} from "@/components/settings";
import { IntegrationsSidebar } from "@/components/integrations";
import { toAnalyticsItems } from "@/lib/adapters";
import type { ScheduleGoal, DeadlineTask } from "@/lib/unified-schedule";
import { useBreakpoint } from "@/lib/responsive";
import { cn } from "@/lib/utils";
import type { WeekStartDay, ProgressMetric } from "@/lib/preferences";
import {
  MIN_CALENDAR_ZOOM,
  MAX_CALENDAR_ZOOM,
  CALENDAR_ZOOM_STEP,
} from "@/lib/preferences";
import type { ShellContentProps } from "./shell-types";
import { useShellLayout } from "./use-shell-layout";
import { useShellFocus } from "./use-shell-focus";
import { useExternalDragPreview } from "./use-external-drag-preview";
import { useToastAggregator } from "./use-toast-aggregator";
import { useUndoableHandlers } from "./use-undoable-handlers";
import { FeedbackButton } from "./feedback-button";
import { useMobileNavigation } from "./use-mobile-navigation";
import { useGoalHandlers } from "./use-goal-handlers";
import { usePlanningIntegration } from "./use-planning-integration";
import { useBlueprintHandlers } from "./use-blueprint-handlers";
import {
  ShellMobileToolbar,
  ShellDesktopToolbar,
  BlueprintEditToolbar,
  OnboardingBlueprintToolbar,
} from "./shell-toolbars";

// Re-export for consumers
export type { ShellContentProps };

// =============================================================================
// Component Props (extending the core props with UI-specific options)
// =============================================================================

export interface ShellContentComponentProps extends ShellContentProps {
  /** Categories for goal inspiration gallery */
  inspirationCategories?: InspirationCategory[];
  /** Callback when UI layout changes (for persistence) */
  onLayoutChange?: (layout: {
    showSidebar: boolean;
    showRightSidebar: boolean;
  }) => void;
}

// =============================================================================
// Component Implementation
// =============================================================================

export function ShellContentComponent({
  // Data
  goals,
  essentials,
  allEssentials,
  events,
  weekDates,
  weekDeadlines,
  weekGoalDeadlines,
  weekMilestoneDeadlines,
  quarterDeadlines,
  // Selection (passed in for coordination)
  selectedEventId: selectedEventIdProp,
  selectedGoalId: selectedGoalIdProp,
  hoveredEvent,
  hoverPosition,
  hoveredDayIndex,
  // Essential management
  enabledEssentialIds,
  draftEnabledEssentialIds,
  onToggleEssentialEnabled,
  onStartEditingEssentials,
  onSaveEssentialChanges,
  onCancelEssentialChanges,
  onCreateEssential,
  onDeleteEssential,
  // Day boundaries
  dayStartMinutes,
  dayEndMinutes,
  onDayBoundariesChange,
  dayBoundariesEnabled,
  onDayBoundariesEnabledChange,
  dayBoundariesDisplay,
  onDayBoundariesDisplayChange,
  // Essential templates
  essentialTemplates,
  onSaveEssentialSchedule,
  onImportEssentialsToWeek,
  // Goal CRUD
  onAddGoal,
  onDeleteGoal,
  onUpdateGoal,
  // Task CRUD
  onToggleTaskComplete,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  // Subtask CRUD
  onAddSubtask,
  onToggleSubtaskComplete,
  onUpdateSubtask,
  onDeleteSubtask,
  // Milestone CRUD
  onAddMilestone,
  onToggleMilestoneComplete,
  onUpdateMilestone,
  onUpdateMilestoneDeadline,
  onDeleteMilestone,
  onToggleMilestonesEnabled,
  // Deadline management
  onClearTaskDeadline,
  // Stats accessors
  getGoalStats,
  getEssentialStats,
  getTaskSchedule,
  getTaskDeadline,
  // Calendar handlers
  calendarHandlers,
  // Event management
  onAddEvent,
  onUpdateEvent,
  onReplaceEvents,
  onAssignTaskToBlock,
  onUnassignTaskFromBlock,
  onUpdateBlockSyncSettings,
  onUpdateGoalSyncSettings,
  // Drop handling
  onDrop,
  // Focus mode
  focusSession,
  focusIsRunning,
  focusElapsedMs,
  onStartFocus,
  onPauseFocus,
  onResumeFocus,
  onEndFocus,
  // Blueprint & planning
  blueprint,
  hasBlueprint,
  onSaveBlueprint,
  currentWeekPlan,
  onSaveWeeklyPlan,
  hasWeeklyPlan,
  onSetWeeklyFocus,
  // Preferences
  weekStartsOn,
  onWeekStartsOnChange,
  progressMetric,
  onProgressMetricChange,
  calendarZoom,
  onCalendarZoomChange,
  // Navigation
  selectedDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  // Reference data
  lifeAreas,
  customLifeAreas,
  goalIcons,
  // Life area management
  onAddLifeArea,
  onUpdateLifeArea,
  onRemoveLifeArea,
  // UI-specific props
  inspirationCategories,
  onLayoutChange,
  // Development
  onSkipOnboarding,
  // Calendar integrations
  calendarIntegrations,
  externalEvents,
  allDayEvents,
  integrationsSidebar,
  onConnectProvider,
  onDisconnectProvider,
  // Import settings callbacks
  onToggleImportEnabled,
  onToggleCalendarImport,
  onToggleMeetingsOnly,
  // Export settings callbacks
  onToggleCalendarExport,
  onToggleExportEnabled,
  onSetExportParticipation,
  onSetExportGoalFilter,
  onSetExportDefaultAppearance,
  onSetExportCustomLabel,
  onUpdateExternalEvent,
}: ShellContentComponentProps) {
  // -------------------------------------------------------------------------
  // Responsive Breakpoint Detection
  // -------------------------------------------------------------------------
  const {
    isMobile,
    isTablet,
    isTabletPortrait,
    isTabletLandscape,
    isDesktop,
    isTouchDevice,
  } = useBreakpoint();

  // Determine if we should use mobile/tablet layout (overlays instead of sidebars)
  const useMobileLayout = isMobile || isTablet;
  const shouldShowWeekView = isTabletLandscape || isDesktop;

  // -------------------------------------------------------------------------
  // Undo System Integration
  // -------------------------------------------------------------------------
  const undoContext = useUndoOptional();

  const getTask = React.useCallback(
    (goalId: string, taskId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      return goal?.tasks?.find((t) => t.id === taskId);
    },
    [goals]
  );

  const getEvent = React.useCallback(
    (eventId: string) => events.find((e) => e.id === eventId),
    [events]
  );

  const getEventsForDay = React.useCallback(
    (dayIndex: number) => events.filter((e) => e.dayIndex === dayIndex),
    [events]
  );

  const getDeadlineTasksForDay = React.useCallback(
    (dayIndex: number) => {
      const dateStr = weekDates[dayIndex]?.toISOString().split("T")[0];
      if (!dateStr) return [];
      const deadlines = weekDeadlines.get(dateStr) ?? [];
      return deadlines.map((d) => ({
        goalId: d.goalId,
        taskId: d.taskId,
        completed: d.completed,
      }));
    },
    [weekDates, weekDeadlines]
  );

  const undoableHandlers = useUndoableHandlers({
    onToggleTaskComplete,
    onDeleteTask,
    onUnassignTaskFromBlock,
    onAssignTaskToBlock,
    onAddTask,
    onUpdateTask,
    onUpdateEvent,
    onAddEvent,
    calendarHandlers,
    getTask,
    getEvent,
    getEventsForDay,
    getDeadlineTasksForDay,
  });

  const enhancedCalendarHandlers = undoableHandlers.calendarHandlers;
  const enhancedToggleTaskComplete = undoableHandlers.onToggleTaskComplete;
  const enhancedDeleteTask = undoableHandlers.onDeleteTask;
  const enhancedUnassignTaskFromBlock = undoableHandlers.onUnassignTaskFromBlock;

  // -------------------------------------------------------------------------
  // Local UI State
  // -------------------------------------------------------------------------
  const [showBacklogOverlay, setShowBacklogOverlay] = React.useState(false);
  const [isEssentialsHidden, setIsEssentialsHidden] = React.useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] =
    React.useState(false);
  const [showLifeAreaCreator, setShowLifeAreaCreator] = React.useState(false);
  const [showLifeAreaManager, setShowLifeAreaManager] = React.useState(false);
  const [lifeAreaCreatorForGoalId, setLifeAreaCreatorForGoalId] =
    React.useState<string | null>(null);

  // Global ? key to open keyboard shortcuts
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("contenteditable") === "true"
      ) {
        return;
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // -------------------------------------------------------------------------
  // UI Layout State (from hook)
  // -------------------------------------------------------------------------
  const layout = useShellLayout({
    initialGoalsCount: goals.length,
  });

  const [scrollToCurrentTimeKey, setScrollToCurrentTimeKey] = React.useState(
    () => Date.now()
  );

  const handleTodayClick = React.useCallback(() => {
    onToday();
    setScrollToCurrentTimeKey(Date.now());
  }, [onToday]);

  const {
    showPlanWeek,
    showCalendar,
    showSidebar,
    setShowSidebar,
    showRightSidebar,
    setShowRightSidebar,
    showTasks,
    setShowTasks,
    showInspirationGallery,
    backlogMode,
    setBacklogMode,
    selectedEventId,
    setSelectedEventId,
    selectedGoalId,
    setSelectedGoalId,
    goalNotes,
    renderedContent,
    setRenderedContent,
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
    isPlanningMode,
    setIsPlanningMode,
    isBlueprintEditMode,
    enterBlueprintEditMode,
    exitBlueprintEditMode,
    onboardingStep,
    isOnboarding,
    isOnboardingBlueprint,
    isOnboardingGoalsCentered,
    onContinueFromGoals,
    onCompleteOnboarding,
    onCompleteOnboardingIntoPlanning,
    onSkipBlueprintCreation,
    showPlanWeekPrompt,
    onDismissPlanWeekPrompt,
    onStartPlanningFromPrompt,
  } = layout;

  // -------------------------------------------------------------------------
  // Extracted Hooks
  // -------------------------------------------------------------------------

  // Mobile day navigation
  const mobileNav = useMobileNavigation({
    weekDates,
    selectedDate,
    onPreviousWeek,
    onNextWeek,
  });

  // Goal creation, deletion, onboarding
  const goalHandlers = useGoalHandlers({
    goals,
    goalIcons,
    lifeAreas,
    onAddGoal,
    onDeleteGoal,
    onUpdateGoal,
    backlogMode,
    setBacklogMode,
    selectedGoalId,
    setSelectedGoalId,
    handleCloseInspiration,
  });

  // Planning flow integration
  const planningIntegration = usePlanningIntegration({
    isPlanningMode,
    setIsPlanningMode,
    weekDates,
    events,
    onSaveWeeklyPlan,
    onSetWeeklyFocus,
    onSaveBlueprint,
    onAddEvent,
    hasBlueprint,
    blueprint,
    hasWeeklyPlan,
    calendarIntegrations,
    onImportEssentialsToWeek,
    isPlanning,
    isOnboardingBlueprint,
    setShowRightSidebar,
  });

  // Blueprint editing & essentials sync
  const blueprintHandlers = useBlueprintHandlers({
    blueprint,
    events,
    weekDates,
    weekStartsOn,
    onReplaceEvents,
    onSaveBlueprint,
    onAddEvent,
    enterBlueprintEditMode,
    exitBlueprintEditMode,
    isBlueprintEditMode,
    hasWeeklyPlan,
    onCompleteOnboardingIntoPlanning,
    onSkipBlueprintCreation,
    allEssentials,
    essentialTemplates,
    calendarHandlers,
    onCreateEssential,
    onDeleteEssential,
    onSaveEssentialSchedule,
  });

  // -------------------------------------------------------------------------
  // Deadline Hover State
  // -------------------------------------------------------------------------
  const [hoveredDeadline, setHoveredDeadline] =
    React.useState<DeadlineTask | null>(null);

  // -------------------------------------------------------------------------
  // Derived Data
  // -------------------------------------------------------------------------
  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId) ?? null
    : null;

  // -------------------------------------------------------------------------
  // Zoom Handlers
  // -------------------------------------------------------------------------
  const handleZoomIn = React.useCallback(() => {
    onCalendarZoomChange(
      Math.min(MAX_CALENDAR_ZOOM, calendarZoom + CALENDAR_ZOOM_STEP)
    );
  }, [calendarZoom, onCalendarZoomChange]);

  const handleZoomOut = React.useCallback(() => {
    onCalendarZoomChange(
      Math.max(MIN_CALENDAR_ZOOM, calendarZoom - CALENDAR_ZOOM_STEP)
    );
  }, [calendarZoom, onCalendarZoomChange]);

  // -------------------------------------------------------------------------
  // Keyboard Shortcuts & Toast Aggregation
  // -------------------------------------------------------------------------
  const { toastMessage: calendarToastMessage } = useCalendarKeyboard({
    hoveredEvent,
    hoverPosition,
    hasClipboardContent: enhancedCalendarHandlers.hasClipboardContent,
    hoveredDayIndex,
    onCopy: enhancedCalendarHandlers.onEventCopy,
    onPaste: enhancedCalendarHandlers.onEventPaste,
    onDuplicate: (eventId, newDayIndex, newStartMinutes) =>
      enhancedCalendarHandlers.onEventDuplicate(eventId, newDayIndex, newStartMinutes),
    onDelete: (eventId) => enhancedCalendarHandlers.onEventDelete(eventId),
    onToggleComplete: (eventId, currentStatus) => {
      const newStatus = currentStatus === "completed" ? "planned" : "completed";
      enhancedCalendarHandlers.onEventStatusChange(eventId, newStatus);
    },
    onMarkDayComplete: enhancedCalendarHandlers.onMarkDayComplete,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
  });

  const toasts = useToastAggregator(calendarToastMessage);

  useDeadlineKeyboard({
    hoveredDeadline,
    onToggleComplete: enhancedToggleTaskComplete,
    onUnassign: onClearTaskDeadline,
    showToast: toasts.setDeadlineToast,
  });

  useUndoKeyboard({
    enabled: !useMobileLayout,
  });

  const undoLastCommand = undoContext?.lastCommand;
  const showUndoActionToast = undoLastCommand !== null;
  const simpleToastMessage = toasts.toastMessage;

  // -------------------------------------------------------------------------
  // Focus Mode
  // -------------------------------------------------------------------------
  const {
    isSidebarBlockFocused,
    showFocusIndicator,
    handleStartFocus,
    handleNavigateToFocusedBlock,
  } = useShellFocus({
    focusSession,
    selectedEventId,
    selectedEvent,
    startFocus: onStartFocus,
    onNavigateToBlock: setSelectedEventId,
  });

  // -------------------------------------------------------------------------
  // External Drag & Drop
  // -------------------------------------------------------------------------
  const dragContext = useDragContextOptional();
  const { externalDragPreview, handleExternalDrop, handleDeadlineDrop } =
    useExternalDragPreview({
      dragContext,
      weekDates,
      onDrop,
    });

  // -------------------------------------------------------------------------
  // Block Sidebar Handlers
  // -------------------------------------------------------------------------
  const {
    sidebarData,
    availableGoals,
    syncState,
    blockSyncSettings,
    handlers: sidebarHandlers,
  } = useBlockSidebarHandlers({
    selectedEvent,
    goals,
    essentials,
    weekDates,
    schedule: {
      updateEvent: onUpdateEvent,
      updateTask: onUpdateTask,
      toggleTaskComplete: enhancedToggleTaskComplete,
      addTask: onAddTask,
      addSubtask: onAddSubtask,
      toggleSubtaskComplete: onToggleSubtaskComplete,
      updateSubtask: onUpdateSubtask,
      deleteSubtask: onDeleteSubtask,
      assignTaskToBlock: onAssignTaskToBlock,
      unassignTaskFromBlock: enhancedUnassignTaskFromBlock,
      updateBlockSyncSettings: onUpdateBlockSyncSettings,
      calendarHandlers: enhancedCalendarHandlers,
    },
    calendarIntegrations,
    onToast: toasts.setSidebarToast,
    onEndFocus:
      focusSession?.blockId === selectedEvent?.id ? onEndFocus : undefined,
    onClose: handleCloseSidebar,
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
  const analyticsGoals = React.useMemo(
    () =>
      toAnalyticsItems(goals, getGoalStats, {
        useFocusedHours,
      }),
    [goals, getGoalStats, useFocusedHours]
  );

  const planningBudgetData = React.useMemo(
    () =>
      buildPlanningBudgetData({
        goals,
        essentials,
        getGoalStats,
        getEssentialStats,
      }),
    [goals, essentials, getGoalStats, getEssentialStats]
  );

  // -------------------------------------------------------------------------
  // Integrations Sidebar Toggle
  // -------------------------------------------------------------------------
  const handleIntegrationsToggle = React.useCallback(() => {
    if (integrationsSidebar.isOpen) {
      integrationsSidebar.close();
    } else {
      setSelectedEventId(null);
      setShowRightSidebar(false);
      integrationsSidebar.open();
      setRenderedContent("integrations");
    }
  }, [
    integrationsSidebar,
    setSelectedEventId,
    setShowRightSidebar,
    setRenderedContent,
  ]);

  // Close integrations sidebar when block or analytics sidebar opens
  React.useEffect(() => {
    if ((selectedEventId || showRightSidebar) && integrationsSidebar.isOpen) {
      integrationsSidebar.close();
    }
  }, [selectedEventId, showRightSidebar, integrationsSidebar]);

  const showIntegrationsSidebar =
    integrationsSidebar.isOpen && !selectedEventId && !showRightSidebar;

  // -------------------------------------------------------------------------
  // Sleep/Day Boundaries Handler
  // -------------------------------------------------------------------------
  const handleSleepTimesChange = React.useCallback(
    (wakeUp: number, windDown: number) => {
      onDayBoundariesChange(wakeUp, windDown);
      if (!dayBoundariesEnabled) {
        onDayBoundariesEnabledChange(true);
      }
    },
    [onDayBoundariesChange, onDayBoundariesEnabledChange, dayBoundariesEnabled]
  );

  // -------------------------------------------------------------------------
  // All-Day Event Toggle Handler
  // -------------------------------------------------------------------------
  const handleToggleAllDayEvent = React.useCallback(
    (eventId: string) => {
      const currentEvent = externalEvents.find((e) => e.id === eventId);
      if (currentEvent) {
        const newStatus =
          currentEvent.status === "completed" ? "planned" : "completed";
        onUpdateExternalEvent(eventId, { status: newStatus });
      }
    },
    [externalEvents, onUpdateExternalEvent]
  );

  // -------------------------------------------------------------------------
  // Goal Detail Mode Derived Data
  // -------------------------------------------------------------------------
  const selectedGoal = selectedGoalId
    ? (goals.find((g) => g.id === selectedGoalId) as ScheduleGoal | undefined)
    : undefined;

  const selectedGoalLifeArea = React.useMemo(() => {
    if (!selectedGoal?.lifeAreaId) return undefined;
    return lifeAreas.find((area) => area.id === selectedGoal.lifeAreaId);
  }, [selectedGoal, lifeAreas]);

  const selectedGoalStats = selectedGoalId
    ? getGoalStats(selectedGoalId)
    : { plannedHours: 0, completedHours: 0, focusedHours: 0 };

  // -------------------------------------------------------------------------
  // Mobile Event Click Handler (opens bottom sheet)
  // -------------------------------------------------------------------------
  const handleMobileEventClick = React.useCallback(
    (event: CalendarEvent) => {
      setSelectedEventId(event.id);
    },
    [setSelectedEventId]
  );

  const handleCloseBottomSheet = React.useCallback(() => {
    setSelectedEventId(null);
  }, [setSelectedEventId]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <Shell>
        {/* Dev skip button - top-right during onboarding goals step */}
        {isOnboardingGoalsCentered &&
          process.env.NODE_ENV === "development" &&
          onSkipOnboarding && (
            <button
              onClick={onSkipOnboarding}
              className="absolute right-6 top-6 z-50 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              Skip onboarding (Dev)
            </button>
          )}

        {/* Render appropriate toolbar based on breakpoint and mode */}
        {!isOnboardingGoalsCentered &&
          (useMobileLayout ? (
            <ShellMobileToolbar
              onOpenBacklog={() => setShowBacklogOverlay(true)}
              shouldShowWeekView={shouldShowWeekView}
              onPreviousWeek={onPreviousWeek}
              onNextWeek={onNextWeek}
              onPreviousDay={mobileNav.handleMobilePreviousDay}
              onNextDay={mobileNav.handleMobileNextDay}
              onToday={handleTodayClick}
              focusSession={focusSession}
              focusElapsedMs={focusElapsedMs}
              focusIsRunning={focusIsRunning}
              onPauseFocus={onPauseFocus}
              onResumeFocus={onResumeFocus}
              onNavigateToFocusedBlock={handleNavigateToFocusedBlock}
              weekStartsOn={weekStartsOn}
              onWeekStartsOnChange={onWeekStartsOnChange}
              isEssentialsHidden={isEssentialsHidden}
              onShowEssentials={() => setIsEssentialsHidden(false)}
              onOpenLifeAreaManager={() => setShowLifeAreaManager(true)}
              onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
            />
          ) : isOnboardingBlueprint ? (
            <OnboardingBlueprintToolbar />
          ) : isBlueprintEditMode ? (
            <BlueprintEditToolbar
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              onCancel={blueprintHandlers.handleCancelBlueprintEdit}
              onSave={blueprintHandlers.handleSaveBlueprintEdit}
            />
          ) : (
            <ShellDesktopToolbar
              isOnboarding={isOnboarding}
              isPlanning={isPlanning}
              isBlueprintEditMode={isBlueprintEditMode}
              isOnboardingBlueprint={isOnboardingBlueprint}
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              isEssentialsHidden={isEssentialsHidden}
              onShowEssentials={() => setIsEssentialsHidden(false)}
              onPreviousWeek={onPreviousWeek}
              onNextWeek={onNextWeek}
              onToday={handleTodayClick}
              showFocusIndicator={showFocusIndicator}
              focusSession={focusSession}
              focusElapsedMs={focusElapsedMs}
              focusIsRunning={focusIsRunning}
              onPauseFocus={onPauseFocus}
              onResumeFocus={onResumeFocus}
              onNavigateToFocusedBlock={handleNavigateToFocusedBlock}
              showPlanWeek={showPlanWeek}
              currentWeekPlan={currentWeekPlan}
              onPlanWeek={handlePlanWeekClick}
              showIntegrationsSidebar={showIntegrationsSidebar}
              onToggleIntegrations={handleIntegrationsToggle}
              showRightSidebar={showRightSidebar}
              selectedEvent={selectedEvent}
              onToggleAnalytics={handleAnalyticsToggle}
              weekStartsOn={weekStartsOn}
              onWeekStartsOnChange={onWeekStartsOnChange}
              hasBlueprint={hasBlueprint}
              onEditBlueprint={blueprintHandlers.handleEnterBlueprintEdit}
              onOpenLifeAreaManager={() => setShowLifeAreaManager(true)}
              onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
            />
          ))}

        {/* Main Content Area - responsive layout */}
        {useMobileLayout ? (
          // Mobile/Tablet: Full-width calendar only
          <ShellContentPrimitive className="overflow-hidden">
            <div className="relative h-full">
              <Calendar
                view={shouldShowWeekView ? "week" : "day"}
                selectedDate={
                  shouldShowWeekView ? selectedDate : mobileNav.mobileSelectedDate
                }
                events={events}
                weekStartsOn={weekStartsOn}
                zoom={calendarZoom}
                scrollToCurrentTimeKey={scrollToCurrentTimeKey}
                onEventClick={handleMobileEventClick}
                enableExternalDrop={false}
                onDeadlineToggleComplete={onToggleTaskComplete}
                onDeadlineUnassign={onClearTaskDeadline}
                deadlines={weekDeadlines}
                goalDeadlines={weekGoalDeadlines}
                milestoneDeadlines={weekMilestoneDeadlines}
                allDayEvents={allDayEvents}
                onToggleAllDayEvent={handleToggleAllDayEvent}
                onGoalDeadlineClick={goalHandlers.handleGoalDeadlineClick}
                onToggleMilestoneComplete={onToggleMilestoneComplete}
                dayStartMinutes={dayStartMinutes}
                dayEndMinutes={dayEndMinutes}
                dayBoundariesEnabled={dayBoundariesEnabled}
                dayBoundariesDisplay={dayBoundariesDisplay}
              />
              <FeedbackButton
                calendarZoom={calendarZoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
              />
            </div>
          </ShellContentPrimitive>
        ) : isOnboardingGoalsCentered ? (
          // Desktop: Centered goals card for onboarding first step
          <ShellContentPrimitive className="flex items-center justify-center bg-muted shadow-none ring-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="onboarding-goals"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <OnboardingGoalsCard
                  goals={goalHandlers.onboardingGoals}
                  onAddGoal={goalHandlers.handleOnboardingAddGoal}
                  onUpdateGoal={goalHandlers.handleOnboardingUpdateGoal}
                  onRemoveGoal={goalHandlers.handleOnboardingRemoveGoal}
                  onContinue={onContinueFromGoals}
                  suggestions={ONBOARDING_GOAL_SUGGESTIONS}
                  lifeAreas={lifeAreas}
                  goalIcons={goalIcons}
                />
              </motion.div>
            </AnimatePresence>
          </ShellContentPrimitive>
        ) : (
          // Desktop: Three-panel layout
          <AnimatePresence mode="wait">
            <motion.div
              key="main-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`flex min-h-0 flex-1 ${
                showSidebar ||
                isRightSidebarOpen ||
                showIntegrationsSidebar ||
                isPlanning ||
                isBlueprintEditMode ||
                isOnboardingBlueprint
                  ? "gap-4"
                  : "gap-0"
              }`}
            >
              {/* Left Sidebar - Backlog, Planning Panel, or Blueprint Backlog */}
              <div
                className={cn(
                  "shrink-0 overflow-hidden transition-all duration-300 ease-out",
                  isPlanning
                    ? "w-[420px] opacity-100"
                    : showSidebar ||
                      isBlueprintEditMode ||
                      isOnboardingBlueprint
                    ? "w-[360px] opacity-100"
                    : "w-0 opacity-0"
                )}
              >
                {isOnboardingBlueprint ? (
                  <BlueprintBacklog
                    goals={goals}
                    essentials={essentials}
                    onSave={blueprintHandlers.handleSaveOnboardingBlueprint}
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    wakeUpMinutes={dayStartMinutes}
                    windDownMinutes={dayEndMinutes}
                    onSleepTimesChange={handleSleepTimesChange}
                    isSleepConfigured={dayBoundariesEnabled}
                    onAddEssential={blueprintHandlers.handleAddEssentialWithImport}
                    essentialTemplates={essentialTemplates}
                    onSaveSchedule={onSaveEssentialSchedule}
                    onDeleteEssential={blueprintHandlers.handleDeleteEssentialWithCleanup}
                    essentialIcons={goalIcons}
                    className="h-full w-[360px] max-w-none"
                  />
                ) : isPlanning ? (
                  <PlanningPanel
                    goals={goals}
                    essentials={essentials}
                    blueprint={blueprint}
                    weekDates={weekDates}
                    onDuplicateLastWeek={
                      hasBlueprint
                        ? planningIntegration.handleDuplicateLastWeek
                        : undefined
                    }
                    onCancel={planningIntegration.planningFlow.cancel}
                    isFirstPlan={!hasBlueprint}
                    step={planningIntegration.planningFlow.step}
                    onNextStep={planningIntegration.planningFlow.nextStep}
                    onConfirm={planningIntegration.planningFlow.confirm}
                    weeklyFocusTaskIds={
                      planningIntegration.planningFlow.weeklyFocusTaskIds
                    }
                    onAddToFocus={
                      planningIntegration.planningFlow.addToWeeklyFocus
                    }
                    onRemoveFromFocus={
                      planningIntegration.planningFlow.removeFromWeeklyFocus
                    }
                    onAddTask={onAddTask}
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    showAddEssentialsButton={
                      !hasBlueprint &&
                      !planningIntegration.hasAddedEssentialsThisSession
                    }
                    onAddEssentialsToCalendar={
                      planningIntegration.handleAddEssentialsToCalendar
                    }
                    className="h-full w-[420px] max-w-none"
                  />
                ) : (
                  <Backlog
                    essentials={essentials as BacklogItem[]}
                    goals={goals as BacklogItem[]}
                    className="h-full w-[360px] max-w-none"
                    showTasks={showTasks && !isBlueprintEditMode}
                    onToggleGoalTask={enhancedToggleTaskComplete}
                    onAddTask={onAddTask}
                    onUpdateTask={onUpdateTask}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtaskComplete}
                    onUpdateSubtask={onUpdateSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    onDeleteTask={enhancedDeleteTask}
                    getGoalStats={getGoalStats}
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    draggable={!isOnboarding}
                    essentialTemplates={essentialTemplates}
                    onSaveEssentialSchedule={
                      isBlueprintEditMode
                        ? blueprintHandlers.handleSaveEssentialScheduleWithSync
                        : onSaveEssentialSchedule
                    }
                    onCreateEssential={
                      isBlueprintEditMode
                        ? blueprintHandlers.handleAddEssentialWithImport
                        : onCreateEssential
                    }
                    onDeleteEssential={
                      isBlueprintEditMode
                        ? blueprintHandlers.handleDeleteEssentialWithCleanup
                        : onDeleteEssential
                    }
                    wakeUpMinutes={dayStartMinutes}
                    windDownMinutes={dayEndMinutes}
                    onSleepTimesChange={handleSleepTimesChange}
                    isSleepConfigured={dayBoundariesEnabled}
                    isEssentialsHidden={isEssentialsHidden}
                    onEssentialsHide={() => setIsEssentialsHidden(true)}
                    isBlueprintEditMode={isBlueprintEditMode}
                    onCreateGoal={goalHandlers.handleCreateGoal}
                    lifeAreas={lifeAreas}
                    goalIcons={goalIcons}
                    onCreateAndSelectGoal={goalHandlers.handleCreateAndSelectGoal}
                    selectedGoalId={selectedGoalId}
                    onSelectGoal={handleSelectGoal}
                    onBrowseInspiration={handleBrowseInspiration}
                    isInspirationActive={showInspirationGallery}
                    onboardingStep={onboardingStep}
                    onOnboardingContinue={onContinueFromGoals}
                    currentWeekStart={planningIntegration.weekStartDate}
                  />
                )}
              </div>

              {/* Main Content - Calendar, Goal Detail, or Inspiration Gallery */}
              <ShellContentPrimitive className="overflow-hidden">
                {showInspirationGallery && inspirationCategories ? (
                  <GoalInspirationGallery
                    categories={inspirationCategories}
                    onAddGoal={goalHandlers.handleCreateGoal}
                    onClose={handleCloseInspiration}
                    className="h-full"
                  />
                ) : isGoalDetailMode && selectedGoal ? (
                  <GoalDetail
                    goal={selectedGoal}
                    lifeArea={selectedGoalLifeArea}
                    deadline={selectedGoal.deadline}
                    notes={goalNotes[selectedGoal.id] ?? ""}
                    onNotesChange={handleGoalNotesChange}
                    onTitleChange={(title) =>
                      onUpdateGoal(selectedGoal.id, { label: title })
                    }
                    onDeadlineChange={(deadline) =>
                      onUpdateGoal(selectedGoal.id, { deadline })
                    }
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    onToggleTask={(taskId) =>
                      enhancedToggleTaskComplete(selectedGoal.id, taskId)
                    }
                    onAddTask={(label, milestoneId) =>
                      onAddTask(selectedGoal.id, label, milestoneId)
                    }
                    onUpdateTask={(taskId, updates) =>
                      onUpdateTask(selectedGoal.id, taskId, updates)
                    }
                    onDeleteTask={(taskId) =>
                      enhancedDeleteTask(selectedGoal.id, taskId)
                    }
                    onAddSubtask={(taskId, label) =>
                      onAddSubtask(selectedGoal.id, taskId, label)
                    }
                    onToggleSubtask={(taskId, subtaskId) =>
                      onToggleSubtaskComplete(
                        selectedGoal.id,
                        taskId,
                        subtaskId
                      )
                    }
                    onUpdateSubtask={(taskId, subtaskId, label) =>
                      onUpdateSubtask(selectedGoal.id, taskId, subtaskId, label)
                    }
                    onDeleteSubtask={(taskId, subtaskId) =>
                      onDeleteSubtask(selectedGoal.id, taskId, subtaskId)
                    }
                    onAddMilestone={(label) =>
                      onAddMilestone(selectedGoal.id, label)
                    }
                    onToggleMilestone={(milestoneId) =>
                      onToggleMilestoneComplete(selectedGoal.id, milestoneId)
                    }
                    onUpdateMilestone={(milestoneId, label) =>
                      onUpdateMilestone(selectedGoal.id, milestoneId, label)
                    }
                    onUpdateMilestoneDeadline={(milestoneId, deadline) =>
                      onUpdateMilestoneDeadline(
                        selectedGoal.id,
                        milestoneId,
                        deadline
                      )
                    }
                    onDeleteMilestone={(milestoneId) =>
                      onDeleteMilestone(selectedGoal.id, milestoneId)
                    }
                    onToggleMilestones={() =>
                      onToggleMilestonesEnabled(selectedGoal.id)
                    }
                    onDelete={goalHandlers.handleDeleteGoal}
                    onBack={handleCloseGoalDetail}
                    lifeAreas={lifeAreas}
                    goalIcons={goalIcons}
                    onIconChange={(icon) =>
                      onUpdateGoal(selectedGoal.id, { icon })
                    }
                    onColorChange={(color) =>
                      onUpdateGoal(selectedGoal.id, { color })
                    }
                    onLifeAreaChange={(lifeAreaId) =>
                      onUpdateGoal(selectedGoal.id, { lifeAreaId })
                    }
                    onAddLifeArea={() => {
                      setLifeAreaCreatorForGoalId(selectedGoal.id);
                      setShowLifeAreaCreator(true);
                    }}
                    onSyncSettingsChange={(settings) =>
                      onUpdateGoalSyncSettings(selectedGoal.id, settings)
                    }
                    hasSyncAvailable={planningIntegration.hasSyncAvailable}
                    className="h-full"
                  />
                ) : showCalendar ? (
                  <div className="relative h-full">
                    <Calendar
                      selectedDate={selectedDate}
                      events={events}
                      weekStartsOn={weekStartsOn}
                      zoom={calendarZoom}
                      scrollToCurrentTimeKey={scrollToCurrentTimeKey}
                      {...calendarHandlers}
                      onEventClick={handleEventClick}
                      enableExternalDrop={
                        !isOnboarding || isOnboardingBlueprint
                      }
                      onExternalDrop={handleExternalDrop}
                      externalDragPreview={externalDragPreview}
                      onDeadlineDrop={handleDeadlineDrop}
                      deadlines={weekDeadlines}
                      goalDeadlines={weekGoalDeadlines}
                      milestoneDeadlines={weekMilestoneDeadlines}
                      allDayEvents={allDayEvents}
                      onDeadlineToggleComplete={onToggleTaskComplete}
                      onDeadlineUnassign={onClearTaskDeadline}
                      onDeadlineHover={setHoveredDeadline}
                      onToggleAllDayEvent={handleToggleAllDayEvent}
                      onGoalDeadlineClick={goalHandlers.handleGoalDeadlineClick}
                      onToggleMilestoneComplete={onToggleMilestoneComplete}
                      dayStartMinutes={dayStartMinutes}
                      dayEndMinutes={dayEndMinutes}
                      dayBoundariesEnabled={dayBoundariesEnabled}
                      dayBoundariesDisplay={dayBoundariesDisplay}
                    />
                    {/* Dimming overlay */}
                    {((isOnboarding && !isOnboardingBlueprint) ||
                      showPlanWeekPrompt ||
                      (isPlanning &&
                        planningIntegration.planningFlow.step ===
                          "prioritize")) && (
                      <div className="absolute inset-0 bg-background/60 pointer-events-none z-10" />
                    )}

                    {/* Plan week prompt card */}
                    {showPlanWeekPrompt && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <PlanWeekPromptCard
                          onStartPlanning={onStartPlanningFromPrompt}
                          onDismiss={onDismissPlanWeekPrompt}
                        />
                      </div>
                    )}

                    <FeedbackButton
                      calendarZoom={calendarZoom}
                      onZoomIn={handleZoomIn}
                      onZoomOut={handleZoomOut}
                    />
                  </div>
                ) : null}
              </ShellContentPrimitive>

              {/* Right Sidebar - Block Details / Analytics / Integrations */}
              <div
                className={cn(
                  "shrink-0 overflow-hidden transition-all duration-300 ease-out",
                  isRightSidebarOpen || showIntegrationsSidebar
                    ? "w-[380px] opacity-100"
                    : "w-0 opacity-0"
                )}
              >
                {renderedContent === "integrations" ? (
                  <IntegrationsSidebar
                    integrationStates={calendarIntegrations}
                    currentView={integrationsSidebar.currentView}
                    availableGoals={goals}
                    onClose={integrationsSidebar.close}
                    onNavigateToProvider={
                      integrationsSidebar.navigateToProvider
                    }
                    onNavigateToList={integrationsSidebar.navigateToList}
                    onConnectProvider={onConnectProvider}
                    onDisconnectProvider={onDisconnectProvider}
                    onToggleImportEnabled={onToggleImportEnabled}
                    onToggleCalendarImport={onToggleCalendarImport}
                    onToggleMeetingsOnly={onToggleMeetingsOnly}
                    onToggleCalendarExport={onToggleCalendarExport}
                    onToggleExportEnabled={onToggleExportEnabled}
                    onSetExportParticipation={onSetExportParticipation}
                    onSetExportGoalFilter={onSetExportGoalFilter}
                    onSetExportDefaultAppearance={onSetExportDefaultAppearance}
                    onSetExportCustomLabel={onSetExportCustomLabel}
                    className="h-full w-[380px] max-w-none overflow-y-auto"
                  />
                ) : renderedContent === "block" && sidebarDataToRender ? (
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
                    onPauseFocus={onPauseFocus}
                    onResumeFocus={onResumeFocus}
                    onEndFocus={onEndFocus}
                    focusDisabled={
                      focusSession !== null && !isSidebarBlockFocused
                    }
                    totalFocusedMinutes={
                      selectedEvent?.blockType !== "essential"
                        ? selectedEvent?.focusedMinutes ?? 0
                        : undefined
                    }
                    onFocusedMinutesChange={
                      selectedEvent?.blockType !== "essential" && selectedEvent
                        ? (minutes) =>
                            onUpdateEvent(selectedEvent.id, {
                              focusedMinutes: minutes,
                            })
                        : undefined
                    }
                    syncState={syncState}
                    blockSyncSettings={blockSyncSettings}
                    className="h-full w-[380px] max-w-none overflow-y-auto"
                  />
                ) : renderedContent === "analytics" ? (
                  isPlanning || isOnboardingBlueprint ? (
                    <div className="flex h-full w-[380px] max-w-none flex-col gap-4 overflow-y-auto">
                      <PlanningBudget
                        goals={planningBudgetData.goals}
                        essentials={planningBudgetData.essentials}
                        wakeUpMinutes={dayStartMinutes}
                        windDownMinutes={dayEndMinutes}
                        isSleepConfigured={dayBoundariesEnabled}
                        weekLabel={
                          isOnboardingBlueprint
                            ? "Your typical week"
                            : formatWeekRange(weekDates)
                        }
                        lifeAreas={lifeAreas}
                      />
                      {isPlanning &&
                        !isOnboardingBlueprint &&
                        quarterDeadlines.length > 0 && (
                          <UpcomingDeadlinesCard
                            deadlines={quarterDeadlines}
                            weekStartDate={weekDates[0]}
                          />
                        )}
                    </div>
                  ) : (
                    <WeeklyAnalytics
                      goals={analyticsGoals}
                      weekLabel={formatWeekRange(weekDates)}
                      progressMetric={progressMetric}
                      onProgressMetricChange={onProgressMetricChange}
                      className="h-full w-[380px] max-w-none overflow-y-auto"
                    />
                  )
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </Shell>

      {/* Mobile/Tablet: Backlog Full-Screen Overlay */}
      {useMobileLayout && (
        <FullScreenOverlay
          key="backlog-overlay"
          open={showBacklogOverlay}
          onClose={() => setShowBacklogOverlay(false)}
          title="Backlog"
          closeStyle="close"
        >
          <Backlog
            essentials={essentials as BacklogItem[]}
            goals={goals as BacklogItem[]}
            className="h-full max-w-none border-0 rounded-none shadow-none"
            showTasks={true}
            onToggleGoalTask={onToggleTaskComplete}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtaskComplete}
            onUpdateSubtask={onUpdateSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onDeleteTask={onDeleteTask}
            getGoalStats={getGoalStats}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            draggable={false}
            essentialTemplates={essentialTemplates}
            onSaveEssentialSchedule={
              isBlueprintEditMode
                ? blueprintHandlers.handleSaveEssentialScheduleWithSync
                : onSaveEssentialSchedule
            }
            onCreateEssential={
              isBlueprintEditMode
                ? blueprintHandlers.handleAddEssentialWithImport
                : onCreateEssential
            }
            onDeleteEssential={
              isBlueprintEditMode
                ? blueprintHandlers.handleDeleteEssentialWithCleanup
                : onDeleteEssential
            }
            wakeUpMinutes={dayStartMinutes}
            windDownMinutes={dayEndMinutes}
            onSleepTimesChange={handleSleepTimesChange}
            isSleepConfigured={dayBoundariesEnabled}
            isEssentialsHidden={isEssentialsHidden}
            onEssentialsHide={() => setIsEssentialsHidden(true)}
            isBlueprintEditMode={isBlueprintEditMode}
            goalIcons={goalIcons}
            currentWeekStart={planningIntegration.weekStartDate}
          />
        </FullScreenOverlay>
      )}

      {/* Mobile/Tablet: Block Details Bottom Sheet */}
      {useMobileLayout && sidebarDataToRender && (
        <BottomSheet
          key="block-sheet"
          open={selectedEventId !== null}
          onClose={handleCloseBottomSheet}
          title={sidebarDataToRender.block.title}
          showCloseButton={true}
          showDragHandle={true}
        >
          <BlockSidebar
            block={sidebarDataToRender.block}
            availableGoalTasks={sidebarDataToRender.availableGoalTasks}
            availableGoals={availableGoals}
            onClose={handleCloseBottomSheet}
            onToggleGoalTask={sidebarHandlers.onToggleGoalTask}
            isFocused={isSidebarBlockFocused}
            focusIsRunning={focusIsRunning}
            focusElapsedMs={focusElapsedMs}
            onStartFocus={handleStartFocus}
            onPauseFocus={onPauseFocus}
            onResumeFocus={onResumeFocus}
            onEndFocus={onEndFocus}
            focusDisabled={focusSession !== null && !isSidebarBlockFocused}
            totalFocusedMinutes={
              selectedEvent?.blockType !== "essential"
                ? selectedEvent?.focusedMinutes ?? 0
                : undefined
            }
            syncState={syncState}
            blockSyncSettings={blockSyncSettings}
            onSyncAppearanceChange={sidebarHandlers.onSyncAppearanceChange}
            className="border-0 rounded-none shadow-none max-w-none w-full"
          />
        </BottomSheet>
      )}

      {/* Only show toast and drag ghost on desktop */}
      {!useMobileLayout && (
        <React.Fragment key="desktop-extras">
          {showUndoActionToast && undoLastCommand ? (
            <UndoToast
              message={undoLastCommand.description}
              onUndo={() => {
                undoContext?.undo();
              }}
              onDismiss={() => undoContext?.clearLastCommand()}
            />
          ) : (
            <SimpleToast message={simpleToastMessage} />
          )}
          <DragGhost />
        </React.Fragment>
      )}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Life area creator modal */}
      <LifeAreaCreatorModal
        open={showLifeAreaCreator}
        onClose={() => {
          setShowLifeAreaCreator(false);
          setLifeAreaCreatorForGoalId(null);
        }}
        goalIcons={goalIcons}
        existingLifeAreas={lifeAreas}
        onCreateLifeArea={(data) => {
          const newLifeAreaId = onAddLifeArea(data);
          if (newLifeAreaId && lifeAreaCreatorForGoalId) {
            onUpdateGoal(lifeAreaCreatorForGoalId, {
              lifeAreaId: newLifeAreaId,
            });
          }
          setLifeAreaCreatorForGoalId(null);
        }}
      />

      {/* Life area manager modal */}
      <LifeAreaManagerModal
        open={showLifeAreaManager}
        onClose={() => setShowLifeAreaManager(false)}
        customLifeAreas={customLifeAreas}
        goalIcons={goalIcons}
        goals={goals}
        onAddLifeArea={onAddLifeArea}
        onUpdateLifeArea={onUpdateLifeArea}
        onRemoveLifeArea={onRemoveLifeArea}
      />
    </>
  );
}
