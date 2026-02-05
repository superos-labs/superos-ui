// Public API for the Weekly Planning components

export { PlanningPanel } from "./planning-panel";
export type { PlanningPanelProps } from "./planning-panel";

export { PlanningScheduleView } from "./planning-schedule-view";
export type { PlanningScheduleViewProps } from "./planning-schedule-view";

export { PlanningPrioritizeView } from "./planning-prioritize-view";
export type { PlanningPrioritizeViewProps } from "./planning-prioritize-view";

export { PlanWeekPromptCard } from "./plan-week-prompt-card";
export type { PlanWeekPromptCardProps } from "./plan-week-prompt-card";

export { BlueprintBacklog } from "./blueprint-backlog";
export type { BlueprintBacklogProps } from "./blueprint-backlog";

export { BlueprintEssentialsSection } from "./blueprint-essentials-section";
export type { BlueprintEssentialsSectionProps } from "./blueprint-essentials-section";

export { UpcomingDeadlinesSection } from "./upcoming-deadlines-section";
export type { UpcomingDeadlinesSectionProps } from "./upcoming-deadlines-section";

export { UpcomingDeadlinesCard } from "./upcoming-deadlines-card";
export type { UpcomingDeadlinesCardProps } from "./upcoming-deadlines-card";

// Re-export types from lib/weekly-planning for convenience
export type { PlanningStep } from "@/lib/weekly-planning";
