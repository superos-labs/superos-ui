"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface UndoToastProps {
  /** Message to display, or null to hide */
  message: string | null;
  /** Callback when Undo button is clicked */
  onUndo?: () => void;
  /** Whether to show the undo button (default: true when onUndo is provided) */
  showUndo?: boolean;
  /** Auto-dismiss delay in ms (default: 4000, use 0 to disable) */
  dismissDelay?: number;
  /** Callback when toast is dismissed (either by timeout or undo) */
  onDismiss?: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A toast notification for action feedback with optional undo button.
 * Displays a small dark pill with white text at the bottom center of the screen.
 * 
 * When an undo button is shown, the toast stays longer (4 seconds) to give
 * users time to click it. The undo button uses CMD+Z shortcut indicator.
 */
export function UndoToast({ 
  message, 
  onUndo,
  showUndo = !!onUndo,
  dismissDelay = 4000,
  onDismiss,
}: UndoToastProps) {
  // Auto-dismiss timer
  React.useEffect(() => {
    if (message && dismissDelay > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, dismissDelay);
      return () => clearTimeout(timer);
    }
  }, [message, dismissDelay, onDismiss]);

  const handleUndo = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUndo?.();
  }, [onUndo]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="pointer-events-auto fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div 
            className={cn(
              "flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 shadow-lg",
              "dark:bg-zinc-100"
            )}
          >
            {/* Message */}
            <span className="text-xs font-medium text-white dark:text-zinc-900">
              {message}
            </span>

            {/* Undo button */}
            {showUndo && onUndo && (
              <>
                <span className="h-3 w-px bg-white/20 dark:bg-zinc-900/20" />
                <button
                  onClick={handleUndo}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    "text-white/70 hover:text-white",
                    "dark:text-zinc-900/70 dark:hover:text-zinc-900",
                    "transition-colors duration-150"
                  )}
                >
                  <span>Undo</span>
                  <kbd 
                    className={cn(
                      "rounded px-1 py-0.5 text-[10px] font-medium",
                      "bg-white/10 text-white/60",
                      "dark:bg-zinc-900/10 dark:text-zinc-900/60"
                    )}
                  >
                    ⌘Z
                  </kbd>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Simple Toast (no undo, for backward compatibility)
// =============================================================================

interface SimpleToastProps {
  /** Message to display, or null to hide */
  message: string | null;
}

/**
 * A simple toast notification without undo functionality.
 * Used for non-undoable actions like copy, paste, zoom, etc.
 */
export function SimpleToast({ message }: SimpleToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
