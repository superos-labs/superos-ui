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
