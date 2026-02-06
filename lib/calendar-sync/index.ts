/**
 * =============================================================================
 * File: calendar-sync/index.ts
 * =============================================================================
 *
 * Public entry point for the Calendar Sync module.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export calendar sync types, hooks, utilities, and configuration.
 * - Provide a single import surface for calendar integration features.
 */

// Types
export type {
  CalendarProvider,
  IntegrationStatus,
  ExportBlockVisibility,
  SyncScope,
  SyncParticipation,
  GoalFilterMode,
  AppearanceOverride,
  IntegrationConfig,
  CalendarIntegrationState,
  ProviderCalendar,
  ExternalEvent,
  IntegrationsSidebarView,
  UseCalendarSyncOptions,
  UseCalendarSyncReturn,
  UseIntegrationsSidebarReturn,
} from "./types";

// Configuration
export { CALENDAR_PROVIDERS, PROVIDER_ORDER } from "./provider-config";

// Hooks
export { useCalendarSync } from "./use-calendar-sync";
export { useIntegrationsSidebar } from "./use-integrations-sidebar";

// Utilities
export {
  externalEventsToCalendarEvents,
  getAllDayEventsForDate,
  getAllDayEventsForWeek,
  externalEventsToAllDayEvents,
} from "./event-utils";

// Sync Resolution
export {
  resolveSyncState,
  getBlockSyncState,
  isWeekPlanned,
  isBlockInScope,
  blockTypeParticipates,
  goalParticipates,
  resolveAppearance,
  DEFAULT_GOAL_SYNC_SETTINGS,
  DEFAULT_BLOCK_SYNC_SETTINGS,
} from "./sync-resolver";
export type { SyncResolution } from "./sync-resolver";

// Mock data (for demo/prototype)
export {
  MOCK_GOOGLE_CALENDARS,
  MOCK_APPLE_CALENDARS,
  MOCK_OUTLOOK_CALENDARS,
  MOCK_EXTERNAL_EVENTS,
  DEMO_INITIAL_STATES,
} from "./mock-data";
