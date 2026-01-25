// Public API for the Block component family
export { Block } from "./block";
export type { BlockProps, BlockStatus, BlockDuration } from "./block";

export { BLOCK_COLORS } from "./block-colors";
export type { BlockColor } from "./block-colors";

export {
  BlockSidebar,
  BlockSidebarTaskRow,
  BlockSidebarSection,
} from "./block-sidebar";
export type {
  BlockSidebarProps,
  BlockSidebarData,
  BlockSidebarTask,
  BlockSidebarGoal,
} from "./block-sidebar";

export { ResizableBlockWrapper } from "./resizable-block-wrapper";
export type { ResizableBlockWrapperProps } from "./resizable-block-wrapper";

export { useBlockResize } from "./use-block-resize";
export type {
  UseBlockResizeOptions,
  UseBlockResizeReturn,
} from "./use-block-resize";

export { DraggableBlockWrapper } from "./draggable-block-wrapper";
export type { DraggableBlockWrapperProps, DragRenderProps } from "./draggable-block-wrapper";

export { useBlockDrag } from "./use-block-drag";
export type { UseBlockDragOptions, UseBlockDragReturn, DragPreviewPosition } from "./use-block-drag";

export { useGridDragCreate } from "./use-grid-drag-create";
export type {
  UseGridDragCreateOptions,
  UseGridDragCreateReturn,
  DragPreview,
} from "./use-grid-drag-create";
