/**
 * Type definitions for the Shell component.
 * 
 * The Shell is the top-level application frame that orchestrates
 * calendar, backlog, analytics, focus mode, and planning features.
 */

import type { CalendarEvent, HoverPosition, CalendarEventCallbacks } from "@/components/calendar";
import type { BacklogMode, NewGoalData } from "@/components/backlog";
import type {
  ScheduleGoal,
  ScheduleEssential,
  ScheduleTask,
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  DeadlineTask,
  UseUnifiedScheduleReturn,
} from "@/lib/unified-schedule";
import type { Blueprint } from "@/lib/blueprint";
import type { WeeklyPlan, IntentionProgress } from "@/lib/weekly-planning";
import type { ActiveFocusSession } from "@/lib/focus";
import type { GoalColor } from "@/lib/colors";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { WeekStartDay, ProgressMetric, CalendarZoom } from "@/lib/preferences";

// =============================================================================
// Core Shell Props
// =============================================================================

/**
 * Props for the ShellContent component.
 * This is the core orchestrated component that renders the full application shell.
 */
export interface ShellContentProps {
  // -------------------------------------------------------------------------
  // Data
  // -------------------------------------------------------------------------
  /** Goals with their tasks */
  goals: ScheduleGoal[];
  /** Enabled essentials for display */
  essentials: ScheduleEssential[];
  /** All available essentials (for editing) */
  allEssentials: ScheduleEssential[];
  /** Calendar events for the current week */
  events: CalendarEvent[];
  /** Week dates array (7 dates) */
  weekDates: Date[];
  /** Deadlines for the current week (Map of date string to deadline tasks) */
  weekDeadlines: Map<string, DeadlineTask[]>;

  // -------------------------------------------------------------------------
  // Selection State
  // -------------------------------------------------------------------------
  /** Currently selected calendar event ID */
  selectedEventId: string | null;
  /** Currently selected goal ID (for goal detail view) */
  selectedGoalId: string | null;
  /** Currently hovered event (for keyboard shortcuts) */
  hoveredEvent: CalendarEvent | null;
  /** Hover position data */
  hoverPosition: HoverPosition | null;
  /** Currently hovered day header index (for keyboard shortcuts) */
  hoveredDayIndex: number | null;

  // -------------------------------------------------------------------------
  // Essential Management
  // -------------------------------------------------------------------------
  /** IDs of enabled essentials */
  enabledEssentialIds: Set<string>;
  /** Draft enabled IDs during editing (null when not editing) */
  draftEnabledEssentialIds: Set<string> | null;
  /** IDs of mandatory essentials that cannot be disabled */
  mandatoryEssentialIds: Set<string>;
  /** Toggle an essential's enabled state */
  onToggleEssentialEnabled: (essentialId: string) => void;
  /** Start editing essentials */
  onStartEditingEssentials: () => void;
  /** Save essential changes */
  onSaveEssentialChanges: () => void;
  /** Cancel essential changes */
  onCancelEssentialChanges: () => void;

  // -------------------------------------------------------------------------
  // Goal CRUD
  // -------------------------------------------------------------------------
  /** Add a new goal */
  onAddGoal: (goal: ScheduleGoal) => void;
  /** Delete a goal */
  onDeleteGoal: (goalId: string) => void;
  /** Update a goal */
  onUpdateGoal: (goalId: string, updates: Partial<ScheduleGoal>) => void;

