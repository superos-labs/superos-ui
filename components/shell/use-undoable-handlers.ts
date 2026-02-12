/**
 * =============================================================================
 * File: use-undoable-handlers.ts
 * =============================================================================
 *
 * Undo-aware action wrapper for shell-level mutations.
 *
 * This hook decorates a subset of task and calendar handlers with undo
 * recording logic, while preserving their original signatures.
 *
 * It acts as a thin orchestration layer between feature-level actions
 * (tasks, blocks, deadlines, day completion) and the global undo system.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Wrap selected task mutations with undo commands.
 * - Wrap selected calendar mutations with undo commands.
 * - Capture minimal pre-mutation state required to restore changes.
 * - Batch related operations into single undo commands when appropriate.
 *
 * -----------------------------------------------------------------------------
 * SUPPORTED UNDO ACTIONS
 * -----------------------------------------------------------------------------
 * - Toggle task completion
 * - Delete task
 * - Unassign task from block
 * - Delete block
 * - Change block status (planned/completed)
 * - Mark entire day complete (batch)
 * - Record block creation (undo only, no toast)
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering undo UI.
 * - Defining undo keyboard shortcuts.
 * - Persisting undo history.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useUndoableHandlers
 */

"use client";

import * as React from "react";
import { useUndoOptional } from "@/lib/undo";
import type { UndoCommand } from "@/lib/undo";
import type {
  CalendarEvent,
  ScheduleTask,
  BlockStatus,
  HoverPosition,
} from "@/lib/unified-schedule";

// =============================================================================
// Calendar Handlers Type (mirrors UseUnifiedScheduleReturn.calendarHandlers)
// =============================================================================

