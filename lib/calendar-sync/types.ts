/**
 * Types for the calendar sync/integration system.
 * Single source of truth for external calendar integration type definitions.
 *
 * This module handles:
 * - Provider connections (Google, Apple, Outlook)
 * - Calendar selection and sync settings
 * - External events imported from providers
 * - Integrations sidebar navigation
 */

import type { BlockStatus, IconComponent } from "@/lib/types";

// =============================================================================
// Provider Types
// =============================================================================

/** Supported calendar providers */
export type CalendarProvider = "google" | "apple" | "outlook";

/** Connection status for an integration */
export type IntegrationStatus = "connected" | "not_connected" | "coming_soon";

/** How exported blocks appear in external calendars */
export type ExportBlockVisibility = "block_title" | "goal_title" | "busy";

// =============================================================================
// Integration Types
// =============================================================================

/** Static metadata for a calendar integration (display info) */
export interface IntegrationConfig {
  id: string;
  provider: CalendarProvider;
  name: string;
  description: string;
  icon: IconComponent;
  brandColor: string;
}

/** Runtime state for a calendar integration */
export interface CalendarIntegrationState {
  provider: CalendarProvider;
  status: IntegrationStatus;
  /** Connected account email (null if not connected) */
  accountEmail: string | null;
  /** Calendars available from this provider */
  calendars: ProviderCalendar[];
  /** When true, only import events that have attendees (meetings). Defaults to true. */
  importMeetingsOnly: boolean;
  /** How exported blocks appear in external calendar. Defaults to "busy". */
  exportBlockVisibility: ExportBlockVisibility;
  /** Last successful sync timestamp */
  lastSyncAt: Date | null;
}

/** A calendar within a provider account */
export interface ProviderCalendar {
  id: string;
  provider: CalendarProvider;
  name: string;
  /** Hex color for the calendar (e.g., "#4285f4") */
  color: string;
  /** Import events from this calendar into SuperOS */
  importEnabled: boolean;
  /** Export SuperOS blueprint to this calendar */
  exportBlueprintEnabled: boolean;
}

// =============================================================================
// External Event Types
// =============================================================================

/** Event imported from an external calendar */
export interface ExternalEvent {
  id: string;
  provider: CalendarProvider;
  calendarId: string;
  calendarName: string;
  /** Hex color from the source calendar */
  calendarColor: string;
  title: string;
  /** ISO date string (e.g., "2026-01-26") */
  date: string;
  /** Minutes from midnight (0-1440) */
  startMinutes: number;
  /** Duration in minutes */
  durationMinutes: number;
  /** Whether this is an all-day event */
  isAllDay: boolean;
  /** Whether this event has attendees (is a meeting vs solo event) */
  isMeeting: boolean;

  // --- Local SuperOS state (not synced back to provider) ---
  /** Optional notes added locally */
  notes?: string;
  /** Local completion status */
  status?: BlockStatus;
  /** Accumulated focus time in minutes (from local focus sessions) */
  focusedMinutes?: number;
}

// =============================================================================
// Sidebar Navigation Types
// =============================================================================

/** Current view in the integrations sidebar */
export type IntegrationsSidebarView =
  | { type: "list" }
  | { type: "provider"; provider: CalendarProvider };

// =============================================================================
// Hook Types
// =============================================================================

export interface UseCalendarSyncOptions {
  /** Pre-populated integration states (for demo) */
  initialStates?: CalendarIntegrationState[];
  /** Pre-populated external events (for demo) */
  initialExternalEvents?: ExternalEvent[];
}

export interface UseCalendarSyncReturn {
  // --- Data ---
  /** State for each calendar provider */
  integrationStates: Map<CalendarProvider, CalendarIntegrationState>;
  /** All external events from enabled calendars */
  externalEvents: ExternalEvent[];

  // --- Connection Actions ---
  /** Simulate connecting a provider (populates with mock calendars) */
  connectProvider: (provider: CalendarProvider) => void;
  /** Disconnect a provider */
  disconnectProvider: (provider: CalendarProvider) => void;

  // --- Calendar Settings ---
  /** Toggle importing events from a calendar */
  toggleCalendarImport: (
    provider: CalendarProvider,
    calendarId: string,
  ) => void;
  /** Toggle exporting blueprint to a calendar */
  toggleCalendarExport: (
    provider: CalendarProvider,
    calendarId: string,
  ) => void;
  /** Toggle "Only show meetings" filter for an integration */
  toggleMeetingsOnly: (provider: CalendarProvider) => void;
  /** Set how exported blocks appear in external calendar */
  setExportBlockVisibility: (
    provider: CalendarProvider,
    visibility: ExportBlockVisibility,
  ) => void;

  // --- External Event Actions (local state) ---
  /** Update local state of an external event */
  updateExternalEvent: (
    eventId: string,
    updates: Partial<ExternalEvent>,
  ) => void;

  // --- Computed Helpers ---
  getIntegrationState: (provider: CalendarProvider) => CalendarIntegrationState;
  isConnected: (provider: CalendarProvider) => boolean;
  getEnabledCalendars: (provider: CalendarProvider) => ProviderCalendar[];
}

export interface UseIntegrationsSidebarReturn {
  /** Whether the integrations sidebar is open */
  isOpen: boolean;
  /** Current view within the sidebar */
  currentView: IntegrationsSidebarView;
  /** Open sidebar to list view */
  open: () => void;
  /** Close sidebar */
  close: () => void;
  /** Navigate to a specific provider's settings */
  navigateToProvider: (provider: CalendarProvider) => void;
  /** Navigate back to the list */
  navigateToList: () => void;
}
