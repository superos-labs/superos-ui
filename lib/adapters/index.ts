/**
 * =============================================================================
 * File: adapters/index.ts
 * =============================================================================
 *
 * Barrel file that re-exports all adapter utilities and related types.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Provide a single import surface for adapter functions.
 * - Re-export adapter-related types for convenience.
 */

// Sidebar adapter
export {
  eventToBlockSidebarData,
  formatMinutesToTime,
  parseTimeToMinutes,
} from "./sidebar-adapter";
export type {
  EventToSidebarResult,
  SidebarGoal,
  SidebarEssential,
} from "./sidebar-adapter";

// Analytics adapter
export { toAnalyticsItems } from "./analytics-adapter";
export type { AnalyticsStats, AnalyticsSource } from "./analytics-adapter";

// Planning budget adapter
export {
  toPlanningBudgetGoals,
  toPlanningBudgetEssentials,
  buildPlanningBudgetData,
} from "./planning-budget-adapter";
export type {
  ToPlanningBudgetGoalsOptions,
  ToPlanningBudgetEssentialsOptions,
  BuildPlanningBudgetDataOptions,
  PlanningBudgetData,
} from "./planning-budget-adapter";
