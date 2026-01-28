/**
 * Shared types for cross-component drag-and-drop.
 * Used by: Backlog (drag source), Calendar (drop target), DragContext
 */

import type { GoalColor } from "./colors";

/**
 * Represents an item being dragged from the backlog or deadline tray to the calendar.
 */
export interface DragItem {
  /** Whether dragging a goal, task, or essential */
  type: "goal" | "task" | "essential";
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
  /** The essential ID (for essential drags) */
  essentialId?: string;
  /** Essential label for display (for essential drags) */
  essentialLabel?: string;
  /** Essential color (for essential drags) */
  essentialColor?: GoalColor;
  /** ISO date string if dragging an existing deadline from the tray */
  sourceDeadline?: string;
}

/**
 * Drop target type for distinguishing different drop zones.
 * - time-grid: Empty space on the calendar grid (creates new block)
 * - day-header: Day header area (sets deadline for tasks)
 * - existing-block: An existing calendar block (assigns task to block)
 */
export type DropTarget = "time-grid" | "day-header" | "existing-block";

/**
 * Position on the calendar for drop preview.
 * For time-grid drops, startMinutes is required.
 * For day-header drops (deadlines), startMinutes is undefined.
 * For existing-block drops, targetBlockId identifies the block.
 */
export interface DropPosition {
  dayIndex: number;
  /** Minutes from midnight (0-1440). Undefined for header and block drops. */
  startMinutes?: number;
  /** The type of drop target */
  dropTarget: DropTarget;
  /** Block ID when dropping onto an existing block */
  targetBlockId?: string;
  /** Duration adapted to fit available gap (default behavior; Shift disables gap-fitting) */
  adaptiveDuration?: number;
}

/** Minimum gap size in minutes to consider for adaptive drop mode */
export const ADAPTIVE_DROP_MIN_GAP = 10;

/**
 * Get the default duration for a drag item type.
 * Goals: 60 minutes (1 hour)
 * Tasks: 30 minutes
 * Essentials: 60 minutes (1 hour)
 */
export function getDefaultDuration(type: DragItem["type"]): number {
  if (type === "task") return 30;
  return 60; // goal and essential default to 1 hour
}

/**
 * Get the display title for a drag item.
 */
export function getDragItemTitle(item: DragItem): string {
  if (item.type === "task") return item.taskLabel ?? item.goalLabel ?? "";
  if (item.type === "essential") return item.essentialLabel ?? "";
  return item.goalLabel ?? "";
}

/**
 * Get the color for a drag item.
 */
export function getDragItemColor(item: DragItem): GoalColor | undefined {
  if (item.type === "essential") return item.essentialColor;
  return item.goalColor;
}
