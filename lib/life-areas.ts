/**
 * =============================================================================
 * File: life-areas.ts
 * =============================================================================
 *
 * Canonical definition of Life Areas used to categorize Goals.
 *
 * Provides the full list of supported life areas along with their display
 * metadata (label, icon, color) and lightweight helpers for lookup and typing.
 *
 * Acts as the single source of truth for goal categorization across the app.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Declare the set of available life areas.
 * - Associate each life area with icon and color metadata.
 * - Provide fast lookup by ID.
 * - Expose a strongly typed LifeAreaId union.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - IDs are stable and should not be renamed lightly.
 * - Colors reference the shared GoalColor palette.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - LIFE_AREAS
 * - LIFE_AREAS_BY_ID
 * - getLifeArea
 * - LifeAreaId
 */

import { RiHeartLine, RiBriefcaseLine } from "@remixicon/react";
import type { LifeArea } from "./types";

// =============================================================================
// Life Areas
// =============================================================================

/**
 * All available life areas in the application.
 * Used for goal creation, filtering, and the inspiration gallery.
 */
export const LIFE_AREAS: LifeArea[] = [
  { id: "life", label: "Life", icon: RiHeartLine, color: "rose" },
  { id: "work", label: "Work", icon: RiBriefcaseLine, color: "violet" },
];

// =============================================================================
// Helpers
// =============================================================================

/** Map for O(1) lookup by ID */
export const LIFE_AREAS_BY_ID = new Map(
  LIFE_AREAS.map((area) => [area.id, area]),
);

/** Helper to get a life area by ID */
export function getLifeArea(id: string): LifeArea | undefined {
  return LIFE_AREAS_BY_ID.get(id);
}

/** Life area ID type for type safety */
export type LifeAreaId = "life" | "work";
