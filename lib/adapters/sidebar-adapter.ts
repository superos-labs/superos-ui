/**
 * =============================================================================
 * File: sidebar-adapter.ts
 * =============================================================================
 *
 * Adapter utilities for converting unified calendar events into the
 * BlockSidebarData shape used by the block sidebar UI.
 *
 * Enriches raw CalendarEvent data with goal, task, essential, and subtask
 * metadata so the sidebar can display and manage block details.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define sidebar-facing goal and essential data shapes.
 * - Convert CalendarEvent into BlockSidebarData.
 * - Resolve source goal, task, and essential from provided collections.
 * - Derive start/end dates and times, including overnight blocks.
 * - Build assigned goal tasks, available goal tasks, and task subtasks.
 * - Resolve icon color classes for display.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Computing schedule events.
 * - Persisting block, task, or goal changes.
 * - Rendering sidebar UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses planned startMinutes + durationMinutes for same-day blocks.
 * - Overnight blocks derive end day and minutes via calendar helpers.
 * - Accepts optional allEvents to filter tasks assigned to other blocks
 *   of the same goal from the "available" list.
 * - Keeps adapter pure and synchronous.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - EventToSidebarResult
 * - SidebarGoal
 * - SidebarEssential
 * - formatMinutesToTime
 * - parseTimeToMinutes
 * - eventToBlockSidebarData
 */

import type { CalendarEvent } from "@/lib/unified-schedule";
import {
  isOvernightEvent,
  getEventEndDayIndex,
  getEventEndMinutes,
} from "@/components/calendar";
import type {
  BlockSidebarData,
  BlockGoalTask,
  BlockSubtask,
} from "@/components/block";
import type { IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass } from "@/lib/colors";

/** Result of converting a CalendarEvent to BlockSidebarData */
export interface EventToSidebarResult {
  block: BlockSidebarData;
  /** Available tasks from the goal that haven't been assigned yet (for goal blocks) */
  availableGoalTasks: BlockGoalTask[];
}

/** Goal structure for sidebar adapter */
export interface SidebarGoal {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  tasks?: Array<{
    id: string;
    label: string;
    completed?: boolean;
    scheduledBlockId?: string;
    /** Optional description for additional context */
    description?: string;
    subtasks?: Array<{
      id: string;
      label: string;
      completed: boolean;
    }>;
  }>;
}

