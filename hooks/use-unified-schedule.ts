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

/** Subtask within a task */
export interface Subtask {
  id: string;
  label: string;
  completed: boolean;
}

/** Task within a goal */
export interface ScheduleTask {
  id: string;
  label: string;
  completed?: boolean;
  /** Reference to the calendar block if scheduled (mutually exclusive with deadline) */
  scheduledBlockId?: string;
  /** ISO date string for deadline (e.g., "2026-01-25") - mutually exclusive with scheduledBlockId */
  deadline?: string;
  /** Optional description for additional context */
  description?: string;
  /** Optional subtasks (simple checkboxes, not schedulable) */
  subtasks?: Subtask[];
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

/** Commitment in the backlog (simpler than goals, no tasks) */
export interface ScheduleCommitment {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** If true, commitment cannot be disabled by the user */
  mandatory?: boolean;
}

export interface UseUnifiedScheduleOptions {
  /** Initial goals for the backlog */
  initialGoals: ScheduleGoal[];
  /** All available commitments (includes mandatory flag) */
  allCommitments: ScheduleCommitment[];
  /** Initial set of enabled commitment IDs (defaults to all) */
  initialEnabledCommitmentIds?: string[];
  /** Initial calendar events */
  initialEvents: CalendarEvent[];
  /** Clipboard copy function (from useCalendarClipboard) */
  onCopy?: (event: CalendarEvent) => void;
  /** Clipboard paste function (from useCalendarClipboard) */
  onPaste?: (dayIndex: number, startMinutes: number) => CalendarEvent | null;
  /** Whether clipboard has content */
  hasClipboardContent?: boolean;
  /** Called when a new event is created (for auto-selection) */
  onEventCreated?: (event: CalendarEvent) => void;
}

export interface UseUnifiedScheduleReturn {
  // Data
  goals: ScheduleGoal[];
  /** Filtered commitments (only enabled ones) */
  commitments: ScheduleCommitment[];
  /** All available commitments (for edit mode) */
  allCommitments: ScheduleCommitment[];
  /** Filtered events (excludes disabled commitment blocks) */
  events: CalendarEvent[];

  // Commitment visibility management
  /** Current set of enabled commitment IDs */
  enabledCommitmentIds: Set<string>;
  /** Draft enabled IDs during editing (null when not editing) */
  draftEnabledCommitmentIds: Set<string> | null;
  /** Set of mandatory commitment IDs (cannot be disabled) */
  mandatoryCommitmentIds: Set<string>;
  /** Toggle a commitment's enabled state (works on draft) */
  toggleCommitmentEnabled: (id: string) => void;
  /** Start editing commitments (creates draft from current state) */
  startEditingCommitments: () => void;
  /** Save draft to actual enabled state */
  saveCommitmentChanges: () => void;
  /** Discard draft changes */
  cancelCommitmentChanges: () => void;

  // Computed data accessors
  getGoalStats: (goalId: string) => GoalStats;
  getCommitmentStats: (commitmentId: string) => GoalStats;
  getTaskSchedule: (taskId: string) => TaskScheduleInfo | null;
  getTaskDeadline: (taskId: string) => TaskDeadlineInfo | null;
  getWeekDeadlines: (weekDates: Date[]) => Map<string, DeadlineTask[]>;

  // Backlog actions
  addGoal: (goal: ScheduleGoal) => void;
  toggleTaskComplete: (goalId: string, taskId: string) => void;

