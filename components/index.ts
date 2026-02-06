/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public entry point for the SuperOS UI component library.
 *
 * This file defines the stable, supported API surface exposed to consumers
 * of the SuperOS UI layer. It aggregates and re-exports core components,
 * hooks, utilities, shared types, and UI primitives in a structured,
 * discoverable way.
 *
 * -----------------------------------------------------------------------------
 * STRUCTURE
 * -----------------------------------------------------------------------------
 * Exports are intentionally grouped by domain to reflect product concepts:
 * - Core product components (Calendar, Backlog, Block, Focus, Goals, Shell)
 * - Hooks and utilities tied to those domains
 * - Shared domain types sourced from a single canonical location
 * - Cross-cutting systems (drag and drop)
 * - Reusable UI primitives (layout, forms, overlays, mobile)
 * - Settings-related components
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Acts as a “barrel file” to simplify imports and enforce consistency.
 * - Serves as documentation for the component architecture and boundaries.
 * - Only exports intentionally public components and types.
 * - Internal or experimental modules should not be surfaced here.
 *
 * -----------------------------------------------------------------------------
 * CONSUMPTION GUIDELINES
 * -----------------------------------------------------------------------------
 * - App code and external consumers should import exclusively from this file.
 * - Direct imports from subfolders are discouraged unless explicitly intended.
 *
 * -----------------------------------------------------------------------------
 * NO RUNTIME LOGIC
 * -----------------------------------------------------------------------------
 * - This file contains exports only.
 * - No side effects, state, or execution should be introduced here.
 */

// -----------------------------------------------------------------------------
// Core Components
// -----------------------------------------------------------------------------

// Calendar
export { Calendar } from "./calendar";
export type {
  CalendarProps,
  CalendarEvent,
  CalendarView,
  CalendarDensity,
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
  GoalItem,
  EssentialItem,
  BacklogMode,
  NewGoalData,
  NewEssentialData,
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
  WeeklyAnalyticsItem,
} from "./weekly-analytics";

// Focus Mode
export {
  FocusTimer,
  StartFocusButton,
  FocusIndicator,
  FocusSidebarContent,
} from "./focus";
export type {
  FocusTimerProps,
  StartFocusButtonProps,
  FocusIndicatorProps,
  FocusSidebarContentProps,
} from "./focus";

// Shell (integrated application frame)
export { ShellContentComponent, useShellState } from "./shell";
export type {
  ShellContentProps,
  ShellContentComponentProps,
  UseShellStateOptions,
  UseShellStateReturn,
} from "./shell";

// Goal Detail
export {
  GoalDetail,
  GoalDetailHeader,
  GoalDetailMilestones,
  GoalDetailTasks,
} from "./goal-detail";
export type {
  GoalDetailProps,
  GoalDetailHeaderProps,
  GoalDetailMilestonesProps,
  GoalDetailTasksProps,
} from "./goal-detail";

// -----------------------------------------------------------------------------
// Shared Types (single source of truth from lib/types)
// -----------------------------------------------------------------------------

export type {
  BlockType,
  BlockStatus,
  IconComponent,
  LifeArea,
  GoalIconOption,
} from "@/lib/types";

// -----------------------------------------------------------------------------
// Drag and Drop System
// -----------------------------------------------------------------------------

export {
  DragProvider,
  DragGhost,
  useDragContext,
  useDragContextOptional,
} from "./drag";
export type {
  DragState,
  DragContextValue,
  DragItem,
  DropPosition,
} from "./drag";

// -----------------------------------------------------------------------------
// UI Primitives (re-exported for convenience)
// -----------------------------------------------------------------------------

// Layout
export { Shell, ShellToolbar, ShellContent } from "./ui/shell";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
export { Separator } from "./ui/separator";

// Forms
export { Button, buttonVariants } from "./ui/button";
export { Input } from "./ui/input";
export { Textarea } from "./ui/textarea";
export { Label } from "./ui/label";
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from "./ui/field";
export {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "./ui/input-group";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./ui/select";
export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
} from "./ui/combobox";
export { TimeInput, TimeRangeRow } from "./ui/time-input";
export type { TimeInputProps, TimeRangeRowProps } from "./ui/time-input";

// Display
export { Badge, badgeVariants } from "./ui/badge";
export { SubtaskRow } from "./ui/subtask-row";

// Overlays & Menus
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./ui/context-menu";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./ui/dropdown-menu";
export { KeyboardShortcuts } from "./ui/keyboard-shortcuts";
export type { KeyboardShortcutsProps } from "./ui/keyboard-shortcuts";

// Mobile/Responsive
export { BottomSheet } from "./ui/bottom-sheet";
export type { BottomSheetProps } from "./ui/bottom-sheet";
export { FullScreenOverlay } from "./ui/full-screen-overlay";
export type { FullScreenOverlayProps } from "./ui/full-screen-overlay";

// -----------------------------------------------------------------------------
// Settings Components
// -----------------------------------------------------------------------------

export { LifeAreaCreatorModal, LifeAreaManagerModal } from "./settings";
export type {
  LifeAreaCreatorModalProps,
  LifeAreaManagerModalProps,
} from "./settings";
