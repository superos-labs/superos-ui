"use client";

import * as React from "react";

export interface UseWeekNavigationOptions {
  /** Called when navigating to the previous week */
  onPreviousWeek: () => void;
  /** Called when navigating to the next week */
  onNextWeek: () => void;
  /** Called when navigating to today's week */
  onToday?: () => void;
}

/**
 * Hook for keyboard-based week navigation.
 * - Left arrow: Previous week
 * - Right arrow: Next week
 * - T key: Go to today
 *
 * Keyboard shortcuts are disabled when the user is typing in an input/textarea.
 */
export function useWeekNavigation({
  onPreviousWeek,
  onNextWeek,
  onToday,
}: UseWeekNavigationOptions) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Arrow keys for week navigation (no modifiers)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          onPreviousWeek();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          onNextWeek();
        } else if (e.key === "t" || e.key === "T") {
          e.preventDefault();
          onToday?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPreviousWeek, onNextWeek, onToday]);
}
