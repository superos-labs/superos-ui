/**
 * Canonical life areas for categorizing goals.
 * Single source of truth used across the application.
 */

import {
  RiHeartLine,
  RiBriefcaseLine,
  RiHeart2Line,
  RiMoneyDollarCircleLine,
  RiPlantLine,
  RiPaletteLine,
  RiTeamLine,
  RiGamepadLine,
} from "@remixicon/react";
import type { LifeArea } from "./types";

// =============================================================================
// Life Areas
// =============================================================================

/**
 * All available life areas in the application.
 * Used for goal creation, filtering, and the inspiration gallery.
 */
export const LIFE_AREAS: LifeArea[] = [
  { id: "health", label: "Health", icon: RiHeartLine, color: "rose" },
  { id: "career", label: "Career", icon: RiBriefcaseLine, color: "violet" },
  { id: "relationships", label: "Relationships", icon: RiHeart2Line, color: "pink" },
  { id: "finance", label: "Finance", icon: RiMoneyDollarCircleLine, color: "emerald" },
  { id: "personal-growth", label: "Personal Growth", icon: RiPlantLine, color: "lime" },
  { id: "creativity", label: "Creativity", icon: RiPaletteLine, color: "teal" },
  { id: "community", label: "Community", icon: RiTeamLine, color: "amber" },
  { id: "recreation", label: "Recreation", icon: RiGamepadLine, color: "cyan" },
];

// =============================================================================
// Helpers
// =============================================================================

/** Map for O(1) lookup by ID */
export const LIFE_AREAS_BY_ID = new Map(
  LIFE_AREAS.map((area) => [area.id, area])
);

/** Helper to get a life area by ID */
export function getLifeArea(id: string): LifeArea | undefined {
  return LIFE_AREAS_BY_ID.get(id);
}

/** Life area ID type for type safety */
export type LifeAreaId =
  | "health"
  | "career"
  | "relationships"
  | "finance"
  | "personal-growth"
  | "creativity"
  | "community"
  | "recreation";
