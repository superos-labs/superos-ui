"use client";

/**
 * useExternalDragPreview - Drag preview generation for calendar.
 *
 * This hook generates the preview data for external drag operations
 * (from backlog to calendar) and handles the drop logic.
 */

import * as React from "react";
import type { ExternalDragPreview } from "@/components/calendar";
import type { DragContextValue } from "@/components/drag";
import type { DragItem, DropPosition } from "@/lib/drag-types";
import {
  getDefaultDuration,
  getDragItemTitle,
  getDragItemColor,
} from "@/lib/drag-types";

// =============================================================================
// Types
// =============================================================================

export interface UseExternalDragPreviewOptions {
  /** Drag context from DragProvider (optional - may be outside provider) */
  dragContext: DragContextValue | null;
  /** Current week dates for drop handling */
  weekDates: Date[];
  /** Handler to process drops */
  onDrop: (item: DragItem, position: DropPosition, weekDates: Date[]) => void;
}

export interface UseExternalDragPreviewReturn {
  /** Preview data to pass to Calendar's externalDragPreview prop */
  externalDragPreview: ExternalDragPreview | null;
  /** Handler for drops on the calendar time grid */
  handleExternalDrop: (dayIndex: number, startMinutes: number) => void;
  /** Handler for drops on day headers (deadlines) */
  handleDeadlineDrop: (dayIndex: number) => void;
  /** Whether an external drag is currently in progress */
  isDragging: boolean;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useExternalDragPreview({
  dragContext,
  weekDates,
  onDrop,
}: UseExternalDragPreviewOptions): UseExternalDragPreviewReturn {
  const dragState = dragContext?.state ?? null;
  const isDragging = dragState?.isDragging ?? false;
  const dragItem = dragState?.item ?? null;
  const previewPosition = dragState?.previewPosition ?? null;

  const externalDragPreview = React.useMemo(() => {
    if (!isDragging || !dragItem || !previewPosition) return null;
    if (previewPosition.dropTarget !== "time-grid") return null;

    const color = getDragItemColor(dragItem);
    if (!color) return null;

    // Use adaptive duration when available (shift+drag mode), otherwise default
    const duration =
      previewPosition.adaptiveDuration ?? getDefaultDuration(dragItem.type);

    return {
      dayIndex: previewPosition.dayIndex,
      startMinutes: previewPosition.startMinutes ?? 0,
      durationMinutes: duration,
      color,
      title: getDragItemTitle(dragItem),
    };
  }, [isDragging, dragItem, previewPosition]);

  const handleExternalDrop = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      if (!dragItem) return;

      let position: DropPosition;
      if (previewPosition && previewPosition.dropTarget === "existing-block") {
        position = previewPosition;
      } else {
        // Preserve adaptiveDuration from preview position if available
        position = {
          dayIndex,
          startMinutes,
          dropTarget: "time-grid" as const,
          adaptiveDuration: previewPosition?.adaptiveDuration,
        };
      }
      onDrop(dragItem, position, weekDates);
    },
    [dragItem, previewPosition, onDrop, weekDates],
  );

  const handleDeadlineDrop = React.useCallback(
    (dayIndex: number) => {
      if (!dragItem || !dragContext) return;
      onDrop(dragItem, { dayIndex, dropTarget: "day-header" }, weekDates);
      dragContext.endDrag();
    },
    [dragItem, dragContext, onDrop, weekDates],
  );

  return {
    externalDragPreview,
    handleExternalDrop,
    handleDeadlineDrop,
    isDragging,
  };
}
