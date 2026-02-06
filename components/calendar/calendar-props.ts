import type { BlockColor } from "@/components/block";
import type { WeekStartDay } from "@/lib/preferences";
import type { CalendarEvent, HoverPosition } from "@/lib/unified-schedule";
import type {
  CalendarDensity,
  CalendarView,
  BlockStyle,
  BlockStatus,
} from "./calendar-constants";
import type { EventDaySegment } from "./calendar-segments";

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
  /** Map of ISO date string to array of goal deadlines for that day */
  goalDeadlines?: Map<string, import("@/lib/unified-schedule").DeadlineGoal[]>;
  /** Map of ISO date string to array of milestone deadlines for that day */
  milestoneDeadlines?: Map<string, import("@/lib/unified-schedule").DeadlineMilestone[]>;
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
  /** Called when a goal deadline pill is clicked (to open goal detail) */
  onGoalDeadlineClick?: (goalId: string) => void;
  /** Called when a milestone's completion status is toggled */
  onToggleMilestoneComplete?: (goalId: string, milestoneId: string) => void;
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
  /** Map of ISO date string to array of goal deadlines for that day */
  goalDeadlines?: Map<string, import("@/lib/unified-schedule").DeadlineGoal[]>;
  /** Map of ISO date string to array of milestone deadlines for that day */
  milestoneDeadlines?: Map<string, import("@/lib/unified-schedule").DeadlineMilestone[]>;
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
  /** Called when a goal deadline pill is clicked (to open goal detail) */
  onGoalDeadlineClick?: (goalId: string) => void;
  /** Called when a milestone's completion status is toggled */
  onToggleMilestoneComplete?: (goalId: string, milestoneId: string) => void;
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
