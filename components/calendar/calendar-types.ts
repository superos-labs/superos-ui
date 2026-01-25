import type { BlockColor, BlockStatus } from "@/components/block";

// Re-export BlockStatus for convenience
export type { BlockStatus };

// Constants
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Fixed grid height in pixels (min-h-[1536px] = 1536px for 24 hours)
export const GRID_HEIGHT_PX = 1536;
export const PIXELS_PER_MINUTE = GRID_HEIGHT_PX / (24 * 60);

// Snap to 15-minute intervals for precise click positioning
export const SNAP_MINUTES = 15;

// Types
export type CalendarView = "week" | "day";
export type CalendarMode = "schedule" | "blueprint";
export type BlockStyle = "planned" | "completed" | "blueprint";

export interface CalendarEvent {
  id: string;
  title: string;
  dayIndex: number; // 0 = Monday, 6 = Sunday
  startMinutes: number; // Minutes from midnight (0-1440)
  durationMinutes: number;
  color: BlockColor;
  taskCount?: number;
  status?: BlockStatus; // "planned" | "completed" | "blueprint"
}

export interface CalendarProps {
  view?: CalendarView;
  mode?: CalendarMode;
  selectedDate?: Date;
  showHourLabels?: boolean;
  headerIsVisible?: boolean;
  /** Events to display on the calendar */
  events?: CalendarEvent[];
  setBlockStyle?: BlockStyle;
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
  onGridPositionHover?: (
    position: { dayIndex: number; startMinutes: number } | null,
  ) => void;
}

export interface CalendarDayHeaderProps {
  day: string;
  date: number;
  isToday?: boolean;
  showBorder?: boolean;
  className?: string;
}

export interface DayViewProps {
  selectedDate: Date;
  showHourLabels?: boolean;
  headerIsVisible?: boolean;
  events?: CalendarEvent[];
  mode?: CalendarMode;
  setBlockStyle?: BlockStyle;
  onEventResize?: (
    eventId: string,
    newStartMinutes: number,
    newDurationMinutes: number,
  ) => void;
  onEventResizeEnd?: (eventId: string) => void;
  onEventDragEnd?: (
    eventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onEventDuplicate?: (
    sourceEventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onGridDoubleClick?: (dayIndex: number, startMinutes: number) => void;
  onGridDragCreate?: (
    dayIndex: number,
    startMinutes: number,
    durationMinutes: number,
  ) => void;
  onEventCopy?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventStatusChange?: (eventId: string, status: BlockStatus) => void;
  onEventPaste?: (dayIndex: number, startMinutes: number) => void;
  hasClipboardContent?: boolean;
  onEventHover?: (event: CalendarEvent | null) => void;
  onGridPositionHover?: (
    position: { dayIndex: number; startMinutes: number } | null,
  ) => void;
}

export interface WeekViewProps {
  weekDates: Date[];
  showHourLabels?: boolean;
  events?: CalendarEvent[];
  mode?: CalendarMode;
  setBlockStyle?: BlockStyle;
  onEventResize?: (
    eventId: string,
    newStartMinutes: number,
    newDurationMinutes: number,
  ) => void;
  onEventResizeEnd?: (eventId: string) => void;
  onEventDragEnd?: (
    eventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onEventDuplicate?: (
    sourceEventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onGridDoubleClick?: (dayIndex: number, startMinutes: number) => void;
  onGridDragCreate?: (
    dayIndex: number,
    startMinutes: number,
    durationMinutes: number,
  ) => void;
  onEventCopy?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventStatusChange?: (eventId: string, status: BlockStatus) => void;
  onEventPaste?: (dayIndex: number, startMinutes: number) => void;
  hasClipboardContent?: boolean;
  onEventHover?: (event: CalendarEvent | null) => void;
  onGridPositionHover?: (
    position: { dayIndex: number; startMinutes: number } | null,
  ) => void;
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
 * Blueprint blocks cannot be marked complete.
 */
export function canMarkComplete(status: BlockStatus | undefined): boolean {
  return status !== "blueprint";
}

/**
 * Determine the status for a pasted or duplicated block.
 * Completed and blueprint blocks become planned when pasted.
 */
export function statusOnPaste(sourceStatus: BlockStatus | undefined): BlockStatus {
  if (sourceStatus === "completed") return "planned";
  if (sourceStatus === "blueprint") return "planned";
  return sourceStatus ?? "planned";
}

/**
 * Check if an event should be visible in the given calendar mode.
 * - Schedule mode: shows planned and completed, hides blueprint
 * - Blueprint mode: shows only blueprint blocks
 */
export function isVisibleInMode(
  status: BlockStatus | undefined,
  mode: CalendarMode,
): boolean {
  if (mode === "blueprint") return status === "blueprint";
  // Schedule mode: show planned and completed, hide blueprint
  return status !== "blueprint";
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
 */
export function getEventEndDayIndex(event: CalendarEvent): number {
  if (!isOvernightEvent(event)) return event.dayIndex;
  return (event.dayIndex + 1) % 7;
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
 * Represents a visible segment of an event for a specific day.
 * Overnight events produce two segments (one per day).
 */
export interface EventDaySegment {
  event: CalendarEvent;
  dayIndex: number;
  startMinutes: number; // 0-1440 within this day
  endMinutes: number; // 0-1440 within this day
  position: SegmentPosition;
}

/**
 * Get all event segments that should be rendered for a specific day.
 * Single-day events produce one segment; overnight events may produce
 * a 'start' segment on day 1 and/or an 'end' segment on day 2.
 */
export function getSegmentsForDay(
  events: CalendarEvent[],
  targetDayIndex: number,
  mode: CalendarMode = "schedule",
): EventDaySegment[] {
  const segments: EventDaySegment[] = [];

  for (const event of events) {
    // Skip events not visible in current mode
    if (!isVisibleInMode(event.status, mode)) continue;

    const isOvernight = isOvernightEvent(event);
    const endDayIndex = getEventEndDayIndex(event);

    // Check if this day is the start day
    if (event.dayIndex === targetDayIndex) {
      segments.push({
        event,
        dayIndex: targetDayIndex,
        startMinutes: event.startMinutes,
        endMinutes: isOvernight ? 1440 : event.startMinutes + event.durationMinutes,
        position: isOvernight ? "start" : "only",
      });
    }
    // Check if this day is the end day (for overnight events only)
    else if (isOvernight && endDayIndex === targetDayIndex) {
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
