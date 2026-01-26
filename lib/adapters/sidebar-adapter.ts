/**
 * Adapter to convert CalendarEvent to BlockSidebarData.
 * Used by shell/app components to display event details in the sidebar.
 */

import type { CalendarEvent } from "@/components/calendar";
import type { BlockSidebarData, BlockGoalTask, BlockSubtask } from "@/components/block";
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

/** Commitment structure for sidebar adapter */
export interface SidebarCommitment {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

/** Format minutes from midnight to HH:MM time string */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
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
 * @param commitments - Array of commitments to look up source commitment data
 * @param weekDates - Array of dates for the current week (to compute ISO date)
 * @returns Object containing the sidebar data and available tasks for assignment
 */
export function eventToBlockSidebarData(
  event: CalendarEvent,
  goals: SidebarGoal[],
  commitments: SidebarCommitment[],
  weekDates: Date[]
): EventToSidebarResult {
  // Find source goal for goal/task blocks
  const sourceGoal = event.sourceGoalId
    ? goals.find((g) => g.id === event.sourceGoalId)
    : undefined;

  // Find source commitment for commitment blocks
  const sourceCommitment = event.sourceCommitmentId
    ? commitments.find((c) => c.id === event.sourceCommitmentId)
    : undefined;

  // Find source task (for task blocks)
  const sourceTask =
    event.sourceTaskId && sourceGoal
      ? sourceGoal.tasks?.find((t) => t.id === event.sourceTaskId)
      : undefined;

  // Calculate date from dayIndex + weekDates
  const date = weekDates[event.dayIndex];
  const isoDate = date ? date.toISOString().split("T")[0] : "";

  // Convert minutes to time strings
  const startTime = formatMinutesToTime(event.startMinutes);
  const endTime = formatMinutesToTime(event.startMinutes + event.durationMinutes);

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

  // Build available tasks (not yet assigned) for goal blocks
  // Filter out: already assigned, completed, or scheduled to other blocks
  // Pass full task objects for consistency
  const availableGoalTasks: BlockGoalTask[] =
    sourceGoal && event.blockType === "goal"
      ? (sourceGoal.tasks ?? [])
          .filter(
            (t) =>
              !assignedTaskIds.includes(t.id) && // not already assigned to this block
              !t.completed && // not completed
              !t.scheduledBlockId // not scheduled to another block
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
      date: isoDate,
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
      commitment: sourceCommitment
        ? {
            id: sourceCommitment.id,
            label: sourceCommitment.label,
            icon: sourceCommitment.icon,
            color: getIconColorClass(sourceCommitment.color),
          }
        : undefined,
    },
    availableGoalTasks,
  };
}
