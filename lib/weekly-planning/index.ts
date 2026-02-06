/**
 * =============================================================================
 * File: lib/weekly-planning/index.ts
 * =============================================================================
 *
 * Public entry point for the Weekly Planning domain.
 *
 * Re-exports the primary hooks and shared types used to power
 * the weekly planning experience and planning flow orchestration.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define the public API surface for weekly planning.
 * - Centralize exports for hooks and domain types.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * Hooks:
 * - useWeeklyPlan
 * - usePlanningFlow
 *
 * Types:
 * - WeeklyPlan
 * - PlanningStep
 * - UseWeeklyPlanOptions
 * - UseWeeklyPlanReturn
 * - UsePlanningFlowOptions
 * - UsePlanningFlowReturn
 */

// Hooks
export { useWeeklyPlan } from "./use-weekly-plan";
export { usePlanningFlow } from "./use-planning-flow";

// Types
export type {
  WeeklyPlan,
  PlanningStep,
  UseWeeklyPlanOptions,
  UseWeeklyPlanReturn,
  UsePlanningFlowOptions,
  UsePlanningFlowReturn,
} from "./types";
