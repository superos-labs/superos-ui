"use client";

import * as React from "react";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";
import type { DragItem, DropPosition } from "@/lib/drag-types";
import type { CalendarEvent, BlockStatus, HoverPosition } from "@/components/calendar";
import { statusOnPaste } from "@/components/calendar";

// ============================================================================
// Types
// ============================================================================

/** Task within a goal */
export interface ScheduleTask {
  id: string;
  label: string;
  completed?: boolean;
  /** Reference to the calendar block if scheduled (mutually exclusive with deadline) */
  scheduledBlockId?: string;
  /** ISO date string for deadline (e.g., "2026-01-25") - mutually exclusive with scheduledBlockId */
  deadline?: string;
}

/** Goal in the backlog */
export interface ScheduleGoal {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  milestone?: string;
  tasks?: ScheduleTask[];
}

/** Computed statistics for a goal (derived from calendar events) */
export interface GoalStats {
  /** Total hours from all scheduled blocks */
  plannedHours: number;
  /** Total hours from completed blocks */
  completedHours: number;
}

/** Schedule info for a task */
export interface TaskScheduleInfo {
  blockId: string;
  dayIndex: number;
  startMinutes: number;
  durationMinutes: number;
}

/** Deadline info for a task */
export interface TaskDeadlineInfo {
  /** ISO date string (e.g., "2026-01-25") */
  date: string;
  /** Whether the deadline is in the past */
  isOverdue: boolean;
}

/** Task with deadline info for display in the deadline tray */
export interface DeadlineTask {
  taskId: string;
  goalId: string;
  label: string;
  goalLabel: string;
  goalColor: import("@/lib/colors").GoalColor;
  completed: boolean;
}

// ============================================================================
// Hook Options & Return Types
// ============================================================================

export interface UseUnifiedScheduleOptions {
  /** Initial goals for the backlog */
  initialGoals: ScheduleGoal[];
  /** Initial calendar events */
  initialEvents: CalendarEvent[];
  /** Clipboard copy function (from useCalendarClipboard) */
  onCopy?: (event: CalendarEvent) => void;
  /** Clipboard paste function (from useCalendarClipboard) */
  onPaste?: (dayIndex: number, startMinutes: number) => CalendarEvent | null;
  /** Whether clipboard has content */
  hasClipboardContent?: boolean;
}

export interface UseUnifiedScheduleReturn {
  // Data
  goals: ScheduleGoal[];
  events: CalendarEvent[];

  // Computed data accessors
  getGoalStats: (goalId: string) => GoalStats;
  getTaskSchedule: (taskId: string) => TaskScheduleInfo | null;
  getTaskDeadline: (taskId: string) => TaskDeadlineInfo | null;
  getWeekDeadlines: (weekDates: Date[]) => Map<string, DeadlineTask[]>;

  // Backlog actions
  toggleTaskComplete: (goalId: string, taskId: string) => void;

  // Scheduling actions (from drag-drop)
  scheduleGoal: (goalId: string, dayIndex: number, startMinutes: number) => void;
  scheduleTask: (
    goalId: string,
    taskId: string,
    dayIndex: number,
    startMinutes: number
  ) => void;

  // Deadline actions
  setTaskDeadline: (goalId: string, taskId: string, date: string) => void;
  clearTaskDeadline: (goalId: string, taskId: string) => void;

  // Calendar event actions
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
  markEventComplete: (eventId: string) => void;
  markEventIncomplete: (eventId: string) => void;

  // Handler to process drops from drag context (supports both grid and header drops)
  handleDrop: (item: DragItem, position: DropPosition, weekDates: Date[]) => void;

  // Hover state (for keyboard shortcuts)
  hoveredEvent: CalendarEvent | null;
  hoverPosition: HoverPosition | null;

