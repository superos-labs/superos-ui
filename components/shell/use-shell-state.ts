/**
 * =============================================================================
 * File: use-shell-state.ts
 * =============================================================================
 *
 * Core shell state composition hook.
 *
 * Aggregates and wires together all domain-level hooks required by the shell:
 * schedule, essentials, focus, blueprint, weekly planning, preferences, and
 * calendar integrations.
 *
 * Exposes a single, stable object that matches ShellContentProps.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Instantiate unified schedule and expose its data + handlers.
 * - Maintain cross-cutting selection state (selected event / goal).
 * - Derive week dates and handle week navigation.
 * - Bridge preferences into shell-consumable props.
 * - Compose essential templates and essential CRUD.
 * - Orchestrate focus session lifecycle and accumulation.
 * - Load and save blueprint and weekly plans.
 * - Merge external calendar events with internal events.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Layout, panels, and view-level UI state.
 * - Visual presentation or component composition.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Acts as the single source of truth for ShellContent data.
 * - Intentionally large to keep cross-domain wiring centralized.
 * - Avoids UI state; delegates that to useShellLayout.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useShellState
 */

"use client";

import * as React from "react";
import { getWeekDates } from "@/components/calendar";
import { useCalendarClipboard } from "@/components/calendar";
import { useUnifiedSchedule, useWeekNavigation } from "@/lib/unified-schedule";
import type {
  ScheduleEssential,
  DeadlineTask,
  DeadlineGoal,
  DeadlineMilestone,
} from "@/lib/unified-schedule";
import { useFocusSession, useFocusNotifications } from "@/lib/focus";
import { useBlueprint, eventsToBlueprint } from "@/lib/blueprint";
import { useWeeklyPlan } from "@/lib/weekly-planning";
import { usePreferences } from "@/lib/preferences";
import {
  useCalendarSync,
  useIntegrationsSidebar,
  externalEventsToCalendarEvents,
  externalEventsToAllDayEvents,
} from "@/lib/calendar-sync";
import type { UseShellStateOptions, UseShellStateReturn } from "./shell-types";
import { useLifeAreas } from "./use-life-areas";
import { useEssentialHandlers } from "./use-essential-handlers";

// =============================================================================
// Hook Implementation
// =============================================================================

