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
export type ProgressMetric = "completed" | "focused";

/**
 * Calendar zoom level as a percentage.
 * - 50 = most zoomed out (40px/hour)
 * - 100 = default (80px/hour)
 * - 150 = most zoomed in (120px/hour)
 */
export type CalendarZoom = number;

/** Minimum zoom level (most zoomed out) */
export const MIN_CALENDAR_ZOOM = 50;

/** Maximum zoom level (most zoomed in) */
export const MAX_CALENDAR_ZOOM = 200;

/** Default zoom level */
export const DEFAULT_CALENDAR_ZOOM = 100;

/** Zoom increment step */
export const CALENDAR_ZOOM_STEP = 10;

// =============================================================================
// Day Boundaries
// =============================================================================

/** Default day start time: 7:00 AM (420 minutes from midnight) */
export const DEFAULT_DAY_START_MINUTES = 420;

/** Default day end time: 11:00 PM (1380 minutes from midnight) */
export const DEFAULT_DAY_END_MINUTES = 1380;

/**
 * How to display hours outside day boundaries.
 * - 'dimmed': Show hours but with reduced opacity
 * - 'hidden': Collapse hours entirely (blocks pushed into visible range)
 */
export type DayBoundariesDisplay = "dimmed" | "hidden";

/**
 * User preferences for the application.
 */
export interface UserPreferences {
  /** Which day the week starts on (0 = Sunday, 1 = Monday) */
  weekStartsOn: WeekStartDay;

  /** How progress is measured in analytics (default: 'completed') */
  progressMetric: ProgressMetric;

  /** Whether essential blocks auto-complete when past their end time (default: true) */
  autoCompleteEssentials: boolean;

  /** Calendar zoom level as percentage (50-150, default: 100) */
  calendarZoom: CalendarZoom;

  /** Whether day boundaries are enabled (default: false) */
  dayBoundariesEnabled: boolean;

  /** How to display out-of-bounds hours when enabled (default: 'dimmed') */
  dayBoundariesDisplay: DayBoundariesDisplay;

  /** Day start time in minutes from midnight (e.g., 420 = 7:00 AM). Hours before this are dimmed/hidden. */
  dayStartMinutes: number;

  /** Day end time in minutes from midnight (e.g., 1380 = 11:00 PM). Hours after this are dimmed/hidden. */
  dayEndMinutes: number;
}
