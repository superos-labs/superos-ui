/**
 * =============================================================================
 * File: suggested-essentials.ts
 * =============================================================================
 *
 * Curated default set of suggested backlog Essentials.
 *
 * These suggestions are used to seed the Essentials CTA and inline suggestion
 * editors, providing sensible starting points for common routine activities.
 *
 * Each suggestion includes display metadata and a default schedule that can be
 * customized before being added.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define the SuggestedEssential type.
 * - Provide a small, opinionated list of defaults.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering UI.
 * - Persisting data.
 * - Inferring user preferences.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Defaults favor common daily and weekly routines.
 * - Kept intentionally small and conservative.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - SuggestedEssential
 * - SUGGESTED_ESSENTIALS
 */

import { RiRestaurantLine, RiCarLine, RiHome4Line } from "@remixicon/react";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface SuggestedEssential {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** Default days (0-6, 0 = first day of week) */
  defaultDays: number[];
  /** Default start time in minutes from midnight */
  defaultStartMinutes: number;
  /** Default duration in minutes */
  defaultDurationMinutes: number;
}

// =============================================================================
// Data
// =============================================================================

export const SUGGESTED_ESSENTIALS: SuggestedEssential[] = [
  {
    id: "lunch",
    label: "Lunch",
    icon: RiRestaurantLine,
    color: "amber",
    defaultDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    defaultStartMinutes: 750, // 12:30 PM
    defaultDurationMinutes: 60, // 1 hour
  },
  {
    id: "dinner",
    label: "Dinner",
    icon: RiRestaurantLine,
    color: "amber",
    defaultDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    defaultStartMinutes: 1140, // 7:00 PM
    defaultDurationMinutes: 60, // 1 hour
  },
  {
    id: "commute",
    label: "Commute",
    icon: RiCarLine,
    color: "slate",
    defaultDays: [0, 1, 2, 3, 4], // Mon-Fri (weekdays)
    defaultStartMinutes: 480, // 8:00 AM
    defaultDurationMinutes: 30, // 30 min
  },
  {
    id: "chores",
    label: "Chores",
    icon: RiHome4Line,
    color: "orange",
    defaultDays: [5, 6], // Sat-Sun (weekend)
    defaultStartMinutes: 600, // 10:00 AM
    defaultDurationMinutes: 120, // 2 hours
  },
];
