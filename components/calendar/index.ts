// Public API for the Calendar component family

// Main component
export { Calendar } from "./calendar";

// Sub-components (for advanced use cases)
export { CalendarDayHeader } from "./calendar-day-header";
export { CurrentTimeLine } from "./current-time-line";
export { DayView } from "./day-view";
export { WeekView } from "./week-view";
export { BlockContextMenu, EmptySpaceContextMenu } from "./calendar-context-menu";

// Hooks
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
  BlockStyle,
  BlockStatus,
  DayViewProps,
  WeekViewProps,
} from "./calendar-types";

// Constants (for advanced use cases)
export {
  DAYS,
  HOURS,
  GRID_HEIGHT_PX,
  PIXELS_PER_MINUTE,
  SNAP_MINUTES,
} from "./calendar-types";

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

export type { SegmentPosition, EventDaySegment } from "./calendar-types";

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
} from "./calendar-utils";
