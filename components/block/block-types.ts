/**
 * =============================================================================
 * File: block-types.ts
 * =============================================================================
 *
 * Centralized type definitions for calendar blocks and block-related UI.
 *
 * This file defines:
 * - Block structural concepts (duration, overnight segments)
 * - Block sidebar support types
 * - Ephemeral block-scoped subtask models
 * - Goal selector option shapes
 *
 * It intentionally re-exports canonical types from @/lib/types where possible,
 * acting as a thin, domain-aligned facade rather than a parallel type system.
 *
 * -----------------------------------------------------------------------------
 * DESIGN PRINCIPLES
 * -----------------------------------------------------------------------------
 * - Single source of truth for block-specific types.
 * - No runtime logic.
 * - UI-facing shapes only (no persistence models).
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Shared vocabulary for everything that describes a block."
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
