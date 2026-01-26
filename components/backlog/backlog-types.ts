/**
 * Type definitions for the Backlog component family.
 */

import type { GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea, GoalIconOption } from "@/lib/types";
import type { ScheduleTask } from "@/hooks/use-unified-schedule";

// Re-export for convenience
export type { LifeArea, GoalIconOption };

/**
 * BacklogTask is a re-export of ScheduleTask for backward compatibility.
 * Use ScheduleTask from @/hooks/use-unified-schedule for new code.
 */
export type BacklogTask = ScheduleTask;

/**
 * BacklogItem represents a goal or commitment in the backlog.
 * For goals with tasks, use ScheduleGoal from @/hooks/use-unified-schedule.
 */
export interface BacklogItem {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  plannedHours?: number;
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  completedHours?: number;
  /** Current milestone - the next concrete step toward this goal */
  milestone?: string;
  /** Tasks associated with this item */
  tasks?: BacklogTask[];
  /** If true, commitment cannot be disabled (only for commitments) */
  mandatory?: boolean;
}

/** Mode for the backlog display */
export type BacklogMode = "view" | "edit-commitments";

/** How to display goals - by goal name or milestone */
export type GoalDisplayMode = "goal" | "milestone";

export interface BacklogGroup {
  id: string;
  title: string;
  description: string;
  items: BacklogItem[];
}

/** Data for creating a new goal */
export interface NewGoalData {
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
}
