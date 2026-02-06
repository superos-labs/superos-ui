/**
 * =============================================================================
 * File: use-focus-session.ts
 * =============================================================================
 *
 * Client-side hook for managing Focus Mode sessions.
 *
 * Provides start, pause, resume, and end controls while tracking elapsed time
 * and emitting a completed session summary when a session finishes.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Create and manage an active focus session.
 * - Track pause/resume segments and elapsed time.
 * - Emit a completed session object on end.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Time is tracked in milliseconds.
 * - Elapsed time updates once per second while running.
 * - Uses GoalColor as the semantic color type for focused blocks.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useFocusSession
 */

"use client";

import * as React from "react";
import type { GoalColor } from "@/lib/colors";
import type {
  ActiveFocusSession,
  CompletedFocusSession,
  FocusSegment,
  UseFocusSessionOptions,
  UseFocusSessionReturn,
} from "./types";

// Use GoalColor as BlockColor for semantic clarity in focus context
type BlockColor = GoalColor;

/**
 * Calculate total elapsed time from segments and current segment.
 */
function calculateElapsedMs(
  session: ActiveFocusSession | null,
  now: number
): number {
  if (!session) return 0;

  // Sum completed segments
  const completedMs = session.segments.reduce(
    (sum, seg) => sum + (seg.endedAt - seg.startedAt),
    0
  );

  // Add current segment if running
  const currentMs = session.currentSegmentStart
    ? now - session.currentSegmentStart
    : 0;

  return completedMs + currentMs;
}

export function useFocusSession(
  options: UseFocusSessionOptions = {}
): UseFocusSessionReturn {
  const { onSessionEnd } = options;

  const [session, setSession] = React.useState<ActiveFocusSession | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);

  // Stable reference to callback
  const onSessionEndRef = React.useRef(onSessionEnd);
  React.useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  // Derived state
  const isRunning = session?.currentSegmentStart !== null && session !== null;

  // Update elapsed time every second when running
  React.useEffect(() => {
    if (!isRunning || !session) {
      return;
    }

    // Initial update
    setElapsedMs(calculateElapsedMs(session, Date.now()));

    const intervalId = setInterval(() => {
      setElapsedMs(calculateElapsedMs(session, Date.now()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, session]);

  // Update elapsed when paused (to ensure final value is correct)
  React.useEffect(() => {
    if (session && !isRunning) {
      setElapsedMs(calculateElapsedMs(session, Date.now()));
    }
  }, [session, isRunning]);

  const start = React.useCallback(
    (blockId: string, blockTitle: string, blockColor: BlockColor) => {
      const now = Date.now();
      setSession({
        blockId,
        blockTitle,
        blockColor,
        segments: [],
        currentSegmentStart: now,
      });
      setElapsedMs(0);
    },
    []
  );

  const pause = React.useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.currentSegmentStart === null) return prev;

      const now = Date.now();
      const completedSegment: FocusSegment = {
        startedAt: prev.currentSegmentStart,
        endedAt: now,
      };

      return {
        ...prev,
        segments: [...prev.segments, completedSegment],
        currentSegmentStart: null,
      };
    });
  }, []);

  const resume = React.useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.currentSegmentStart !== null) return prev;

      return {
        ...prev,
        currentSegmentStart: Date.now(),
      };
    });
  }, []);

  const end = React.useCallback(() => {
    setSession((prev) => {
      if (!prev) return null;

      const now = Date.now();
      let finalSegments = [...prev.segments];

      // If currently running, close the current segment
      if (prev.currentSegmentStart !== null) {
        finalSegments.push({
          startedAt: prev.currentSegmentStart,
          endedAt: now,
        });
      }

      // Calculate total time
      const totalMs = finalSegments.reduce(
        (sum, seg) => sum + (seg.endedAt - seg.startedAt),
        0
      );

      // Determine session start time
      const startedAt =
        finalSegments.length > 0 ? finalSegments[0].startedAt : now;

      // Create completed session
      const completed: CompletedFocusSession = {
        blockId: prev.blockId,
        blockTitle: prev.blockTitle,
        blockColor: prev.blockColor,
        segments: finalSegments,
        totalMs,
        startedAt,
        endedAt: now,
      };

      // Notify callback
      onSessionEndRef.current?.(completed);

      return null;
    });

    setElapsedMs(0);
  }, []);

  return {
    session,
    isRunning,
    elapsedMs,
    start,
    pause,
    resume,
    end,
  };
}
