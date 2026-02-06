/**
 * =============================================================================
 * File: use-grid-drag-create.ts
 * =============================================================================
 *
 * Interaction hook for creating new blocks by dragging directly on the calendar grid.
 *
 * Responsibilities:
 * - Track pointer drag from an empty grid cell
 * - Compute start time and duration from drag distance
 * - Provide live preview dimensions during drag
 * - Emit final creation intent on pointer release
 *
 * This hook is the creation counterpart to:
 * - useBlockDrag   → moving / duplicating existing blocks
 * - useBlockResize → resizing existing blocks
 *
 * It contains no rendering logic.
 * It owns only transient interaction state.
 *
 * ---------------------------------------------------------------------------
 * DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 * - Start time always snaps to standard interval (e.g. 15m)
 * - Duration can become fine-grained (1m) when Shift is held
 * - Creation supports overnight blocks (duration may exceed 1440m)
 * - Threshold-based activation avoids accidental drags
 */

"use client";

import * as React from "react";

/** Maximum duration for events (just under 48 hours, spanning at most 2 days) */
const MAX_EVENT_DURATION_MINUTES = 2879;

/** Fine-grained snap interval when Shift is held (1 minute) */
const FINE_GRAIN_INTERVAL = 1;

interface UseGridDragCreateOptions {
  /** Pixels per minute in the calendar grid */
  pixelsPerMinute: number;
  /** Snap to this interval in minutes (default: 15) */
  snapInterval?: number;
  /** Minimum duration in minutes to create a block (default: 15) */
  minDuration?: number;
  /** Maximum duration in minutes (default: 2879 for overnight support) */
  maxDuration?: number;
  /** Minimum pixels to drag before treating as drag vs click (default: 5) */
  dragThreshold?: number;
  /** Called when a block should be created */
  onCreate?: (
    dayIndex: number,
    startMinutes: number,
    durationMinutes: number,
  ) => void;
}

interface DragPreview {
  dayIndex: number;
  startMinutes: number;
  durationMinutes: number;
}

interface UseGridDragCreateReturn {
  /** Whether a drag operation is currently active */
  isDragging: boolean;
  /** Preview block dimensions during drag (null when not dragging or below threshold) */
  preview: DragPreview | null;
  /** Attach to grid cells' onPointerDown */
  handlePointerDown: (
    e: React.PointerEvent,
    dayIndex: number,
    cellTopMinutes: number,
  ) => void;
  /** Attach to grid container's onPointerMove */
  handlePointerMove: (e: React.PointerEvent) => void;
  /** Attach to grid container's onPointerUp */
  handlePointerUp: (e: React.PointerEvent) => void;
}

export function useGridDragCreate({
  pixelsPerMinute,
  snapInterval = 15,
  minDuration = 15,
  maxDuration = MAX_EVENT_DURATION_MINUTES,
  dragThreshold = 5,
  onCreate,
}: UseGridDragCreateOptions): UseGridDragCreateReturn {
  const [isDragging, setIsDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<DragPreview | null>(null);

  // Refs to track drag state without causing re-renders
  const dragRef = React.useRef<{
    dayIndex: number;
    anchorY: number; // Initial clientY
    anchorMinutes: number; // Snapped minutes where drag started
    hasExceededThreshold: boolean;
  } | null>(null);

  // Track Shift key state for fine-grained duration (1-minute precision)
  // Note: Start time always snaps to 15 min; only duration becomes fine-grained
  const isShiftHeldRef = React.useRef(false);

  // Track Shift key during drag operation
  React.useEffect(() => {
    if (!isDragging) {
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
  }, [isDragging]);

  const snapToInterval = React.useCallback(
    (minutes: number, interval: number = snapInterval) =>
      Math.round(minutes / interval) * interval,
    [snapInterval],
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent, dayIndex: number, cellTopMinutes: number) => {
      // Only handle primary button (left click / touch)
      if (e.button !== 0) return;

      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Check if Shift is already held when drag starts
      if (e.shiftKey) {
        isShiftHeldRef.current = true;
      }

      // Calculate precise start position within the cell
      // Start time always snaps to standard interval (15 min) for usability
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const minutesIntoCell = (relativeY / rect.height) * 60;
      const anchorMinutes = snapToInterval(cellTopMinutes + minutesIntoCell);

      dragRef.current = {
        dayIndex,
        anchorY: e.clientY,
        anchorMinutes,
        hasExceededThreshold: false,
      };

      setIsDragging(true);
    },
    [snapToInterval],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaY = e.clientY - drag.anchorY;

      // Check if we've exceeded the drag threshold
      if (!drag.hasExceededThreshold) {
        if (Math.abs(deltaY) < dragThreshold) {
          return; // Still within click tolerance
        }
        drag.hasExceededThreshold = true;
      }

      // Use fine-grained interval for duration when Shift is held
      // Note: Start time always uses standard interval for usability
      const durationInterval = isShiftHeldRef.current
        ? FINE_GRAIN_INTERVAL
        : snapInterval;

      // Calculate minutes delta and snap (for end position calculation)
      const deltaMinutes = deltaY / pixelsPerMinute;
      const currentMinutes = snapToInterval(
        drag.anchorMinutes + deltaMinutes,
        durationInterval,
      );

      // Allow extending past midnight for overnight blocks
      // Start time must be within day (0-1440), but duration can extend past
      const clampedStart = Math.max(0, Math.min(1440, drag.anchorMinutes));

      // For downward drags (positive delta), allow going past 1440
      // For upward drags (negative delta), clamp end to anchor
      let startMinutes: number;
      let endMinutes: number;

      if (currentMinutes >= drag.anchorMinutes) {
        // Dragging downward
        startMinutes = clampedStart;
        // Allow end time to extend past 1440 (for overnight blocks)
        endMinutes = Math.max(currentMinutes, drag.anchorMinutes);
      } else {
        // Dragging upward - start time snaps to standard interval, but end position uses duration interval
        startMinutes = Math.max(
          0,
          snapToInterval(currentMinutes, snapInterval),
        );
        endMinutes = drag.anchorMinutes;
      }

      // Calculate duration and clamp to max
      let durationMinutes = Math.max(minDuration, endMinutes - startMinutes);
      durationMinutes = Math.min(durationMinutes, maxDuration);

      setPreview({
        dayIndex: drag.dayIndex,
        startMinutes,
        durationMinutes,
      });
    },
    [
      pixelsPerMinute,
      snapInterval,
      snapToInterval,
      dragThreshold,
      minDuration,
      maxDuration,
    ],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may have been lost
      }

      // Only create if we exceeded threshold and have a valid preview
      if (
        drag.hasExceededThreshold &&
        preview &&
        preview.durationMinutes >= minDuration
      ) {
        onCreate?.(
          preview.dayIndex,
          preview.startMinutes,
          preview.durationMinutes,
        );
      }

      // Reset state
      dragRef.current = null;
      setIsDragging(false);
      setPreview(null);
    },
    [preview, minDuration, onCreate],
  );

  return {
    isDragging,
    preview,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

export type { UseGridDragCreateOptions, UseGridDragCreateReturn, DragPreview };
