"use client";

import * as React from "react";
import type {
  CalendarProvider,
  CalendarIntegrationState,
  ExternalEvent,
  ExportBlockVisibility,
  ProviderCalendar,
  SyncScope,
  SyncParticipation,
  GoalFilterMode,
  UseCalendarSyncOptions,
  UseCalendarSyncReturn,
} from "./types";
import {
  MOCK_GOOGLE_CALENDARS,
  MOCK_APPLE_CALENDARS,
  MOCK_OUTLOOK_CALENDARS,
  MOCK_EXTERNAL_EVENTS,
  DEMO_INITIAL_STATES,
} from "./mock-data";

/** Default export participation settings */
const DEFAULT_EXPORT_PARTICIPATION: SyncParticipation = {
  essentials: true,
  goals: true,
  standaloneTaskBlocks: false,
};

/** Mock calendars by provider (populated on simulated connect) */
const MOCK_CALENDARS: Record<CalendarProvider, ProviderCalendar[]> = {
  google: MOCK_GOOGLE_CALENDARS,
  apple: MOCK_APPLE_CALENDARS,
  outlook: MOCK_OUTLOOK_CALENDARS,
};

/** Mock emails by provider */
const MOCK_EMAILS: Record<CalendarProvider, string> = {
  google: "user@gmail.com",
  apple: "user@icloud.com",
  outlook: "user@outlook.com",
};

/**
 * Hook for managing calendar provider connections and external events.
 *
 * Provides:
 * - Provider connection state (connected/disconnected)
 * - Calendar selection (import/export toggles)
 * - Filtered external events based on enabled calendars
 * - Local state updates for external events (notes, status, focus)
 *
 * @example
 * ```tsx
 * const {
 *   integrationStates,
 *   externalEvents,
 *   connectProvider,
 *   toggleCalendarImport,
 * } = useCalendarSync();
 * ```
 */
