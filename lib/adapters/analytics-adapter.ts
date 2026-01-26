/**
 * Adapter to convert goals/commitments to WeeklyAnalyticsItem format.
 * Used by shell/app components to display analytics.
 */

import type { WeeklyAnalyticsItem } from "@/components/weekly-analytics";
import type { IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass } from "@/lib/colors";

/** Stats for analytics conversion */
export interface AnalyticsStats {
  plannedHours: number;
  completedHours: number;
}

/** Item with icon and color for analytics */
export interface AnalyticsSource {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

/**
 * Convert an array of items with stats to WeeklyAnalyticsItem format.
 * 
 * @param items - Array of items with id, label, icon, and color
 * @param getStats - Function to get planned/completed hours for an item
 * @returns Array of WeeklyAnalyticsItem for the analytics component
 */
export function toAnalyticsItems(
  items: AnalyticsSource[],
  getStats: (id: string) => AnalyticsStats
): WeeklyAnalyticsItem[] {
  return items.map((item) => {
    const stats = getStats(item.id);
    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      color: getIconColorClass(item.color),
      plannedHours: stats.plannedHours,
      completedHours: stats.completedHours,
    };
  });
}
