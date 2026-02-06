/**
 * =============================================================================
 * File: preferences-context.tsx
 * =============================================================================
 *
 * Client-side context and provider for user preferences.
 *
 * Manages user-configurable settings related to calendar behavior, progress
 * measurement, and day-boundary display, and exposes setters to update them.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Store user preference state.
 * - Provide clamped setters for constrained values (zoom, minutes).
 * - Expose preferences via context and hooks.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Defaults reflect common planning assumptions (Mon start, 7am–11pm day).
 * - No persistence layer here; higher-level code may hydrate/persist.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - PreferencesProvider
 * - PreferencesProviderProps
 * - usePreferences
 * - usePreferencesOptional
 */

"use client";

import * as React from "react";
import type {
  WeekStartDay,
  ProgressMetric,
  CalendarZoom,
  DayBoundariesDisplay,
  UserPreferences,
} from "./types";
import {
  DEFAULT_CALENDAR_ZOOM,
  MIN_CALENDAR_ZOOM,
  MAX_CALENDAR_ZOOM,
  DEFAULT_DAY_START_MINUTES,
  DEFAULT_DAY_END_MINUTES,
} from "./types";

// =============================================================================
// Context
// =============================================================================

interface PreferencesContextValue extends UserPreferences {
  setWeekStartsOn: (day: WeekStartDay) => void;
  setProgressMetric: (metric: ProgressMetric) => void;
  setAutoCompleteEssentials: (enabled: boolean) => void;
  setCalendarZoom: (zoom: CalendarZoom) => void;
  setDayBoundariesEnabled: (enabled: boolean) => void;
  setDayBoundariesDisplay: (display: DayBoundariesDisplay) => void;
  setDayStartMinutes: (minutes: number) => void;
  setDayEndMinutes: (minutes: number) => void;
  setDayBoundaries: (startMinutes: number, endMinutes: number) => void;
}

const PreferencesContext = React.createContext<PreferencesContextValue | null>(
  null
);

// =============================================================================
// Provider
// =============================================================================

export interface PreferencesProviderProps {
  children: React.ReactNode;
  /** Override the default week start (for testing) */
  defaultWeekStartsOn?: WeekStartDay;
  /** Override the default progress metric */
  defaultProgressMetric?: ProgressMetric;
  /** Override the default auto-complete essentials setting */
  defaultAutoCompleteEssentials?: boolean;
  /** Override the default calendar zoom level */
  defaultCalendarZoom?: CalendarZoom;
  /** Override whether day boundaries are enabled */
  defaultDayBoundariesEnabled?: boolean;
  /** Override the default day boundaries display mode */
  defaultDayBoundariesDisplay?: DayBoundariesDisplay;
  /** Override the default day start time (minutes from midnight) */
  defaultDayStartMinutes?: number;
  /** Override the default day end time (minutes from midnight) */
  defaultDayEndMinutes?: number;
}

/**
 * Default week start day.
 * Monday (1) = weeks run Monday to Sunday.
 */
const DEFAULT_WEEK_START: WeekStartDay = 1;

export function PreferencesProvider({
  children,
  defaultWeekStartsOn,
  defaultProgressMetric,
  defaultAutoCompleteEssentials,
  defaultCalendarZoom,
  defaultDayBoundariesEnabled,
  defaultDayBoundariesDisplay,
  defaultDayStartMinutes,
  defaultDayEndMinutes,
}: PreferencesProviderProps) {
  // Week starts on Monday by default
  const [weekStartsOn, setWeekStartsOn] = React.useState<WeekStartDay>(
    defaultWeekStartsOn ?? DEFAULT_WEEK_START
  );

  // Progress metric: default to 'completed'
  const [progressMetric, setProgressMetric] = React.useState<ProgressMetric>(
    defaultProgressMetric ?? "completed"
  );

  // Auto-complete essentials: default to true
  const [autoCompleteEssentials, setAutoCompleteEssentials] =
    React.useState<boolean>(defaultAutoCompleteEssentials ?? true);

  // Calendar zoom: default to 100%
  const [calendarZoom, setCalendarZoomState] = React.useState<CalendarZoom>(
    defaultCalendarZoom ?? DEFAULT_CALENDAR_ZOOM
  );

  // Day boundaries enabled: default to false
  const [dayBoundariesEnabled, setDayBoundariesEnabled] =
    React.useState<boolean>(defaultDayBoundariesEnabled ?? false);

  // Day boundaries display mode: default to 'dimmed'
  const [dayBoundariesDisplay, setDayBoundariesDisplay] =
    React.useState<DayBoundariesDisplay>(
      defaultDayBoundariesDisplay ?? "dimmed"
    );

  // Day boundaries: default to 7am - 11pm
  const [dayStartMinutes, setDayStartMinutesState] = React.useState<number>(
    defaultDayStartMinutes ?? DEFAULT_DAY_START_MINUTES
  );
  const [dayEndMinutes, setDayEndMinutesState] = React.useState<number>(
    defaultDayEndMinutes ?? DEFAULT_DAY_END_MINUTES
  );

  // Clamped setter for calendar zoom
  const setCalendarZoom = React.useCallback((zoom: CalendarZoom) => {
    setCalendarZoomState(
      Math.max(MIN_CALENDAR_ZOOM, Math.min(MAX_CALENDAR_ZOOM, zoom))
    );
  }, []);

  // Clamped setters for day boundaries (0-1440 minutes)
  const setDayStartMinutes = React.useCallback((minutes: number) => {
    setDayStartMinutesState(Math.max(0, Math.min(1440, minutes)));
  }, []);

  const setDayEndMinutes = React.useCallback((minutes: number) => {
    setDayEndMinutesState(Math.max(0, Math.min(1440, minutes)));
  }, []);

  // Set both boundaries at once (useful for the UI)
  const setDayBoundaries = React.useCallback(
    (startMinutes: number, endMinutes: number) => {
      setDayStartMinutesState(Math.max(0, Math.min(1440, startMinutes)));
      setDayEndMinutesState(Math.max(0, Math.min(1440, endMinutes)));
    },
    []
  );

  const value = React.useMemo(
    () => ({
      weekStartsOn,
      setWeekStartsOn,
      progressMetric,
      setProgressMetric,
      autoCompleteEssentials,
      setAutoCompleteEssentials,
      calendarZoom,
      setCalendarZoom,
      dayBoundariesEnabled,
      setDayBoundariesEnabled,
      dayBoundariesDisplay,
      setDayBoundariesDisplay,
      dayStartMinutes,
      setDayStartMinutes,
      dayEndMinutes,
      setDayEndMinutes,
      setDayBoundaries,
    }),
    [
      weekStartsOn,
      progressMetric,
      autoCompleteEssentials,
      calendarZoom,
      setCalendarZoom,
      dayBoundariesEnabled,
      dayBoundariesDisplay,
      dayStartMinutes,
      setDayStartMinutes,
      dayEndMinutes,
      setDayEndMinutes,
      setDayBoundaries,
    ]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Access user preferences.
 * Must be used within a PreferencesProvider.
 */
export function usePreferences(): PreferencesContextValue {
  const context = React.useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}

/**
 * Access user preferences, returning null if not within a provider.
 * Useful for components that may be used outside the preferences context.
 */
export function usePreferencesOptional(): PreferencesContextValue | null {
  return React.useContext(PreferencesContext);
}
