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
  NewGoalData,
  Milestone,
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

// Focus Mode
export { FocusTimer, StartFocusButton, FocusIndicator, FocusSidebarContent } from "./focus";
export type {
  FocusTimerProps,
  StartFocusButtonProps,
  FocusIndicatorProps,
  FocusSidebarContentProps,
} from "./focus";

// -----------------------------------------------------------------------------
// Drag and Drop System
// -----------------------------------------------------------------------------

export { DragProvider, DragGhost, useDragContext, useDragContextOptional } from "./drag";
export type { DragState, DragContextValue, DragItem, DropPosition } from "./drag";

// -----------------------------------------------------------------------------
// UI Primitives (re-exported for convenience)
// -----------------------------------------------------------------------------

// Layout
export { Shell, ShellToolbar, ShellContent } from "./ui/shell";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./ui/card";
export { Separator } from "./ui/separator";

// Forms
export { Button, buttonVariants } from "./ui/button";
export { Input } from "./ui/input";
export { Textarea } from "./ui/textarea";
export { Label } from "./ui/label";
export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle } from "./ui/field";
export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "./ui/input-group";
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from "./ui/select";
export { Combobox, ComboboxTrigger, ComboboxContent, ComboboxInput, ComboboxEmpty, ComboboxGroup, ComboboxItem, ComboboxSeparator } from "./ui/combobox";

// Display
export { Badge, badgeVariants } from "./ui/badge";
export { SubtaskRow } from "./ui/subtask-row";

// Overlays & Menus
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "./ui/context-menu";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "./ui/dropdown-menu";
