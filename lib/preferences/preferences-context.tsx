"use client";

import * as React from "react";
import type { WeekStartDay, ProgressMetric, CalendarZoom, UserPreferences } from "./types";
import {
  DEFAULT_CALENDAR_ZOOM,
  MIN_CALENDAR_ZOOM,
  MAX_CALENDAR_ZOOM,
} from "./types";

// =============================================================================
// Context
// =============================================================================

interface PreferencesContextValue extends UserPreferences {
  setWeekStartsOn: (day: WeekStartDay) => void;
  setProgressMetric: (metric: ProgressMetric) => void;
  setAutoCompleteEssentials: (enabled: boolean) => void;
  setCalendarZoom: (zoom: CalendarZoom) => void;
}

const PreferencesContext = React.createContext<PreferencesContextValue | null>(null);

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
}: PreferencesProviderProps) {
  // Week starts on Monday by default
  const [weekStartsOn, setWeekStartsOn] = React.useState<WeekStartDay>(
    defaultWeekStartsOn ?? DEFAULT_WEEK_START
  );
  
  // Progress metric: default to 'completed'
  const [progressMetric, setProgressMetric] = React.useState<ProgressMetric>(
    defaultProgressMetric ?? 'completed'
  );
  
  // Auto-complete essentials: default to true
  const [autoCompleteEssentials, setAutoCompleteEssentials] = React.useState<boolean>(
    defaultAutoCompleteEssentials ?? true
  );
  
  // Calendar zoom: default to 100%
  const [calendarZoom, setCalendarZoomState] = React.useState<CalendarZoom>(
    defaultCalendarZoom ?? DEFAULT_CALENDAR_ZOOM
  );
  
  // Clamped setter for calendar zoom
  const setCalendarZoom = React.useCallback((zoom: CalendarZoom) => {
    setCalendarZoomState(Math.max(MIN_CALENDAR_ZOOM, Math.min(MAX_CALENDAR_ZOOM, zoom)));
  }, []);

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
    }),
    [weekStartsOn, progressMetric, autoCompleteEssentials, calendarZoom, setCalendarZoom]
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
