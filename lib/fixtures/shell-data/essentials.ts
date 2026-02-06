/**
 * =============================================================================
 * File: essentials.ts
 * =============================================================================
 *
 * Static fixture data for "Essentials" — recurring, non-goal activities that
 * users may choose to track and schedule (e.g., eating, commuting, exercise).
 *
 * These values seed onboarding, blueprint creation, and preference defaults.
 * Sleep is intentionally excluded and handled via day-boundary preferences.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define the full catalog of available essentials.
 * - Provide default enabled essential ID sets for different modes.
 * - Expose an empty essentials dataset for initialization and resets.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - All essentials are optional; none are enabled by default.
 * - Each essential includes a stable id, label, icon, and color token.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ALL_ESSENTIALS
 * - DEFAULT_ENABLED_ESSENTIAL_IDS
 * - COMPLETE_ENABLED_ESSENTIAL_IDS
 * - EMPTY_ESSENTIALS
 */

import {
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiHome4Line,
  RiSofaLine,
} from "@remixicon/react";
import type { ScheduleEssential } from "@/lib/unified-schedule";

// =============================================================================
// Essentials (recurring activities to track)
// =============================================================================

/**
 * All available essentials.
 * All essentials are optional - users choose which to track.
 * Note: Sleep is no longer an essential; it's handled via day boundaries in preferences.
 */
export const ALL_ESSENTIALS: ScheduleEssential[] = [
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "amber" },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "slate" },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "green" },
  { id: "downtime", label: "Downtime", icon: RiSofaLine, color: "cyan" },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "orange" },
];

/** Default enabled essential IDs (none enabled by default - user chooses) */
export const DEFAULT_ENABLED_ESSENTIAL_IDS: string[] = [];

/** Default enabled essentials for complete mode */
export const COMPLETE_ENABLED_ESSENTIAL_IDS: string[] = [
  "eat",
  "exercise",
  "downtime",
];

// =============================================================================
// Empty Data Set
// =============================================================================

export const EMPTY_ESSENTIALS: ScheduleEssential[] = [];
