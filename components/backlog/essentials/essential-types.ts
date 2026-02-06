/**
 * =============================================================================
 * File: essential-types.ts
 * =============================================================================
 *
 * Shared type definitions for backlog "Essentials".
 *
 * This file defines lightweight UI-facing types used by backlog components
 * when rendering and creating essential items. It also re-exports core
 * scheduling types from the domain layer for convenience.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define EssentialItem display shape for backlog UI.
 * - Define data shape for creating new essentials.
 * - Re-export essential scheduling domain types.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Containing scheduling logic.
 * - Defining persistence or storage models.
 * - Owning validation rules.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - EssentialItem intentionally does not embed schedule data.
 *   Scheduling is provided separately via EssentialTemplate.
 * - Keeps UI types thin and composable.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - EssentialItem
 * - NewEssentialData
 * - EssentialSlot (re-export)
 * - EssentialTemplate (re-export)
 * - EssentialConfig (re-export)
 */

import type { GoalColor } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";
import type { BacklogItemBase } from "../backlog-types";

// Re-export from lib/essentials for convenience
export type {
  EssentialSlot,
  EssentialTemplate,
  EssentialConfig,
} from "@/lib/essentials";

// =============================================================================
// Essential Item (Component Display Type)
// =============================================================================

/**
 * EssentialItem represents an essential in the backlog UI.
 * Extends the shared BacklogItemBase with essential-specific properties.
 */
export interface EssentialItem extends BacklogItemBase {
  // Essentials don't have additional display properties beyond the base.
  // Schedule information comes from EssentialTemplate via the templates prop.
}

// =============================================================================
// Essential Creation
// =============================================================================

/**
 * Data for creating a new essential.
 * Used by the inline essential creator.
 */
export interface NewEssentialData {
  label: string;
  icon: IconComponent;
  color: GoalColor;
}
