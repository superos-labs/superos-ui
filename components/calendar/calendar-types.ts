import type { BlockColor } from "@/components/block";
import type { BlockType, BlockStatus } from "@/lib/types";
import type { WeekStartDay } from "@/lib/preferences";
import type { CalendarEvent, HoverPosition } from "@/lib/unified-schedule";

// Re-export shared types for convenience
// CalendarEvent and HoverPosition are now sourced from lib/unified-schedule
export type { BlockType, BlockStatus, CalendarEvent, HoverPosition };

// Constants
/** Day labels for Monday-start weeks (legacy constant for backward compatibility) */
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Day labels for Sunday-start weeks */
export const DAYS_SUNDAY_START = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Get the day labels array based on which day the week starts on.
 * @param weekStartsOn - Which day the week starts on (0 = Sunday, 1 = Monday)
 * @returns Array of day abbreviations in order
 */
export function getDayLabels(
  weekStartsOn: WeekStartDay = 1,
): readonly string[] {
  return weekStartsOn === 0 ? DAYS_SUNDAY_START : DAYS;
}

// Snap to 15-minute intervals for precise click positioning
export const SNAP_MINUTES = 15;

// ============================================================================
// Overlap layout configuration
// ============================================================================

/** Maximum number of side-by-side columns before events become too narrow */
export const MAX_OVERLAP_COLUMNS = 5;

/** Universal gap between blocks - applies to both overlapping and sequential blocks (in pixels) */
export const BLOCK_GAP_PX = 2;

/** Base horizontal margin for blocks (in pixels) */
export const BLOCK_MARGIN_PX = 4;

/** Indentation per nesting level for contained events (in pixels) */
export const NESTING_INDENT_PX = 8;

// Minimum height in pixels for a block to display full content (title + time subline)
// Below this threshold, blocks use compact layout (centered title only)
// Set to 44px so that 30-min blocks only use full layout at "comfortable" density (48px)
export const COMPACT_LAYOUT_THRESHOLD_PX = 44;

// ============================================================================
// Density configuration
// ============================================================================

/**
 * Calendar density presets that control vertical spacing.
 * - compact: Denser layout, more content visible (56px/hour)
 * - default: Balanced readability (80px/hour) - recommended
 * - comfortable: Spacious layout, best for small blocks (120px/hour)
 *
 * @deprecated Use zoom-based configuration instead (50-150%)
 */
export type CalendarDensity = "compact" | "default" | "comfortable";

/** Grid height in pixels for each density preset (for 24 hours)
 * @deprecated Use getGridHeightFromZoom instead
 */
export const DENSITY_HEIGHTS: Record<CalendarDensity, number> = {
  compact: 1344, // 56px/hour, 14px per 15-min
  default: 1920, // 80px/hour, 20px per 15-min
  comfortable: 2880, // 120px/hour, 30px per 15-min
};

/** Default density for the calendar
 * @deprecated Use DEFAULT_CALENDAR_ZOOM from lib/preferences instead
 */
export const DEFAULT_DENSITY: CalendarDensity = "default";

/**
 * Get the grid height in pixels for a given density.
 * @deprecated Use getGridHeightFromZoom instead
 */
export function getGridHeight(
  density: CalendarDensity = DEFAULT_DENSITY,
): number {
  return DENSITY_HEIGHTS[density];
}

/**
 * Get pixels per minute for a given density.
 * Used for positioning events and drag/resize calculations.
 * @deprecated Use getPixelsPerMinuteFromZoom instead
 */
export function getPixelsPerMinute(
  density: CalendarDensity = DEFAULT_DENSITY,
): number {
  return DENSITY_HEIGHTS[density] / (24 * 60);
}

// Legacy constants for backward compatibility (use getGridHeight/getPixelsPerMinute instead)
export const GRID_HEIGHT_PX = DENSITY_HEIGHTS[DEFAULT_DENSITY];
export const PIXELS_PER_MINUTE = getPixelsPerMinute(DEFAULT_DENSITY);

// ============================================================================
// Zoom-based configuration (replaces density)
// ============================================================================

/** Base pixels per hour at 100% zoom */
const BASE_PIXELS_PER_HOUR = 80;

/**
 * Get the grid height in pixels for a given zoom level.
 * @param zoomPercent - Zoom level as percentage (50-150, default 100)
 * @returns Grid height in pixels for 24 hours
 */
export function getGridHeightFromZoom(zoomPercent: number = 100): number {
  const pixelsPerHour = BASE_PIXELS_PER_HOUR * (zoomPercent / 100);
  return pixelsPerHour * 24;
}

