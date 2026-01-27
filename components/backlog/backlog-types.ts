/**
 * Type definitions for the Backlog component family.
 */

import type { GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea, GoalIconOption } from "@/lib/types";
import type { ScheduleTask, Milestone } from "@/lib/unified-schedule";

// Re-export for convenience
export type { LifeArea, GoalIconOption, Milestone };

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
  /** Ordered milestones (sequential steps toward the goal) */
  milestones?: Milestone[];
  /** Whether milestones are enabled for this goal (defaults to true if milestones exist) */
  milestonesEnabled?: boolean;
  /** Tasks associated with this item */
  tasks?: BacklogTask[];
  /** If true, commitment cannot be disabled (only for commitments) */
  mandatory?: boolean;
}

/** Mode for the backlog display */
export type BacklogMode = "view" | "edit-commitments" | "goal-detail";

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
