/**
 * Command history management for undo functionality.
 * Maintains a stack of undoable commands with a configurable limit.
 */

import type { UndoCommand } from "./types";

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of commands to keep in history */
export const MAX_HISTORY_SIZE = 10;

// =============================================================================
// Command History Class
// =============================================================================

export class CommandHistory {
  private commands: UndoCommand[] = [];
  private maxSize: number;

  constructor(maxSize: number = MAX_HISTORY_SIZE) {
    this.maxSize = maxSize;
  }

  /**
   * Add a new command to the history.
   * If history exceeds max size, oldest commands are removed.
   */
  push(command: UndoCommand): void {
    this.commands.push(command);
    
    // Trim history if it exceeds max size
    if (this.commands.length > this.maxSize) {
      this.commands = this.commands.slice(-this.maxSize);
    }
  }

  /**
   * Remove and return the most recent command.
   * Returns null if history is empty.
   */
  pop(): UndoCommand | null {
    return this.commands.pop() ?? null;
  }

  /**
   * Get the most recent command without removing it.
   */
  peek(): UndoCommand | null {
    return this.commands.length > 0 
      ? this.commands[this.commands.length - 1] 
      : null;
  }

  /**
   * Check if there are any commands in history.
   */
  isEmpty(): boolean {
    return this.commands.length === 0;
  }

  /**
   * Get the number of commands in history.
   */
  size(): number {
    return this.commands.length;
  }

  /**
   * Clear all commands from history.
   */
  clear(): void {
    this.commands = [];
  }

  /**
   * Get a copy of all commands (for debugging).
   */
  getAll(): UndoCommand[] {
    return [...this.commands];
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new command history instance.
 */
export function createCommandHistory(maxSize?: number): CommandHistory {
  return new CommandHistory(maxSize);
}
