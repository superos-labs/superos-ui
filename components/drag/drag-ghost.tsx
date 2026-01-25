"use client";

import * as React from "react";
import { Block } from "@/components/block";
import { getDefaultDuration, getDragItemTitle, getDragItemColor } from "@/lib/drag-types";
import { useDragContext } from "./drag-context";

// ============================================================================
// Component
// ============================================================================

/**
 * Visual ghost that follows the cursor during drag operations.
 * Renders a Block component preview at the current pointer position.
 */
export function DragGhost() {
  const { state } = useDragContext();

  if (!state.isDragging || !state.item) {
    return null;
  }

  const duration = getDefaultDuration(state.item.type);
  const title = getDragItemTitle(state.item);
  const color = getDragItemColor(state.item);

  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: state.position.x,
        top: state.position.y,
        // Offset so the ghost appears slightly offset from cursor
        transform: "translate(-50%, -10px)",
        width: 180,
      }}
    >
      <div className="opacity-90 shadow-lg rounded-md">
        <Block
          title={title}
          color={color}
          duration={duration as 30 | 60}
          status="planned"
        />
      </div>
    </div>
  );
}