  // Task CRUD actions
  addTask: (goalId: string, label: string) => string;
  updateTask: (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => void;
  deleteTask: (goalId: string, taskId: string) => void;

  // Subtask CRUD actions
  addSubtask: (goalId: string, taskId: string, label: string) => void;
  updateSubtask: (goalId: string, taskId: string, subtaskId: string, label: string) => void;
  toggleSubtaskComplete: (goalId: string, taskId: string, subtaskId: string) => void;
  deleteSubtask: (goalId: string, taskId: string, subtaskId: string) => void;

  // Scheduling actions (from drag-drop)
  scheduleGoal: (goalId: string, dayIndex: number, startMinutes: number) => void;
  scheduleTask: (
    goalId: string,
    taskId: string,
    dayIndex: number,
    startMinutes: number
  ) => void;
  scheduleCommitment: (
    commitmentId: string,
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

  // Task assignment to blocks (for goal blocks)
  assignTaskToBlock: (blockId: string, taskId: string) => void;
  unassignTaskFromBlock: (blockId: string, taskId: string) => void;

  // Block drop handlers (for dropping tasks onto existing blocks)
  /** Assign a task to an existing goal block (removes from any previous block) */
  assignTaskToGoalBlock: (blockId: string, goalId: string, taskId: string) => void;
  /** Convert a task block into a goal block containing both tasks */
  convertTaskBlockToGoalBlock: (blockId: string, droppedTaskId: string) => void;

  // Handler to process drops from drag context (supports grid, header, and block drops)
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
  allCommitments: allCommitmentsInput,
  initialEnabledCommitmentIds,
  initialEvents,
  onCopy,
  onPaste,
  hasClipboardContent = false,
  onEventCreated,
}: UseUnifiedScheduleOptions): UseUnifiedScheduleReturn {
  const [goals, setGoals] = React.useState<ScheduleGoal[]>(initialGoals);
  const [allCommitments] = React.useState<ScheduleCommitment[]>(allCommitmentsInput);
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);

  // Hover state for keyboard shortcuts
  const [hoveredEvent, setHoveredEvent] = React.useState<CalendarEvent | null>(null);
  const [hoverPosition, setHoverPosition] = React.useState<HoverPosition | null>(null);

  // -------------------------------------------------------------------------
  // Commitment Visibility Management
  // -------------------------------------------------------------------------

  // Compute mandatory IDs from allCommitments
  const mandatoryCommitmentIds = React.useMemo(
    () => new Set(allCommitments.filter((c) => c.mandatory).map((c) => c.id)),
    [allCommitments]
  );

  // Enabled commitment IDs (committed state)
  // Always ensure mandatory commitments are included
  const [enabledCommitmentIds, setEnabledCommitmentIds] = React.useState<Set<string>>(
    () => {
      const mandatoryIds = allCommitments.filter((c) => c.mandatory).map((c) => c.id);
      const initialIds = initialEnabledCommitmentIds ?? allCommitments.map((c) => c.id);
      // Combine initial with mandatory to ensure mandatory are always included
      return new Set([...mandatoryIds, ...initialIds]);
    }
  );

  // Draft state for editing (null when not editing)
  const [draftEnabledCommitmentIds, setDraftEnabledCommitmentIds] = React.useState<Set<string> | null>(null);

  // Start editing: create draft from current state
  const startEditingCommitments = React.useCallback(() => {
    setDraftEnabledCommitmentIds(new Set(enabledCommitmentIds));
  }, [enabledCommitmentIds]);

