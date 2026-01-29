/**
 * Shared type definitions for the Backlog component family.
 * Goal-specific types are in ./goals/goal-types.ts
 * Essential-specific types are in ./essentials/essential-types.ts
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
