/**
 * =============================================================================
 * File: use-shell-wiring.ts
 * =============================================================================
 *
 * Shell interaction wiring and cross-feature orchestration hook.
 *
 * Consumes ShellContentProps and composes higher-level behavior by layering
 * feature-specific hooks (layout, focus, blueprint, planning, undo, keyboard,
 * drag & drop, sidebars, analytics) into a single cohesive wiring object.
 *
 * Think of this hook as:
 *   "Behavior + Interaction Orchestrator"
 * not
 *   "State Owner"
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Bridge domain data (ShellContentProps) to interaction-level hooks.
 * - Compose keyboard shortcuts, undo system, and toast feedback.
 * - Coordinate layout state with selection and sidebars.
 * - Wire focus mode behavior and navigation.
 * - Provide drag & drop previews and drop handlers.
 * - Assemble analytics and planning budget derived data.
 * - Expose a unified wiring surface consumed by layout components.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or persisting data.
 * - Owning domain state.
 * - Rendering UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Sits between useShellState and ShellContent component.
 * - Optimized for LLM scanning and mental mapping of interactions.
 * - Centralizes complex cross-feature glue to avoid scattering logic.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useShellWiring
 * - ShellWiring
 */

"use client";

import * as React from "react";
import {
  useCalendarKeyboard,
  useDeadlineKeyboard,
  type CalendarEvent,
} from "@/components/calendar";
import { useUndoOptional, useUndoKeyboard } from "@/lib/undo";
import { useBlockSidebarHandlers } from "@/components/block";
import { useDragContextOptional } from "@/components/drag";
import { toAnalyticsItems, buildPlanningBudgetData } from "@/lib/adapters";
import {
  MIN_CALENDAR_ZOOM,
  MAX_CALENDAR_ZOOM,
  CALENDAR_ZOOM_STEP,
} from "@/lib/preferences";
import { useBreakpoint } from "@/lib/responsive";
import type { DeadlineTask, ScheduleGoal } from "@/lib/unified-schedule";
import type { ShellContentProps } from "./shell-types";
import { useShellLayout } from "./use-shell-layout";
import { useShellFocus } from "./use-shell-focus";
import { useExternalDragPreview } from "./use-external-drag-preview";
import { useToastAggregator } from "./use-toast-aggregator";
import { useUndoableHandlers } from "./use-undoable-handlers";
import { useMobileNavigation } from "./use-mobile-navigation";
import { useGoalHandlers } from "./use-goal-handlers";
import { usePlanningIntegration } from "./use-planning-integration";
import { useBlueprintHandlers } from "./use-blueprint-handlers";