export function useCalendarSync(
  options: UseCalendarSyncOptions = {}
): UseCalendarSyncReturn {
  const {
    initialStates = DEMO_INITIAL_STATES,
    initialExternalEvents = MOCK_EXTERNAL_EVENTS,
  } = options;

  // Integration states by provider
  const [statesMap, setStatesMap] = React.useState<
    Map<CalendarProvider, CalendarIntegrationState>
  >(() => new Map(initialStates.map((s) => [s.provider, s])));

  // External events with local state
  const [allExternalEvents, setAllExternalEvents] = React.useState<
    ExternalEvent[]
  >(initialExternalEvents);

  // Derived: filter events by enabled calendars and meetings-only setting
  const externalEvents = React.useMemo(() => {
    // Build a map of enabled calendar IDs to their provider's settings
    const enabledCalendars = new Map<string, { importMeetingsOnly: boolean }>();

    statesMap.forEach((state) => {
      // Only include if connected AND import is enabled at provider level
      if (state.status === "connected" && state.importEnabled) {
        state.calendars.forEach((cal) => {
          if (cal.importEnabled) {
            enabledCalendars.set(cal.id, {
              importMeetingsOnly: state.importMeetingsOnly,
            });
          }
        });
      }
    });

    return allExternalEvents.filter((event) => {
      const settings = enabledCalendars.get(event.calendarId);
      if (!settings) return false;

      // If meetings-only is enabled at integration level, filter out non-meeting events
      if (settings.importMeetingsOnly && !event.isMeeting) {
        return false;
      }

      return true;
    });
  }, [statesMap, allExternalEvents]);

  // Connect provider (simulates OAuth flow)
  const connectProvider = React.useCallback((provider: CalendarProvider) => {
    setStatesMap((prev) => {
      const next = new Map(prev);
      next.set(provider, {
        provider,
        status: "connected",
        accountEmail: MOCK_EMAILS[provider],
        calendars: MOCK_CALENDARS[provider],
        lastSyncAt: new Date(),
        // Import settings - defaults
        importEnabled: true,
        importMeetingsOnly: true,
        // Export settings - defaults
        exportEnabled: false,
        exportScope: "scheduled_and_blueprint",
        exportParticipation: { ...DEFAULT_EXPORT_PARTICIPATION },
        exportGoalFilter: "all",
        exportSelectedGoalIds: new Set(),
        exportDefaultAppearance: "blocked_superos",
        exportCustomLabel: "",
      });
      return next;
    });
  }, []);

  // Disconnect provider - clears all integration settings
  const disconnectProvider = React.useCallback((provider: CalendarProvider) => {
    setStatesMap((prev) => {
      const next = new Map(prev);
      next.set(provider, {
        provider,
        status: "not_connected",
        accountEmail: null,
        calendars: [],
        lastSyncAt: null,
        // Reset all import settings on disconnect
        importEnabled: true,
        importMeetingsOnly: true,
        // Reset all export settings on disconnect
        exportEnabled: false,
        exportScope: "scheduled_and_blueprint",
        exportParticipation: { ...DEFAULT_EXPORT_PARTICIPATION },
        exportGoalFilter: "all",
        exportSelectedGoalIds: new Set(),
        exportDefaultAppearance: "blocked_superos",
        exportCustomLabel: "",
      });
      return next;
    });
  }, []);

  // Toggle import enabled for a provider
  const toggleImportEnabled = React.useCallback(
    (provider: CalendarProvider) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          const wasEnabled = state.importEnabled;
          next.set(provider, {
            ...state,
            importEnabled: !wasEnabled,
            // When enabling, auto-enable first calendar if none enabled
            calendars:
              !wasEnabled && !state.calendars.some((c) => c.importEnabled)
                ? state.calendars.map((cal, i) =>
                    i === 0 ? { ...cal, importEnabled: true } : cal
                  )
                : state.calendars,
          });
        }
        return next;
      });
    },
    []
  );

  // Toggle calendar import
  const toggleCalendarImport = React.useCallback(
    (provider: CalendarProvider, calendarId: string) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            calendars: state.calendars.map((cal) =>
              cal.id === calendarId
                ? { ...cal, importEnabled: !cal.importEnabled }
                : cal
            ),
          });
        }
        return next;
      });
    },
    []
  );

  // Toggle calendar blueprint export
  const toggleCalendarExport = React.useCallback(
    (provider: CalendarProvider, calendarId: string) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            calendars: state.calendars.map((cal) =>
              cal.id === calendarId
                ? {
                    ...cal,
                    exportBlueprintEnabled: !cal.exportBlueprintEnabled,
                  }
                : cal
            ),
          });
        }
        return next;
      });
    },
    []
  );

  // Toggle "Only show meetings" filter for an integration
  const toggleMeetingsOnly = React.useCallback((provider: CalendarProvider) => {
    setStatesMap((prev) => {
      const next = new Map(prev);
      const state = next.get(provider);
      if (state) {
        next.set(provider, {
          ...state,
          importMeetingsOnly: !state.importMeetingsOnly,
        });
      }
      return next;
    });
  }, []);

  // Toggle export enabled for a provider
  const toggleExportEnabled = React.useCallback(
    (provider: CalendarProvider) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          const wasEnabled = state.exportEnabled;
          next.set(provider, {
            ...state,
            exportEnabled: !wasEnabled,
            // When enabling, auto-select first calendar if none selected
            calendars:
              !wasEnabled &&
              !state.calendars.some((c) => c.exportBlueprintEnabled)
                ? state.calendars.map((cal, i) =>
                    i === 0 ? { ...cal, exportBlueprintEnabled: true } : cal
                  )
                : state.calendars,
          });
        }
        return next;
      });
    },
    []
  );

  // Set the sync scope (scheduled, blueprint, or both)
  const setExportScope = React.useCallback(
    (provider: CalendarProvider, scope: SyncScope) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            exportScope: scope,
          });
        }
        return next;
      });
    },
    []
  );

  // Update which block types participate in sync
  const setExportParticipation = React.useCallback(
    (provider: CalendarProvider, participation: Partial<SyncParticipation>) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            exportParticipation: {
              ...state.exportParticipation,
              ...participation,
            },
          });
        }
        return next;
      });
    },
    []
  );

  // Set goal filter mode and optionally selected goal IDs
  const setExportGoalFilter = React.useCallback(
    (
      provider: CalendarProvider,
      mode: GoalFilterMode,
      selectedIds?: Set<string>
    ) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            exportGoalFilter: mode,
            exportSelectedGoalIds:
              selectedIds !== undefined
                ? selectedIds
                : state.exportSelectedGoalIds,
          });
        }
        return next;
      });
    },
    []
  );

  // Set the default appearance for exported blocks
  const setExportDefaultAppearance = React.useCallback(
    (provider: CalendarProvider, appearance: ExportBlockVisibility) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            exportDefaultAppearance: appearance,
          });
        }
        return next;
      });
    },
    []
  );

  // Set the custom label for exported events
  const setExportCustomLabel = React.useCallback(
    (provider: CalendarProvider, label: string) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            exportCustomLabel: label,
          });
        }
        return next;
      });
    },
    []
  );

  // Update external event (local state only)
  const updateExternalEvent = React.useCallback(
    (eventId: string, updates: Partial<ExternalEvent>) => {
      setAllExternalEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event
        )
      );
    },
    []
  );

  // Helper: get integration state for a provider
  const getIntegrationState = React.useCallback(
    (provider: CalendarProvider): CalendarIntegrationState => {
      return (
        statesMap.get(provider) ?? {
          provider,
          status: "not_connected",
          accountEmail: null,
          calendars: [],
          lastSyncAt: null,
          importEnabled: true,
          importMeetingsOnly: true,
          exportEnabled: false,
          exportScope: "scheduled_and_blueprint",
          exportParticipation: { ...DEFAULT_EXPORT_PARTICIPATION },
          exportGoalFilter: "all",
          exportSelectedGoalIds: new Set(),
          exportDefaultAppearance: "blocked_superos",
          exportCustomLabel: "",
        }
      );
    },
    [statesMap]
  );

  // Helper: check if provider is connected
  const isConnected = React.useCallback(
    (provider: CalendarProvider): boolean => {
      return statesMap.get(provider)?.status === "connected";
    },
    [statesMap]
  );

  // Helper: get enabled calendars for a provider
  const getEnabledCalendars = React.useCallback(
    (provider: CalendarProvider): ProviderCalendar[] => {
      const state = statesMap.get(provider);
      return state?.calendars.filter((c) => c.importEnabled) ?? [];
    },
    [statesMap]
  );

  return {
    integrationStates: statesMap,
    externalEvents,
    connectProvider,
    disconnectProvider,
    // Import settings
    toggleImportEnabled,
    toggleCalendarImport,
    toggleMeetingsOnly,
    // Export settings
    toggleCalendarExport,
    toggleExportEnabled,
    setExportScope,
    setExportParticipation,
    setExportGoalFilter,
    setExportDefaultAppearance,
    setExportCustomLabel,
    // External event actions
    updateExternalEvent,
    // Helpers
    getIntegrationState,
    isConnected,
    getEnabledCalendars,
  };
}