  // Toggle commitment enabled state (works on draft if editing, otherwise on committed state)
  const toggleCommitmentEnabled = React.useCallback(
    (id: string) => {
      // Cannot toggle mandatory commitments
      if (mandatoryCommitmentIds.has(id)) return;

      if (draftEnabledCommitmentIds !== null) {
        // Editing mode: update draft
        setDraftEnabledCommitmentIds((prev) => {
          if (!prev) return prev;
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        // Not editing: update committed state directly
        setEnabledCommitmentIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [mandatoryCommitmentIds, draftEnabledCommitmentIds]
  );

  // Save draft to committed state
  const saveCommitmentChanges = React.useCallback(() => {
    if (draftEnabledCommitmentIds !== null) {
      setEnabledCommitmentIds(draftEnabledCommitmentIds);
      setDraftEnabledCommitmentIds(null);
    }
  }, [draftEnabledCommitmentIds]);

  // Discard draft changes
  const cancelCommitmentChanges = React.useCallback(() => {
    setDraftEnabledCommitmentIds(null);
  }, []);

  // Filtered commitments: only enabled ones
  const commitments = React.useMemo(
    () => allCommitments.filter((c) => enabledCommitmentIds.has(c.id)),
    [allCommitments, enabledCommitmentIds]
  );

  // Filtered events: exclude blocks from disabled commitments
  const filteredEvents = React.useMemo(
    () =>
      events.filter((event) => {
        // Keep all non-commitment blocks
        if (event.blockType !== "commitment") return true;
        // For commitment blocks, only keep if commitment is enabled
        return event.sourceCommitmentId && enabledCommitmentIds.has(event.sourceCommitmentId);
      }),
    [events, enabledCommitmentIds]
  );

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

  const getCommitmentStats = React.useCallback(
    (commitmentId: string): GoalStats => {
      const commitmentEvents = filteredEvents.filter((e) => e.sourceCommitmentId === commitmentId);
      const plannedMinutes = commitmentEvents.reduce(
        (sum, e) => sum + e.durationMinutes,
        0
      );
      const completedMinutes = commitmentEvents
        .filter((e) => e.status === "completed")
        .reduce((sum, e) => sum + e.durationMinutes, 0);

      return {
        plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
        completedHours: Math.round((completedMinutes / 60) * 10) / 10,
      };
    },
    [filteredEvents]
  );

  const getTaskSchedule = React.useCallback(
    (taskId: string): TaskScheduleInfo | null => {
      // First check for standalone task blocks
      const taskBlock = events.find((e) => e.sourceTaskId === taskId);
      if (taskBlock) {
        return {
          blockId: taskBlock.id,
          dayIndex: taskBlock.dayIndex,
          startMinutes: taskBlock.startMinutes,
          durationMinutes: taskBlock.durationMinutes,
        };
      }

      // Also check for goal blocks where this task is assigned
      const goalBlock = events.find((e) => e.assignedTaskIds?.includes(taskId));
      if (goalBlock) {
        return {
          blockId: goalBlock.id,
          dayIndex: goalBlock.dayIndex,
          startMinutes: goalBlock.startMinutes,
          durationMinutes: goalBlock.durationMinutes,
        };
      }

      return null;
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
      const newEventId = crypto.randomUUID();

      // Update goals first to get task data and set the new block reference
      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);
        if (!goal || !task) return currentGoals;

        // Create new event using current goal/task data
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
          notes: task.description, // Sync task description to block notes
        };

        // Update events: remove old (if any), add new
        setEvents((currentEvents) => {
          const filtered = currentEvents.filter((e) => e.sourceTaskId !== taskId);
          return [...filtered, newEvent];
        });

        // Update task with new block reference and clear deadline (mutually exclusive)
        return currentGoals.map((g) =>
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
        );
      });
    },
    []
  );

