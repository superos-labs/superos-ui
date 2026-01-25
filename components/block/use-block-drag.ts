"use client";

import * as React from "react";

/** Pixel distance pointer must move before drag activates */
const DRAG_THRESHOLD = 4;

/** Maximum duration for events (just under 48 hours, spanning at most 2 days) */
const MAX_EVENT_DURATION_MINUTES = 2879;

type DragState = "idle" | "pending" | "dragging";

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
  /** Maximum start time in minutes from midnight (default: 1440 - allows overnight events) */
  maxStartMinutes?: number;
  /** Pixel distance before drag activates (default: 4) */
  dragThreshold?: number;
  /** Called when drag operation ends with the final position (move) */
  onDragEnd?: (newDayIndex: number, newStartMinutes: number) => void;
  /** Called when drag operation ends with Option key held (duplicate) */
  onDuplicate?: (newDayIndex: number, newStartMinutes: number) => void;
}

interface DragPreviewPosition {
  dayIndex: number;
  startMinutes: number;
}

interface UseBlockDragReturn {
  isDragging: boolean;
  /** Whether the Option/Alt key is currently held during drag */
  isOptionHeld: boolean;
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
  maxStartMinutes = 1440, // Max start time (allows overnight events to start late in day)
  dragThreshold = DRAG_THRESHOLD,
  onDragEnd,
  onDuplicate,
}: UseBlockDragOptions): UseBlockDragReturn {
  const [dragState, setDragState] = React.useState<DragState>("idle");
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [previewPosition, setPreviewPosition] = React.useState<DragPreviewPosition | null>(null);
  const [isOptionHeld, setIsOptionHeld] = React.useState(false);

  const startPos = React.useRef({ x: 0, y: 0 });
  const startValues = React.useRef({ dayIndex: 0, startMinutes: 0 });
  // Track the current calculated position for use in pointerUp
  const currentPosition = React.useRef({ dayIndex: 0, startMinutes: 0 });
  // Track Option key state in a ref for use in pointerUp (avoids stale closure)
  const isOptionHeldRef = React.useRef(false);

  // Track Option/Alt key state during drag
  React.useEffect(() => {
    if (dragState === "idle") {
      // Reset Option state when not dragging
      setIsOptionHeld(false);
      isOptionHeldRef.current = false;
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsOptionHeld(true);
        isOptionHeldRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsOptionHeld(false);
        isOptionHeldRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [dragState]);

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

      // Check if Option/Alt is already held when drag starts
      if (e.altKey) {
        setIsOptionHeld(true);
        isOptionHeldRef.current = true;
      }

      // Enter pending state - NOT dragging yet until threshold is exceeded
      setDragState("pending");
      setDragOffset({ x: 0, y: 0 });
      startPos.current = { x: e.clientX, y: e.clientY };
      startValues.current = { dayIndex, startMinutes };
      currentPosition.current = { dayIndex, startMinutes };
    },
    [dayIndex, startMinutes],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (dragState === "idle") return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      // Check if we should transition from pending to dragging
      if (dragState === "pending") {
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        if (distance < dragThreshold) {
          // Still under threshold, don't activate drag visuals
          return;
        }
        // Threshold exceeded, now we're actually dragging
        setDragState("dragging");
      }

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

      // Constrain start time to valid range
      // For overnight events, start can be anywhere from 0 to maxStartMinutes
      // The event will naturally extend into the next day
      newStartMinutes = Math.max(minStartMinutes, newStartMinutes);
      newStartMinutes = Math.min(maxStartMinutes, newStartMinutes);

      // Store for use in pointerUp and update preview state
      currentPosition.current = { dayIndex: newDayIndex, startMinutes: newStartMinutes };
      setPreviewPosition({ dayIndex: newDayIndex, startMinutes: newStartMinutes });
    },
    [
      dragState,
      dragThreshold,
      dayColumnWidth,
      pixelsPerMinute,
      snapToInterval,
      minDayIndex,
      maxDayIndex,
      minStartMinutes,
      maxStartMinutes,
    ],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (dragState === "idle") return;

      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may have been lost
      }

      const wasDragging = dragState === "dragging";
      const { dayIndex: newDayIndex, startMinutes: newStartMinutes } = currentPosition.current;
      // Use ref to get current Option state (avoids stale closure issues)
      const wasOptionHeld = isOptionHeldRef.current;
      
      setDragState("idle");
      setDragOffset({ x: 0, y: 0 });
      setPreviewPosition(null);
      
      // Only call callbacks if we were actually dragging (not just clicking)
      if (wasDragging) {
        if (wasOptionHeld && onDuplicate) {
          // Option was held - duplicate to new position
          onDuplicate(newDayIndex, newStartMinutes);
        } else if (
          newDayIndex !== startValues.current.dayIndex ||
          newStartMinutes !== startValues.current.startMinutes
        ) {
          // No Option - move to new position (only if position changed)
          onDragEnd?.(newDayIndex, newStartMinutes);
        }
      }
    },
    [dragState, onDragEnd, onDuplicate],
  );

  // isDragging is true only when actively dragging (threshold exceeded)
  const isDragging = dragState === "dragging";

  return {
    isDragging,
    isOptionHeld,
    dragOffset,
    previewPosition,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

export type { UseBlockDragOptions, UseBlockDragReturn, DragPreviewPosition };
