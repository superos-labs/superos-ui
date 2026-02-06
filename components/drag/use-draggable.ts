/**
 * =============================================================================
 * File: use-draggable.ts
 * =============================================================================
 *
 * Hook for making an element act as a drag source.
 *
 * Binds pointer-down behavior to the global DragContext and exposes
 * ergonomic props that can be spread onto any interactive element.
 *
 * This hook is intentionally thin. It does not manage drag state itself,
 * only delegates initiation to the DragProvider when available.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Register pointer down to start a drag.
 * - Respect disabled state.
 * - Expose cursor and interaction styles.
 * - Indicate whether this item is currently being dragged.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Tracking pointer movement.
 * - Rendering drag previews.
 * - Determining drop targets or placement.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses optional drag context to allow graceful usage outside provider.
 * - Touch-action is disabled to prevent native scrolling during drag.
 * - Compares item identity to determine active dragging state.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useDraggable
 */

"use client";

import * as React from "react";
import type { DragItem } from "@/lib/drag-types";
import { useDragContextOptional } from "./drag-context";

// ============================================================================
// Types
// ============================================================================

interface UseDraggableOptions {
  /** The item to drag */
  item: DragItem;
  /** Whether dragging is disabled */
  disabled?: boolean;
}

interface UseDraggableReturn {
  /** Props to spread onto the draggable element */
  draggableProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
    "data-dragging"?: boolean;
  };
  /** Whether this item is currently being dragged */
  isDragging: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useDraggable({
  item,
  disabled = false,
}: UseDraggableOptions): UseDraggableReturn {
  const dragContext = useDragContextOptional();

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (disabled || !dragContext) return;

      // Only handle primary button (left click / touch)
      if (e.button !== 0) return;

      dragContext.startDrag(item, e);
    },
    [item, disabled, dragContext],
  );

  // Check if this specific item is being dragged
  const isDragging = React.useMemo(() => {
    if (!dragContext?.state.isDragging || !dragContext.state.item) return false;

    const currentItem = dragContext.state.item;
    if (item.type !== currentItem.type) return false;
    if (item.goalId !== currentItem.goalId) return false;
    if (item.type === "task" && item.taskId !== currentItem.taskId)
      return false;

    return true;
  }, [dragContext?.state, item]);

  const draggableProps = React.useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      style: {
        cursor: disabled ? "default" : "grab",
        touchAction: "none" as const,
        userSelect: "none" as const,
      },
      ...(isDragging ? { "data-dragging": true } : {}),
    }),
    [handlePointerDown, disabled, isDragging],
  );

  return {
    draggableProps,
    isDragging,
  };
}
