"use client";

import * as React from "react";

interface UseGridDragCreateOptions {
  /** Pixels per minute in the calendar grid */
  pixelsPerMinute: number;
  /** Snap to this interval in minutes (default: 15) */
  snapInterval?: number;
  /** Minimum duration in minutes to create a block (default: 15) */
  minDuration?: number;
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

  const snapToInterval = React.useCallback(
    (minutes: number) => Math.round(minutes / snapInterval) * snapInterval,
    [snapInterval],
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent, dayIndex: number, cellTopMinutes: number) => {
      // Only handle primary button (left click / touch)
      if (e.button !== 0) return;

      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Calculate precise start position within the cell
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

      // Calculate minutes delta and snap
      const deltaMinutes = deltaY / pixelsPerMinute;
      const currentMinutes = snapToInterval(drag.anchorMinutes + deltaMinutes);

      // Clamp to valid range (0-1440)
      const clampedMinutes = Math.max(0, Math.min(1440, currentMinutes));

      // Compute preview: handle both downward (positive) and upward (negative) drags
      const startMinutes = Math.min(drag.anchorMinutes, clampedMinutes);
      const endMinutes = Math.max(drag.anchorMinutes, clampedMinutes);
      const durationMinutes = Math.max(minDuration, endMinutes - startMinutes);

      setPreview({
        dayIndex: drag.dayIndex,
        startMinutes,
        durationMinutes,
      });
    },
    [pixelsPerMinute, snapToInterval, dragThreshold, minDuration],
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
        onCreate?.(preview.dayIndex, preview.startMinutes, preview.durationMinutes);
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
