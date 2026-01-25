/**
 * Shared types for cross-component drag-and-drop.
 * Used by: Backlog (drag source), Calendar (drop target), DragContext
 */

import type { GoalColor } from "./colors";

/**
 * Represents an item being dragged from the backlog or deadline tray to the calendar.
 */
export interface DragItem {
  /** Whether dragging a goal, task, or commitment */
  type: "goal" | "task" | "commitment";
  /** The goal ID (for goal/task drags) */
  goalId?: string;
  /** Goal label for display (for goal/task drags) */
  goalLabel?: string;
  /** Goal color (inherited by blocks, for goal/task drags) */
  goalColor?: GoalColor;
  /** Task ID (only for task drags) */
  taskId?: string;
  /** Task label (only for task drags) */
  taskLabel?: string;
  /** The commitment ID (for commitment drags) */
  commitmentId?: string;
  /** Commitment label for display (for commitment drags) */
  commitmentLabel?: string;
  /** Commitment color (for commitment drags) */
  commitmentColor?: GoalColor;
  /** ISO date string if dragging an existing deadline from the tray */
  sourceDeadline?: string;
}

/**
 * Drop target type for distinguishing header vs grid drops.
 */
export type DropTarget = "time-grid" | "day-header";

/**
 * Position on the calendar for drop preview.
 * For time-grid drops, startMinutes is required.
 * For day-header drops (deadlines), startMinutes is undefined.
 */
export interface DropPosition {
  dayIndex: number;
  /** Minutes from midnight (0-1440). Undefined for header drops. */
  startMinutes?: number;
  /** The type of drop target */
  dropTarget: DropTarget;
}

/**
 * Get the default duration for a drag item type.
 * Goals: 60 minutes (1 hour)
 * Tasks: 30 minutes
 * Commitments: 60 minutes (1 hour)
 */
export function getDefaultDuration(type: DragItem["type"]): number {
  if (type === "task") return 30;
  return 60; // goal and commitment default to 1 hour
}

/**
 * Get the display title for a drag item.
 */
export function getDragItemTitle(item: DragItem): string {
  if (item.type === "task") return item.taskLabel ?? item.goalLabel ?? "";
  if (item.type === "commitment") return item.commitmentLabel ?? "";
  return item.goalLabel ?? "";
}

/**
 * Get the color for a drag item.
 */
export function getDragItemColor(item: DragItem): GoalColor | undefined {
  if (item.type === "commitment") return item.commitmentColor;
  return item.goalColor;
}
