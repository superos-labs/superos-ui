/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public entry point for the SuperOS drag-and-drop system.
 *
 * Aggregates and re-exports the drag context, hooks, components, and
 * commonly used drag-related types into a single import surface.
 *
 * This file exists to provide a stable, ergonomic API boundary for
 * consumers across the application.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export drag context and provider.
 * - Re-export draggable and drop zone hooks.
 * - Re-export drag ghost component.
 * - Re-export core drag types and helpers.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing drag behavior.
 * - Owning business or layout logic.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Prefer importing from this file instead of deep paths.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - DragProvider
 * - useDragContext
 * - useDragContextOptional
 * - useDraggable
 * - useDropZone
 * - DragGhost
 * - DragState
 * - DragContextValue
 * - DragItem
 * - DropPosition
 * - DropTarget
 * - getDefaultDuration
 * - getDragItemTitle
 */

// Context and Provider
export {
  DragProvider,
  useDragContext,
  useDragContextOptional,
} from "./drag-context";
export type { DragState, DragContextValue } from "./drag-context";

// Hooks
export { useDraggable } from "./use-draggable";
export { useDropZone } from "./use-drop-zone";

// Components
export { DragGhost } from "./drag-ghost";

// Re-export types from lib for convenience
export type { DragItem, DropPosition, DropTarget } from "@/lib/drag-types";
export { getDefaultDuration, getDragItemTitle } from "@/lib/drag-types";
