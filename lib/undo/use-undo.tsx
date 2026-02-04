"use client";

/**
 * React hook for undo functionality.
 * Provides a context-based undo system that can be used throughout the app.
 */

import * as React from "react";
import { CommandHistory, createCommandHistory } from "./command-history";
import type { UndoCommand, UndoContextValue } from "./types";

// =============================================================================
// Context
// =============================================================================

const UndoContext = React.createContext<UndoContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

interface UndoProviderProps {
  children: React.ReactNode;
  /** Maximum number of commands to keep in history (default: 10) */
  maxHistorySize?: number;
}

export function UndoProvider({ children, maxHistorySize }: UndoProviderProps) {
  // Use ref for history to avoid re-renders on every action
  const historyRef = React.useRef<CommandHistory | null>(null);
  
  // Lazy initialization of history
  if (!historyRef.current) {
    historyRef.current = createCommandHistory(maxHistorySize);
  }

  // State to track if we can undo (triggers re-render when needed)
  const [canUndo, setCanUndo] = React.useState(false);
  
  // State to track the last command for toast display
  const [lastCommand, setLastCommand] = React.useState<UndoCommand | null>(null);

  const recordAction = React.useCallback((command: UndoCommand) => {
    historyRef.current?.push(command);
    setCanUndo(true);
    setLastCommand(command);
  }, []);

  const undo = React.useCallback((): UndoCommand | null => {
    const command = historyRef.current?.pop() ?? null;
    
    if (command) {
      // Execute the undo function
      command.undo();
      
      // Update canUndo state
      setCanUndo(!historyRef.current?.isEmpty());
      
      // Clear lastCommand since we just undid it
      setLastCommand(null);
    }
    
    return command;
  }, []);

  const clearLastCommand = React.useCallback(() => {
    setLastCommand(null);
  }, []);

  const clearHistory = React.useCallback(() => {
    historyRef.current?.clear();
    setCanUndo(false);
    setLastCommand(null);
  }, []);

  const value = React.useMemo(
    (): UndoContextValue => ({
      recordAction,
      undo,
      canUndo,
      lastCommand,
      clearLastCommand,
      clearHistory,
    }),
    [recordAction, undo, canUndo, lastCommand, clearLastCommand, clearHistory]
  );

  return (
    <UndoContext.Provider value={value}>
      {children}
    </UndoContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access undo functionality.
 * Must be used within an UndoProvider.
 */
export function useUndo(): UndoContextValue {
  const context = React.useContext(UndoContext);
  
  if (!context) {
    throw new Error("useUndo must be used within an UndoProvider");
  }
  
  return context;
}

/**
 * Optional version of useUndo that returns null if not within provider.
 * Useful for components that may or may not have undo support.
 */
export function useUndoOptional(): UndoContextValue | null {
  return React.useContext(UndoContext);
}

// =============================================================================
// Keyboard Hook
// =============================================================================

interface UseUndoKeyboardOptions {
  /** Callback when undo is triggered */
  onUndo?: (command: UndoCommand | null) => void;
  /** Whether the keyboard shortcut is enabled */
  enabled?: boolean;
}

/**
 * Hook to handle CMD+Z keyboard shortcut for undo.
 * Should be used at the shell level to capture global shortcuts.
 */
export function useUndoKeyboard({ 
  onUndo, 
  enabled = true 
}: UseUndoKeyboardOptions = {}) {
  const undoContext = useUndoOptional();

  React.useEffect(() => {
    if (!enabled || !undoContext) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      // CMD+Z (Mac) or Ctrl+Z (Windows/Linux)
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        
        if (undoContext.canUndo) {
          const command = undoContext.undo();
          onUndo?.(command);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, undoContext, onUndo]);
}
