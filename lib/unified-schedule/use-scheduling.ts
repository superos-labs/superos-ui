/**
 * =============================================================================
 * File: use-scheduling.ts
 * =============================================================================
 *
 * React hook responsible for translating user scheduling intents into
 * goal/task/essential blocks and deadline updates.
 *
 * Encapsulates all logic for creating calendar events, assigning tasks to
 * blocks, converting between task and goal blocks, and handling drag-drop
 * scheduling interactions.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Schedule goals, tasks, and essentials onto the calendar.
 * - Set and clear task deadlines (mutually exclusive with scheduled blocks).
 * - Assign and unassign tasks to goal blocks.
 * - Convert task blocks into goal blocks when combining tasks.
 * - Interpret drag-and-drop operations from the calendar.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Coordinates updates across both goals and events state.
 * - Uses defaults for block durations (goals: 60m, tasks: 30m, essentials: 60m).
 * - No persistence; caller owns saving.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useScheduling
 * - UseSchedulingOptions
 * - UseSchedulingReturn
 */

"use client";

import * as React from "react";
import type { DragItem, DropPosition } from "@/lib/drag-types";
import type { CalendarEvent, ScheduleGoal, ScheduleEssential } from "./types";

// ============================================================================
// Types
// ============================================================================

export interface UseSchedulingOptions {
  goals: ScheduleGoal[];
  allEssentials: ScheduleEssential[];
  events: CalendarEvent[];
  weekDates: Date[];
  setGoals: React.Dispatch<React.SetStateAction<ScheduleGoal[]>>;
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

export interface UseSchedulingReturn {
  /** Schedule a goal on the calendar */
  scheduleGoal: (
    goalId: string,
    dayIndex: number,
    startMinutes: number,
    durationMinutes?: number,
  ) => void;
  /** Schedule a task on the calendar */
  scheduleTask: (
    goalId: string,
    taskId: string,
    dayIndex: number,
    startMinutes: number,
    durationMinutes?: number,
  ) => void;
  /** Schedule an essential on the calendar */
  scheduleEssential: (
    essentialId: string,
    dayIndex: number,
    startMinutes: number,
    durationMinutes?: number,
  ) => void;
  /** Set a deadline for a task */
  setTaskDeadline: (goalId: string, taskId: string, date: string) => void;
  /** Clear a task's deadline */
  clearTaskDeadline: (goalId: string, taskId: string) => void;
  /** Assign a task to a goal block */
  assignTaskToBlock: (blockId: string, taskId: string) => void;
  /** Unassign a task from a goal block */
  unassignTaskFromBlock: (blockId: string, taskId: string) => void;
  /** Assign a task to an existing goal block (removes from any previous block) */
  assignTaskToGoalBlock: (
    blockId: string,
    goalId: string,
    taskId: string,
  ) => void;
  /** Convert a task block into a goal block containing both tasks */
  convertTaskBlockToGoalBlock: (blockId: string, droppedTaskId: string) => void;
  /** Process drops from drag context */
  handleDrop: (
    item: DragItem,
    position: DropPosition,
    weekDates: Date[],
  ) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useScheduling({
  goals,
  allEssentials,
  events,
  weekDates,
  setGoals,
  setEvents,
}: UseSchedulingOptions): UseSchedulingReturn {
  const scheduleGoal = React.useCallback(
    (
      goalId: string,
      dayIndex: number,
      startMinutes: number,
      durationMinutes?: number,
    ) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: goal.label,
        date: weekDates[dayIndex].toISOString().split("T")[0],
        dayIndex,
        startMinutes,
        durationMinutes: durationMinutes ?? 60, // Default 1 hour for goals
        color: goal.color,
        blockType: "goal",
        sourceGoalId: goalId,
        status: "planned",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [goals, weekDates, setEvents],
  );

  const scheduleTask = React.useCallback(
    (
      goalId: string,
      taskId: string,
      dayIndex: number,
      startMinutes: number,
      durationMinutes?: number,
    ) => {
      const newEventId = crypto.randomUUID();
      const eventDate = weekDates[dayIndex].toISOString().split("T")[0];

      // Update goals first to get task data and set the new block reference
      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);
        if (!goal || !task) return currentGoals;

        // Create new event using current goal/task data
        const newEvent: CalendarEvent = {
          id: newEventId,
          title: task.label,
          date: eventDate,
          dayIndex,
          startMinutes,
          durationMinutes: durationMinutes ?? 30, // Default 30 min for tasks
          color: goal.color, // Inherit from parent goal
          blockType: "task",
          sourceGoalId: goalId,
          sourceTaskId: taskId,
          status: task.completed ? "completed" : "planned",
          notes: task.description, // Sync task description to block notes
        };

        // Update events: remove old (if any), add new
        setEvents((currentEvents) => {
          const filtered = currentEvents.filter(
            (e) => e.sourceTaskId !== taskId,
          );
          return [...filtered, newEvent];
        });

        // Update task with new block reference and clear deadline (mutually exclusive)
        return currentGoals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        scheduledBlockId: newEventId,
                        deadline: undefined,
                      }
                    : t,
                ),
              }
            : g,
        );
      });
    },
    [weekDates, setGoals, setEvents],
  );

  const scheduleEssential = React.useCallback(
    (
      essentialId: string,
      dayIndex: number,
      startMinutes: number,
      durationMinutes?: number,
    ) => {
      const essential = allEssentials.find((c) => c.id === essentialId);
      if (!essential) return;

      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: essential.label,
        date: weekDates[dayIndex].toISOString().split("T")[0],
        dayIndex,
        startMinutes,
        durationMinutes: durationMinutes ?? 60, // Default 1 hour for essentials
        color: essential.color,
        blockType: "essential",
        sourceEssentialId: essentialId,
        status: "planned",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [allEssentials, weekDates, setEvents],
  );

  const setTaskDeadline = React.useCallback(
    (goalId: string, taskId: string, date: string) => {
      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);
        if (!goal || !task) return currentGoals;

        // If task has a scheduled block, remove it (mutually exclusive)
        if (task.scheduledBlockId) {
          const blockIdToRemove = task.scheduledBlockId;
          setEvents((prev) => prev.filter((e) => e.id !== blockIdToRemove));
        }

        // Update task with deadline and clear scheduledBlockId
        return currentGoals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? { ...t, deadline: date, scheduledBlockId: undefined }
                    : t,
                ),
              }
            : g,
        );
      });
    },
    [setGoals, setEvents],
  );

  const clearTaskDeadline = React.useCallback(
    (goalId: string, taskId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId ? { ...t, deadline: undefined } : t,
                ),
              }
            : g,
        ),
      );
    },
    [setGoals],
  );

  const assignTaskToBlock = React.useCallback(
    (blockId: string, taskId: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === blockId
            ? { ...e, assignedTaskIds: [...(e.assignedTaskIds ?? []), taskId] }
            : e,
        ),
      );
    },
    [setEvents],
  );

  const unassignTaskFromBlock = React.useCallback(
    (blockId: string, taskId: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === blockId
            ? {
                ...e,
                assignedTaskIds: (e.assignedTaskIds ?? []).filter(
                  (id) => id !== taskId,
                ),
              }
            : e,
        ),
      );
    },
    [setEvents],
  );

  const assignTaskToGoalBlock = React.useCallback(
    (blockId: string, goalId: string, taskId: string) => {
      setEvents((prev) => {
        // First, remove task from any existing block's assignedTaskIds
        const updated = prev.map((e) => {
          if (e.assignedTaskIds?.includes(taskId)) {
            return {
              ...e,
              assignedTaskIds: e.assignedTaskIds.filter((id) => id !== taskId),
            };
          }
          return e;
        });

        // Delete any standalone task block for this task
        const withoutTaskBlock = updated.filter(
          (e) => e.sourceTaskId !== taskId,
        );

        // Add to target block's assignedTaskIds
        return withoutTaskBlock.map((e) =>
          e.id === blockId
            ? { ...e, assignedTaskIds: [...(e.assignedTaskIds ?? []), taskId] }
            : e,
        );
      });

      // Clear task's scheduledBlockId since it's now part of a goal block
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? { ...t, scheduledBlockId: undefined, deadline: undefined }
                    : t,
                ),
              }
            : g,
        ),
      );
    },
    [setEvents, setGoals],
  );

  const convertTaskBlockToGoalBlock = React.useCallback(
    (blockId: string, droppedTaskId: string) => {
      setEvents((currentEvents) => {
        const targetBlock = currentEvents.find((e) => e.id === blockId);
        if (!targetBlock || targetBlock.blockType !== "task")
          return currentEvents;

        const existingTaskId = targetBlock.sourceTaskId;
        const goalId = targetBlock.sourceGoalId;
        if (!existingTaskId || !goalId) return currentEvents;

        // Find goal to get its label
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return currentEvents;

        // Remove the target block (we'll recreate it as a goal block)
        // Also remove dropped task's standalone block if it exists
        // Also remove dropped task from any other block's assignedTaskIds
        const filtered = currentEvents
          .filter((e) => e.id !== blockId && e.sourceTaskId !== droppedTaskId)
          .map((e) => {
            if (e.assignedTaskIds?.includes(droppedTaskId)) {
              return {
                ...e,
                assignedTaskIds: e.assignedTaskIds.filter(
                  (id) => id !== droppedTaskId,
                ),
              };
            }
            return e;
          });

        // Create the converted goal block
        const goalBlock: CalendarEvent = {
          ...targetBlock,
          title: goal.label,
          blockType: "goal",
          sourceTaskId: undefined, // No longer a task block
          assignedTaskIds: [existingTaskId, droppedTaskId],
        };

        return [...filtered, goalBlock];
      });

      // Clear scheduledBlockId for both tasks
      setGoals((currentGoals) => {
        // Find the existing task ID from the block we're converting
        const targetBlock = events.find((e) => e.id === blockId);
        const existingTaskId = targetBlock?.sourceTaskId;

        return currentGoals.map((g) => ({
          ...g,
          tasks: g.tasks?.map((t) =>
            t.id === droppedTaskId || t.id === existingTaskId
              ? { ...t, scheduledBlockId: undefined, deadline: undefined }
              : t,
          ),
        }));
      });
    },
    [goals, events, setEvents, setGoals],
  );

  const handleDrop = React.useCallback(
    (item: DragItem, position: DropPosition, weekDates: Date[]) => {
      // Block drop handling - dropping a task onto an existing block
      if (position.dropTarget === "existing-block" && position.targetBlockId) {
        // Only tasks can be dropped onto blocks
        if (item.type !== "task" || !item.taskId || !item.goalId) return;

        const targetBlock = events.find((e) => e.id === position.targetBlockId);
        if (!targetBlock) return;

        // Validate goal match - can only drop on blocks from the same goal
        if (targetBlock.sourceGoalId !== item.goalId) return;

        if (targetBlock.blockType === "goal") {
          // Drop onto goal block → assign task to that block
          assignTaskToGoalBlock(
            position.targetBlockId,
            item.goalId,
            item.taskId,
          );
        } else if (targetBlock.blockType === "task") {
          // Drop onto task block → convert to goal block with both tasks
          convertTaskBlockToGoalBlock(position.targetBlockId, item.taskId);
        }
        // Commitments don't accept drops (filtered by block detection)
        return;
      }

      if (position.dropTarget === "day-header") {
        // Deadline drop - only for tasks
        if (item.type === "task" && item.taskId && item.goalId) {
          const isoDate = weekDates[position.dayIndex]
            .toISOString()
            .split("T")[0];
          setTaskDeadline(item.goalId, item.taskId, isoDate);
        }
        // Goals and commitments dropped on header are ignored (only tasks can have deadlines)
      } else if (position.dropTarget === "time-grid") {
        // Time grid drop - use adaptive duration if available (shift+drag mode)
        const startMinutes = position.startMinutes ?? 0;
        const duration = position.adaptiveDuration; // undefined uses default
        if (item.type === "goal" && item.goalId) {
          scheduleGoal(item.goalId, position.dayIndex, startMinutes, duration);
        } else if (item.type === "task" && item.taskId && item.goalId) {
          scheduleTask(
            item.goalId,
            item.taskId,
            position.dayIndex,
            startMinutes,
            duration,
          );
        } else if (item.type === "essential" && item.essentialId) {
          scheduleEssential(
            item.essentialId,
            position.dayIndex,
            startMinutes,
            duration,
          );
        }
      }
    },
    [
      events,
      scheduleGoal,
      scheduleTask,
      scheduleEssential,
      setTaskDeadline,
      assignTaskToGoalBlock,
      convertTaskBlockToGoalBlock,
    ],
  );

  return {
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
  };
}
