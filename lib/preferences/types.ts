/**
 * User preferences types.
 */

/**
 * Day the week starts on.
 * - 0 = Sunday
 * - 1 = Monday
 */
export type WeekStartDay = 0 | 1;

/**
 * User preferences for the application.
 */
export interface UserPreferences {
  /** Which day the week starts on (0 = Sunday, 1 = Monday) */
  weekStartsOn: WeekStartDay;
}
