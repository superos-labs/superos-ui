// Public API for adapters

// Sidebar adapter
export { 
  eventToBlockSidebarData,
  formatMinutesToTime,
  parseTimeToMinutes,
} from "./sidebar-adapter";
export type { 
  EventToSidebarResult, 
  SidebarGoal, 
  SidebarEssential 
} from "./sidebar-adapter";

// Analytics adapter
export { toAnalyticsItems } from "./analytics-adapter";
export type { AnalyticsStats, AnalyticsSource } from "./analytics-adapter";
