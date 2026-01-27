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
 * How progress is measured in analytics.
 * - 'completed': Hours from blocks marked complete
 * - 'focused': Hours of actual focus time tracked
 */
export type ProgressMetric = 'completed' | 'focused';

/**
 * User preferences for the application.
 */
export interface UserPreferences {
  /** Which day the week starts on (0 = Sunday, 1 = Monday) */
  weekStartsOn: WeekStartDay;
  
  /** How progress is measured in analytics (default: 'completed') */
  progressMetric: ProgressMetric;
  
  /** Whether commitment blocks auto-complete when past their end time (default: true) */
  autoCompleteCommitments: boolean;
}
