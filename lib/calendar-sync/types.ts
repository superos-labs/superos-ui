/**
 * =============================================================================
 * File: calendar-sync-types.ts
 * =============================================================================
 *
 * Shared type definitions for calendar integrations, external events, and
 * import/export (sync) configuration.
 *
 * Centralizes all domain-level types used by calendar sync state, resolution,
 * adapters, and UI so the integration surface remains consistent.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define supported providers and integration status types.
 * - Define export visibility, sync scope, and participation models.
 * - Define runtime integration state shape.
 * - Define provider calendar and external event shapes.
 * - Define hook option/return contracts for calendar sync and sidebar.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing sync logic.
 * - Fetching or persisting integration data.
 * - Rendering UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Types are intentionally explicit to reduce cross-module coupling.
 * - Mirrors real integration concepts while remaining provider-agnostic.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - CalendarProvider
 * - IntegrationStatus
 * - ExportBlockVisibility
 * - SyncScope
 * - SyncParticipation
 * - GoalFilterMode
 * - AppearanceOverride
 * - IntegrationConfig
 * - CalendarIntegrationState
 * - ProviderCalendar
 * - ExternalEvent
 * - IntegrationsSidebarView
 * - UseCalendarSyncOptions
 * - UseCalendarSyncReturn
 * - UseIntegrationsSidebarReturn
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
export type ExportBlockVisibility =
  | "blocked_superos"
  | "busy"
  | "goal_title"
  | "block_title"
  | "custom";

// =============================================================================
// Export Sync Types
// =============================================================================

/**
 * Sync scope determines which planning layers are synced to external calendars.
 * - scheduled: Only explicitly scheduled blocks
 * - blueprint: Only blueprint blocks (for unplanned weeks)
 * - scheduled_and_blueprint: Both layers
 */
export type SyncScope = "scheduled" | "blueprint" | "scheduled_and_blueprint";

/**
 * Flags controlling which block types participate in external sync.
 */
export interface SyncParticipation {
  /** Whether essential blocks are synced */
  essentials: boolean;
  /** Whether goal work session blocks are synced */
  goals: boolean;
  /** Whether standalone task blocks are synced */
  standaloneTaskBlocks: boolean;
}

/**
 * Goal filter mode for export.
 * - all: All goals participate in sync
 * - selected: Only selected goals participate
 */
export type GoalFilterMode = "all" | "selected";

/**
 * Appearance override options for goals and blocks.
 * - use_default: Falls back to the next level in hierarchy
 * - blocked_superos/busy/goal_title/block_title/custom: Explicit appearance setting
 */
export type AppearanceOverride =
  | "use_default"
  | "blocked_superos"
  | "busy"
  | "goal_title"
  | "block_title"
  | "custom";

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
  /** Last successful sync timestamp */
  lastSyncAt: Date | null;

  // --- Import Settings ---
  /** Master toggle: whether to import calendar events to SuperOS */
  importEnabled: boolean;
  /** When true, only import events that have attendees (meetings). Defaults to true. */
  importMeetingsOnly: boolean;

  // --- Export Settings ---
  /** Master toggle: whether sync to external calendar is enabled */
  exportEnabled: boolean;
  /** Which planning layers should sync */
  exportScope: SyncScope;
  /** Which block types participate in sync */
  exportParticipation: SyncParticipation;
  /** Whether to sync all goals or only selected ones */
  exportGoalFilter: GoalFilterMode;
  /** Goal IDs that participate when filter is "selected" */
  exportSelectedGoalIds: Set<string>;
  /** How exported blocks appear by default (can be overridden per goal/block) */
  exportDefaultAppearance: ExportBlockVisibility;
  /** Custom label for exported events when appearance is "custom" */
  exportCustomLabel: string;
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

  // --- Import Settings ---
  /** Toggle import enabled for a provider */
  toggleImportEnabled: (provider: CalendarProvider) => void;
  /** Toggle importing events from a calendar */
  toggleCalendarImport: (
    provider: CalendarProvider,
    calendarId: string
  ) => void;
  /** Toggle "Only show meetings" filter for an integration */
  toggleMeetingsOnly: (provider: CalendarProvider) => void;

  // --- Export Settings (Calendar Selection) ---
  /** Toggle exporting blueprint to a calendar */
  toggleCalendarExport: (
    provider: CalendarProvider,
    calendarId: string
  ) => void;

  // --- Export Settings ---
  /** Toggle export enabled for a provider */
  toggleExportEnabled: (provider: CalendarProvider) => void;
  /** Set the sync scope (scheduled, blueprint, or both) */
  setExportScope: (provider: CalendarProvider, scope: SyncScope) => void;
  /** Update which block types participate in sync */
  setExportParticipation: (
    provider: CalendarProvider,
    participation: Partial<SyncParticipation>
  ) => void;
  /** Set goal filter mode and optionally selected goal IDs */
  setExportGoalFilter: (
    provider: CalendarProvider,
    mode: GoalFilterMode,
    selectedIds?: Set<string>
  ) => void;
  /** Set the default appearance for exported blocks */
  setExportDefaultAppearance: (
    provider: CalendarProvider,
    appearance: ExportBlockVisibility
  ) => void;
  /** Set the custom label for exported events */
  setExportCustomLabel: (provider: CalendarProvider, label: string) => void;

  // --- External Event Actions (local state) ---
  /** Update local state of an external event */
  updateExternalEvent: (
    eventId: string,
    updates: Partial<ExternalEvent>
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
