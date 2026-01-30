"use client";

/**
 * Composed state orchestration hook for the Shell component.
 *
 * This hook brings together all the sub-hooks needed to run the shell:
 * - Unified schedule (goals, events, tasks, essentials)
 * - Focus session management
 * - Blueprint and weekly planning
 * - Week navigation
 * - Preferences
 *
 * This is the primary integration point that consumers use to get all
 * the state and handlers needed by ShellContent.
 */

import * as React from "react";
import { getWeekDates } from "@/components/calendar";
import type { CalendarEvent } from "@/components/calendar";
import { useCalendarClipboard } from "@/components/calendar";
import { useUnifiedSchedule, useWeekNavigation } from "@/lib/unified-schedule";
import type {
  ScheduleGoal,
  ScheduleEssential,
  DeadlineTask,
} from "@/lib/unified-schedule";
import {
  useEssentialConfig,
  importEssentialsToEvents,
  weekNeedsEssentialImport,
} from "@/lib/essentials";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import { DEFAULT_ESSENTIAL_SLOTS } from "@/lib/essentials";
import { useFocusSession, useFocusNotifications } from "@/lib/focus";
import {
  useBlueprint,
  blueprintToEvents,
  eventsToBlueprint,
} from "@/lib/blueprint";
import { useWeeklyPlan, usePlanningFlow } from "@/lib/weekly-planning";
import { usePreferences } from "@/lib/preferences";
import type { LifeArea, GoalIconOption, IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import { LIFE_AREAS } from "@/lib/life-areas";
import type { NewEssentialData } from "@/components/backlog";
import {
  useCalendarSync,
  useIntegrationsSidebar,
  externalEventsToCalendarEvents,
  externalEventsToAllDayEvents,
} from "@/lib/calendar-sync";
import type { UseShellStateOptions, UseShellStateReturn } from "./shell-types";

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
    lifeAreas: defaultLifeAreas,
    goalIcons,
  } = options;

  // -------------------------------------------------------------------------
  // Custom Life Areas
  // -------------------------------------------------------------------------
  const [customLifeAreas, setCustomLifeAreas] = React.useState<LifeArea[]>([]);

  // Combined life areas (defaults + custom)
  const allLifeAreas = React.useMemo(
    () => [...LIFE_AREAS, ...customLifeAreas],
    [customLifeAreas],
  );

  const handleAddLifeArea = React.useCallback(
    (data: { label: string; icon: IconComponent; color: GoalColor }): string | null => {
      // Validate: no duplicate labels (case-insensitive)
      const exists = allLifeAreas.some(
        (a) => a.label.toLowerCase() === data.label.toLowerCase(),
      );
      if (exists) return null;

      const newArea: LifeArea = {
        id: `custom-${Date.now()}`,
        label: data.label,
        icon: data.icon,
        color: data.color,
        isCustom: true,
      };
      setCustomLifeAreas((prev) => [...prev, newArea]);
      return newArea.id;
    },
    [allLifeAreas],
  );

  const handleUpdateLifeArea = React.useCallback(
    (
      id: string,
      updates: { label?: string; icon?: IconComponent; color?: GoalColor },
    ) => {
      // Only allow updating custom areas
      setCustomLifeAreas((prev) =>
        prev.map((area) => (area.id === id ? { ...area, ...updates } : area)),
      );
    },
    [],
  );

  const handleRemoveLifeArea = React.useCallback((id: string) => {
    setCustomLifeAreas((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // -------------------------------------------------------------------------
  // Mutable Essentials List
  // -------------------------------------------------------------------------
  // Keep a mutable copy of allEssentials so we can add/remove essentials
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
    autoCompleteEssentials,
    calendarZoom,
    setCalendarZoom,
    dayBoundariesEnabled,
    setDayBoundariesEnabled,
    dayBoundariesDisplay,
    setDayBoundariesDisplay,
    dayStartMinutes,
    dayEndMinutes,
    setDayBoundaries,
  } = usePreferences();

  // -------------------------------------------------------------------------
  // Essential Config (templates)
  // -------------------------------------------------------------------------
  // Generate initial templates for enabled essentials with default slots
  const initialTemplates = React.useMemo(() => {
    const enabledIds =
      initialEnabledEssentialIds ?? allEssentialsState.map((e) => e.id);
    return enabledIds.map(
      (essentialId): EssentialTemplate => ({
        essentialId,
        slots: (DEFAULT_ESSENTIAL_SLOTS[essentialId] ?? []).map((slot) => ({
          ...slot,
          id: `slot-init-${essentialId}-${slot.id}`,
        })),
      }),
    );
  }, [initialEnabledEssentialIds, allEssentialsState]);

  const essentialConfig = useEssentialConfig({
    initialEnabledIds:
      initialEnabledEssentialIds ?? allEssentialsState.map((e) => e.id),
    initialTemplates,
  });

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
  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(
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
  const { getWeeklyPlan, saveWeeklyPlan } = useWeeklyPlan();
  const currentWeekPlan = getWeeklyPlan(weekStartDate);

  // -------------------------------------------------------------------------
  // Week Deadlines
  // -------------------------------------------------------------------------
  const weekDeadlines = React.useMemo(
    () => schedule.getWeekDeadlines(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule.getWeekDeadlines, weekDates],
  ) as Map<string, import("@/lib/unified-schedule").DeadlineTask[]>;

  // -------------------------------------------------------------------------
  // Calendar Integrations
  // -------------------------------------------------------------------------
  const calendarSync = useCalendarSync();
  const integrationsSidebar = useIntegrationsSidebar();

  // Convert external events to calendar events for rendering
  const externalCalendarEvents = React.useMemo(
    () => externalEventsToCalendarEvents(calendarSync.externalEvents, weekDates),
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
  // Essential Schedule Handlers
  // -------------------------------------------------------------------------
  const handleSaveEssentialSchedule = React.useCallback(
    (essentialId: string, slots: EssentialSlot[]) => {
      essentialConfig.setSlots(essentialId, slots);
    },
    [essentialConfig],
  );

  // Check if the week needs essential import
  const needsEssentialImport = React.useMemo(() => {
    return weekNeedsEssentialImport(
      schedule.events,
      essentialConfig.config.enabledIds,
    );
  }, [schedule.events, essentialConfig.config.enabledIds]);

  const handleImportEssentialsToWeek = React.useCallback(() => {
    // Skip if week already has essentials
    if (!needsEssentialImport) return;

    // Get enabled templates
    const enabledTemplates = essentialConfig.config.templates.filter((t) =>
      essentialConfig.config.enabledIds.includes(t.essentialId),
    );

    // Map essentials to the format expected by importEssentialsToEvents
    const essentialsData = schedule.allEssentials.map((e) => ({
      id: e.id,
      label: e.label,
      color: e.color,
    }));

    // Import essentials to events
    const newEvents = importEssentialsToEvents({
      templates: enabledTemplates,
      weekDates,
      essentials: essentialsData,
    });

    // Add all new events
    newEvents.forEach((event) => {
      schedule.addEvent(event);
    });
  }, [
    needsEssentialImport,
    essentialConfig.config,
    schedule.allEssentials,
    weekDates,
    schedule.addEvent,
  ]);

  // -------------------------------------------------------------------------
  // Create/Delete Essential Handlers
  // -------------------------------------------------------------------------
  const handleCreateEssential = React.useCallback(
    (data: NewEssentialData, slots: EssentialSlot[]) => {
      // Generate a unique ID for the new essential
      const id = `essential-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      // Create the new essential
      const newEssential: ScheduleEssential = {
        id,
        label: data.label,
        icon: data.icon,
        color: data.color,
      };

      // Add to allEssentials state
      setAllEssentialsState((prev) => [...prev, newEssential]);

      // Enable the essential in the visibility system (for UI display)
      // This updates useEssentialVisibility's enabledEssentialIds
      schedule.toggleEssentialEnabled(id);

      // Enable the essential and set its slots in config (for templates)
      // We need to manually add the template since enableEssential uses defaults
      essentialConfig.enableEssential(id);

      // Set the slots after enabling (with a small delay to ensure template exists)
      setTimeout(() => {
        essentialConfig.setSlots(id, slots);
      }, 0);
    },
    [essentialConfig, schedule.toggleEssentialEnabled],
  );

  const handleDeleteEssential = React.useCallback(
    (essentialId: string) => {
      // Don't allow deleting Sleep
      if (essentialId === "sleep") return;

      // Disable in config (removes from enabledIds and templates)
      essentialConfig.disableEssential(essentialId);

      // Remove from allEssentials state
      setAllEssentialsState((prev) => prev.filter((e) => e.id !== essentialId));
    },
    [essentialConfig],
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
    weekDates,
    weekDeadlines,

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
    onCreateEssential: handleCreateEssential,
    onDeleteEssential: handleDeleteEssential,

    // Day boundaries
    dayStartMinutes,
    dayEndMinutes,
    onDayBoundariesChange: setDayBoundaries,
    dayBoundariesEnabled,
    onDayBoundariesEnabledChange: setDayBoundariesEnabled,
    dayBoundariesDisplay,
    onDayBoundariesDisplayChange: setDayBoundariesDisplay,

    // Essential templates
    essentialTemplates: essentialConfig.config.templates,
    onSaveEssentialSchedule: handleSaveEssentialSchedule,
    onImportEssentialsToWeek: handleImportEssentialsToWeek,
    weekNeedsEssentialImport: needsEssentialImport,

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
    onSetWeeklyFocus: schedule.setWeeklyFocus,

    // Preferences
    weekStartsOn,
    onWeekStartsOnChange: setWeekStartsOn,
    progressMetric,
    onProgressMetricChange: setProgressMetric,
    calendarZoom,
    onCalendarZoomChange: setCalendarZoom,

    // Navigation
    selectedDate,
    onPreviousWeek: goToPreviousWeek,
    onNextWeek: goToNextWeek,
    onToday: goToToday,

    // Reference data
    lifeAreas: allLifeAreas,
    customLifeAreas,
    goalIcons,

    // Life area management
    onAddLifeArea: handleAddLifeArea,
    onUpdateLifeArea: handleUpdateLifeArea,
    onRemoveLifeArea: handleRemoveLifeArea,

    // Calendar integrations
    calendarIntegrations: calendarSync.integrationStates,
    externalEvents: calendarSync.externalEvents,
    allDayEvents,
    integrationsSidebar,
    onConnectProvider: calendarSync.connectProvider,
    onDisconnectProvider: calendarSync.disconnectProvider,
    onToggleCalendarImport: calendarSync.toggleCalendarImport,
    onToggleCalendarExport: calendarSync.toggleCalendarExport,
    onToggleMeetingsOnly: calendarSync.toggleMeetingsOnly,
    onUpdateExternalEvent: calendarSync.updateExternalEvent,
  };
}
