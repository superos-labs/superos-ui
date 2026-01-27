"use client";

import * as React from "react";
import type { WeekStartDay, ProgressMetric, UserPreferences } from "./types";

// =============================================================================
// Context
// =============================================================================

interface PreferencesContextValue extends UserPreferences {
  setWeekStartsOn: (day: WeekStartDay) => void;
  setProgressMetric: (metric: ProgressMetric) => void;
  setAutoCompleteCommitments: (enabled: boolean) => void;
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
  /** Override the default auto-complete commitments setting */
  defaultAutoCompleteCommitments?: boolean;
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
  defaultAutoCompleteCommitments,
}: PreferencesProviderProps) {
  // Week starts on Monday by default
  const [weekStartsOn, setWeekStartsOn] = React.useState<WeekStartDay>(
    defaultWeekStartsOn ?? DEFAULT_WEEK_START
  );
  
  // Progress metric: default to 'completed'
  const [progressMetric, setProgressMetric] = React.useState<ProgressMetric>(
    defaultProgressMetric ?? 'completed'
  );
  
  // Auto-complete commitments: default to true
  const [autoCompleteCommitments, setAutoCompleteCommitments] = React.useState<boolean>(
    defaultAutoCompleteCommitments ?? true
  );

  const value = React.useMemo(
    () => ({
      weekStartsOn,
      setWeekStartsOn,
      progressMetric,
      setProgressMetric,
      autoCompleteCommitments,
      setAutoCompleteCommitments,
    }),
    [weekStartsOn, progressMetric, autoCompleteCommitments]
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
