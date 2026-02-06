/**
 * =============================================================================
 * File: drag-ghost.tsx
 * =============================================================================
 *
 * Cursor-following visual preview for active drag operations.
 *
 * Renders a lightweight Block-based "ghost" that tracks pointer position
 * while an item is being dragged and no snapped preview is active.
 *
 * When the pointer enters a valid drop zone, this ghost is hidden and the
 * target surface is responsible for rendering its own placement preview.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Subscribe to drag state from DragContext.
 * - Position a floating preview at the current pointer coordinates.
 * - Derive title, color, and default duration from DragItem.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Determining valid drop targets.
 * - Snapping or layout calculations.
 * - Performing placement or persistence.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses pointer-events-none to avoid intercepting input.
 * - Slightly offset from cursor for visual clarity.
 * - High z-index to ensure visibility above UI chrome.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - DragGhost
 */

"use client";

import * as React from "react";
import { Block } from "@/components/block";
import {
  getDefaultDuration,
  getDragItemTitle,
  getDragItemColor,
} from "@/lib/drag-types";
import { useDragContext } from "./drag-context";

// ============================================================================
// Component
// ============================================================================

/**
 * Visual ghost that follows the cursor during drag operations.
 * Renders a Block component preview at the current pointer position.
 *
 * The ghost is hidden when over a valid drop zone (calendar shows its own preview).
 */
export function DragGhost() {
  const { state } = useDragContext();

  // Hide ghost when over a valid drop zone - the calendar renders its own preview
  if (!state.isDragging || !state.item || state.previewPosition) {
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