/**
 * Get pixels per minute for a given zoom level.
 * @param zoomPercent - Zoom level as percentage (50-150, default 100)
 * @returns Pixels per minute for positioning calculations
 */
export function getPixelsPerMinuteFromZoom(zoomPercent: number = 100): number {
  return getGridHeightFromZoom(zoomPercent) / (24 * 60);
}

// Types
export type CalendarView = "week" | "day";
export type BlockStyle = "planned" | "completed";

// Note: CalendarEvent is now imported from @/lib/unified-schedule (source of truth)
// Note: HoverPosition is now imported from @/lib/unified-schedule (source of truth)

// =============================================================================
// Shared Callback Interfaces
// =============================================================================

/** Preview for external drag items (from backlog) */
export interface ExternalDragPreview {
  dayIndex: number;
  startMinutes: number;
  durationMinutes: number;
  color: BlockColor;
  title: string;
}

/**
 * Event callbacks shared across Calendar, DayView, WeekView, and TimeColumn.
 * Extract to reduce duplication and ensure consistency.
 */
export interface CalendarEventCallbacks {
  /** Called when an event is being resized */
  onEventResize?: (
    eventId: string,
    newStartMinutes: number,
    newDurationMinutes: number,
  ) => void;
  /** Called when resize operation ends */
  onEventResizeEnd?: (eventId: string) => void;
  /** Called when drag operation ends with the final position */
  onEventDragEnd?: (
    eventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  /** Called when drag operation ends with Option key held (duplicate) */
  onEventDuplicate?: (
    sourceEventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  /** Called when user double-clicks on an empty area of the calendar grid */
  onGridDoubleClick?: (dayIndex: number, startMinutes: number) => void;
  /** Called when user drags on an empty area of the calendar grid to create a block */
  onGridDragCreate?: (
    dayIndex: number,
    startMinutes: number,
    durationMinutes: number,
  ) => void;
  /** Called when an event is copied via context menu */
  onEventCopy?: (event: CalendarEvent) => void;
  /** Called when an event is deleted via context menu */
  onEventDelete?: (eventId: string) => void;
  /** Called when an event's status is changed (complete/incomplete) */
  onEventStatusChange?: (eventId: string, status: BlockStatus) => void;
  /** Called when user triggers paste via context menu */
  onEventPaste?: (dayIndex: number, startMinutes: number) => void;
  /** Whether the clipboard has content (enables/disables paste) */
  hasClipboardContent?: boolean;
  /** Called when mouse enters/leaves an event block (for keyboard shortcuts) */
  onEventHover?: (event: CalendarEvent | null) => void;
  /** Called when mouse moves over the grid (for paste position) */
  onGridPositionHover?: (position: HoverPosition | null) => void;
  /** Called when an event block is clicked (for sidebar selection) */
  onEventClick?: (event: CalendarEvent) => void;
  /** Called when mouse enters/leaves a day header (for keyboard shortcuts) */
  onDayHeaderHover?: (dayIndex: number | null) => void;
  /** Called when user wants to mark all blocks on a day as complete (⌘Enter on header) */
  onMarkDayComplete?: (dayIndex: number) => void;
}

/**
 * External drop callbacks for backlog drag-and-drop integration.
 */
export interface ExternalDropCallbacks {
  /** Whether to enable external drop zone (requires DragProvider wrapper) */
  enableExternalDrop?: boolean;
  /** Called when an external item is dropped on the calendar */
  onExternalDrop?: (dayIndex: number, startMinutes: number) => void;
  /** Preview for external drag (shown when dragging over) */
  externalDragPreview?: ExternalDragPreview | null;
}

// =============================================================================
// Component Props
// =============================================================================

export interface CalendarProps
  extends CalendarEventCallbacks, ExternalDropCallbacks {
  view?: CalendarView;
  selectedDate?: Date;
  showHourLabels?: boolean;
  headerIsVisible?: boolean;
  /** Events to display on the calendar (required - no default data) */
  events: CalendarEvent[];
  /** Key that triggers scroll-to-current-time when changed (used for initial load and "Today" button) */
  scrollToCurrentTimeKey?: string | number;
  /**
   * Density preset controlling vertical spacing (default: "default")
   * @deprecated Use zoom instead
   */
  density?: CalendarDensity;
  /** Zoom level as percentage (50-150, default: 100). Overrides density if provided. */
  zoom?: number;
  /** Which day the week starts on (0 = Sunday, 1 = Monday, default: 1) */
  weekStartsOn?: WeekStartDay;
  setBlockStyle?: BlockStyle;
  /** Called when a task is dropped on a day header to set a deadline */
  onDeadlineDrop?: (dayIndex: number, date: string) => void;
  /** Map of ISO date string to array of deadline tasks for that day */
  deadlines?: Map<string, import("@/lib/unified-schedule").DeadlineTask[]>;
  /** Map of ISO date string to array of all-day external events for that day */
  allDayEvents?: Map<string, import("./deadline-tray").AllDayEvent[]>;
  /** Called when a deadline task's completion status is toggled */
  onDeadlineToggleComplete?: (goalId: string, taskId: string) => void;
  /** Called when a deadline is removed (unassigned) */
  onDeadlineUnassign?: (goalId: string, taskId: string) => void;
  /** Called when mouse enters/leaves a deadline pill (for keyboard shortcuts) */
  onDeadlineHover?: (
    deadline: import("@/lib/unified-schedule").DeadlineTask | null,
  ) => void;
  /** Called when an all-day event's completion status is toggled */
  onToggleAllDayEvent?: (eventId: string) => void;
  /** Called when mouse enters/leaves an all-day event pill */
  onAllDayEventHover?: (event: import("./deadline-tray").AllDayEvent | null) => void;
  /** Day start time in minutes from midnight (for dimming hours outside day boundaries) */
  dayStartMinutes?: number;
  /** Day end time in minutes from midnight (for dimming hours outside day boundaries) */
  dayEndMinutes?: number;
  /** Whether day boundaries are enabled */
  dayBoundariesEnabled?: boolean;
  /** How to display hours outside day boundaries: 'dimmed' */
  dayBoundariesDisplay?: "dimmed";
}

export interface CalendarDayHeaderProps {
  day: string;
  date: number;
  isToday?: boolean;
  showBorder?: boolean;
  className?: string;
  /** Day index for drop handling (0 = Monday, 6 = Sunday) */
  dayIndex?: number;
  /** Full date for ISO string generation on drop */
  fullDate?: Date;
  /** Whether this header is a valid drop target for the current drag */
  isDropTarget?: boolean;
  /** Called when an item is dropped on this header */
  onDeadlineDrop?: (dayIndex: number, date: string) => void;
  /** Called when mouse enters/leaves this header (for keyboard shortcuts) */
  onDayHeaderHover?: (dayIndex: number | null) => void;
}

export interface DayViewProps
  extends CalendarEventCallbacks, ExternalDropCallbacks {
  selectedDate: Date;
  showHourLabels?: boolean;
  headerIsVisible?: boolean;
  /** Events to display (required - always passed from parent Calendar) */
  events: CalendarEvent[];
  setBlockStyle?: BlockStyle;
  /** Key that triggers scroll-to-current-time when changed */
  scrollToCurrentTimeKey?: string | number;
  /**
   * Density preset controlling vertical spacing (default: "default")
   * @deprecated Use zoom instead
   */
  density?: CalendarDensity;
  /** Zoom level as percentage (50-150, default: 100). Overrides density if provided. */
  zoom?: number;
  /** Called when mouse enters/leaves the day header (for keyboard shortcuts) */
  onDayHeaderHover?: (dayIndex: number | null) => void;
  /** Called when user wants to mark all blocks on this day as complete */
  onMarkDayComplete?: (dayIndex: number) => void;
  /** Day start time in minutes from midnight (for dimming hours outside day boundaries) */
  dayStartMinutes?: number;
  /** Day end time in minutes from midnight (for dimming hours outside day boundaries) */
  dayEndMinutes?: number;
  /** Whether day boundaries are enabled */
  dayBoundariesEnabled?: boolean;
  /** How to display hours outside day boundaries: 'dimmed' */
  dayBoundariesDisplay?: "dimmed";
}

export interface WeekViewProps
  extends CalendarEventCallbacks, ExternalDropCallbacks {
  weekDates: Date[];
  showHourLabels?: boolean;
  /** Events to display (required - always passed from parent Calendar) */
  events: CalendarEvent[];
  setBlockStyle?: BlockStyle;
  /** Key that triggers scroll-to-current-time when changed */
  scrollToCurrentTimeKey?: string | number;
  /**
   * Density preset controlling vertical spacing (default: "default")
   * @deprecated Use zoom instead
   */
  density?: CalendarDensity;
  /** Zoom level as percentage (50-150, default: 100). Overrides density if provided. */
  zoom?: number;
  /** Which day the week starts on (0 = Sunday, 1 = Monday, default: 1) */
  weekStartsOn?: WeekStartDay;
  /** Called when a task is dropped on a day header to set a deadline */
  onDeadlineDrop?: (dayIndex: number, date: string) => void;
  /** Map of ISO date string to array of deadline tasks for that day */
  deadlines?: Map<string, import("@/lib/unified-schedule").DeadlineTask[]>;
  /** Map of ISO date string to array of all-day external events for that day */
  allDayEvents?: Map<string, import("./deadline-tray").AllDayEvent[]>;
  /** Called when a deadline task's completion status is toggled */
  onDeadlineToggleComplete?: (goalId: string, taskId: string) => void;
  /** Called when a deadline is removed (unassigned) */
  onDeadlineUnassign?: (goalId: string, taskId: string) => void;
  /** Called when mouse enters/leaves a deadline pill (for keyboard shortcuts) */
  onDeadlineHover?: (
    deadline: import("@/lib/unified-schedule").DeadlineTask | null,
  ) => void;
  /** Called when an all-day event's completion status is toggled */
  onToggleAllDayEvent?: (eventId: string) => void;
  /** Called when mouse enters/leaves an all-day event pill */
  onAllDayEventHover?: (event: import("./deadline-tray").AllDayEvent | null) => void;
  /** Called when mouse enters/leaves a day header (for keyboard shortcuts) */
  onDayHeaderHover?: (dayIndex: number | null) => void;
  /** Called when user wants to mark all blocks on a day as complete */
  onMarkDayComplete?: (dayIndex: number) => void;
  /** Day start time in minutes from midnight (for dimming hours outside day boundaries) */
  dayStartMinutes?: number;
  /** Day end time in minutes from midnight (for dimming hours outside day boundaries) */
  dayEndMinutes?: number;
  /** Whether day boundaries are enabled */
  dayBoundariesEnabled?: boolean;
  /** How to display hours outside day boundaries: 'dimmed' */
  dayBoundariesDisplay?: "dimmed";
}

/**
 * Props for the TimeColumn component - a shared component for rendering
 * a single day column with events, used by both DayView and WeekView.
 */
export interface TimeColumnProps
  extends CalendarEventCallbacks, ExternalDropCallbacks {
  /** The day index for this column (0 = Monday, 6 = Sunday) */
  dayIndex: number;
  /** Whether this day is today (for highlighting) */
  isToday?: boolean;
  /** Event segments to render in this column */
  segments: EventDaySegment[];
  /** Width of the day column in pixels (for drag calculations) */
  dayColumnWidth: number;
  /** Pixels per minute for positioning calculations (derived from density) */
  pixelsPerMinute: number;
  /** Override style for all blocks */
  setBlockStyle?: BlockStyle;
  /** Whether a drag-to-create is in progress */
  isCreatingBlock?: boolean;
  /** Preview for drag-to-create */
  createPreview?: {
    dayIndex: number;
    startMinutes: number;
    durationMinutes: number;
  } | null;
  /** Minimum day index for drag constraints (DayView uses this) */
  minDayIndex?: number;
  /** Maximum day index for drag constraints (DayView uses this) */
  maxDayIndex?: number;
  /** Pointer down handler for drag-to-create */
  onPointerDown?: (
    e: React.PointerEvent,
    dayIndex: number,
    minutes: number,
  ) => void;
  /** Day start time in minutes from midnight (for dimming hours outside day boundaries) */
  dayStartMinutes?: number;
  /** Day end time in minutes from midnight (for dimming hours outside day boundaries) */
  dayEndMinutes?: number;
  /** Whether day boundaries are enabled */
  dayBoundariesEnabled?: boolean;
  /** How to display hours outside day boundaries: 'dimmed' */
  dayBoundariesDisplay?: "dimmed";
}

// Helper to convert BlockStyle to BlockStatus
export function blockStyleToStatus(style: BlockStyle): BlockStatus {
  return style;
}

// ============================================================================
// Status-based helpers
// ============================================================================

/**
 * Check if a block can be marked complete/incomplete.
 * All blocks can be marked complete.
 */
export function canMarkComplete(status: BlockStatus | undefined): boolean {
  return true;
}

/**
 * Determine the status for a pasted or duplicated block.
 * Completed blocks become planned when pasted.
 */
export function statusOnPaste(
  sourceStatus: BlockStatus | undefined,
): BlockStatus {
  if (sourceStatus === "completed") return "planned";
  return sourceStatus ?? "planned";
}

// ============================================================================
// Overnight block helpers
// ============================================================================

/** Maximum duration for events (just under 48 hours, spanning at most 2 days) */
export const MAX_EVENT_DURATION_MINUTES = 2879;

/**
 * Check if an event spans across midnight into the next day.
 */
export function isOvernightEvent(event: CalendarEvent): boolean {
  return event.startMinutes + event.durationMinutes > 1440;
}

/**
 * Get the day index where the event ends (0-6).
 * For overnight events, this is the next day (with week wrapping).
 * Note: This uses modulo arithmetic and is mainly for positioning within a week.
 * For cross-week matching, use getNextDayDate() with actual dates instead.
 */
export function getEventEndDayIndex(event: CalendarEvent): number {
  if (!isOvernightEvent(event)) return event.dayIndex;
  return (event.dayIndex + 1) % 7;
}

/**
 * Get the ISO date string for the day after the given date.
 * Used for calculating the actual end date of overnight events.
 */
export function getNextDayDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  date.setDate(date.getDate() + 1);
  // Use local date parts instead of toISOString() to avoid timezone conversion issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get the end time in minutes within the end day (0-1440).
 * For overnight events, this is the time on day 2.
 */
export function getEventEndMinutes(event: CalendarEvent): number {
  const rawEnd = event.startMinutes + event.durationMinutes;
  return isOvernightEvent(event) ? rawEnd - 1440 : rawEnd;
}

/**
 * Clamp event duration to the maximum allowed (2 days).
 */
export function clampEventDuration(durationMinutes: number): number {
  return Math.min(durationMinutes, MAX_EVENT_DURATION_MINUTES);
}

/**
 * Segment position for styling overnight blocks.
 * - 'only': Single-day event (full rounded corners)
 * - 'start': First day of overnight event (rounded top, flat bottom)
 * - 'end': Second day of overnight event (flat top, rounded bottom)
 */
export type SegmentPosition = "only" | "start" | "end";

/**
 * Layout information for positioning overlapping events.
 * Calculated by the overlap layout algorithm.
 */
export interface OverlapLayout {
  /** 0-indexed column position within the overlap group */
  column: number;
  /** Total number of concurrent columns in this segment's time range */
  totalColumns: number;
  /** Calculated left position as a percentage (0-100) */
  leftPercent: number;
  /** Calculated width as a percentage (0-100) */
  widthPercent: number;
}

/**
 * Represents a visible segment of an event for a specific day.
 * Overnight events produce two segments (one per day).
 */
export interface EventDaySegment {
  event: CalendarEvent;
  dayIndex: number;
  startMinutes: number; // 0-1440 within this day
  endMinutes: number; // 0-1440 within this day
  position: SegmentPosition;
  /** Layout positioning for overlapping events */
  layout?: OverlapLayout;
}

/**
 * Get the day index (0-6, Monday-start) from an ISO date string.
 * Used internally for segment positioning.
 */
function getDayIndexFromDateInternal(date: string): number {
  const d = new Date(date + "T00:00:00");
  const day = d.getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday-start (Mon=0, Sun=6)
}

/**
 * Get all event segments that should be rendered for a specific day.
 * Single-day events produce one segment; overnight events may produce
 * a 'start' segment on day 1 and/or an 'end' segment on day 2.
 *
 * @param events - Array of calendar events to filter
 * @param targetDate - ISO date string (e.g., "2026-01-20") for the target day
 */
export function getSegmentsForDay(
  events: CalendarEvent[],
  targetDate: string,
): EventDaySegment[] {
  const segments: EventDaySegment[] = [];
  const targetDayIndex = getDayIndexFromDateInternal(targetDate);

  for (const event of events) {
    const isOvernight = isOvernightEvent(event);

    // Check if this day is the start day (match by exact date)
    if (event.date === targetDate) {
      segments.push({
        event,
        dayIndex: targetDayIndex,
        startMinutes: event.startMinutes,
        endMinutes: isOvernight
          ? 1440
          : event.startMinutes + event.durationMinutes,
        position: isOvernight ? "start" : "only",
      });
    }
    // Check if this day is the end day (for overnight events only)
    // Compare actual dates to avoid cross-week confusion
    else if (isOvernight && getNextDayDate(event.date) === targetDate) {
      segments.push({
        event,
        dayIndex: targetDayIndex,
        startMinutes: 0,
        endMinutes: getEventEndMinutes(event),
        position: "end",
      });
    }
  }

  return segments;
}
