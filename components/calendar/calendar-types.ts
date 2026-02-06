// =============================================================================
// Barrel re-export — all consumers continue importing from "./calendar-types"
//
// The actual definitions now live in focused modules:
//   calendar-constants.ts — constants, density/zoom config, simple types, status helpers
//   calendar-segments.ts  — overnight helpers, segment types, getSegmentsForDay
//   calendar-props.ts     — callback interfaces, component prop interfaces
// =============================================================================

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