interface CalendarHandlers {
  onEventResize: (
    eventId: string,
    newStartMinutes: number,
    newDurationMinutes: number,
  ) => void;
  onEventResizeEnd: () => void;
  onEventDragEnd: (
    eventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onEventDuplicate: (
    sourceEventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onGridDoubleClick: (dayIndex: number, startMinutes: number) => void;
  onGridDragCreate: (
    dayIndex: number,
    startMinutes: number,
    durationMinutes: number,
  ) => void;
  onEventCopy: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onEventStatusChange: (eventId: string, status: BlockStatus) => void;
  onEventPaste: (dayIndex: number, startMinutes: number) => void;
  hasClipboardContent: boolean;
  onEventHover: (event: CalendarEvent | null) => void;
  onGridPositionHover: (position: HoverPosition | null) => void;
  onDayHeaderHover: (dayIndex: number | null) => void;
  onMarkDayComplete: (dayIndex: number) => void;
}

// =============================================================================
// Types
// =============================================================================

interface UndoableHandlersOptions {
  // Original handlers
  onToggleTaskComplete: (goalId: string, taskId: string) => void;
  onDeleteTask: (goalId: string, taskId: string) => void;
  onUnassignTaskFromBlock: (blockId: string, taskId: string) => void;
  onAssignTaskToBlock: (blockId: string, taskId: string) => void;
  onAddTask: (goalId: string, label: string, initiativeId?: string) => string;
  onUpdateTask: (
    goalId: string,
    taskId: string,
    updates: Partial<ScheduleTask>,
  ) => void;

  // Event handlers
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onAddEvent: (event: CalendarEvent) => void;

  // Calendar handlers
  calendarHandlers: CalendarHandlers;

  // Data accessors for capturing state before mutation
  getTask: (goalId: string, taskId: string) => ScheduleTask | undefined;
  getEvent: (eventId: string) => CalendarEvent | undefined;
  getEventsForDay: (dayIndex: number) => CalendarEvent[];
  getDeadlineTasksForDay: (dayIndex: number) => Array<{
    goalId: string;
    taskId: string;
    completed: boolean;
  }>;
}

interface UndoableHandlersReturn {
  // Enhanced handlers with undo recording
  onToggleTaskComplete: (goalId: string, taskId: string) => void;
  onDeleteTask: (goalId: string, taskId: string) => void;
  onUnassignTaskFromBlock: (blockId: string, taskId: string) => void;

  // Enhanced calendar handlers (same type as input, with some handlers replaced)
  calendarHandlers: CalendarHandlers;

  // Block creation (undoable but no toast)
  recordBlockCreation: (eventId: string) => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateCommandId(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useUndoableHandlers(
  options: UndoableHandlersOptions,
): UndoableHandlersReturn {
  const undoContext = useUndoOptional();

  const {
    onToggleTaskComplete: originalToggleTask,
    onDeleteTask: originalDeleteTask,
    onUnassignTaskFromBlock: originalUnassignTask,
    onAssignTaskToBlock,
    onAddTask,
    onUpdateTask,
    onUpdateEvent,
    onAddEvent,
    calendarHandlers: originalCalendarHandlers,
    getTask,
    getEvent,
    getEventsForDay,
    getDeadlineTasksForDay,
  } = options;

  // -------------------------------------------------------------------------
  // Task Complete Handler (with undo)
  // -------------------------------------------------------------------------
  const handleToggleTaskComplete = React.useCallback(
    (goalId: string, taskId: string) => {
      // Capture state before mutation
      const task = getTask(goalId, taskId);
      const previousCompleted = task?.completed ?? false;

      // Execute the action
      originalToggleTask(goalId, taskId);

      // Record undo command
      if (undoContext) {
        const command: UndoCommand = {
          id: generateCommandId(),
          type: "task-complete",
          description: previousCompleted
            ? "Task marked incomplete"
            : "Task completed",
          timestamp: Date.now(),
          undo: () => {
            // Toggle back to previous state
            originalToggleTask(goalId, taskId);
          },
        };
        undoContext.recordAction(command);
      }
    },
    [originalToggleTask, getTask, undoContext],
  );

  // -------------------------------------------------------------------------
  // Task Delete Handler (with undo)
  // -------------------------------------------------------------------------
  const handleDeleteTask = React.useCallback(
    (goalId: string, taskId: string) => {
      // Capture the full task before deletion
      const task = getTask(goalId, taskId);

      if (!task) {
        // Task not found, just execute delete
        originalDeleteTask(goalId, taskId);
        return;
      }

      // Make a deep copy of the task for restoration
      const taskCopy: ScheduleTask = {
        ...task,
        subtasks: task.subtasks ? [...task.subtasks] : undefined,
      };

      // Execute the deletion
      originalDeleteTask(goalId, taskId);

      // Record undo command
      if (undoContext) {
        const command: UndoCommand = {
          id: generateCommandId(),
          type: "task-delete",
          description: "Task deleted",
          timestamp: Date.now(),
          undo: () => {
            // Restore the task by creating a new one with the same label
            // then updating it with the original properties
            const newTaskId = onAddTask(
              goalId,
              taskCopy.label,
              taskCopy.initiativeId,
            );

            // Update with remaining properties (completed status, description, deadline, etc.)
            onUpdateTask(goalId, newTaskId, {
              completed: taskCopy.completed,
              description: taskCopy.description,
              deadline: taskCopy.deadline,
              subtasks: taskCopy.subtasks,
              weeklyFocusWeek: taskCopy.weeklyFocusWeek,
            });

            // Note: scheduledBlockId won't be restored since the task has a new ID
            // This is a known limitation - the task will be unscheduled after undo
          },
        };
        undoContext.recordAction(command);
      }
    },
    [originalDeleteTask, getTask, undoContext, onAddTask, onUpdateTask],
  );

  // -------------------------------------------------------------------------
  // Task Unassign Handler (with undo)
  // -------------------------------------------------------------------------
  const handleUnassignTaskFromBlock = React.useCallback(
    (blockId: string, taskId: string) => {
      // Execute the action
      originalUnassignTask(blockId, taskId);

      // Record undo command
      if (undoContext) {
        const command: UndoCommand = {
          id: generateCommandId(),
          type: "task-unassign",
          description: "Task removed from block",
          timestamp: Date.now(),
          undo: () => {
            // Re-assign the task to the block
            onAssignTaskToBlock(blockId, taskId);
          },
        };
        undoContext.recordAction(command);
      }
    },
    [originalUnassignTask, undoContext, onAssignTaskToBlock],
  );

  // -------------------------------------------------------------------------
  // Block Delete Handler (with undo)
  // -------------------------------------------------------------------------
  const handleEventDelete = React.useCallback(
    (eventId: string) => {
      // Capture the full event before deletion
      const event = getEvent(eventId);

      // Don't allow undo for external events
      if (event?.isExternal) {
        originalCalendarHandlers.onEventDelete(eventId);
        return;
      }

      // Execute the deletion
      originalCalendarHandlers.onEventDelete(eventId);

      // Record undo command
      if (undoContext && event) {
        const command: UndoCommand = {
          id: generateCommandId(),
          type: "block-delete",
          description: "Block deleted",
          timestamp: Date.now(),
          undo: () => {
            // Restore the event
            onAddEvent(event);
          },
        };
        undoContext.recordAction(command);
      }
    },
    [originalCalendarHandlers, getEvent, undoContext, onAddEvent],
  );

  // -------------------------------------------------------------------------
  // Block Status Change Handler (with undo)
  // -------------------------------------------------------------------------
  const handleEventStatusChange = React.useCallback(
    (eventId: string, newStatus: BlockStatus) => {
      // Capture the previous status
      const event = getEvent(eventId);
      const previousStatus = event?.status;

      // Execute the status change
      originalCalendarHandlers.onEventStatusChange(eventId, newStatus);

      // Record undo command
      if (undoContext && event) {
        const isCompleting = newStatus === "completed";
        const command: UndoCommand = {
          id: generateCommandId(),
          type: "block-complete",
          description: isCompleting
            ? "Block completed"
            : "Block marked incomplete",
          timestamp: Date.now(),
          undo: () => {
            // Restore previous status
            onUpdateEvent(eventId, { status: previousStatus });
          },
        };
        undoContext.recordAction(command);
      }
    },
    [originalCalendarHandlers, getEvent, undoContext, onUpdateEvent],
  );

  // -------------------------------------------------------------------------
  // Mark Day Complete Handler (with undo - batch operation)
  // -------------------------------------------------------------------------
  const handleMarkDayComplete = React.useCallback(
    (dayIndex: number) => {
      // Capture all events and their statuses before mutation
      const eventsOnDay = getEventsForDay(dayIndex);
      const eventStatuses = new Map<string, BlockStatus | undefined>();

      eventsOnDay.forEach((event) => {
        // Only track non-external events that aren't already completed
        if (!event.isExternal && event.status !== "completed") {
          eventStatuses.set(event.id, event.status);
        }
      });

      // Capture deadline tasks
      const deadlineTasks = getDeadlineTasksForDay(dayIndex);
      const incompleteTasks = deadlineTasks.filter((t) => !t.completed);

      // Execute the action
      originalCalendarHandlers.onMarkDayComplete(dayIndex);

      // Record batch undo command
      if (
        undoContext &&
        (eventStatuses.size > 0 || incompleteTasks.length > 0)
      ) {
        const command: UndoCommand = {
          id: generateCommandId(),
          type: "day-complete",
          description: "Day completed",
          timestamp: Date.now(),
          undo: () => {
            // Restore all event statuses
            eventStatuses.forEach((previousStatus, eventId) => {
              onUpdateEvent(eventId, { status: previousStatus ?? "planned" });
            });

            // Toggle back incomplete tasks
            incompleteTasks.forEach(({ goalId, taskId }) => {
              originalToggleTask(goalId, taskId);
            });
          },
        };
        undoContext.recordAction(command);
      }
    },
    [
      originalCalendarHandlers,
      getEventsForDay,
      getDeadlineTasksForDay,
      undoContext,
      onUpdateEvent,
      originalToggleTask,
    ],
  );

  // -------------------------------------------------------------------------
  // Block Creation Recorder (no toast, but undoable via CMD+Z)
  // -------------------------------------------------------------------------
  const recordBlockCreation = React.useCallback(
    (eventId: string) => {
      if (!undoContext) return;

      const command: UndoCommand = {
        id: generateCommandId(),
        type: "block-create",
        description: "Block created",
        timestamp: Date.now(),
        undo: () => {
          // Delete the created event
          originalCalendarHandlers.onEventDelete(eventId);
        },
      };

      // Record without showing toast (we clear lastCommand immediately)
      undoContext.recordAction(command);
      undoContext.clearLastCommand();
    },
    [undoContext, originalCalendarHandlers],
  );

  // -------------------------------------------------------------------------
  // Compose enhanced calendar handlers
  // -------------------------------------------------------------------------
  const enhancedCalendarHandlers = React.useMemo(
    () => ({
      ...originalCalendarHandlers,
      onEventDelete: handleEventDelete,
      onEventStatusChange: handleEventStatusChange,
      onMarkDayComplete: handleMarkDayComplete,
    }),
    [
      originalCalendarHandlers,
      handleEventDelete,
      handleEventStatusChange,
      handleMarkDayComplete,
    ],
  );

  return {
    onToggleTaskComplete: handleToggleTaskComplete,
    onDeleteTask: handleDeleteTask,
    onUnassignTaskFromBlock: handleUnassignTaskFromBlock,
    calendarHandlers: enhancedCalendarHandlers,
    recordBlockCreation,
  };
}
