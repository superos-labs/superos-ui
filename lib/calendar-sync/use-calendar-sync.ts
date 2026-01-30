"use client";

import * as React from "react";
import type {
  CalendarProvider,
  CalendarIntegrationState,
  ExternalEvent,
  ExportBlockVisibility,
  ProviderCalendar,
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
  options: UseCalendarSyncOptions = {},
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
  const [allExternalEvents, setAllExternalEvents] =
    React.useState<ExternalEvent[]>(initialExternalEvents);

  // Derived: filter events by enabled calendars and meetings-only setting
  const externalEvents = React.useMemo(() => {
    // Build a map of enabled calendar IDs to their provider's meetings-only setting
    const enabledCalendars = new Map<string, { importMeetingsOnly: boolean }>();

    statesMap.forEach((state) => {
      if (state.status === "connected") {
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
        importMeetingsOnly: true,
        exportBlockVisibility: "busy",
        lastSyncAt: new Date(),
      });
      return next;
    });
  }, []);

  // Disconnect provider
  const disconnectProvider = React.useCallback((provider: CalendarProvider) => {
    setStatesMap((prev) => {
      const next = new Map(prev);
      next.set(provider, {
        provider,
        status: "not_connected",
        accountEmail: null,
        calendars: [],
        importMeetingsOnly: true,
        exportBlockVisibility: "busy",
        lastSyncAt: null,
      });
      return next;
    });
  }, []);

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
                : cal,
            ),
          });
        }
        return next;
      });
    },
    [],
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
                ? { ...cal, exportBlueprintEnabled: !cal.exportBlueprintEnabled }
                : cal,
            ),
          });
        }
        return next;
      });
    },
    [],
  );

  // Toggle "Only show meetings" filter for an integration
  const toggleMeetingsOnly = React.useCallback(
    (provider: CalendarProvider) => {
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
    },
    [],
  );

  // Set how exported blocks appear in external calendar
  const setExportBlockVisibility = React.useCallback(
    (provider: CalendarProvider, visibility: ExportBlockVisibility) => {
      setStatesMap((prev) => {
        const next = new Map(prev);
        const state = next.get(provider);
        if (state) {
          next.set(provider, {
            ...state,
            exportBlockVisibility: visibility,
          });
        }
        return next;
      });
    },
    [],
  );

  // Update external event (local state only)
  const updateExternalEvent = React.useCallback(
    (eventId: string, updates: Partial<ExternalEvent>) => {
      setAllExternalEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event,
        ),
      );
    },
    [],
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
          importMeetingsOnly: true,
          exportBlockVisibility: "busy",
          lastSyncAt: null,
        }
      );
    },
    [statesMap],
  );

  // Helper: check if provider is connected
  const isConnected = React.useCallback(
    (provider: CalendarProvider): boolean => {
      return statesMap.get(provider)?.status === "connected";
    },
    [statesMap],
  );

  // Helper: get enabled calendars for a provider
  const getEnabledCalendars = React.useCallback(
    (provider: CalendarProvider): ProviderCalendar[] => {
      const state = statesMap.get(provider);
      return state?.calendars.filter((c) => c.importEnabled) ?? [];
    },
    [statesMap],
  );

  return {
    integrationStates: statesMap,
    externalEvents,
    connectProvider,
    disconnectProvider,
    toggleCalendarImport,
    toggleCalendarExport,
    toggleMeetingsOnly,
    setExportBlockVisibility,
    updateExternalEvent,
    getIntegrationState,
    isConnected,
    getEnabledCalendars,
  };
}
