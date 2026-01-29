// Public API for the Block component family

// Shared types (re-exported from lib/types for convenience)
export type { BlockType, BlockStatus } from "@/lib/types";

export { Block } from "./block";
export type { BlockProps, BlockDuration, SegmentPosition } from "./block";

export { BLOCK_COLORS } from "./block-colors";
export type { BlockColor } from "./block-colors";

export {
  BlockSidebar,
  BlockGoalTaskRow,
  BlockSidebarSection,
} from "./block-sidebar";
export type {
  BlockSidebarProps,
  BlockSidebarData,
  BlockGoalTask,
  BlockSubtask,
  BlockSidebarSource,
  GoalSelectorOption,
} from "./block-sidebar";

// Re-export ScheduleTask for consumers working with goal task data
export type { ScheduleTask, Subtask } from "@/lib/unified-schedule";

export { ResizableBlockWrapper } from "./resizable-block-wrapper";
export type { ResizableBlockWrapperProps } from "./resizable-block-wrapper";

export { useBlockResize } from "./use-block-resize";
export type {
  UseBlockResizeOptions,
  UseBlockResizeReturn,
} from "./use-block-resize";

export { DraggableBlockWrapper } from "./draggable-block-wrapper";
export type {
  DraggableBlockWrapperProps,
  DragRenderProps,
} from "./draggable-block-wrapper";

export { useBlockDrag } from "./use-block-drag";
export type {
  UseBlockDragOptions,
  UseBlockDragReturn,
  DragPreviewPosition,
} from "./use-block-drag";

export { useGridDragCreate } from "./use-grid-drag-create";
export type {
  UseGridDragCreateOptions,
  UseGridDragCreateReturn,
  DragPreview,
} from "./use-grid-drag-create";

export { useBlockSidebarHandlers } from "./use-block-sidebar-handlers";
export type {
  UseBlockSidebarHandlersOptions,
  UseBlockSidebarHandlersReturn,
} from "./use-block-sidebar-handlers";
