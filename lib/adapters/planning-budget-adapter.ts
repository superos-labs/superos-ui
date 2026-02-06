/**
 * =============================================================================
 * File: planning-budget-adapter.ts
 * =============================================================================
 *
 * Adapter functions for shaping schedule goals and essentials into the
 * Planning Budget data structures used by weekly analytics.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Convert schedule goals to PlanningBudgetGoal.
 * - Convert schedule essentials to PlanningBudgetEssential.
 * - Build combined planning budget data from schedule state.
 */

import type {
  PlanningBudgetGoal,
  PlanningBudgetEssential,
} from "@/components/weekly-analytics/planning-budget";
import type {
  ScheduleGoal,
  ScheduleEssential,
  GoalStats,
} from "@/lib/unified-schedule";

// =============================================================================
// Types
// =============================================================================

export interface ToPlanningBudgetGoalsOptions {
  /** Goals from the schedule */
  goals: ScheduleGoal[];
  /** Function to get stats for a goal */
  getGoalStats: (goalId: string) => GoalStats;
}

export interface ToPlanningBudgetEssentialsOptions {
  /** Essentials from the schedule */
  essentials: ScheduleEssential[];
  /** Function to get stats for an essential */
  getEssentialStats: (essentialId: string) => GoalStats;
}

// =============================================================================
// Converters
// =============================================================================

/**
 * Convert schedule goals to planning budget format.
 * Uses plannedHours as the scheduled time (since we're in planning mode).
 */
export function toPlanningBudgetGoals({
  goals,
  getGoalStats,
}: ToPlanningBudgetGoalsOptions): PlanningBudgetGoal[] {
  return goals.map((goal) => {
    const stats = getGoalStats(goal.id);
    return {
      id: goal.id,
      label: goal.label,
      icon: goal.icon,
      color: goal.color,
      lifeAreaId: goal.lifeAreaId,
      scheduledHours: stats.plannedHours,
    };
  });
}

/**
 * Convert schedule essentials to planning budget format.
 * Uses plannedHours as the scheduled time.
 */
export function toPlanningBudgetEssentials({
  essentials,
  getEssentialStats,
}: ToPlanningBudgetEssentialsOptions): PlanningBudgetEssential[] {
  return essentials.map((essential) => {
    const stats = getEssentialStats(essential.id);
    return {
      id: essential.id,
      label: essential.label,
      icon: essential.icon,
      color: essential.color,
      scheduledHours: stats.plannedHours,
    };
  });
}

// =============================================================================
// Complete Budget Data Builder
// =============================================================================

export interface BuildPlanningBudgetDataOptions {
  goals: ScheduleGoal[];
  essentials: ScheduleEssential[];
  getGoalStats: (goalId: string) => GoalStats;
  getEssentialStats: (essentialId: string) => GoalStats;
}

export interface PlanningBudgetData {
  goals: PlanningBudgetGoal[];
  essentials: PlanningBudgetEssential[];
}

/**
 * Build complete planning budget data from schedule state.
 * Convenience function that combines both converters.
 */
export function buildPlanningBudgetData({
  goals,
  essentials,
  getGoalStats,
  getEssentialStats,
}: BuildPlanningBudgetDataOptions): PlanningBudgetData {
  return {
    goals: toPlanningBudgetGoals({ goals, getGoalStats }),
    essentials: toPlanningBudgetEssentials({ essentials, getEssentialStats }),
  };
}
