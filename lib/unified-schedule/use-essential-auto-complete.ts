"use client";

import * as React from "react";
import type { CalendarEvent } from "./types";

// =============================================================================
// Types
// =============================================================================

export interface UseEssentialAutoCompleteOptions {
  /** Current calendar events */
  events: CalendarEvent[];
  /** Whether auto-complete is enabled */
  enabled: boolean;
  /** Callback to mark an event as complete */
  markComplete: (eventId: string) => void;
  /** Interval in ms to check for blocks to auto-complete (default: 60000 = 1 minute) */
  checkInterval?: number;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get the end timestamp (ms since epoch) for a calendar event.
 * Handles overnight blocks by adding a day to the end time.
 */
function getEventEndTimestamp(event: CalendarEvent): number {
  const [year, month, day] = event.date.split("-").map(Number);
  const startOfDay = new Date(year, month - 1, day).getTime();

  const endMinutes = event.startMinutes + event.durationMinutes;

  // If the event ends past midnight (overnight), add 24 hours
  if (endMinutes >= 1440) {
    return startOfDay + (endMinutes - 1440) * 60 * 1000 + 24 * 60 * 60 * 1000;
  }

  return startOfDay + endMinutes * 60 * 1000;
}

/**
 * Find essential blocks that should be auto-completed.
 * Returns IDs of blocks that are:
 * - Essential blocks (blockType === "essential")
 * - Currently planned (status === "planned" or undefined)
 * - End time is in the past
 */
function findBlocksToAutoComplete(
  events: CalendarEvent[],
  now: number,
): string[] {
  return events
    .filter((event) => {
      // Must be an essential block
      if (event.blockType !== "essential") return false;

      // Must be planned (not already completed)
      if (event.status === "completed") return false;

      // End time must be in the past
      const endTimestamp = getEventEndTimestamp(event);
      return endTimestamp < now;
    })
    .map((event) => event.id);
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to auto-complete essential blocks when their end time passes.
 *
 * @example
 * ```tsx
 * useEssentialAutoComplete({
 *   events,
 *   enabled: preferences.autoCompleteEssentials,
 *   markComplete: (eventId) => markEventComplete(eventId),
 * });
 * ```
 */
export function useEssentialAutoComplete({
  events,
  enabled,
  markComplete,
  checkInterval = 60000, // 1 minute
}: UseEssentialAutoCompleteOptions): void {
  // Stable reference to markComplete to avoid re-running effects
  const markCompleteRef = React.useRef(markComplete);
  React.useEffect(() => {
    markCompleteRef.current = markComplete;
  }, [markComplete]);

  // Check and auto-complete blocks
  const checkAndComplete = React.useCallback(() => {
    const now = Date.now();
    const idsToComplete = findBlocksToAutoComplete(events, now);

    for (const id of idsToComplete) {
      markCompleteRef.current(id);
    }
  }, [events]);

  // Run check on mount and when events change (if enabled)
  React.useEffect(() => {
    if (!enabled) return;
    checkAndComplete();
  }, [enabled, checkAndComplete]);

  // Set up interval for real-time checking
  React.useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(checkAndComplete, checkInterval);
    return () => clearInterval(intervalId);
  }, [enabled, checkAndComplete, checkInterval]);
}
