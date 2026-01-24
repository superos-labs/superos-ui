// Public API for the Block component family
export { Block, BLOCK_COLORS } from "./block";
export type {
  BlockProps,
  BlockColor,
  BlockStatus,
  BlockDuration,
} from "./block";

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
