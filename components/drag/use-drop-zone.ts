/**
 * =============================================================================
 * File: use-drop-zone.ts
 * =============================================================================
 *
 * Hook for registering a time-based drop target.
 *
 * Translates pointer movement into snapped time positions and reports
 * preview placement back to the global DragContext.
 *
 * Designed primarily for calendar day columns, but remains generic to any
 * vertical time grid.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Attach pointer handlers for drag-over, leave, and drop.
 * - Convert Y pointer position into start minutes.
 * - Snap minutes to a configurable interval.
 * - Publish preview positions to DragContext.
 * - Invoke onDrop with resolved item and start time.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering drop previews.
 * - Validating business rules.
 * - Creating or updating domain entities.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses optional drag context for graceful usage.
 * - Clamps minutes to a valid 24h range.
 * - Clears preview when pointer leaves the zone.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useDropZone
 */

"use client";

import * as React from "react";
import type { DragItem, DropPosition } from "@/lib/drag-types";
import { useDragContextOptional } from "./drag-context";

// ============================================================================
// Types
// ============================================================================

interface UseDropZoneOptions {
  /** The day index this drop zone represents */
  dayIndex: number;
  /** Pixels per minute for position calculations */
  pixelsPerMinute: number;
  /** Snap interval in minutes (default: 15) */
  snapInterval?: number;
  /** Called when an item is dropped in this zone */
  onDrop?: (item: DragItem, startMinutes: number) => void;
}

interface UseDropZoneReturn {
  /** Ref to attach to the drop zone container */
  dropZoneRef: React.RefObject<HTMLDivElement>;
  /** Props to spread onto the drop zone element */
  dropZoneProps: {
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
  };
  /** Whether an item is currently being dragged over this zone */
  isOver: boolean;
  /** The preview position if dragging over this zone */
  previewPosition: DropPosition | null;
}

// ============================================================================
// Helpers
// ============================================================================

function snapToInterval(minutes: number, interval: number): number {
  return Math.round(minutes / interval) * interval;
}

// ============================================================================
// Hook
// ============================================================================

export function useDropZone({
  dayIndex,
  pixelsPerMinute,
  snapInterval = 15,
  onDrop,
}: UseDropZoneOptions): UseDropZoneReturn {
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const dragContext = useDragContextOptional();

  const getMinutesFromY = React.useCallback(
    (clientY: number): number => {
      if (!dropZoneRef.current) return 0;

      const rect = dropZoneRef.current.getBoundingClientRect();
      const scrollTop = dropZoneRef.current.scrollTop;
      const y = clientY - rect.top + scrollTop;
      const rawMinutes = y / pixelsPerMinute;

      // Clamp to valid range and snap
      const clampedMinutes = Math.max(0, Math.min(1440 - 15, rawMinutes));
      return snapToInterval(clampedMinutes, snapInterval);
    },
    [pixelsPerMinute, snapInterval],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragContext?.state.isDragging) return;

      const startMinutes = getMinutesFromY(e.clientY);
      dragContext.setPreviewPosition({
        dayIndex,
        startMinutes,
        dropTarget: "time-grid",
      });
    },
    [dragContext, dayIndex, getMinutesFromY],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragContext?.state.isDragging || !dragContext.state.item) return;

      const startMinutes = getMinutesFromY(e.clientY);
      onDrop?.(dragContext.state.item, startMinutes);
      dragContext.endDrag();
    },
    [dragContext, getMinutesFromY, onDrop],
  );

  const handlePointerLeave = React.useCallback(() => {
    if (!dragContext?.state.isDragging) return;

    // Clear preview when leaving this zone
    if (dragContext.state.previewPosition?.dayIndex === dayIndex) {
      dragContext.setPreviewPosition(null);
    }
  }, [dragContext, dayIndex]);

  const isOver = React.useMemo(() => {
    return (
      dragContext?.state.isDragging === true &&
      dragContext?.state.previewPosition?.dayIndex === dayIndex
    );
  }, [dragContext?.state, dayIndex]);

  const previewPosition = React.useMemo(() => {
    if (!isOver) return null;
    return dragContext?.state.previewPosition ?? null;
  }, [isOver, dragContext?.state.previewPosition]);

  const dropZoneProps = React.useMemo(
    () => ({
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    }),
    [handlePointerMove, handlePointerUp, handlePointerLeave],
  );

  return {
    dropZoneRef: dropZoneRef as React.RefObject<HTMLDivElement>,
    dropZoneProps,
    isOver,
    previewPosition,
  };
}
