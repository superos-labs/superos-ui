/**
 * Centralized type definitions for the Block component family.
 *
 * This file serves as a barrel for all block-related types, providing a single
 * import point while maintaining backward compatibility with existing imports.
 *
 * Usage:
 *   import type { BlockProps, BlockSidebarData, BlockColor } from "@/components/block/block-types";
 *
 * For public API consumers, import from the feature folder:
 *   import type { BlockProps, BlockSidebarData } from "@/components/block";
 */

// =============================================================================
// Core Types (from @/lib/types - single source of truth)
// =============================================================================

export type { BlockType, BlockStatus, IconComponent } from "@/lib/types";

// =============================================================================
// Color Types (from block-colors.ts)
// =============================================================================

export type { BlockColor } from "./block-colors";

// =============================================================================
// Block Component Types
// =============================================================================

/**
 * Duration presets for blocks in minutes.
 * Standard durations: 30min, 1hr, 4hr
 */
export type BlockDuration = 30 | 60 | 240;

/**
 * Segment position for overnight blocks.
 * - 'only': Single-day event (full rounded corners)
 * - 'start': First day of overnight event (rounded top, flat bottom)
 * - 'end': Second day of overnight event (flat top, rounded bottom)
 */
export type SegmentPosition = "only" | "start" | "end";

// =============================================================================
// BlockSidebar Types
// =============================================================================

/**
 * Ephemeral subtask - block-scoped, deleted with block
 */
export interface BlockSubtask {
  id: string;
  text: string;
  done: boolean;
}

/**
 * Associated goal or essential for the block
 */
export interface BlockSidebarSource {
  id: string;
  label: string;
  icon: import("@/lib/types").IconComponent;
  color: string;
}

/**
 * Goal selector option for the goal dropdown
 */
export interface GoalSelectorOption {
  id: string;
  label: string;
  icon: import("@/lib/types").IconComponent;
  color: string;
}
