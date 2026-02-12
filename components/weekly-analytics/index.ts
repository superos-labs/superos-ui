// Public API for the Weekly Analytics component

export {
  WeeklyAnalytics,
  WeeklyAnalyticsSection,
  WeeklyAnalyticsItemRow,
  WeeklyAnalyticsHeader,
  ProgressBar,
  DistributionProgressBar,
  getProgress,
} from "./weekly-analytics";

export type {
  WeeklyAnalyticsProps,
  WeeklyAnalyticsItem,
  WeeklyAnalyticsSectionData,
  DistributionMode,
} from "./weekly-analytics";

// Planning Budget (for weekly planning mode)
export { PlanningBudget } from "./planning-budget";
export type {
  PlanningBudgetProps,
  PlanningBudgetGoal,
  PlanningBudgetEssential,
} from "./planning-budget";

// Weekly Report (unlock-gated advanced analytics)
export { WeeklyReport } from "./weekly-report";
export type { WeeklyReportProps } from "./weekly-report";
