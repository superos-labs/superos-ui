/**
 * =============================================================================
 * File: use-external-drag.ts
 * =============================================================================
 *
 * External drag-and-drop controller for calendar time columns.
 *
 * Supports dragging items from outside the calendar (backlog, lists, etc.)
 * into a specific day column, with live preview, gap-fitting, and block
 * hit-detection.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Track pointer movement during external drags.
 * - Detect drops over existing blocks vs empty grid.
 * - Compute raw minutes from pointer Y position.
 * - Apply adaptive drop algorithm or overlap placement.
 * - Update shared drag preview state.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Creating events.
 * - Persisting changes.
 * - Rendering previews.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses drag context as the single source of truth.
 * - Shift enables overlap mode (bypass adaptive fitting).
 * - Existing-block drops are routed upward via preview state.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useExternalDrag
 */

"use client";

import * as React from "react";
import { useDragContextOptional } from "@/components/drag";
import { getDefaultDuration } from "@/lib/drag-types";
import { snapToGrid, calculateAdaptiveDrop } from "./calendar-utils";
import type { EventDaySegment } from "./calendar-types";

interface UseExternalDragOptions {
  columnRef: React.RefObject<HTMLDivElement | null>;
  pixelsPerMinute: number;
  enableExternalDrop: boolean;
  dayIndex: number;
  segments: EventDaySegment[];
  onExternalDrop?: (dayIndex: number, startMinutes: number) => void;
  blockRefsMap: React.RefObject<Map<string, HTMLDivElement>>;
}

/**
 * Hook that encapsulates external drag-and-drop logic for a TimeColumn.
 * Handles pointer tracking, hit detection against existing blocks,
 * adaptive gap-fitting, and preview position updates.
 */
export function useExternalDrag({
  columnRef,
  pixelsPerMinute,
  enableExternalDrop,
  dayIndex,
  segments,
  onExternalDrop,
  blockRefsMap,
}: UseExternalDragOptions) {
  const dragContext = useDragContextOptional();

  // Check if a point hits a valid block drop target
  const getBlockAtPoint = React.useCallback(
    (
      clientX: number,
      clientY: number,
    ): { blockId: string; event: EventDaySegment["event"] } | null => {
      const dragItem = dragContext?.state.item;
      // Only check for task drags
      if (!dragItem || dragItem.type !== "task") return null;

      for (const segment of segments) {
        const event = segment.event;
        // Skip essentials - they don't accept drops
        if (event.blockType === "essential") continue;
        // Skip if goal doesn't match
        if (event.sourceGoalId !== dragItem.goalId) continue;
        // Only goal and task blocks can accept task drops
        if (event.blockType !== "goal" && event.blockType !== "task") continue;

        const blockEl = blockRefsMap.current.get(event.id);
        if (!blockEl) continue;

        const rect = blockEl.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return { blockId: event.id, event };
        }
      }
      return null;
    },
    [dragContext?.state.item, segments, blockRefsMap],
  );

  // Calculate raw minutes from Y position (no snapping)
  const getRawMinutesFromY = React.useCallback(
    (clientY: number): number => {
      if (!columnRef.current) return 0;
      const rect = columnRef.current.getBoundingClientRect();
      const scrollParent = columnRef.current.closest("[data-calendar-scroll]");
      const scrollTop = scrollParent?.scrollTop ?? 0;
      const y = clientY - rect.top + scrollTop;
      const rawMinutes = y / pixelsPerMinute;
      return Math.max(0, Math.min(1440 - 15, rawMinutes));
    },
    [pixelsPerMinute, columnRef],
  );

  // Handle pointer move for external drag preview
  const handleExternalDragMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enableExternalDrop || !dragContext?.state.isDragging) return;

      const dragItem = dragContext.state.item;
      if (!dragItem) return;

      // Check if pointer is over a valid block drop target
      const blockHit = getBlockAtPoint(e.clientX, e.clientY);
      if (blockHit) {
        dragContext.setPreviewPosition({
          dayIndex,
          dropTarget: "existing-block",
          targetBlockId: blockHit.blockId,
        });
        return;
      }

      const rawMinutes = getRawMinutesFromY(e.clientY);
      const defaultDuration = getDefaultDuration(dragItem.type);

      // Default: Adaptive drop - fits block to available gaps
      if (!dragContext.state.isOverlapModeEnabled) {
        // Pass raw cursor position - adaptive algorithm handles centering within gaps
        const adaptive = calculateAdaptiveDrop(
          segments,
          rawMinutes,
          defaultDuration,
        );
        dragContext.setPreviewPosition({
          dayIndex,
          startMinutes: adaptive.startMinutes,
          dropTarget: "time-grid",
          adaptiveDuration: adaptive.isAdapted
            ? adaptive.durationMinutes
            : undefined,
        });
      } else {
        // Shift held: Override to allow overlap placement
        const centeredMinutes = Math.max(0, rawMinutes - defaultDuration / 2);
        const snappedMinutes = snapToGrid(centeredMinutes);
        dragContext.setPreviewPosition({
          dayIndex,
          startMinutes: snappedMinutes,
          dropTarget: "time-grid",
        });
      }
    },
    [
      enableExternalDrop,
      dragContext,
      dayIndex,
      getRawMinutesFromY,
      getBlockAtPoint,
      segments,
    ],
  );

  // Handle pointer up for external drop
  const handleExternalDrop = React.useCallback(
    (e: React.PointerEvent) => {
      if (
        !enableExternalDrop ||
        !dragContext?.state.isDragging ||
        !dragContext.state.item
      )
        return;

      // Check if dropping on a block
      const blockHit = getBlockAtPoint(e.clientX, e.clientY);
      if (blockHit) {
        // The drop will be handled by the parent via handleDrop with existing-block target
        onExternalDrop?.(dayIndex, 0); // startMinutes not used for block drops
        dragContext.endDrag();
        return;
      }

      // Grid drop - use the snapped position from preview if available
      const previewPos = dragContext.state.previewPosition;
      const startMinutes =
        previewPos?.startMinutes ?? snapToGrid(getRawMinutesFromY(e.clientY));
      onExternalDrop?.(dayIndex, startMinutes);
      dragContext.endDrag();
    },
    [
      enableExternalDrop,
      dragContext,
      dayIndex,
      getRawMinutesFromY,
      onExternalDrop,
      getBlockAtPoint,
    ],
  );

  // Handle pointer leave - clear preview if leaving this column
  const handlePointerLeave = React.useCallback(() => {
    if (!dragContext?.state.isDragging) return;
    if (dragContext.state.previewPosition?.dayIndex === dayIndex) {
      dragContext.setPreviewPosition(null);
    }
  }, [dragContext, dayIndex]);

  // Check if external drag is over this column (time-grid only, not header)
  const isExternalDragOver = Boolean(
    enableExternalDrop &&
    dragContext?.state.isDragging &&
    dragContext?.state.previewPosition?.dayIndex === dayIndex &&
    dragContext?.state.previewPosition?.dropTarget === "time-grid",
  );

  return {
    handleExternalDragMove,
    handleExternalDrop,
    handlePointerLeave,
    isExternalDragOver,
  };
}
