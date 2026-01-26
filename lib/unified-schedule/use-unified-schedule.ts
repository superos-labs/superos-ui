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
import { useCommitmentVisibility } from "./use-commitment-visibility";
import { useEventState } from "./use-event-state";
import { useScheduleStats } from "./use-schedule-stats";
import { useScheduling } from "./use-scheduling";

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Unified schedule hook that composes smaller, focused hooks for:
 * - Goal state management (goals, tasks, subtasks)
 * - Commitment visibility management
 * - Event state management (calendar events)
 * - Schedule statistics (computed hours, task schedules, deadlines)
 * - Scheduling actions (drop handlers, scheduling operations)
 */
export function useUnifiedSchedule({
  initialGoals,
  allCommitments: allCommitmentsInput,
  initialEnabledCommitmentIds,
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
    toggleTaskComplete: baseToggleTaskComplete,
    addTask,
    updateTask: baseUpdateTask,
    deleteTask: baseDeleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
    findTask,
  } = useGoalState({ initialGoals });

  // -------------------------------------------------------------------------
  // Compose Commitment Visibility
  // -------------------------------------------------------------------------
  const {
    allCommitments,
    commitments,
    enabledCommitmentIds,
    draftEnabledCommitmentIds,
    mandatoryCommitmentIds,
    toggleCommitmentEnabled,
    startEditingCommitments,
    saveCommitmentChanges,
    cancelCommitmentChanges,
  } = useCommitmentVisibility({
    allCommitments: allCommitmentsInput,
    initialEnabledCommitmentIds,
  });

  // -------------------------------------------------------------------------
  // Compose Event State
  // -------------------------------------------------------------------------
  const {
    allEvents,
    setEvents,
    hoveredEvent,
    hoverPosition,
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
    getCommitmentStats,
    getTaskSchedule,
    getTaskDeadline,
    getWeekDeadlines,
    filteredEvents,
  } = useScheduleStats({
    goals,
    events: allEvents,
    weekDates,
    enabledCommitmentIds,
  });

  // -------------------------------------------------------------------------
  // Compose Scheduling Actions
  // -------------------------------------------------------------------------
  const {
    scheduleGoal,
    scheduleTask,
    scheduleCommitment,
    setTaskDeadline,
    clearTaskDeadline,
    assignTaskToBlock,
    unassignTaskFromBlock,
    assignTaskToGoalBlock,
    convertTaskBlockToGoalBlock,
    handleDrop,
  } = useScheduling({
    goals,
    allCommitments,
    events: allEvents,
    weekDates,
    setGoals,
    setEvents,
  });

  // -------------------------------------------------------------------------
  // Sync Task Counts on Events
  // -------------------------------------------------------------------------

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
  }, [goals, setEvents]);

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
    }),
    [baseCalendarHandlers, deleteEvent, markEventComplete, markEventIncomplete, updateEvent]
  );

  // -------------------------------------------------------------------------
  // Return Value
  // -------------------------------------------------------------------------

  return {
    goals,
    commitments,
    allCommitments,
    events: filteredEvents,
    // Commitment visibility management
    enabledCommitmentIds,
    draftEnabledCommitmentIds,
    mandatoryCommitmentIds,
    toggleCommitmentEnabled,
    startEditingCommitments,
    saveCommitmentChanges,
    cancelCommitmentChanges,
    // Computed data accessors
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
    scheduleGoal,
    scheduleTask,
    scheduleCommitment,
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
    calendarHandlers,
  };
}
