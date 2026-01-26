// =============================================================================
// Public API for the SuperOS UI component library
// =============================================================================

// -----------------------------------------------------------------------------
// Core Components
// -----------------------------------------------------------------------------

// Calendar
export { Calendar } from "./calendar";
export type { 
  CalendarProps, 
  CalendarEvent, 
  CalendarView, 
  CalendarMode,
  CalendarDensity,
  BlockStatus,
  BlockType,
  BlockStyle,
  CalendarEventCallbacks,
  ExternalDropCallbacks,
  HoverPosition,
  ExternalDragPreview,
} from "./calendar";

// Calendar hooks
export { 
  useCalendarInteractions,
  useCalendarClipboard,
  useCalendarKeyboard,
  useDeadlineKeyboard,
} from "./calendar";

// Calendar utilities (for advanced use cases)
export { 
  getWeekDates,
  formatHour,
  formatFullDate,
  formatEventTime,
} from "./calendar";

// Backlog
export { Backlog } from "./backlog";
export type { 
  BacklogProps, 
  BacklogItem, 
  BacklogTask,
  BacklogMode,
  GoalDisplayMode,
  NewGoalData,
} from "./backlog";

// Block
export { Block, BlockSidebar } from "./block";
export type { 
  BlockProps, 
  BlockSidebarProps, 
  BlockSidebarData,
  BlockColor,
  BlockGoalTask,
  BlockSubtask,
} from "./block";

// Weekly Analytics
export { WeeklyAnalytics } from "./weekly-analytics";
export type { 
  WeeklyAnalyticsProps, 
  WeeklyAnalyticsItem 
} from "./weekly-analytics";

// -----------------------------------------------------------------------------
// Drag and Drop System
// -----------------------------------------------------------------------------

export { DragProvider, DragGhost, useDragContext, useDragContextOptional } from "./drag";
export type { DragState, DragContextValue, DragItem, DropPosition } from "./drag";

// -----------------------------------------------------------------------------
// UI Primitives (re-exported for convenience)
// -----------------------------------------------------------------------------

export { Shell, ShellToolbar, ShellContent } from "./ui/shell";
export { Button } from "./ui/button";
export { Input } from "./ui/input";
export { Card } from "./ui/card";
