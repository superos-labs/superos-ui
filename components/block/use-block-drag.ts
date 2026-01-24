"use client";

import * as React from "react";

interface UseBlockDragOptions {
  startMinutes: number;
  dayIndex: number;
  durationMinutes: number;
  /** Pixels per minute in the calendar grid */
  pixelsPerMinute: number;
  /** Width of each day column in pixels */
  dayColumnWidth: number;
  /** Snap to this interval in minutes (default: 15) */
  snapInterval?: number;
  /** Minimum day index (default: 0 = Monday) */
  minDayIndex?: number;
  /** Maximum day index (default: 6 = Sunday) */
  maxDayIndex?: number;
  /** Minimum start time in minutes from midnight (default: 0) */
  minStartMinutes?: number;
  /** Maximum end time in minutes from midnight (default: 1440 = 24 hours) */
  maxEndMinutes?: number;
  /** Called when drag operation ends with the final position */
  onDragEnd?: (newDayIndex: number, newStartMinutes: number) => void;
}

interface DragPreviewPosition {
  dayIndex: number;
  startMinutes: number;
}

interface UseBlockDragReturn {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  /** The projected position during drag (null when not dragging) */
  previewPosition: DragPreviewPosition | null;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
}

export function useBlockDrag({
  startMinutes,
  dayIndex,
  durationMinutes,
  pixelsPerMinute,
  dayColumnWidth,
  snapInterval = 15,
  minDayIndex = 0,
  maxDayIndex = 6,
  minStartMinutes = 0,
  maxEndMinutes = 1440,
  onDragEnd,
}: UseBlockDragOptions): UseBlockDragReturn {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [previewPosition, setPreviewPosition] = React.useState<DragPreviewPosition | null>(null);

  const startPos = React.useRef({ x: 0, y: 0 });
  const startValues = React.useRef({ dayIndex: 0, startMinutes: 0 });
  // Track the current calculated position for use in pointerUp
  const currentPosition = React.useRef({ dayIndex: 0, startMinutes: 0 });

  const snapToInterval = React.useCallback(
    (minutes: number) => {
      return Math.round(minutes / snapInterval) * snapInterval;
    },
    [snapInterval],
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      // Only handle primary button (left click / touch)
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      setIsDragging(true);
      setDragOffset({ x: 0, y: 0 });
      startPos.current = { x: e.clientX, y: e.clientY };
      startValues.current = { dayIndex, startMinutes };
      currentPosition.current = { dayIndex, startMinutes };
    },
    [dayIndex, startMinutes],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      // Update visual offset for smooth dragging feedback
      setDragOffset({ x: deltaX, y: deltaY });

      // Calculate new day index from horizontal movement
      const dayDelta = Math.round(deltaX / dayColumnWidth);
      let newDayIndex = startValues.current.dayIndex + dayDelta;
      newDayIndex = Math.max(minDayIndex, Math.min(maxDayIndex, newDayIndex));

      // Calculate new start time from vertical movement
      const minutesDelta = deltaY / pixelsPerMinute;
      let newStartMinutes = snapToInterval(
        startValues.current.startMinutes + minutesDelta,
      );

      // Constrain to valid time range
      newStartMinutes = Math.max(minStartMinutes, newStartMinutes);
      // Ensure the block doesn't extend past the end boundary
      if (newStartMinutes + durationMinutes > maxEndMinutes) {
        newStartMinutes = snapToInterval(maxEndMinutes - durationMinutes);
      }

      // Store for use in pointerUp and update preview state
      currentPosition.current = { dayIndex: newDayIndex, startMinutes: newStartMinutes };
      setPreviewPosition({ dayIndex: newDayIndex, startMinutes: newStartMinutes });
    },
    [
      isDragging,
      dayColumnWidth,
      pixelsPerMinute,
      snapToInterval,
      minDayIndex,
      maxDayIndex,
      minStartMinutes,
      maxEndMinutes,
      durationMinutes,
    ],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may have been lost
      }

      const { dayIndex: newDayIndex, startMinutes: newStartMinutes } = currentPosition.current;
      
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      setPreviewPosition(null);
      
      // Only call onDragEnd with position if it actually changed
      if (newDayIndex !== startValues.current.dayIndex || 
          newStartMinutes !== startValues.current.startMinutes) {
        onDragEnd?.(newDayIndex, newStartMinutes);
      }
    },
    [isDragging, onDragEnd],
  );

  return {
    isDragging,
    dragOffset,
    previewPosition,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

export type { UseBlockDragOptions, UseBlockDragReturn, DragPreviewPosition };
