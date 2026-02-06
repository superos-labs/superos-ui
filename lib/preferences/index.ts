/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public API for user preferences.
 *
 * Re-exports preference types, constants, and context/hooks used to read and
 * update user-level configuration (calendar behavior, display options, etc.).
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Expose preference-related types.
 * - Expose preference constants.
 * - Expose preferences context provider and hooks.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - WeekStartDay
 * - ProgressMetric
 * - CalendarZoom
 * - DayBoundariesDisplay
 * - UserPreferences
 * - MIN_CALENDAR_ZOOM
 * - MAX_CALENDAR_ZOOM
 * - DEFAULT_CALENDAR_ZOOM
 * - CALENDAR_ZOOM_STEP
 * - DEFAULT_DAY_START_MINUTES
 * - DEFAULT_DAY_END_MINUTES
 * - PreferencesProvider
 * - usePreferences
 * - usePreferencesOptional
 * - PreferencesProviderProps
 */

// Types
export type {
  WeekStartDay,
  ProgressMetric,
  CalendarZoom,
  DayBoundariesDisplay,
  UserPreferences,
} from "./types";

// Zoom constants
export {
  MIN_CALENDAR_ZOOM,
  MAX_CALENDAR_ZOOM,
  DEFAULT_CALENDAR_ZOOM,
  CALENDAR_ZOOM_STEP,
} from "./types";

// Day boundary constants
export { DEFAULT_DAY_START_MINUTES, DEFAULT_DAY_END_MINUTES } from "./types";

// Context and hooks
export {
  PreferencesProvider,
  usePreferences,
  usePreferencesOptional,
  type PreferencesProviderProps,
} from "./preferences-context";
