/**
 * Component-level types for the Essentials section of the Backlog.
 *
 * These types are specific to the UI component layer. Core essential types
 * (EssentialSlot, EssentialTemplate, etc.) are in lib/essentials.
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
