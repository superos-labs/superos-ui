/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public API for the Undo system.
 *
 * Re-exports undo-related types, command history utilities, and React hooks
 * implementing command-pattern based undo behavior.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Expose undo domain types.
 * - Expose command history implementation.
 * - Expose undo provider and hooks.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - UndoActionType
 * - UndoCommand
 * - UndoContextValue
 * - TaskCompletePayload
 * - TaskDeletePayload
 * - TaskUnassignPayload
 * - BlockCompletePayload
 * - BlockDeletePayload
 * - BlockCreatePayload
 * - DayCompletePayload
 * - CommandHistory
 * - createCommandHistory
 * - MAX_HISTORY_SIZE
 * - UndoProvider
 * - useUndo
 * - useUndoOptional
 * - useUndoKeyboard
 */

// Types
export type {
  UndoActionType,
  UndoCommand,
  UndoContextValue,
  TaskCompletePayload,
  TaskDeletePayload,
  TaskUnassignPayload,
  BlockCompletePayload,
  BlockDeletePayload,
  BlockCreatePayload,
  DayCompletePayload,
} from "./types";

// Command history
export {
  CommandHistory,
  createCommandHistory,
  MAX_HISTORY_SIZE,
} from "./command-history";

// React hooks and provider
export {
  UndoProvider,
  useUndo,
  useUndoOptional,
  useUndoKeyboard,
} from "./use-undo";
