"use client";

import * as React from "react";
import type { WeekStartDay, UserPreferences } from "./types";

// =============================================================================
// Locale Detection
// =============================================================================

/**
 * Detect the default week start day from browser locale.
 * Uses Intl.Locale.weekInfo when available (Chrome 99+, Safari 15.4+, Firefox 105+).
 * Falls back to Monday for unsupported browsers.
 * 
 * IMPORTANT: Only call this on the client (after hydration) to avoid SSR mismatch.
 */
function detectLocaleWeekStart(): WeekStartDay {
  if (typeof window === "undefined") {
    return 1; // SSR fallback
  }
  
  try {
    const locale = new Intl.Locale(navigator.language);
    // weekInfo.firstDay: 1 = Monday, 7 = Sunday (ISO 8601)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weekInfo = (locale as any).weekInfo ?? (locale as any).getWeekInfo?.();
    if (weekInfo?.firstDay === 7) return 0; // Sunday
    return 1; // Default to Monday
  } catch {
    return 1; // Fallback to Monday
  }
}

// =============================================================================
// Context
// =============================================================================

interface PreferencesContextValue extends UserPreferences {
  setWeekStartsOn: (day: WeekStartDay) => void;
}

const PreferencesContext = React.createContext<PreferencesContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

export interface PreferencesProviderProps {
  children: React.ReactNode;
  /** Override the default week start (for testing) */
  defaultWeekStartsOn?: WeekStartDay;
}

/**
 * Default week start used during SSR and initial client render.
 * We use Monday (1) as the SSR-safe default to ensure hydration matches.
 */
const SSR_SAFE_DEFAULT: WeekStartDay = 1;

export function PreferencesProvider({
  children,
  defaultWeekStartsOn,
}: PreferencesProviderProps) {
  // Start with SSR-safe default, then update after hydration
  const [weekStartsOn, setWeekStartsOn] = React.useState<WeekStartDay>(
    defaultWeekStartsOn ?? SSR_SAFE_DEFAULT
  );

  // Detect locale preference after hydration (client-only)
  React.useEffect(() => {
    if (defaultWeekStartsOn === undefined) {
      const detected = detectLocaleWeekStart();
      if (detected !== SSR_SAFE_DEFAULT) {
        setWeekStartsOn(detected);
      }
    }
  }, [defaultWeekStartsOn]);

  const value = React.useMemo(
    () => ({
      weekStartsOn,
      setWeekStartsOn,
    }),
    [weekStartsOn]
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
