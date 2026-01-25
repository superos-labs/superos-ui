/**
 * Shared types for cross-component drag-and-drop.
 * Used by: Backlog (drag source), Calendar (drop target), DragContext
 */

import type { GoalColor } from "./colors";

/**
 * Represents an item being dragged from the backlog or deadline tray to the calendar.
 */
export interface DragItem {
  /** Whether dragging a goal or a task */
  type: "goal" | "task";
  /** The goal ID (always present) */
  goalId: string;
  /** Goal label for display */
  goalLabel: string;
  /** Goal color (inherited by blocks) */
  goalColor: GoalColor;
  /** Task ID (only for task drags) */
  taskId?: string;
  /** Task label (only for task drags) */
  taskLabel?: string;
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
 */
export function getDefaultDuration(type: DragItem["type"]): number {
  return type === "goal" ? 60 : 30;
}

/**
 * Get the display title for a drag item.
 */
export function getDragItemTitle(item: DragItem): string {
  return item.type === "task" ? item.taskLabel ?? item.goalLabel : item.goalLabel;
}
