/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public API surface for the Block component family.
 *
 * This barrel file re-exports all primitives, wrappers, hooks,
 * and sidebar components used to render and manipulate calendar blocks.
 *
 * The Block system is responsible for:
 * - Visual block rendering
 * - Dragging, resizing, and grid-based creation
 * - Block sidebar editing (date, time, notes, tasks, focus, sync)
 *
 * It does NOT own:
 * - Scheduling persistence
 * - Domain business rules
 * - Data fetching or mutations
 *
 * -----------------------------------------------------------------------------
 * SUBSYSTEMS
 * -----------------------------------------------------------------------------
 * - Block (visual primitive)
 * - BlockSidebar (editing surface)
 * - DraggableBlockWrapper / ResizableBlockWrapper
 * - useBlockDrag / useBlockResize / useGridDragCreate
 * - Shared block types and color tokens
 *
 * -----------------------------------------------------------------------------
 * DESIGN PRINCIPLES
 * -----------------------------------------------------------------------------
 * - Barrel exports define the stable public contract.
 * - Internal file structure can change without breaking consumers.
 * - Hooks expose mechanics, components expose experience.
 */

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
