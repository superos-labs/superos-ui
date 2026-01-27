// Types
export type { WeekStartDay, ProgressMetric, UserPreferences } from "./types";

// Context and hooks
export {
  PreferencesProvider,
  usePreferences,
  usePreferencesOptional,
  type PreferencesProviderProps,
} from "./preferences-context";
