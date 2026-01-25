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
