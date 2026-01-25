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
    [item, disabled, dragContext]
  );

  // Check if this specific item is being dragged
  const isDragging = React.useMemo(() => {
    if (!dragContext?.state.isDragging || !dragContext.state.item) return false;
    
    const currentItem = dragContext.state.item;
    if (item.type !== currentItem.type) return false;
    if (item.goalId !== currentItem.goalId) return false;
    if (item.type === "task" && item.taskId !== currentItem.taskId) return false;
    
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
    [handlePointerDown, disabled, isDragging]
  );

  return {
    draggableProps,
    isDragging,
  };
}