export function useShellWiring(props: ShellContentProps) {
  const {
    goals,
    essentials,
    allEssentials,
    events,
    weekDates,
    weekDeadlines,
    selectedDate,
    calendarHandlers,
    calendarZoom,
    onCalendarZoomChange,
    onToggleTaskComplete,
    onDeleteTask,
    onUnassignTaskFromBlock,
    onAssignTaskToBlock,
    onAddTask,
    onUpdateTask,
    onUpdateEvent,
    onAddEvent,
    onReplaceEvents,
    onDrop,
    focusSession,
    onStartFocus,
    onEndFocus,
    blueprint,
    hasBlueprint,
    onSaveBlueprint,
    onSaveWeeklyPlan,
    hasWeeklyPlan,
    onSetWeeklyFocus,
    weekStartsOn,
    progressMetric,
    onPreviousWeek,
    onNextWeek,
    onToday,
    lifeAreas,
    goalIcons,
    onAddGoal,
    onDeleteGoal,
    onUpdateGoal,
    onAddSubtask,
    onToggleSubtaskComplete,
    onUpdateSubtask,
    onDeleteSubtask,
    onUpdateBlockSyncSettings,
    onClearTaskDeadline,
    getGoalStats,
    getEssentialStats,
    hoveredEvent,
    hoverPosition,
    hoveredDayIndex,
    calendarIntegrations,
    externalEvents,
    integrationsSidebar,
    essentialTemplates,
    onSaveEssentialSchedule,
    onCreateEssential,
    onDeleteEssential,
    onImportEssentialsToWeek,
    dayStartMinutes,
    dayEndMinutes,
    dayBoundariesEnabled,
    onDayBoundariesChange,
    onDayBoundariesEnabledChange,
    onUpdateExternalEvent,
  } = props;

  // Responsive breakpoint
  const breakpoint = useBreakpoint();
  const { isMobile, isTablet, isTabletLandscape, isDesktop } = breakpoint;
  const useMobileLayout = isMobile || isTablet;
  const shouldShowWeekView = isTabletLandscape || isDesktop;

  // Undo system
  const undoContext = useUndoOptional();

  const getTask = React.useCallback(
    (goalId: string, taskId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      return goal?.tasks?.find((t) => t.id === taskId);
    },
    [goals],
  );
  const getEvent = React.useCallback(
    (eventId: string) => events.find((e) => e.id === eventId),
    [events],
  );
  const getEventsForDay = React.useCallback(
    (dayIndex: number) => events.filter((e) => e.dayIndex === dayIndex),
    [events],
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
    [weekDates, weekDeadlines],
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
  const enhancedUnassignTaskFromBlock =
    undoableHandlers.onUnassignTaskFromBlock;

  // Layout state
  const layout = useShellLayout({ initialGoalsCount: goals.length });

  const [scrollToCurrentTimeKey, setScrollToCurrentTimeKey] = React.useState(
    () => Date.now(),
  );
  const handleTodayClick = React.useCallback(() => {
    onToday();
    setScrollToCurrentTimeKey(Date.now());
  }, [onToday]);

  // Feature hooks
  const mobileNav = useMobileNavigation({
    weekDates,
    selectedDate,
    onPreviousWeek,
    onNextWeek,
  });

  const goalHandlers = useGoalHandlers({
    goals,
    goalIcons,
    lifeAreas,
    onAddGoal,
    onDeleteGoal,
    onUpdateGoal,
    backlogMode: layout.backlogMode,
    setBacklogMode: layout.setBacklogMode,
    selectedGoalId: layout.selectedGoalId,
    setSelectedGoalId: layout.setSelectedGoalId,
    handleCloseInspiration: layout.handleCloseInspiration,
  });

  const planningIntegration = usePlanningIntegration({
    isPlanningMode: layout.isPlanningMode,
    setIsPlanningMode: layout.setIsPlanningMode,
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
    isPlanning: layout.isPlanning,
    isOnboardingBlueprint: layout.isOnboardingBlueprint,
    setShowRightSidebar: layout.setShowRightSidebar,
  });

  const blueprintHandlers = useBlueprintHandlers({
    blueprint,
    events,
    weekDates,
    weekStartsOn,
    onReplaceEvents,
    onSaveBlueprint,
    onAddEvent,
    enterBlueprintEditMode: layout.enterBlueprintEditMode,
    exitBlueprintEditMode: layout.exitBlueprintEditMode,
    isBlueprintEditMode: layout.isBlueprintEditMode,
    hasWeeklyPlan,
    onCompleteOnboardingIntoPlanning: layout.onCompleteOnboardingIntoPlanning,
    onSkipBlueprintCreation: layout.onSkipBlueprintCreation,
    allEssentials,
    essentialTemplates,
    calendarHandlers,
    onCreateEssential,
    onDeleteEssential,
    onSaveEssentialSchedule,
  });

  // Deadline hover state
  const [hoveredDeadline, setHoveredDeadline] =
    React.useState<DeadlineTask | null>(null);

  // Selected event
  const selectedEvent = layout.selectedEventId
    ? (events.find((e) => e.id === layout.selectedEventId) ?? null)
    : null;

  // Zoom handlers
  const handleZoomIn = React.useCallback(() => {
    onCalendarZoomChange(
      Math.min(MAX_CALENDAR_ZOOM, calendarZoom + CALENDAR_ZOOM_STEP),
    );
  }, [calendarZoom, onCalendarZoomChange]);
  const handleZoomOut = React.useCallback(() => {
    onCalendarZoomChange(
      Math.max(MIN_CALENDAR_ZOOM, calendarZoom - CALENDAR_ZOOM_STEP),
    );
  }, [calendarZoom, onCalendarZoomChange]);

  // Keyboard shortcuts & toast aggregation
  const { toastMessage: calendarToastMessage } = useCalendarKeyboard({
    hoveredEvent,
    hoverPosition,
    hasClipboardContent: enhancedCalendarHandlers.hasClipboardContent,
    hoveredDayIndex,
    onCopy: enhancedCalendarHandlers.onEventCopy,
    onPaste: enhancedCalendarHandlers.onEventPaste,
    onDuplicate: (eventId, newDayIndex, newStartMinutes) =>
      enhancedCalendarHandlers.onEventDuplicate(
        eventId,
        newDayIndex,
        newStartMinutes,
      ),
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
  useUndoKeyboard({ enabled: !useMobileLayout });

  // Focus mode
  const focus = useShellFocus({
    focusSession,
    selectedEventId: layout.selectedEventId,
    selectedEvent,
    startFocus: onStartFocus,
    onNavigateToBlock: layout.setSelectedEventId,
  });

  // External drag & drop
  const dragContext = useDragContextOptional();
  const { externalDragPreview, handleExternalDrop, handleDeadlineDrop } =
    useExternalDragPreview({ dragContext, weekDates, onDrop });

  // Block sidebar handlers
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
    onClose: layout.handleCloseSidebar,
  });

  React.useEffect(() => {
    layout.updateFrozenSidebarData(sidebarData);
  }, [sidebarData, layout.updateFrozenSidebarData]);

  const sidebarDataToRender = selectedEvent
    ? sidebarData
    : layout.frozenSidebarData;

  // Analytics data
  const useFocusedHours = progressMetric === "focused";
  const analyticsGoals = React.useMemo(
    () => toAnalyticsItems(goals, getGoalStats, { useFocusedHours }),
    [goals, getGoalStats, useFocusedHours],
  );
  const planningBudgetData = React.useMemo(
    () =>
      buildPlanningBudgetData({
        goals,
        essentials,
        getGoalStats,
        getEssentialStats,
      }),
    [goals, essentials, getGoalStats, getEssentialStats],
  );

  // Integrations sidebar toggle
  const handleIntegrationsToggle = React.useCallback(() => {
    if (integrationsSidebar.isOpen) {
      integrationsSidebar.close();
    } else {
      layout.setSelectedEventId(null);
      layout.setShowRightSidebar(false);
      integrationsSidebar.open();
      layout.setRenderedContent("integrations");
    }
  }, [integrationsSidebar, layout]);

  React.useEffect(() => {
    if (
      (layout.selectedEventId || layout.showRightSidebar) &&
      integrationsSidebar.isOpen
    ) {
      integrationsSidebar.close();
    }
  }, [layout.selectedEventId, layout.showRightSidebar, integrationsSidebar]);

  const showIntegrationsSidebar =
    integrationsSidebar.isOpen &&
    !layout.selectedEventId &&
    !layout.showRightSidebar;

  // Sleep / day boundaries handler
  const handleSleepTimesChange = React.useCallback(
    (wakeUp: number, windDown: number) => {
      onDayBoundariesChange(wakeUp, windDown);
      if (!dayBoundariesEnabled) onDayBoundariesEnabledChange(true);
    },
    [onDayBoundariesChange, onDayBoundariesEnabledChange, dayBoundariesEnabled],
  );

  // All-day event toggle
  const handleToggleAllDayEvent = React.useCallback(
    (eventId: string) => {
      const currentEvent = externalEvents.find((e) => e.id === eventId);
      if (currentEvent) {
        const newStatus =
          currentEvent.status === "completed" ? "planned" : "completed";
        onUpdateExternalEvent(eventId, { status: newStatus });
      }
    },
    [externalEvents, onUpdateExternalEvent],
  );

  // Goal detail derived data
  const selectedGoal = layout.selectedGoalId
    ? (goals.find((g) => g.id === layout.selectedGoalId) as
        | ScheduleGoal
        | undefined)
    : undefined;
  const selectedGoalLifeArea = React.useMemo(() => {
    if (!selectedGoal?.lifeAreaId) return undefined;
    return lifeAreas.find((area) => area.id === selectedGoal.lifeAreaId);
  }, [selectedGoal, lifeAreas]);

  // Mobile event click handlers
  const handleMobileEventClick = React.useCallback(
    (event: CalendarEvent) => {
      layout.setSelectedEventId(event.id);
    },
    [layout],
  );
  const handleCloseBottomSheet = React.useCallback(() => {
    layout.setSelectedEventId(null);
  }, [layout]);

  // Undo toast state
  const undoLastCommand = undoContext?.lastCommand;
  const showUndoActionToast = undoLastCommand !== null;
  const simpleToastMessage = toasts.toastMessage;

  return {
    breakpoint,
    useMobileLayout,
    shouldShowWeekView,
    layout,
    scrollToCurrentTimeKey,
    handleTodayClick,
    mobileNav,
    goalHandlers,
    planningIntegration,
    blueprintHandlers,
    enhancedCalendarHandlers,
    enhancedToggleTaskComplete,
    enhancedDeleteTask,
    enhancedUnassignTaskFromBlock,
    toasts,
    undoContext,
    undoLastCommand,
    showUndoActionToast,
    simpleToastMessage,
    focus,
    externalDragPreview,
    handleExternalDrop,
    handleDeadlineDrop,
    sidebarData,
    sidebarDataToRender,
    availableGoals,
    syncState,
    blockSyncSettings,
    sidebarHandlers,
    handleZoomIn,
    handleZoomOut,
    selectedEvent,
    hoveredDeadline,
    setHoveredDeadline,
    analyticsGoals,
    planningBudgetData,
    handleIntegrationsToggle,
    showIntegrationsSidebar,
    handleSleepTimesChange,
    handleToggleAllDayEvent,
    selectedGoal,
    selectedGoalLifeArea,
    handleMobileEventClick,
    handleCloseBottomSheet,
  };
}

/** Return type of the shell wiring hook */
export type ShellWiring = ReturnType<typeof useShellWiring>;