  // -------------------------------------------------------------------------
  // Task CRUD
  // -------------------------------------------------------------------------
  /** Toggle task completion */
  onToggleTaskComplete: (goalId: string, taskId: string) => void;
  /** Add a task to a goal (returns the new task ID) */
  onAddTask: (goalId: string, label: string) => string;
  /** Update a task */
  onUpdateTask: (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => void;
  /** Delete a task */
  onDeleteTask: (goalId: string, taskId: string) => void;

  // -------------------------------------------------------------------------
  // Subtask CRUD
  // -------------------------------------------------------------------------
  /** Add a subtask */
  onAddSubtask: (goalId: string, taskId: string, label: string) => void;
  /** Toggle subtask completion */
  onToggleSubtaskComplete: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Update a subtask */
  onUpdateSubtask: (goalId: string, taskId: string, subtaskId: string, label: string) => void;
  /** Delete a subtask */
  onDeleteSubtask: (goalId: string, taskId: string, subtaskId: string) => void;

  // -------------------------------------------------------------------------
  // Milestone CRUD
  // -------------------------------------------------------------------------
  /** Add a milestone (returns the new milestone ID) */
  onAddMilestone: (goalId: string, label: string) => string;
  /** Toggle milestone completion */
  onToggleMilestoneComplete: (goalId: string, milestoneId: string) => void;
  /** Update a milestone */
  onUpdateMilestone: (goalId: string, milestoneId: string, label: string) => void;
  /** Delete a milestone */
  onDeleteMilestone: (goalId: string, milestoneId: string) => void;

  // -------------------------------------------------------------------------
  // Deadline Management
  // -------------------------------------------------------------------------
  /** Clear a task's deadline */
  onClearTaskDeadline: (goalId: string, taskId: string) => void;

  // -------------------------------------------------------------------------
  // Stats Accessors
  // -------------------------------------------------------------------------
  /** Get stats for a goal */
  getGoalStats: (goalId: string) => GoalStats;
  /** Get stats for an essential */
  getEssentialStats: (essentialId: string) => GoalStats;
  /** Get schedule info for a task */
  getTaskSchedule: (taskId: string) => TaskScheduleInfo | null;
  /** Get deadline info for a task */
  getTaskDeadline: (taskId: string) => TaskDeadlineInfo | null;

  // -------------------------------------------------------------------------
  // Calendar Handlers
  // -------------------------------------------------------------------------
  /** Calendar event handlers (spread onto Calendar) */
  calendarHandlers: UseUnifiedScheduleReturn["calendarHandlers"];

  // -------------------------------------------------------------------------
  // Event Management
  // -------------------------------------------------------------------------
  /** Add a calendar event */
  onAddEvent: (event: CalendarEvent) => void;
  /** Update a calendar event */
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  /** Assign a task to a block */
  onAssignTaskToBlock: (blockId: string, taskId: string) => void;
  /** Unassign a task from a block */
  onUnassignTaskFromBlock: (blockId: string, taskId: string) => void;

  // -------------------------------------------------------------------------
  // Drop Handling
  // -------------------------------------------------------------------------
  /** Handle drops from backlog onto calendar */
  onDrop: (item: import("@/lib/drag-types").DragItem, position: import("@/lib/drag-types").DropPosition, weekDates: Date[]) => void;

  // -------------------------------------------------------------------------
  // Focus Mode
  // -------------------------------------------------------------------------
  /** Current focus session (null if not focusing) */
  focusSession: ActiveFocusSession | null;
  /** Whether focus timer is running */
  focusIsRunning: boolean;
  /** Elapsed focus time in milliseconds */
  focusElapsedMs: number;
  /** Start a focus session */
  onStartFocus: (blockId: string, title: string, color: GoalColor) => void;
  /** Pause focus session */
  onPauseFocus: () => void;
  /** Resume focus session */
  onResumeFocus: () => void;
  /** End focus session */
  onEndFocus: () => void;

  // -------------------------------------------------------------------------
  // Blueprint & Planning
  // -------------------------------------------------------------------------
  /** User's weekly blueprint (null if not set) */
  blueprint: Blueprint | null;
  /** Whether user has a blueprint */
  hasBlueprint: boolean;
  /** Save blueprint */
  onSaveBlueprint: (blueprint: Blueprint) => void;
  /** Current week's plan (null if not planned) */
  currentWeekPlan: WeeklyPlan | null;
  /** Save weekly plan */
  onSaveWeeklyPlan: (plan: WeeklyPlan) => void;
  /** Get progress for an intention */
  getIntentionProgress: (goalId: string) => IntentionProgress | null;

  // -------------------------------------------------------------------------
  // Preferences
  // -------------------------------------------------------------------------
  /** Day the week starts on (0 = Sunday, 1 = Monday) */
  weekStartsOn: WeekStartDay;
  /** Set week start day */
  onWeekStartsOnChange: (day: WeekStartDay) => void;
  /** Progress metric to display */
  progressMetric: ProgressMetric;
  /** Set progress metric */
  onProgressMetricChange: (metric: ProgressMetric) => void;
  /** Calendar zoom level (50-150, default: 100) */
  calendarZoom: CalendarZoom;
  /** Set calendar zoom level */
  onCalendarZoomChange: (zoom: CalendarZoom) => void;

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  /** Currently selected date */
  selectedDate: Date;
  /** Go to previous week */
  onPreviousWeek: () => void;
  /** Go to next week */
  onNextWeek: () => void;
  /** Go to today */
  onToday: () => void;

  // -------------------------------------------------------------------------
  // Reference Data
  // -------------------------------------------------------------------------
  /** Available life areas */
  lifeAreas: LifeArea[];
  /** Available goal icons */
  goalIcons: GoalIconOption[];
}

// =============================================================================
// Shell State Hook Types
// =============================================================================

/**
 * Options for the useShellState hook.
 */
export interface UseShellStateOptions {
  /** Initial goals */
  initialGoals: ScheduleGoal[];
  /** All available essentials */
  allEssentials: ScheduleEssential[];
  /** Initial enabled essential IDs (defaults to all) */
  initialEnabledEssentialIds?: string[];
  /** Initial calendar events */
  initialEvents: CalendarEvent[];
  /** Life areas for goal creation */
  lifeAreas: LifeArea[];
  /** Goal icons for goal creation */
  goalIcons: GoalIconOption[];
}

/**
 * Return type for the useShellState hook.
 * Provides all the state and handlers needed by ShellContent.
 */
export interface UseShellStateReturn extends ShellContentProps {}

// =============================================================================
// Layout State Types
// =============================================================================

/**
 * UI layout state managed by the shell.
 */
export interface ShellLayoutState {
  /** Whether to show the Plan Week button */
  showPlanWeek: boolean;
  /** Whether to show the calendar */
  showCalendar: boolean;
  /** Whether to show the left sidebar (backlog) */
  showSidebar: boolean;
  /** Whether to show the right sidebar (analytics) */
  showRightSidebar: boolean;
  /** Whether to show tasks in the backlog */
  showTasks: boolean;
  /** Whether to show the inspiration gallery */
  showInspirationGallery: boolean;
  /** Current backlog mode */
  backlogMode: BacklogMode;
  /** Whether planning mode is active */
  isPlanningMode: boolean;
  /** Selected event ID */
  selectedEventId: string | null;
  /** Selected goal ID */
  selectedGoalId: string | null;
  /** Goal notes (keyed by goal ID) */
  goalNotes: Record<string, string>;
}