/** Essential structure for sidebar adapter */
export interface SidebarEssential {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

/** Format minutes from midnight to HH:MM time string */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/** Parse HH:MM time string to minutes from midnight */
export function parseTimeToMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

/**
 * Convert a CalendarEvent to BlockSidebarData for display in the sidebar.
 *
 * @param event - The calendar event to convert
 * @param goals - Array of goals to look up source goal/task data
 * @param essentials - Array of essentials to look up source essential data
 * @param weekDates - Array of dates for the current week (to compute ISO date)
 * @param allEvents - All week events (used to exclude tasks assigned to other blocks)
 * @returns Object containing the sidebar data and available tasks for assignment
 */
export function eventToBlockSidebarData(
  event: CalendarEvent,
  goals: SidebarGoal[],
  essentials: SidebarEssential[],
  weekDates: Date[],
  allEvents: CalendarEvent[] = [],
): EventToSidebarResult {
  // Find source goal for goal/task blocks
  const sourceGoal = event.sourceGoalId
    ? goals.find((g) => g.id === event.sourceGoalId)
    : undefined;

  // Find source essential for essential blocks
  const sourceEssential = event.sourceEssentialId
    ? essentials.find((c) => c.id === event.sourceEssentialId)
    : undefined;

  // Find source task (for task blocks)
  const sourceTask =
    event.sourceTaskId && sourceGoal
      ? sourceGoal.tasks?.find((t) => t.id === event.sourceTaskId)
      : undefined;

  // Calculate start date from dayIndex + weekDates
  const startDate = weekDates[event.dayIndex];
  const isoStartDate = startDate ? startDate.toISOString().split("T")[0] : "";

  // Handle overnight blocks - calculate end date and normalized end time
  const isOvernight = isOvernightEvent(event);
  let isoEndDate: string | undefined;
  let endMinutes: number;

  if (isOvernight) {
    const endDayIndex = getEventEndDayIndex(event);
    const endDate = weekDates[endDayIndex];
    isoEndDate = endDate ? endDate.toISOString().split("T")[0] : undefined;
    endMinutes = getEventEndMinutes(event); // Returns 0-1440 for the end day
  } else {
    endMinutes = event.startMinutes + event.durationMinutes;
  }

  // Convert minutes to time strings
  const startTime = formatMinutesToTime(event.startMinutes);
  const endTime = formatMinutesToTime(endMinutes);

  // Build goal tasks for goal blocks - only show assigned tasks
  // Pass full task objects to support expansion with notes/subtasks
  const assignedTaskIds = event.assignedTaskIds ?? [];
  const goalTasks: BlockGoalTask[] =
    sourceGoal && event.blockType === "goal"
      ? (sourceGoal.tasks ?? [])
          .filter((t) => assignedTaskIds.includes(t.id))
          .map((t) => ({
            id: t.id,
            label: t.label,
            completed: t.completed ?? false,
            description: t.description,
            subtasks: t.subtasks?.map((s) => ({
              id: s.id,
              label: s.label,
              completed: s.completed,
            })),
          }))
      : [];

  // Collect task IDs assigned to OTHER blocks of the same goal so they are
  // excluded from the "available" list.  This prevents a task assigned to
  // Goal Block A from appearing as available in Goal Block B.
  const otherBlockAssignedTaskIds = new Set<string>();
  if (sourceGoal && event.blockType === "goal") {
    for (const e of allEvents) {
      if (
        e.id !== event.id &&
        e.sourceGoalId === sourceGoal.id &&
        e.assignedTaskIds
      ) {
        for (const tid of e.assignedTaskIds) {
          otherBlockAssignedTaskIds.add(tid);
        }
      }
    }
  }

  // Build available tasks (not yet assigned) for goal blocks
  // Filter out: already assigned to this block, assigned to another block,
  // completed, or scheduled as its own block
  const availableGoalTasks: BlockGoalTask[] =
    sourceGoal && event.blockType === "goal"
      ? (sourceGoal.tasks ?? [])
          .filter(
            (t) =>
              !assignedTaskIds.includes(t.id) && // not already assigned to this block
              !otherBlockAssignedTaskIds.has(t.id) && // not assigned to another block
              !t.completed && // not completed
              !t.scheduledBlockId // not scheduled as its own block
          )
          .map((t) => ({
            id: t.id,
            label: t.label,
            completed: t.completed ?? false,
            description: t.description,
            subtasks: t.subtasks?.map((s) => ({
              id: s.id,
              label: s.label,
              completed: s.completed,
            })),
          }))
      : [];

  // Build subtasks for task blocks
  const subtasks: BlockSubtask[] =
    sourceTask?.subtasks?.map((s) => ({
      id: s.id,
      text: s.label,
      done: s.completed,
    })) ?? [];

  return {
    block: {
      id: event.id,
      title: event.title,
      blockType: event.blockType ?? "goal",
      status: event.status,
      date: isoStartDate,
      endDate: isoEndDate,
      startTime,
      endTime,
      notes: event.notes ?? "",
      subtasks,
      goalTasks,
      color: event.color,
      goal: sourceGoal
        ? {
            id: sourceGoal.id,
            label: sourceGoal.label,
            icon: sourceGoal.icon,
            color: getIconColorClass(sourceGoal.color),
          }
        : undefined,
      essential: sourceEssential
        ? {
            id: sourceEssential.id,
            label: sourceEssential.label,
            icon: sourceEssential.icon,
            color: getIconColorClass(sourceEssential.color),
          }
        : undefined,
      // External calendar integration fields
      sourceProvider: event.sourceProvider,
      sourceCalendarName: event.sourceCalendarName,
      sourceCalendarColor: event.customColor,
    },
    availableGoalTasks,
  };
}
