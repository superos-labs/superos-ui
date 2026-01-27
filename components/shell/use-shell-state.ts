"use client";

/**
 * Composed state orchestration hook for the Shell component.
 * 
 * This hook brings together all the sub-hooks needed to run the shell:
 * - Unified schedule (goals, events, tasks, commitments)
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
import { useUnifiedSchedule, useWeekNavigation, useCommitmentAutoComplete } from "@/lib/unified-schedule";
import type { ScheduleGoal, ScheduleCommitment, DeadlineTask } from "@/lib/unified-schedule";
import { useFocusSession, useFocusNotifications } from "@/lib/focus";
import { useBlueprint, blueprintToEvents, eventsToBlueprint } from "@/lib/blueprint";
import type { BlueprintIntention } from "@/lib/blueprint";
import { useWeeklyPlan, usePlanningFlow, useIntentionProgress } from "@/lib/weekly-planning";
import type { WeeklyIntention } from "@/lib/weekly-planning";
import { usePreferences } from "@/lib/preferences";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { UseShellStateOptions, UseShellStateReturn } from "./shell-types";

// =============================================================================
// Hook Implementation
// =============================================================================

export function useShellState(options: UseShellStateOptions): UseShellStateReturn {
  const {
    initialGoals,
    allCommitments: allCommitmentsInput,
    initialEnabledCommitmentIds,
    initialEvents,
    lifeAreas,
    goalIcons,
  } = options;

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
  // Selection State (lifted here for coordination)
  // -------------------------------------------------------------------------
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Clipboard
  // -------------------------------------------------------------------------
  const { copy, paste, hasContent: hasClipboardContent } = useCalendarClipboard();

  // -------------------------------------------------------------------------
  // Unified Schedule
  // -------------------------------------------------------------------------
  const schedule = useUnifiedSchedule({
    initialGoals,
    allCommitments: allCommitmentsInput,
    initialEnabledCommitmentIds,
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
      const event = calendarEventsRef.current.find((e) => e.id === completed.blockId);
      if (!event) return;

      // Skip commitments (they don't track focus time)
      if (event.blockType === "commitment") return;

      // Accumulate focus time on the event
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
    events: schedule.events,
    enabled: autoCompleteCommitments,
    markComplete: schedule.markEventComplete,
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
  // Intention Progress
  // -------------------------------------------------------------------------
  const { getProgress: getIntentionProgress } = useIntentionProgress({
    goals: schedule.goals,
    events: schedule.events,
    weeklyPlan: currentWeekPlan,
    weekDates,
  });

  // -------------------------------------------------------------------------
  // Week Deadlines
  // -------------------------------------------------------------------------
  const weekDeadlines = React.useMemo(
    () => schedule.getWeekDeadlines(weekDates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule.getWeekDeadlines, weekDates]
  ) as Map<string, import("@/lib/unified-schedule").DeadlineTask[]>;

  // -------------------------------------------------------------------------
  // Return Value
  // -------------------------------------------------------------------------
  return {
    // Data
    goals: schedule.goals,
    commitments: schedule.commitments,
    allCommitments: schedule.allCommitments,
    events: schedule.events,
    weekDates,
    weekDeadlines,

    // Selection state
    selectedEventId,
    selectedGoalId,
    hoveredEvent: schedule.hoveredEvent,
    hoverPosition: schedule.hoverPosition,
    hoveredDayIndex: schedule.hoveredDayIndex,

    // Commitment management
    enabledCommitmentIds: schedule.enabledCommitmentIds as Set<string>,
    draftEnabledCommitmentIds: schedule.draftEnabledCommitmentIds as Set<string> | null,
    mandatoryCommitmentIds: schedule.mandatoryCommitmentIds as Set<string>,
    onToggleCommitmentEnabled: schedule.toggleCommitmentEnabled,
    onStartEditingCommitments: schedule.startEditingCommitments,
    onSaveCommitmentChanges: schedule.saveCommitmentChanges,
    onCancelCommitmentChanges: schedule.cancelCommitmentChanges,

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

    // Deadline management
    onClearTaskDeadline: schedule.clearTaskDeadline,

    // Stats accessors
    getGoalStats: schedule.getGoalStats,
    getCommitmentStats: schedule.getCommitmentStats,
    getTaskSchedule: schedule.getTaskSchedule,
    getTaskDeadline: schedule.getTaskDeadline,

    // Calendar handlers
    calendarHandlers: schedule.calendarHandlers,

    // Event management
    onAddEvent: schedule.addEvent,
    onUpdateEvent: schedule.updateEvent,
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
    getIntentionProgress,

    // Preferences
    weekStartsOn,
    onWeekStartsOnChange: setWeekStartsOn,
    progressMetric,
    onProgressMetricChange: setProgressMetric,

    // Navigation
    selectedDate,
    onPreviousWeek: goToPreviousWeek,
    onNextWeek: goToNextWeek,
    onToday: goToToday,

    // Reference data
    lifeAreas,
    goalIcons,
  };
}
