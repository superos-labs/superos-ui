/**
 * Calendar Sync Module
 *
 * Provides types, configuration, hooks, and mock data for external calendar integration.
 *
 * @example
 * ```tsx
 * import {
 *   useCalendarSync,
 *   CALENDAR_PROVIDERS,
 *   externalEventsToCalendarEvents,
 * } from "@/lib/calendar-sync";
 * import type { CalendarProvider, ExternalEvent } from "@/lib/calendar-sync";
 * ```
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
