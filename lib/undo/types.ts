/**
 * Types for the undo system.
 * Defines command structures for undoable actions.
 */

import type { CalendarEvent, ScheduleTask, BlockStatus } from "@/lib/unified-schedule";

// =============================================================================
// Command Types
// =============================================================================

/** Types of undoable actions */
export type UndoActionType =
  | "task-complete"
  | "task-delete"
  | "task-unassign"
  | "block-complete"
  | "block-delete"
  | "block-create"
  | "day-complete";

/** Base command interface */
export interface UndoCommand {
  /** Unique identifier for the command */
  id: string;
  /** Type of action that was performed */
  type: UndoActionType;
  /** Human-readable description for toast display */
  description: string;
  /** Timestamp when action was performed */
  timestamp: number;
  /** Function to undo the action */
  undo: () => void;
}

// =============================================================================
// Specific Command Payloads (for type safety in handlers)
// =============================================================================

/** Payload for task completion toggle */
export interface TaskCompletePayload {
  goalId: string;
  taskId: string;
  previousCompleted: boolean;
}

/** Payload for task deletion */
export interface TaskDeletePayload {
  goalId: string;
  task: ScheduleTask;
}

/** Payload for task unassignment from block */
export interface TaskUnassignPayload {
  blockId: string;
  taskId: string;
  goalId: string;
}

/** Payload for block completion toggle */
export interface BlockCompletePayload {
  eventId: string;
  previousStatus: BlockStatus;
}

/** Payload for block deletion */
export interface BlockDeletePayload {
  event: CalendarEvent;
}

/** Payload for block creation */
export interface BlockCreatePayload {
  eventId: string;
}

/** Payload for day completion (batch action) */
export interface DayCompletePayload {
  dayIndex: number;
  /** Events that were marked complete */
  completedEventIds: string[];
  /** Previous status of each event */
  previousEventStatuses: Map<string, BlockStatus | undefined>;
  /** Tasks that were marked complete (goalId -> taskId[]) */
  completedTasks: Array<{ goalId: string; taskId: string; previousCompleted: boolean }>;
}

// =============================================================================
// Undo Context Types
// =============================================================================

export interface UndoContextValue {
  /** Record a new undoable action */
  recordAction: (command: UndoCommand) => void;
  /** Undo the most recent action */
  undo: () => UndoCommand | null;
  /** Check if there are actions to undo */
  canUndo: boolean;
  /** Get the most recent command (for toast display) */
  lastCommand: UndoCommand | null;
  /** Clear the most recent command (after toast dismissal) */
  clearLastCommand: () => void;
  /** Clear entire history (on navigation, etc.) */
  clearHistory: () => void;
}
