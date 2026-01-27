"use client";

import * as React from "react";

/** Maximum duration for events (just under 48 hours, spanning at most 2 days) */
const MAX_EVENT_DURATION_MINUTES = 2879;

/** Fine-grained snap interval when Shift is held (1 minute) */
const FINE_GRAIN_INTERVAL = 1;

interface UseBlockResizeOptions {
  startMinutes: number;
  durationMinutes: number;
  /** Pixels per minute in the calendar grid */
  pixelsPerMinute: number;
  /** Snap to this interval in minutes (default: 15) */
  snapInterval?: number;
  /** Minimum duration in minutes (default: 15) */
  minDuration?: number;
  /** Maximum duration in minutes (default: 2879 = just under 48 hours for overnight support) */
  maxDuration?: number;
  /** Called during resize with new values */
  onResize?: (newStartMinutes: number, newDurationMinutes: number) => void;
  /** Called when resize operation ends */
  onResizeEnd?: () => void;
}

interface UseBlockResizeReturn {
  isResizing: boolean;
  activeEdge: "top" | "bottom" | null;
  handlePointerDown: (e: React.PointerEvent, edge: "top" | "bottom") => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
}

export function useBlockResize({
  startMinutes,
  durationMinutes,
  pixelsPerMinute,
  snapInterval = 15,
  minDuration = 15,
  maxDuration = MAX_EVENT_DURATION_MINUTES,
  onResize,
  onResizeEnd,
}: UseBlockResizeOptions): UseBlockResizeReturn {
  const [isResizing, setIsResizing] = React.useState(false);
  const [activeEdge, setActiveEdge] = React.useState<"top" | "bottom" | null>(
    null,
  );

  const startY = React.useRef(0);
  const startValues = React.useRef({ start: 0, duration: 0 });
  
  // Track Shift key state for fine-grained resizing (1-minute precision)
  const isShiftHeldRef = React.useRef(false);

  // Track Shift key during resize operation
  React.useEffect(() => {
    if (!isResizing) {
      isShiftHeldRef.current = false;
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        isShiftHeldRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        isShiftHeldRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isResizing]);

  const snapToInterval = React.useCallback(
    (minutes: number, interval: number = snapInterval) => {
      return Math.round(minutes / interval) * interval;
    },
    [snapInterval],
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent, edge: "top" | "bottom") => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Check if Shift is already held when resize starts
      if (e.shiftKey) {
        isShiftHeldRef.current = true;
      }

      setIsResizing(true);
      setActiveEdge(edge);
      startY.current = e.clientY;
      startValues.current = {
        start: startMinutes,
        duration: durationMinutes,
      };
    },
    [startMinutes, durationMinutes],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing || !activeEdge) return;

      const deltaY = e.clientY - startY.current;
      const deltaMinutes = deltaY / pixelsPerMinute;
      
      // Use fine-grained interval when Shift is held
      const effectiveInterval = isShiftHeldRef.current ? FINE_GRAIN_INTERVAL : snapInterval;

      let newStart = startValues.current.start;
      let newDuration = startValues.current.duration;

      if (activeEdge === "top") {
        // Dragging top edge: adjust start time, inverse duration change
        const proposedStart = startValues.current.start + deltaMinutes;
        const snappedStart = snapToInterval(proposedStart, effectiveInterval);
        const maxStart =
          startValues.current.start +
          startValues.current.duration -
          minDuration;
        newStart = Math.max(
          0,
          Math.min(snappedStart, snapToInterval(maxStart, effectiveInterval)),
        );
        newDuration =
          startValues.current.duration - (newStart - startValues.current.start);
      } else {
        // Dragging bottom edge: adjust duration only
        const proposedDuration = startValues.current.duration + deltaMinutes;
        newDuration = Math.max(minDuration, snapToInterval(proposedDuration, effectiveInterval));
        // Clamp to maximum duration (supports overnight blocks up to ~48 hours)
        newDuration = Math.min(newDuration, maxDuration);
      }

      onResize?.(newStart, newDuration);
    },
    [
      isResizing,
      activeEdge,
      pixelsPerMinute,
      snapInterval,
      snapToInterval,
      minDuration,
      maxDuration,
      onResize,
    ],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing) return;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsResizing(false);
      setActiveEdge(null);
      onResizeEnd?.();
    },
    [isResizing, onResizeEnd],
  );

  return {
    isResizing,
    activeEdge,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

export type { UseBlockResizeOptions, UseBlockResizeReturn };
