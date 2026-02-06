/**
 * =============================================================================
 * File: analytics-adapter.ts
 * =============================================================================
 *
 * Adapter utilities for transforming domain analytics data into the
 * WeeklyAnalyticsItem format consumed by the analytics UI.
 *
 * Bridges generic sources (goals, life areas, etc.) with the visual and
 * structural requirements of the weekly analytics component.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define lightweight analytics source and stats interfaces.
 * - Convert source items + stats lookup into WeeklyAnalyticsItem objects.
 * - Resolve icon color classes from domain color tokens.
 * - Support optional use of focused hours as the progress metric.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Computing or aggregating analytics stats.
 * - Persisting analytics data.
 * - Rendering analytics UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Keeps conversion logic centralized to avoid UI-specific shaping elsewhere.
 * - Defaults to completedHours for progress, with an opt-in focusedHours path.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - AnalyticsStats
 * - AnalyticsSource
 * - ToAnalyticsItemsOptions
 * - toAnalyticsItems
 */

import type { WeeklyAnalyticsItem } from "@/components/weekly-analytics";
import type { IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass } from "@/lib/colors";

/** Stats for analytics conversion */
export interface AnalyticsStats {
  plannedHours: number;
  completedHours: number;
  focusedHours?: number;
}

/** Item with icon and color for analytics */
export interface AnalyticsSource {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

/** Options for analytics conversion */
export interface ToAnalyticsItemsOptions {
  /** Use focusedHours instead of completedHours for progress (default: false) */
  useFocusedHours?: boolean;
}

/**
 * Convert an array of items with stats to WeeklyAnalyticsItem format.
 *
 * @param items - Array of items with id, label, icon, and color
 * @param getStats - Function to get planned/completed/focused hours for an item
 * @param options - Conversion options (e.g., useFocusedHours)
 * @returns Array of WeeklyAnalyticsItem for the analytics component
 */
export function toAnalyticsItems(
  items: AnalyticsSource[],
  getStats: (id: string) => AnalyticsStats,
  options: ToAnalyticsItemsOptions = {}
): WeeklyAnalyticsItem[] {
  const { useFocusedHours = false } = options;

  return items.map((item) => {
    const stats = getStats(item.id);

    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      color: getIconColorClass(item.color),
      plannedHours: stats.plannedHours,
      // Use focusedHours for progress if available and requested, otherwise completedHours
      completedHours:
        useFocusedHours && stats.focusedHours !== undefined
          ? stats.focusedHours
          : stats.completedHours,
    };
  });
}
