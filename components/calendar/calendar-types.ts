/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public barrel file for the calendar module.
 *
 * Re-exports all shared calendar constants, helpers, types, and prop
 * interfaces from a single entry point to simplify imports and keep
 * consumer code consistent.
 *
 * No runtime logic lives in this file.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Aggregate and re-export calendar submodule APIs.
 * - Define the public surface area of the calendar package.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing logic.
 * - Declaring new types.
 * - Performing side effects.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Organized into three sections:
 *   1) Constants and helpers.
 *   2) Segments and overnight utilities.
 *   3) Props and callback interfaces.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - All exports from calendar-constants
 * - All exports from calendar-segments
 * - All exports from calendar-props
 */

// --- Constants, config, simple types, status helpers -------------------------
export {
  // Re-exported shared types
  type BlockType,
  type BlockStatus,
  type CalendarEvent,
  type HoverPosition,
  // Day / hour constants
  DAYS,
  DAYS_SUNDAY_START,
  HOURS,
  getDayLabels,
  SNAP_MINUTES,
  // Overlap layout constants
  MAX_OVERLAP_COLUMNS,
  BLOCK_GAP_PX,
  BLOCK_MARGIN_PX,
  NESTING_INDENT_PX,
  COMPACT_LAYOUT_THRESHOLD_PX,
  // Density config (deprecated)
  type CalendarDensity,
  DENSITY_HEIGHTS,
  DEFAULT_DENSITY,
  getGridHeight,
  getPixelsPerMinute,
  GRID_HEIGHT_PX,
  PIXELS_PER_MINUTE,
  // Zoom config (preferred)
  getGridHeightFromZoom,
  getPixelsPerMinuteFromZoom,
  // Simple type aliases
  type CalendarView,
  type BlockStyle,
  // Status helpers
  blockStyleToStatus,
  canMarkComplete,
  statusOnPaste,
} from "./calendar-constants";

// --- Overnight helpers, segment types, getSegmentsForDay ---------------------
export {
  MAX_EVENT_DURATION_MINUTES,
  isOvernightEvent,
  getEventEndDayIndex,
  getNextDayDate,
  getEventEndMinutes,
  clampEventDuration,
  type SegmentPosition,
  type OverlapLayout,
  type EventDaySegment,
  getSegmentsForDay,
} from "./calendar-segments";

// --- Callback interfaces, component props ------------------------------------
export {
  type ExternalDragPreview,
  type CalendarEventCallbacks,
  type ExternalDropCallbacks,
  type CalendarProps,
  type CalendarDayHeaderProps,
  type DayViewProps,
  type WeekViewProps,
  type TimeColumnProps,
} from "./calendar-props";
