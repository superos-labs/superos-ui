// Public API for the Calendar component family

// Main component
export { Calendar } from "./calendar";

// Sub-components (for advanced use cases)
export { CalendarDayHeader } from "./calendar-day-header";
export { CurrentTimeLine } from "./current-time-line";
export { DayView } from "./day-view";
export { WeekView } from "./week-view";
export { TimeColumn } from "./time-column";
export { BlockContextMenu, EmptySpaceContextMenu } from "./calendar-context-menu";

// Hooks
export { useCalendarInteractions } from "./use-calendar-interactions";
export type {
  UseCalendarInteractionsOptions,
  UseCalendarInteractionsReturn,
} from "./use-calendar-interactions";

export { useCalendarClipboard } from "./use-calendar-clipboard";
export type {
  UseCalendarClipboardReturn,
  CalendarClipboard,
} from "./use-calendar-clipboard";

export { useCalendarKeyboard } from "./use-calendar-keyboard";
export type {
  UseCalendarKeyboardOptions,
  UseCalendarKeyboardReturn,
  HoverPosition,
} from "./use-calendar-keyboard";

// Keyboard feedback
export { KeyboardToast } from "./keyboard-toast";

// Types
export type {
  CalendarProps,
  CalendarView,
  CalendarMode,
  CalendarEvent,
  CalendarDayHeaderProps,
  CalendarDensity,
  BlockStyle,
  BlockStatus,
  BlockType,
  DayViewProps,
  WeekViewProps,
  TimeColumnProps,
} from "./calendar-types";

// Constants (for advanced use cases)
export {
  DAYS,
  HOURS,
  GRID_HEIGHT_PX,
  PIXELS_PER_MINUTE,
  SNAP_MINUTES,
  COMPACT_LAYOUT_THRESHOLD_PX,
  DENSITY_HEIGHTS,
  DEFAULT_DENSITY,
} from "./calendar-types";

// Density helpers
export { getGridHeight, getPixelsPerMinute } from "./calendar-types";

// Status helpers (for advanced use cases)
export {
  canMarkComplete,
  statusOnPaste,
  isVisibleInMode,
  blockStyleToStatus,
} from "./calendar-types";

// Overnight block helpers (for advanced use cases)
export {
  MAX_EVENT_DURATION_MINUTES,
  isOvernightEvent,
  getEventEndDayIndex,
  getEventEndMinutes,
  clampEventDuration,
  getSegmentsForDay,
} from "./calendar-types";

export type {
  SegmentPosition,
  EventDaySegment,
  OverlapLayout,
} from "./calendar-types";

// Overlap layout constants
export {
  MAX_OVERLAP_COLUMNS,
  BLOCK_GAP_PX,
  BLOCK_MARGIN_PX,
  NESTING_INDENT_PX,
} from "./calendar-types";

// Utilities (for advanced use cases)
export {
  getWeekDates,
  formatHour,
  formatFullDate,
  formatEventTime,
  formatTimeFromMinutes,
  isToday,
  isCurrentHour,
  snapToGrid,
  blockAnimations,
  calculateOverlapLayout,
} from "./calendar-utils";
