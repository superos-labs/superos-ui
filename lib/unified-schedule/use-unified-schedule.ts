"use client";

import * as React from "react";
import type { CalendarEvent, BlockStatus } from "@/components/calendar";
import type {
  ScheduleTask,
  UseUnifiedScheduleOptions,
  UseUnifiedScheduleReturn,
} from "./types";

// Import composable hooks
import { useGoalState } from "./use-goal-state";
import { useEssentialVisibility } from "./use-essential-visibility";
import { useEventState } from "./use-event-state";
import { useScheduleStats } from "./use-schedule-stats";
import { useScheduling } from "./use-scheduling";

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Unified schedule hook that composes smaller, focused hooks for:
 * - Goal state management (goals, tasks, subtasks)
 * - Essential visibility management
 * - Event state management (calendar events)
 * - Schedule statistics (computed hours, task schedules, deadlines)
 * - Scheduling actions (drop handlers, scheduling operations)
 */
export function useUnifiedSchedule({
  initialGoals,
  allEssentials: allEssentialsInput,
  initialEnabledEssentialIds,
  initialEvents,
  weekDates,
  onCopy,
  onPaste,
  hasClipboardContent = false,
  onEventCreated,
}: UseUnifiedScheduleOptions): UseUnifiedScheduleReturn {
  // -------------------------------------------------------------------------
  // Compose Goal State
  // -------------------------------------------------------------------------
  const {
    goals,
    setGoals,
    addGoal,
    deleteGoal,
    updateGoal,
    toggleTaskComplete: baseToggleTaskComplete,
    addTask,
    updateTask: baseUpdateTask,
    deleteTask: baseDeleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
    findTask,
    // Milestone CRUD
    addMilestone,
    updateMilestone,
    toggleMilestoneComplete,
    deleteMilestone,
    toggleMilestonesEnabled,
  } = useGoalState({ initialGoals });

  // -------------------------------------------------------------------------
  // Compose Essential Visibility
  // -------------------------------------------------------------------------
  const {
    allEssentials,
    essentials,
    enabledEssentialIds,
    draftEnabledEssentialIds,
    mandatoryEssentialIds,
    toggleEssentialEnabled,
    startEditingEssentials,
    saveEssentialChanges,
    cancelEssentialChanges,
  } = useEssentialVisibility({
    allEssentials: allEssentialsInput,
    initialEnabledEssentialIds,
  });

  // -------------------------------------------------------------------------
  // Compose Event State
  // -------------------------------------------------------------------------
  const {
    allEvents,
    setEvents,
    hoveredEvent,
    hoverPosition,
    hoveredDayIndex,
    addEvent,
    updateEvent,
    deleteEvent: baseDeleteEvent,
    markEventComplete: baseMarkEventComplete,
    markEventIncomplete: baseMarkEventIncomplete,
    calendarHandlers: baseCalendarHandlers,
  } = useEventState({
    initialEvents,
    weekDates,
    onCopy,
    onPaste,
    hasClipboardContent,
    onEventCreated,
  });

  // -------------------------------------------------------------------------
  // Compose Schedule Stats
  // -------------------------------------------------------------------------
  const {
    getGoalStats,
    getEssentialStats,
    getTaskSchedule,
    getTaskDeadline,
    getWeekDeadlines,
    filteredEvents,
  } = useScheduleStats({
    goals,
    events: allEvents,
    weekDates,
    enabledEssentialIds,
  });

  // -------------------------------------------------------------------------
  // Compose Scheduling Actions
  // -------------------------------------------------------------------------
  const {
    scheduleGoal,
    scheduleTask,
    scheduleEssential,
    setTaskDeadline,
    clearTaskDeadline,
    assignTaskToBlock,
    unassignTaskFromBlock,
    assignTaskToGoalBlock,
    convertTaskBlockToGoalBlock,
    handleDrop,
  } = useScheduling({
    goals,
    allEssentials,
    events: allEvents,
    weekDates,
    setGoals,
    setEvents,
  });

  // -------------------------------------------------------------------------
  // Sync Task Counts on Events
  // -------------------------------------------------------------------------

  // Create a stable key for tracking assigned task changes
  // This ensures the sync effect runs when any event's assignedTaskIds changes
  const assignedTasksKey = React.useMemo(
    () =>
      allEvents
        .filter((e) => e.assignedTaskIds?.length)
        .map((e) => `${e.id}:${e.assignedTaskIds?.slice().sort().join(",")}`)
        .sort()
        .join("|"),
    [allEvents]
  );

  // Keep event.pendingTaskCount and event.completedTaskCount in sync with goals
  React.useEffect(() => {
    setEvents((currentEvents) => {
      let hasChanges = false;
      const updatedEvents = currentEvents.map((event) => {
        if (!event.assignedTaskIds?.length) {
          // No assigned tasks - ensure counts are undefined
          if (
            event.pendingTaskCount !== undefined ||
            event.completedTaskCount !== undefined
          ) {
            hasChanges = true;
            return {
              ...event,
              pendingTaskCount: undefined,
              completedTaskCount: undefined,
            };
          }
          return event;
        }

        // Find the goal for this event
        const goal = goals.find((g) => g.id === event.sourceGoalId);
        if (!goal?.tasks) return event;

        // Compute counts from assigned tasks
        const assignedTasks = goal.tasks.filter((t) =>
          event.assignedTaskIds!.includes(t.id)
        );
        const pendingCount = assignedTasks.filter((t) => !t.completed).length;
        const completedCount = assignedTasks.filter((t) => t.completed).length;

        // Only update if counts changed
        if (
          event.pendingTaskCount !== pendingCount ||
          event.completedTaskCount !== completedCount
        ) {
          hasChanges = true;
          return {
            ...event,
            pendingTaskCount: pendingCount,
            completedTaskCount: completedCount,
          };
        }
        return event;
      });

      return hasChanges ? updatedEvents : currentEvents;
    });
  }, [goals, assignedTasksKey, setEvents]);

  // -------------------------------------------------------------------------
  // Bidirectional Sync: Task ↔ Event
  // -------------------------------------------------------------------------

  // Toggle task complete with event sync
  const toggleTaskComplete = React.useCallback(
    (goalId: string, taskId: string) => {
      const result = findTask(taskId);
      const task = result?.task;

      // Get the new state that will be set
      const newCompletedState = task ? !task.completed : undefined;

      // Update the task first
      baseToggleTaskComplete(goalId, taskId);

      // If task has a scheduled block, update its status too
      if (task?.scheduledBlockId) {
        const blockId = task.scheduledBlockId;
        const newStatus: BlockStatus = newCompletedState ? "completed" : "planned";
        updateEvent(blockId, { status: newStatus });
      }
    },
    [findTask, baseToggleTaskComplete, updateEvent]
  );

  // Update task with event sync
  const updateTask = React.useCallback(
    (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => {
      const result = findTask(taskId);
      const task = result?.task;

      baseUpdateTask(goalId, taskId, updates);

      // Sync label/description changes to event if scheduled
      if (task?.scheduledBlockId) {
        const blockId = task.scheduledBlockId;
        const eventUpdates: Partial<CalendarEvent> = {};

        if (updates.label) {
          eventUpdates.title = updates.label;
        }
        if (updates.description !== undefined) {
          eventUpdates.notes = updates.description;
        }

        if (Object.keys(eventUpdates).length > 0) {
          updateEvent(blockId, eventUpdates);
        }
      }
    },
    [findTask, baseUpdateTask, updateEvent]
  );

  // Delete task with event cleanup
  const deleteTask = React.useCallback(
    (goalId: string, taskId: string) => {
      const result = findTask(taskId);
      const task = result?.task;

      // Remove associated calendar event if exists
      if (task?.scheduledBlockId) {
        baseDeleteEvent(task.scheduledBlockId);
      }

      baseDeleteTask(goalId, taskId);
    },
    [findTask, baseDeleteTask, baseDeleteEvent]
  );

  // Delete event with goal sync
  const deleteEvent = React.useCallback(
    (eventId: string) => {
      const event = allEvents.find((e) => e.id === eventId);

      // Clear scheduledBlockId on task if this was a task block
      if (event?.blockType === "task" && event.sourceTaskId && event.sourceGoalId) {
        baseUpdateTask(event.sourceGoalId, event.sourceTaskId, {
          scheduledBlockId: undefined,
        });
      }

      baseDeleteEvent(eventId);
    },
    [allEvents, baseUpdateTask, baseDeleteEvent]
  );

  // Mark event complete with goal sync
  const markEventComplete = React.useCallback(
    (eventId: string) => {
      const event = allEvents.find((e) => e.id === eventId);
      if (!event) return;

      // If it's a task block, also complete the task
      if (event.blockType === "task" && event.sourceTaskId && event.sourceGoalId) {
        baseUpdateTask(event.sourceGoalId, event.sourceTaskId, { completed: true });
      }

      // If it's a goal block with assigned tasks, complete all of them
      if (event.blockType === "goal" && event.assignedTaskIds?.length && event.sourceGoalId) {
        for (const taskId of event.assignedTaskIds) {
          baseUpdateTask(event.sourceGoalId, taskId, { completed: true });
        }
      }

      baseMarkEventComplete(eventId);
    },
    [allEvents, baseUpdateTask, baseMarkEventComplete]
  );

  // Mark event incomplete with goal sync
  const markEventIncomplete = React.useCallback(
    (eventId: string) => {
      const event = allEvents.find((e) => e.id === eventId);
      if (!event) return;

      // If it's a task block, also un-complete the task
      if (event.blockType === "task" && event.sourceTaskId && event.sourceGoalId) {
        baseUpdateTask(event.sourceGoalId, event.sourceTaskId, { completed: false });
      }

      baseMarkEventIncomplete(eventId);
    },
    [allEvents, baseUpdateTask, baseMarkEventIncomplete]
  );

  // -------------------------------------------------------------------------
  // Enhanced Calendar Handlers
  // -------------------------------------------------------------------------

  // Enhanced mark day complete that also completes deadline tasks
  const handleMarkDayComplete = React.useCallback(
    (dayIndex: number) => {
      const targetDate = weekDates[dayIndex].toISOString().split("T")[0];

      // 1. Mark all calendar events on this day as complete (via base handler)
      baseCalendarHandlers.onMarkDayComplete(dayIndex);

      // 2. Mark all deadline tasks for this day as complete
      for (const goal of goals) {
        if (!goal.tasks) continue;
        for (const task of goal.tasks) {
          // Check if task has a deadline on this day and is not already completed
          if (task.deadline === targetDate && !task.completed) {
            baseUpdateTask(goal.id, task.id, { completed: true });
          }
        }
      }
    },
    [weekDates, baseCalendarHandlers, goals, baseUpdateTask]
  );

  const calendarHandlers = React.useMemo(
    () => ({
      ...baseCalendarHandlers,
      onEventDelete: deleteEvent,
      onEventStatusChange: (eventId: string, status: BlockStatus) => {
        if (status === "completed") {
          markEventComplete(eventId);
        } else if (status === "planned") {
          markEventIncomplete(eventId);
        } else {
          updateEvent(eventId, { status });
        }
      },
      onMarkDayComplete: handleMarkDayComplete,
    }),
    [baseCalendarHandlers, deleteEvent, markEventComplete, markEventIncomplete, updateEvent, handleMarkDayComplete]
  );

  // -------------------------------------------------------------------------
  // Return Value
  // -------------------------------------------------------------------------

  return {
    goals,
    essentials,
    allEssentials,
    events: filteredEvents,
    // Essential visibility management
    enabledEssentialIds,
    draftEnabledEssentialIds,
    mandatoryEssentialIds,
    toggleEssentialEnabled,
    startEditingEssentials,
    saveEssentialChanges,
    cancelEssentialChanges,
    // Computed data accessors
    getGoalStats,
    getEssentialStats,
    getTaskSchedule,
    getTaskDeadline,
    getWeekDeadlines,
    addGoal,
    deleteGoal,
    updateGoal,
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
    // Milestone CRUD
    addMilestone,
    updateMilestone,
    toggleMilestoneComplete,
    deleteMilestone,
    toggleMilestonesEnabled,
    scheduleGoal,
    scheduleTask,
    scheduleEssential,
    setTaskDeadline,
    clearTaskDeadline,
    handleDrop,
    addEvent,
    updateEvent,
    deleteEvent,
    markEventComplete,
    markEventIncomplete,
    assignTaskToBlock,
    unassignTaskFromBlock,
    assignTaskToGoalBlock,
    convertTaskBlockToGoalBlock,
    hoveredEvent,
    hoverPosition,
    hoveredDayIndex,
    calendarHandlers,
  };
}