export function useShellState(
  options: UseShellStateOptions,
): UseShellStateReturn {
  const {
    initialGoals,
    allEssentials: allEssentialsInput,
    initialEnabledEssentialIds,
    initialEvents,
    goalIcons,
    skipOnboarding,
  } = options;

  // -------------------------------------------------------------------------
  // Custom Life Areas
  // -------------------------------------------------------------------------
  const lifeAreasHook = useLifeAreas();

  // -------------------------------------------------------------------------
  // Mutable Essentials List
  // -------------------------------------------------------------------------
  // Keep a mutable copy of allEssentials so we can add/remove essentials.
  // This lives here because useUnifiedSchedule needs it before
  // useEssentialHandlers can be called (dependency ordering).
  const [allEssentialsState, setAllEssentialsState] = React.useState<
    ScheduleEssential[]
  >(() => allEssentialsInput);

  // -------------------------------------------------------------------------
  // Preferences
  // -------------------------------------------------------------------------
  const {
    weekStartsOn,
    setWeekStartsOn,
    progressMetric,
    setProgressMetric,
    calendarZoom,
    setCalendarZoom,
    dayBoundariesEnabled,
    setDayBoundariesEnabled,
    dayBoundariesDisplay,
    setDayBoundariesDisplay,
    dayStartMinutes,
    dayEndMinutes,
    setDayBoundaries,
    showQuarterlyViewButton,
    setShowQuarterlyViewButton,
    showNextBlockCard,
    setShowNextBlockCard,
    showStatsViewButton,
    setShowStatsViewButton,
  } = usePreferences();

  // -------------------------------------------------------------------------
  // Week Navigation
  // -------------------------------------------------------------------------
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());

  const weekDates = React.useMemo(
    () => getWeekDates(selectedDate, weekStartsOn),
    [selectedDate, weekStartsOn],
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
  // Selection State (lifted here for coordination)
  // -------------------------------------------------------------------------
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null,
  );
  const [selectedGoalId, _setSelectedGoalId] = React.useState<string | null>(
    null,
  );

  // -------------------------------------------------------------------------
  // Clipboard
  // -------------------------------------------------------------------------
  const {
    copy,
    paste,
    hasContent: hasClipboardContent,
  } = useCalendarClipboard();

  // -------------------------------------------------------------------------
  // Unified Schedule
  // -------------------------------------------------------------------------
  const schedule = useUnifiedSchedule({
    initialGoals,
    allEssentials: allEssentialsState,
    initialEnabledEssentialIds,
    initialEvents,
    weekDates,
    onCopy: copy,
    onPaste: paste,
    hasClipboardContent,
    onEventCreated: (event) => setSelectedEventId(event.id),
  });

  // -------------------------------------------------------------------------
  // Essential Config & Handlers
  // -------------------------------------------------------------------------
  const essentialHandlers = useEssentialHandlers({
    allEssentials: allEssentialsState,
    setAllEssentials: setAllEssentialsState,
    initialEnabledEssentialIds,
    weekDates,
    scheduleEvents: schedule.events,
    scheduleAllEssentials: schedule.allEssentials,
    scheduleAddEvent: schedule.addEvent,
    scheduleToggleEssentialEnabled: schedule.toggleEssentialEnabled,
  });

  // -------------------------------------------------------------------------
  // Focus Mode
  // -------------------------------------------------------------------------
  // Use ref to avoid stale closure in onSessionEnd callback
  const calendarEventsRef = React.useRef(schedule.events);
  React.useEffect(() => {
    calendarEventsRef.current = schedule.events;
  }, [schedule.events]);

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
      // Find the event using ref to get current value
      const event = calendarEventsRef.current.find(
        (e) => e.id === completed.blockId,
      );
      if (!event) return;

      // Skip essentials (they don't track focus time)
      if (event.blockType === "essential") return;

      // Accumulate focus time on the event
      const additionalMinutes = Math.round(completed.totalMs / 60000);
      schedule.updateEvent(completed.blockId, {
        focusedMinutes: (event.focusedMinutes ?? 0) + additionalMinutes,
      });
    },
  });

  // -------------------------------------------------------------------------
  // Focus Notifications
  // -------------------------------------------------------------------------
  useFocusNotifications({
    session: focusSession,
    events: schedule.events,
    enabled: true,
    onNotify: () => {
      // Could play a sound here
      console.log("Focus session: block time ended");
    },
  });

  // -------------------------------------------------------------------------
  // Blueprint & Weekly Planning
  // -------------------------------------------------------------------------
  const { blueprint, hasBlueprint, saveBlueprint } = useBlueprint();

  const weekStartDate = weekDates[0]?.toISOString().split("T")[0] ?? "";
  const { getWeeklyPlan, saveWeeklyPlan, hasWeeklyPlan } = useWeeklyPlan();
  const currentWeekPlan = getWeeklyPlan(weekStartDate);

  // -------------------------------------------------------------------------
  // Skip Onboarding Setup (dev only)
  // -------------------------------------------------------------------------
  // When skipOnboarding is true, immediately save weekly plan and blueprint
  const skipOnboardingRef = React.useRef(false);
  React.useEffect(() => {
    if (skipOnboarding && !skipOnboardingRef.current) {
      skipOnboardingRef.current = true;
      // Save weekly plan for current week
      saveWeeklyPlan({
        weekStartDate,
        plannedAt: new Date().toISOString(),
      });
      // Save blueprint from initial events
      const blueprintBlocks = eventsToBlueprint(initialEvents, weekDates);
      saveBlueprint({
        blocks: blueprintBlocks,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [
    skipOnboarding,
    weekStartDate,
    saveWeeklyPlan,
    initialEvents,
    weekDates,
    saveBlueprint,
  ]);

  // -------------------------------------------------------------------------
  // Week Deadlines
  // -------------------------------------------------------------------------
  const weekDeadlines = React.useMemo(
    () => schedule.getWeekDeadlines(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule.getWeekDeadlines, weekDates],
  ) as Map<string, DeadlineTask[]>;

  const weekGoalDeadlines = React.useMemo(
    () => schedule.getWeekGoalDeadlines(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule.getWeekGoalDeadlines, weekDates],
  ) as Map<string, DeadlineGoal[]>;

  const weekMilestoneDeadlines = React.useMemo(
    () => schedule.getWeekMilestoneDeadlines(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule.getWeekMilestoneDeadlines, weekDates],
  ) as Map<string, DeadlineMilestone[]>;

  // Quarter deadlines for planning panel
  const quarterDeadlines = React.useMemo(
    () => schedule.getQuarterDeadlines(new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule.getQuarterDeadlines],
  );

  // -------------------------------------------------------------------------
  // Calendar Integrations
  // -------------------------------------------------------------------------
  const calendarSync = useCalendarSync();
  const integrationsSidebar = useIntegrationsSidebar();

  // Convert external events to calendar events for rendering
  const externalCalendarEvents = React.useMemo(
    () =>
      externalEventsToCalendarEvents(calendarSync.externalEvents, weekDates),
    [calendarSync.externalEvents, weekDates],
  );

  // Convert external all-day events for the deadline tray
  const allDayEvents = React.useMemo(
    () => externalEventsToAllDayEvents(calendarSync.externalEvents, weekDates),
    [calendarSync.externalEvents, weekDates],
  );

  // Merge regular events with external events
  const mergedEvents = React.useMemo(
    () => [...schedule.events, ...externalCalendarEvents],
    [schedule.events, externalCalendarEvents],
  );

  // -------------------------------------------------------------------------
  // Return Value
  // -------------------------------------------------------------------------
  return {
    // Data
    goals: schedule.goals,
    essentials: schedule.essentials,
    allEssentials: schedule.allEssentials,
    events: mergedEvents, // Includes external events
    allEvents: schedule.allEvents, // Unfiltered events for quarter view
    weekDates,
    weekDeadlines,
    weekGoalDeadlines,
    weekMilestoneDeadlines,
    quarterDeadlines,

    // Selection state
    selectedEventId,
    selectedGoalId,
    hoveredEvent: schedule.hoveredEvent,
    hoverPosition: schedule.hoverPosition,
    hoveredDayIndex: schedule.hoveredDayIndex,

    // Essential management
    enabledEssentialIds: schedule.enabledEssentialIds as Set<string>,
    draftEnabledEssentialIds:
      schedule.draftEnabledEssentialIds as Set<string> | null,
    onToggleEssentialEnabled: schedule.toggleEssentialEnabled,
    onStartEditingEssentials: schedule.startEditingEssentials,
    onSaveEssentialChanges: schedule.saveEssentialChanges,
    onCancelEssentialChanges: schedule.cancelEssentialChanges,
    onCreateEssential: essentialHandlers.createEssential,
    onDeleteEssential: essentialHandlers.deleteEssential,

    // Day boundaries
    dayStartMinutes,
    dayEndMinutes,
    onDayBoundariesChange: setDayBoundaries,
    dayBoundariesEnabled,
    onDayBoundariesEnabledChange: setDayBoundariesEnabled,
    dayBoundariesDisplay,
    onDayBoundariesDisplayChange: setDayBoundariesDisplay,

    // Essential templates
    essentialTemplates: essentialHandlers.essentialTemplates,
    onSaveEssentialSchedule: essentialHandlers.saveEssentialSchedule,
    onImportEssentialsToWeek: essentialHandlers.importEssentialsToWeek,
    weekNeedsEssentialImport: essentialHandlers.weekNeedsEssentialImport,

    // Goal CRUD
    onAddGoal: schedule.addGoal,
    onDeleteGoal: schedule.deleteGoal,
    onUpdateGoal: schedule.updateGoal,

    // Task CRUD
    onToggleTaskComplete: schedule.toggleTaskComplete,
    onAddTask: schedule.addTask,
    onUpdateTask: schedule.updateTask,
    onDeleteTask: schedule.deleteTask,

    // Subtask CRUD
    onAddSubtask: schedule.addSubtask,
    onToggleSubtaskComplete: schedule.toggleSubtaskComplete,
    onUpdateSubtask: schedule.updateSubtask,
    onDeleteSubtask: schedule.deleteSubtask,

    // Milestone CRUD
    onAddMilestone: schedule.addMilestone,
    onToggleMilestoneComplete: schedule.toggleMilestoneComplete,
    onUpdateMilestone: schedule.updateMilestone,
    onUpdateMilestoneDeadline: schedule.updateMilestoneDeadline,
    onDeleteMilestone: schedule.deleteMilestone,
    onToggleMilestonesEnabled: schedule.toggleMilestonesEnabled,

    // Deadline management
    onClearTaskDeadline: schedule.clearTaskDeadline,

    // Stats accessors
    getGoalStats: schedule.getGoalStats,
    getEssentialStats: schedule.getEssentialStats,
    getTaskSchedule: schedule.getTaskSchedule,
    getTaskDeadline: schedule.getTaskDeadline,

    // Calendar handlers
    calendarHandlers: schedule.calendarHandlers,

    // Event management
    onAddEvent: schedule.addEvent,
    onUpdateEvent: schedule.updateEvent,
    onReplaceEvents: schedule.replaceEvents,
    onAssignTaskToBlock: schedule.assignTaskToBlock,
    onUnassignTaskFromBlock: schedule.unassignTaskFromBlock,
    onUpdateBlockSyncSettings: schedule.updateBlockSyncSettings,
    onUpdateGoalSyncSettings: schedule.updateGoalSyncSettings,

    // Drop handling
    onDrop: schedule.handleDrop,

    // Focus mode
    focusSession,
    focusIsRunning,
    focusElapsedMs,
    onStartFocus: startFocus,
    onPauseFocus: pauseFocus,
    onResumeFocus: resumeFocus,
    onEndFocus: endFocus,

    // Blueprint & planning
    blueprint,
    hasBlueprint,
    onSaveBlueprint: saveBlueprint,
    currentWeekPlan,
    onSaveWeeklyPlan: saveWeeklyPlan,
    hasWeeklyPlan,
    onSetWeeklyFocus: schedule.setWeeklyFocus,

    // Preferences
    weekStartsOn,
    onWeekStartsOnChange: setWeekStartsOn,
    progressMetric,
    onProgressMetricChange: setProgressMetric,
    calendarZoom,
    onCalendarZoomChange: setCalendarZoom,
    showQuarterlyViewButton,
    onShowQuarterlyViewButtonChange: setShowQuarterlyViewButton,
    showNextBlockCard,
    onShowNextBlockCardChange: setShowNextBlockCard,
    showStatsViewButton,
    onShowStatsViewButtonChange: setShowStatsViewButton,

    // Navigation
    selectedDate,
    onPreviousWeek: goToPreviousWeek,
    onNextWeek: goToNextWeek,
    onToday: goToToday,

    // Reference data
    lifeAreas: lifeAreasHook.allLifeAreas,
    customLifeAreas: lifeAreasHook.customLifeAreas,
    goalIcons,

    // Life area management
    onAddLifeArea: lifeAreasHook.addLifeArea,
    onUpdateLifeArea: lifeAreasHook.updateLifeArea,
    onRemoveLifeArea: lifeAreasHook.removeLifeArea,

    // Calendar integrations
    calendarIntegrations: calendarSync.integrationStates,
    externalEvents: calendarSync.externalEvents,
    allDayEvents,
    integrationsSidebar,
    onConnectProvider: calendarSync.connectProvider,
    onDisconnectProvider: calendarSync.disconnectProvider,
    // Import settings
    onToggleImportEnabled: calendarSync.toggleImportEnabled,
    onToggleCalendarImport: calendarSync.toggleCalendarImport,
    onToggleMeetingsOnly: calendarSync.toggleMeetingsOnly,
    // Export settings
    onToggleCalendarExport: calendarSync.toggleCalendarExport,
    onToggleExportEnabled: calendarSync.toggleExportEnabled,
    onSetExportParticipation: calendarSync.setExportParticipation,
    onSetExportGoalFilter: calendarSync.setExportGoalFilter,
    onSetExportDefaultAppearance: calendarSync.setExportDefaultAppearance,
    onSetExportCustomLabel: calendarSync.setExportCustomLabel,
    onUpdateExternalEvent: calendarSync.updateExternalEvent,
  };
}
