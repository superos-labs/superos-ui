// Public API for the Calendar component family

// Main component
export { Calendar } from "./calendar";

// Sub-components (for advanced use cases)
export { CalendarDayHeader } from "./calendar-day-header";
export { CurrentTimeLine } from "./current-time-line";
export { DayView } from "./day-view";
export { WeekView } from "./week-view";

// Types
export type {
  CalendarProps,
  CalendarView,
  CalendarMode,
  CalendarEvent,
  CalendarDayHeaderProps,
  BlockStyle,
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