  const scheduleCommitment = React.useCallback(
    (commitmentId: string, dayIndex: number, startMinutes: number) => {
      // Find commitment from allCommitments (stable reference)
      const commitment = allCommitments.find((c) => c.id === commitmentId);
      if (!commitment) return;

      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: commitment.label,
        dayIndex,
        startMinutes,
        durationMinutes: 60, // 1 hour for commitments
        color: commitment.color,
        blockType: "commitment",
        sourceCommitmentId: commitmentId,
        status: "planned",
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [allCommitments]
  );

  // -------------------------------------------------------------------------
  // Deadline Actions
  // -------------------------------------------------------------------------

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
                    : t
                ),
              }
            : g
        );
      });
    },
    []
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
  // Block Drop Handlers (for dropping tasks onto existing blocks)
  // -------------------------------------------------------------------------

  /**
   * Assign a task to an existing goal block.
   * If task was previously in another block or had a standalone task block, removes it first.
   */
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
          (e) => e.sourceTaskId !== taskId
        );

        // Add to target block's assignedTaskIds
        return withoutTaskBlock.map((e) =>
          e.id === blockId
            ? { ...e, assignedTaskIds: [...(e.assignedTaskIds ?? []), taskId] }
            : e
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
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  /**
   * Convert a task block into a goal block containing both tasks.
   * Called when dropping a task onto another task's block.
   */
  const convertTaskBlockToGoalBlock = React.useCallback(
    (blockId: string, droppedTaskId: string) => {
      setEvents((currentEvents) => {
        const targetBlock = currentEvents.find((e) => e.id === blockId);
        if (!targetBlock || targetBlock.blockType !== "task") return currentEvents;

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
                assignedTaskIds: e.assignedTaskIds.filter((id) => id !== droppedTaskId),
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
              : t
          ),
        }));
      });
    },
    [goals, events]
  );

  // -------------------------------------------------------------------------
  // Drop Handler
  // -------------------------------------------------------------------------

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
          assignTaskToGoalBlock(position.targetBlockId, item.goalId, item.taskId);
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
          const isoDate = weekDates[position.dayIndex].toISOString().split("T")[0];
          setTaskDeadline(item.goalId, item.taskId, isoDate);
        }
        // Goals and commitments dropped on header are ignored (only tasks can have deadlines)
      } else if (position.dropTarget === "time-grid") {
        // Time grid drop
        const startMinutes = position.startMinutes ?? 0;
        if (item.type === "goal" && item.goalId) {
          scheduleGoal(item.goalId, position.dayIndex, startMinutes);
        } else if (item.type === "task" && item.taskId && item.goalId) {
          scheduleTask(item.goalId, item.taskId, position.dayIndex, startMinutes);
        } else if (item.type === "commitment" && item.commitmentId) {
          scheduleCommitment(item.commitmentId, position.dayIndex, startMinutes);
        }
      }
    },
    [events, scheduleGoal, scheduleTask, scheduleCommitment, setTaskDeadline, assignTaskToGoalBlock, convertTaskBlockToGoalBlock]
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
      setEvents((currentEvents) => {
        const event = currentEvents.find((e) => e.id === eventId);

        // Clear scheduledBlockId on task if this was a task block
        if (event?.blockType === "task" && event.sourceTaskId) {
          const { sourceGoalId, sourceTaskId } = event;
          setGoals((prev) =>
            prev.map((g) =>
              g.id === sourceGoalId
                ? {
                    ...g,
                    tasks: g.tasks?.map((t) =>
                      t.id === sourceTaskId
                        ? { ...t, scheduledBlockId: undefined }
                        : t
                    ),
                  }
                : g
            )
          );
        }

        // Remove the event
        return currentEvents.filter((e) => e.id !== eventId);
      });
    },
    []
  );

  const markEventComplete = React.useCallback(
    (eventId: string) => {
      setEvents((currentEvents) => {
        const event = currentEvents.find((e) => e.id === eventId);
        if (!event) return currentEvents;

        // If it's a task block, also complete the task
        if (event.blockType === "task" && event.sourceTaskId) {
          const { sourceGoalId, sourceTaskId } = event;
          setGoals((prev) =>
            prev.map((g) =>
              g.id === sourceGoalId
                ? {
                    ...g,
                    tasks: g.tasks?.map((t) =>
                      t.id === sourceTaskId ? { ...t, completed: true } : t
                    ),
                  }
                : g
            )
          );
        }

        // If it's a goal block with assigned tasks, complete all of them
        if (event.blockType === "goal" && event.assignedTaskIds?.length) {
          const { sourceGoalId, assignedTaskIds } = event;
          if (sourceGoalId) {
            setGoals((prev) =>
              prev.map((g) =>
                g.id === sourceGoalId
                  ? {
                      ...g,
                      tasks: g.tasks?.map((t) =>
                        assignedTaskIds.includes(t.id)
                          ? { ...t, completed: true }
                          : t
                      ),
                    }
                  : g
              )
            );
          }
        }

        // Update event status
        return currentEvents.map((e) =>
          e.id === eventId ? { ...e, status: "completed" as BlockStatus } : e
        );
      });
    },
    []
  );

  const markEventIncomplete = React.useCallback(
    (eventId: string) => {
      setEvents((currentEvents) => {
        const event = currentEvents.find((e) => e.id === eventId);
        if (!event) return currentEvents;

        // If it's a task block, also un-complete the task
        if (event.blockType === "task" && event.sourceTaskId) {
          const { sourceGoalId, sourceTaskId } = event;
          setGoals((prev) =>
            prev.map((g) =>
              g.id === sourceGoalId
                ? {
                    ...g,
                    tasks: g.tasks?.map((t) =>
                      t.id === sourceTaskId ? { ...t, completed: false } : t
                    ),
                  }
                : g
            )
          );
        }

        // Update event status
        return currentEvents.map((e) =>
          e.id === eventId ? { ...e, status: "planned" as BlockStatus } : e
        );
      });
    },
    []
  );

  // Assign a task to a goal block
  const assignTaskToBlock = React.useCallback(
    (blockId: string, taskId: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === blockId
            ? { ...e, assignedTaskIds: [...(e.assignedTaskIds ?? []), taskId] }
            : e
        )
      );
    },
    []
  );

  // Unassign a task from a goal block
  const unassignTaskFromBlock = React.useCallback(
    (blockId: string, taskId: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === blockId
            ? {
                ...e,
                assignedTaskIds: (e.assignedTaskIds ?? []).filter(
                  (id) => id !== taskId
                ),
              }
            : e
        )
      );
    },
    []
  );

  // -------------------------------------------------------------------------
  // Backlog Actions
  // -------------------------------------------------------------------------

  const addGoal = React.useCallback(
    (goal: ScheduleGoal) => {
      setGoals((prev) => [...prev, goal]);
    },
    []
  );

  const toggleTaskComplete = React.useCallback(
    (goalId: string, taskId: string) => {
      setGoals((currentGoals) => {
        // Find the current task state
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);
        if (!task) return currentGoals;

        const newCompletedState = !task.completed;

        // If task has a scheduled block, update its status too
        if (task.scheduledBlockId) {
          const blockId = task.scheduledBlockId;
          const newStatus: BlockStatus = newCompletedState
            ? "completed"
            : "planned";
          setEvents((prev) =>
            prev.map((e) =>
              e.id === blockId ? { ...e, status: newStatus } : e
            )
          );
        }

        // Update the task
        return currentGoals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId ? { ...t, completed: newCompletedState } : t
                ),
              }
            : g
        );
      });
    },
    []
  );

  // -------------------------------------------------------------------------
  // Task CRUD Actions
  // -------------------------------------------------------------------------

  const addTask = React.useCallback(
    (goalId: string, label: string): string => {
      const newTask: ScheduleTask = {
        id: crypto.randomUUID(),
        label,
        completed: false,
      };
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, tasks: [...(g.tasks ?? []), newTask] }
            : g
        )
      );
      return newTask.id;
    },
    []
  );

  const updateTask = React.useCallback(
    (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => {
      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);

        // If updating the label and task has a scheduled block, update the event title
        const newLabel = updates.label;
        if (newLabel && task?.scheduledBlockId) {
          const blockId = task.scheduledBlockId;
          setEvents((prev) =>
            prev.map((e) =>
              e.id === blockId ? { ...e, title: newLabel } : e
            )
          );
        }

        // If updating description and task has a scheduled block, sync to event notes
        if (updates.description !== undefined && task?.scheduledBlockId) {
          const blockId = task.scheduledBlockId;
          setEvents((prev) =>
            prev.map((e) =>
              e.id === blockId ? { ...e, notes: updates.description } : e
            )
          );
        }

        // Update the task
        return currentGoals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
              }
            : g
        );
      });
    },
    []
  );

  const deleteTask = React.useCallback(
    (goalId: string, taskId: string) => {
      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);

        // Remove associated calendar event if exists
        if (task?.scheduledBlockId) {
          const blockId = task.scheduledBlockId;
          setEvents((prev) => prev.filter((e) => e.id !== blockId));
        }

        // Remove the task from the goal
        return currentGoals.map((g) =>
          g.id === goalId
            ? { ...g, tasks: g.tasks?.filter((t) => t.id !== taskId) }
            : g
        );
      });
    },
    []
  );

  // -------------------------------------------------------------------------
  // Subtask CRUD Actions
  // -------------------------------------------------------------------------

  const addSubtask = React.useCallback(
    (goalId: string, taskId: string, label: string) => {
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        label,
        completed: false,
      };
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? { ...t, subtasks: [...(t.subtasks ?? []), newSubtask] }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const updateSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string, label: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        subtasks: t.subtasks?.map((s) =>
                          s.id === subtaskId ? { ...s, label } : s
                        ),
                      }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const toggleSubtaskComplete = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        subtasks: t.subtasks?.map((s) =>
                          s.id === subtaskId
                            ? { ...s, completed: !s.completed }
                            : s
                        ),
                      }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const deleteSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? { ...t, subtasks: t.subtasks?.filter((s) => s.id !== subtaskId) }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
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
      onEventCreated?.(newEvent);
    },
    [onEventCreated]
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
      onEventCreated?.(newEvent);
    },
    [onEventCreated]
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
