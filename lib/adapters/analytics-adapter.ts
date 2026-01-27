/**
 * Adapter to convert goals/commitments to WeeklyAnalyticsItem format.
 * Used by shell/app components to display analytics.
 */

import type { WeeklyAnalyticsItem, IntentionInfo } from "@/components/weekly-analytics";
import type { IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass } from "@/lib/colors";
import type { IntentionProgress } from "@/lib/weekly-planning";

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
  /** Function to get intention progress for an item (optional) */
  getIntentionProgress?: (id: string) => IntentionProgress | null;
}

/**
 * Convert an array of items with stats to WeeklyAnalyticsItem format.
 * 
 * @param items - Array of items with id, label, icon, and color
 * @param getStats - Function to get planned/completed/focused hours for an item
 * @param options - Conversion options (e.g., useFocusedHours, getIntentionProgress)
 * @returns Array of WeeklyAnalyticsItem for the analytics component
 */
export function toAnalyticsItems(
  items: AnalyticsSource[],
  getStats: (id: string) => AnalyticsStats,
  options: ToAnalyticsItemsOptions = {}
): WeeklyAnalyticsItem[] {
  const { useFocusedHours = false, getIntentionProgress } = options;
  
  return items.map((item) => {
    const stats = getStats(item.id);
    
    // Check for intention-based progress
    const intentionProgress = getIntentionProgress?.(item.id);
    const intention: IntentionInfo | undefined = intentionProgress
      ? {
          target: intentionProgress.intended,
          actual: intentionProgress.actual,
          indicator: intentionProgress.indicator,
          unit: intentionProgress.unit,
        }
      : undefined;
    
    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      color: getIconColorClass(item.color),
      plannedHours: stats.plannedHours,
      // Use focusedHours for progress if available and requested, otherwise completedHours
      completedHours: useFocusedHours && stats.focusedHours !== undefined
        ? stats.focusedHours
        : stats.completedHours,
      // Add intention if available
      intention,
    };
  });
}
