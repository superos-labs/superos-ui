/**
 * =============================================================================
 * File: backlog-types.ts
 * =============================================================================
 *
 * Shared type definitions for items rendered in the Backlog.
 *
 * Provides foundational interfaces used by both Goals and Essentials,
 * plus lightweight grouping and display mode primitives.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define the minimal shape of a backlog item.
 * - Define high-level backlog display modes.
 * - Define generic grouping structure.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Containing behavior or logic.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - BacklogItemBase
 * - BacklogMode
 * - BacklogGroup
 */

import type { GoalColor } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";

// =============================================================================
// Base Item Interface
// =============================================================================

/**
 * Base interface for items displayed in the backlog.
 * Shared by both goals and essentials.
 */
export interface BacklogItemBase {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

// =============================================================================
// Display Modes
// =============================================================================

/** Mode for the backlog/shell display */
export type BacklogMode = "view" | "goal-detail";

// =============================================================================
// Grouping
// =============================================================================

export interface BacklogGroup<T extends BacklogItemBase = BacklogItemBase> {
  id: string;
  title: string;
  description: string;
  items: T[];
}