  // Standard calendar handlers (spread onto Calendar component)
  calendarHandlers: {
    onEventResize: (
      eventId: string,
      newStartMinutes: number,
      newDurationMinutes: number
    ) => void;
    onEventResizeEnd: () => void;
    onEventDragEnd: (
      eventId: string,
      newDayIndex: number,
      newStartMinutes: number
    ) => void;
    onEventDuplicate: (
      sourceEventId: string,
      newDayIndex: number,
      newStartMinutes: number
    ) => void;
    onGridDoubleClick: (dayIndex: number, startMinutes: number) => void;
    onGridDragCreate: (
      dayIndex: number,
      startMinutes: number,
      durationMinutes: number
    ) => void;
    onEventCopy: (event: CalendarEvent) => void;
    onEventDelete: (eventId: string) => void;
    onEventStatusChange: (eventId: string, status: BlockStatus) => void;
    onEventPaste: (dayIndex: number, startMinutes: number) => void;
    hasClipboardContent: boolean;
    onEventHover: (event: CalendarEvent | null) => void;
    onGridPositionHover: (position: HoverPosition | null) => void;
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useUnifiedSchedule({
  initialGoals,
  initialEvents,
  onCopy,
  onPaste,
  hasClipboardContent = false,
}: UseUnifiedScheduleOptions): UseUnifiedScheduleReturn {
  const [goals, setGoals] = React.useState<ScheduleGoal[]>(initialGoals);
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);

  // Hover state for keyboard shortcuts
  const [hoveredEvent, setHoveredEvent] = React.useState<CalendarEvent | null>(null);
  const [hoverPosition, setHoverPosition] = React.useState<HoverPosition | null>(null);

  // -------------------------------------------------------------------------
  // Event Management
  // -------------------------------------------------------------------------

  const addEvent = React.useCallback((event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  // -------------------------------------------------------------------------
  // Computed Stats
  // -------------------------------------------------------------------------

  const getGoalStats = React.useCallback(
    (goalId: string): GoalStats => {
      const goalEvents = events.filter((e) => e.sourceGoalId === goalId);
      const plannedMinutes = goalEvents.reduce(
        (sum, e) => sum + e.durationMinutes,
        0
      );
      const completedMinutes = goalEvents
        .filter((e) => e.status === "completed")
        .reduce((sum, e) => sum + e.durationMinutes, 0);

      return {
        plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
        completedHours: Math.round((completedMinutes / 60) * 10) / 10,
      };
    },
    [events]
  );

  const getTaskSchedule = React.useCallback(
    (taskId: string): TaskScheduleInfo | null => {
      const event = events.find((e) => e.sourceTaskId === taskId);
      if (!event) return null;
      return {
        blockId: event.id,
        dayIndex: event.dayIndex,
        startMinutes: event.startMinutes,
        durationMinutes: event.durationMinutes,
      };
    },
    [events]
  );

  const getTaskDeadline = React.useCallback(
    (taskId: string): TaskDeadlineInfo | null => {
      for (const goal of goals) {
        const task = goal.tasks?.find((t) => t.id === taskId);
        if (task?.deadline) {
          const today = new Date().toISOString().split("T")[0];
          return {
            date: task.deadline,
            isOverdue: task.deadline < today && !task.completed,
          };
        }
      }
      return null;
    },
    [goals]
  );

  const getWeekDeadlines = React.useCallback(
    (weekDates: Date[]): Map<string, DeadlineTask[]> => {
      const result = new Map<string, DeadlineTask[]>();
      
      // Get ISO dates for the week
      const weekISODates = weekDates.map((d) => d.toISOString().split("T")[0]);
      
      for (const goal of goals) {
        if (!goal.tasks) continue;
        
        for (const task of goal.tasks) {
          if (task.deadline && weekISODates.includes(task.deadline)) {
            const existing = result.get(task.deadline) ?? [];
            existing.push({
              taskId: task.id,
              goalId: goal.id,
              label: task.label,
              goalLabel: goal.label,
              goalColor: goal.color,
              completed: task.completed ?? false,
            });
            result.set(task.deadline, existing);
          }
        }
      }
      
      return result;
    },
    [goals]
  );

  // -------------------------------------------------------------------------
  // Scheduling Actions
  // -------------------------------------------------------------------------

  const scheduleGoal = React.useCallback(
    (goalId: string, dayIndex: number, startMinutes: number) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: goal.label,
        dayIndex,
        startMinutes,
        durationMinutes: 60, // 1 hour for goals
        color: goal.color,
        blockType: "goal",
        sourceGoalId: goalId,
        status: "planned",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [goals]
  );

  const scheduleTask = React.useCallback(
    (
      goalId: string,
      taskId: string,
      dayIndex: number,
      startMinutes: number
    ) => {
      const goal = goals.find((g) => g.id === goalId);
      const task = goal?.tasks?.find((t) => t.id === taskId);
      if (!goal || !task) return;

      // Find existing block for this task (if any) to remove it
      const existingEvent = events.find((e) => e.sourceTaskId === taskId);

      // Create new event
      const newEventId = crypto.randomUUID();
      const newEvent: CalendarEvent = {
        id: newEventId,
        title: task.label,
        dayIndex,
        startMinutes,
        durationMinutes: 30, // 30 min for tasks
        color: goal.color, // Inherit from parent goal
        blockType: "task",
        sourceGoalId: goalId,
        sourceTaskId: taskId,
        status: task.completed ? "completed" : "planned",
      };

      // Update events: remove old, add new
      setEvents((prev) => {
        const filtered = existingEvent
          ? prev.filter((e) => e.id !== existingEvent.id)
          : prev;
        return [...filtered, newEvent];
      });

      // Update task with new block reference and clear deadline (mutually exclusive)
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId 
                    ? { ...t, scheduledBlockId: newEventId, deadline: undefined } 
                    : t
                ),
              }
            : g
        )
      );
    },
    [goals, events]
  );

  // -------------------------------------------------------------------------
  // Deadline Actions
  // -------------------------------------------------------------------------

  const setTaskDeadline = React.useCallback(
    (goalId: string, taskId: string, date: string) => {
      const goal = goals.find((g) => g.id === goalId);
      const task = goal?.tasks?.find((t) => t.id === taskId);
      if (!goal || !task) return;

      // If task has a scheduled block, remove it (mutually exclusive)
      if (task.scheduledBlockId) {
        setEvents((prev) => prev.filter((e) => e.id !== task.scheduledBlockId));
      }

      // Update task with deadline and clear scheduledBlockId
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? { ...t, deadline: date, scheduledBlockId: undefined }
                    : t
                ),
              }
            : g
        )
      );
    },
    [goals]
  );

  const clearTaskDeadline = React.useCallback(
    (goalId: string, taskId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId ? { ...t, deadline: undefined } : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  // -------------------------------------------------------------------------
  // Drop Handler
  // -------------------------------------------------------------------------

  const handleDrop = React.useCallback(
    (item: DragItem, position: DropPosition, weekDates: Date[]) => {
      if (position.dropTarget === "day-header") {
        // Deadline drop - only for tasks
        if (item.taskId) {
          const isoDate = weekDates[position.dayIndex].toISOString().split("T")[0];
          setTaskDeadline(item.goalId, item.taskId, isoDate);
        }
        // Goals dropped on header are ignored (only tasks can have deadlines)
      } else {
        // Time grid drop
        const startMinutes = position.startMinutes ?? 0;
        if (item.type === "goal") {
          scheduleGoal(item.goalId, position.dayIndex, startMinutes);
        } else if (item.taskId) {
          scheduleTask(item.goalId, item.taskId, position.dayIndex, startMinutes);
        }
      }
    },
    [scheduleGoal, scheduleTask, setTaskDeadline]
  );

  // -------------------------------------------------------------------------
  // Event Actions
  // -------------------------------------------------------------------------

  const updateEvent = React.useCallback(
    (eventId: string, updates: Partial<CalendarEvent>) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
      );
    },
    []
  );

  const deleteEvent = React.useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);

      // Remove the event
      setEvents((prev) => prev.filter((e) => e.id !== eventId));

      // Clear scheduledBlockId on task if this was a task block
      if (event?.blockType === "task" && event.sourceTaskId) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === event.sourceGoalId
              ? {
                  ...g,
                  tasks: g.tasks?.map((t) =>
                    t.id === event.sourceTaskId
                      ? { ...t, scheduledBlockId: undefined }
                      : t
                  ),
                }
              : g
          )
        );
      }
    },
    [events]
  );

  const markEventComplete = React.useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      // Update event status
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, status: "completed" as BlockStatus } : e
        )
      );

      // If it's a task block, also complete the task
      if (event.blockType === "task" && event.sourceTaskId) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === event.sourceGoalId
              ? {
                  ...g,
                  tasks: g.tasks?.map((t) =>
                    t.id === event.sourceTaskId ? { ...t, completed: true } : t
                  ),
                }
              : g
          )
        );
      }
    },
    [events]
  );

  const markEventIncomplete = React.useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      // Update event status
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, status: "planned" as BlockStatus } : e
        )
      );

      // If it's a task block, also un-complete the task
      if (event.blockType === "task" && event.sourceTaskId) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === event.sourceGoalId
              ? {
                  ...g,
                  tasks: g.tasks?.map((t) =>
                    t.id === event.sourceTaskId ? { ...t, completed: false } : t
                  ),
                }
              : g
          )
        );
      }
    },
    [events]
  );

  // -------------------------------------------------------------------------
  // Backlog Actions
  // -------------------------------------------------------------------------

  const toggleTaskComplete = React.useCallback(
    (goalId: string, taskId: string) => {
      // Find the current task state
      const goal = goals.find((g) => g.id === goalId);
      const task = goal?.tasks?.find((t) => t.id === taskId);
      if (!task) return;

      const newCompletedState = !task.completed;

      // Update the task
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId ? { ...t, completed: newCompletedState } : t
                ),
              }
            : g
        )
      );

      // If task has a scheduled block, update its status too
      if (task.scheduledBlockId) {
        const newStatus: BlockStatus = newCompletedState
          ? "completed"
          : "planned";
        setEvents((prev) =>
          prev.map((e) =>
            e.id === task.scheduledBlockId ? { ...e, status: newStatus } : e
          )
        );
      }
    },
    [goals]
  );

  // -------------------------------------------------------------------------
  // Calendar Handlers (for spreading onto Calendar component)
  // -------------------------------------------------------------------------

  const handleEventResize = React.useCallback(
    (eventId: string, newStartMinutes: number, newDurationMinutes: number) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                startMinutes: newStartMinutes,
                durationMinutes: newDurationMinutes,
              }
            : event
        )
      );
    },
    []
  );

  const handleEventResizeEnd = React.useCallback(() => {
    // Available for persistence
  }, []);

  const handleEventDragEnd = React.useCallback(
    (eventId: string, newDayIndex: number, newStartMinutes: number) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, dayIndex: newDayIndex, startMinutes: newStartMinutes }
            : event
        )
      );
    },
    []
  );

  const handleEventDuplicate = React.useCallback(
    (sourceEventId: string, newDayIndex: number, newStartMinutes: number) => {
      setEvents((prev) => {
        const source = prev.find((e) => e.id === sourceEventId);
        if (!source) return prev;

        // Only goal blocks can be duplicated (tasks can only have one instance)
        if (source.blockType === "task") {
          // Move instead of duplicate for tasks
          return prev.map((e) =>
            e.id === sourceEventId
              ? { ...e, dayIndex: newDayIndex, startMinutes: newStartMinutes }
              : e
          );
        }

        const duplicate: CalendarEvent = {
          ...source,
          id: crypto.randomUUID(),
          dayIndex: newDayIndex,
          startMinutes: newStartMinutes,
          status: statusOnPaste(source.status),
          taskCount: undefined,
        };
        return [...prev, duplicate];
      });
    },
    []
  );

  const handleGridDoubleClick = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      // Create a generic block (not linked to any goal)
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: "New Block",
        dayIndex,
        startMinutes,
        durationMinutes: 60,
        color: "indigo",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    []
  );

  const handleGridDragCreate = React.useCallback(
    (dayIndex: number, startMinutes: number, durationMinutes: number) => {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: "New Block",
        dayIndex,
        startMinutes,
        durationMinutes,
        color: "indigo",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    []
  );

  const handleEventCopy = React.useCallback((event: CalendarEvent) => {
    onCopy?.(event);
  }, [onCopy]);

  const handleEventPaste = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      const pastedEvent = onPaste?.(dayIndex, startMinutes);
      if (pastedEvent) {
        setEvents((prev) => [...prev, pastedEvent]);
      }
    },
    [onPaste]
  );

  const handleEventStatusChange = React.useCallback(
    (eventId: string, status: BlockStatus) => {
      if (status === "completed") {
        markEventComplete(eventId);
      } else if (status === "planned") {
        markEventIncomplete(eventId);
      } else {
        // Blueprint or other statuses
        updateEvent(eventId, { status });
      }
    },
    [markEventComplete, markEventIncomplete, updateEvent]
  );

  // -------------------------------------------------------------------------
  // Return Value
  // -------------------------------------------------------------------------

  return {
    goals,
    events,
    getGoalStats,
    getTaskSchedule,
    getTaskDeadline,
    getWeekDeadlines,
    toggleTaskComplete,
    scheduleGoal,
    scheduleTask,
    setTaskDeadline,
    clearTaskDeadline,
    handleDrop,
    addEvent,
    updateEvent,
    deleteEvent,
    markEventComplete,
    markEventIncomplete,
    hoveredEvent,
    hoverPosition,
    calendarHandlers: {
      onEventResize: handleEventResize,
      onEventResizeEnd: handleEventResizeEnd,
      onEventDragEnd: handleEventDragEnd,
      onEventDuplicate: handleEventDuplicate,
      onGridDoubleClick: handleGridDoubleClick,
      onGridDragCreate: handleGridDragCreate,
      onEventCopy: handleEventCopy,
      onEventDelete: deleteEvent,
      onEventStatusChange: handleEventStatusChange,
      onEventPaste: handleEventPaste,
      hasClipboardContent,
      onEventHover: setHoveredEvent,
      onGridPositionHover: setHoverPosition,
    },
  };
}
