// Public API for the Drag system

// Context and Provider
export { DragProvider, useDragContext, useDragContextOptional } from "./drag-context";
export type { DragState, DragContextValue } from "./drag-context";

// Hooks
export { useDraggable } from "./use-draggable";
export { useDropZone } from "./use-drop-zone";

// Components
export { DragGhost } from "./drag-ghost";

// Re-export types from lib for convenience
export type { DragItem, DropPosition, DropTarget } from "@/lib/drag-types";
export { getDefaultDuration, getDragItemTitle } from "@/lib/drag-types";
