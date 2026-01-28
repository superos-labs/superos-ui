/**
 * Types for the unified schedule system.
 * Single source of truth for schedule-related type definitions.
 */

import type { GoalColor } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";
import type { DragItem, DropPosition } from "@/lib/drag-types";
import type {
  CalendarEvent,
  BlockStatus,
  HoverPosition,
} from "@/components/calendar";

// ============================================================================
// Progress Indicator Types
// ============================================================================

/**
 * How progress is measured for a goal.
 * Determines what "100%" means in weekly analytics.
 */
export type ProgressIndicator =
  | "completed-time" // Hours from completed blocks (default)
  | "focused-time" // Actual focus session time
  | "blocks-completed" // Count of completed blocks
  | "days-with-blocks" // Days with ≥1 completed block
  | "specific-tasks"; // Named tasks to complete

/**
 * Human-readable labels for progress indicators.
 */
export const PROGRESS_INDICATOR_LABELS: Record<ProgressIndicator, string> = {
  "completed-time": "Completed time",
  "focused-time": "Focused time",
  "blocks-completed": "Blocks completed",
  "days-with-blocks": "Days practiced",
  "specific-tasks": "Specific tasks",
};

/**
 * Unit labels for progress indicators.
 */
export const PROGRESS_INDICATOR_UNITS: Record<ProgressIndicator, string> = {
  "completed-time": "hours",
  "focused-time": "hours",
  "blocks-completed": "blocks",
  "days-with-blocks": "days",
  "specific-tasks": "tasks",
};

// ============================================================================
// Core Data Types
// ============================================================================

/** Subtask within a task */
export interface Subtask {
  id: string;
  label: string;
  completed: boolean;
}

/** Milestone within a goal (ordered sequential steps) */
export interface Milestone {
  id: string;
  label: string;
  completed: boolean;
}

/** Task within a goal */
export interface ScheduleTask {
  id: string;
  label: string;
  completed?: boolean;
  /** Reference to the calendar block if scheduled (mutually exclusive with deadline) */
  scheduledBlockId?: string;
  /** ISO date string for deadline (e.g., "2026-01-25") - mutually exclusive with scheduledBlockId */
  deadline?: string;
  /** Optional description for additional context */
  description?: string;
  /** Optional subtasks (simple checkboxes, not schedulable) */
  subtasks?: Subtask[];
}

/** Goal in the backlog */
export interface ScheduleGoal {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** Life area this goal belongs to */
  lifeAreaId: string;
  /** Ordered milestones (sequential steps toward the goal) */
  milestones?: Milestone[];
  /** Whether milestones are enabled for this goal (defaults to true if milestones exist) */
  milestonesEnabled?: boolean;
  tasks?: ScheduleTask[];
  /** How progress is measured for this goal (default: 'completed-time') */
  progressIndicator?: ProgressIndicator;
}

/** Essential in the backlog (simpler than goals, no tasks) */
export interface ScheduleEssential {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

// ============================================================================
// Computed/Derived Types
// ============================================================================

/** Computed statistics for a goal (derived from calendar events) */
export interface GoalStats {
  /** Total hours from all scheduled blocks */
  plannedHours: number;
  /** Total hours from blocks marked as completed */
  completedHours: number;
  /** Total hours of actual focus time tracked */
  focusedHours: number;
}

/** Schedule info for a task */
export interface TaskScheduleInfo {
  blockId: string;
  dayIndex: number;
  startMinutes: number;
  durationMinutes: number;
}

/** Deadline info for a task */
export interface TaskDeadlineInfo {
  /** ISO date string (e.g., "2026-01-25") */
  date: string;
  /** Whether the deadline is in the past */
  isOverdue: boolean;
}

/** Task with deadline info for display in the deadline tray */
export interface DeadlineTask {
  taskId: string;
  goalId: string;
  label: string;
  goalLabel: string;
  goalColor: GoalColor;
  completed: boolean;
}

// ============================================================================
// Hook Options & Return Types
// ============================================================================

export interface UseUnifiedScheduleOptions {
  /** Initial goals for the backlog */
  initialGoals: ScheduleGoal[];
  /** All available essentials (for edit mode) */
  allEssentials: ScheduleEssential[];
  /** Initial set of enabled essential IDs (defaults to all) */
  initialEnabledEssentialIds?: string[];
  /** Initial calendar events */
  initialEvents: CalendarEvent[];
  /** Current week dates (required for week-scoped operations) */
  weekDates: Date[];
  /** Clipboard copy function (from useCalendarClipboard) */
  onCopy?: (event: CalendarEvent) => void;
  /** Clipboard paste function (from useCalendarClipboard) */
  onPaste?: (dayIndex: number, startMinutes: number) => CalendarEvent | null;
  /** Whether clipboard has content */
  hasClipboardContent?: boolean;
  /** Called when a new event is created (for auto-selection) */
  onEventCreated?: (event: CalendarEvent) => void;
}

export interface UseUnifiedScheduleReturn {
  // Data
  goals: ScheduleGoal[];
  /** Filtered essentials (only enabled ones) */
  essentials: ScheduleEssential[];
  /** All available essentials (for edit mode) */
  allEssentials: ScheduleEssential[];
  /** Filtered events (excludes disabled essential blocks) */
  events: CalendarEvent[];

  // Essential visibility management
  /** Current set of enabled essential IDs */
  enabledEssentialIds: Set<string>;
  /** Draft enabled IDs during editing (null when not editing) */
  draftEnabledEssentialIds: Set<string> | null;
  /** Toggle an essential's enabled state (works on draft) */
  toggleEssentialEnabled: (id: string) => void;
  /** Start editing essentials (creates draft from current state) */
  startEditingEssentials: () => void;
  /** Save draft to actual enabled state */
  saveEssentialChanges: () => void;
  /** Discard draft changes */
  cancelEssentialChanges: () => void;

  // Computed data accessors
  getGoalStats: (goalId: string) => GoalStats;
  getEssentialStats: (essentialId: string) => GoalStats;
  getTaskSchedule: (taskId: string) => TaskScheduleInfo | null;
  getTaskDeadline: (taskId: string) => TaskDeadlineInfo | null;
  getWeekDeadlines: (weekDates: Date[]) => Map<string, DeadlineTask[]>;

  // Backlog actions
  addGoal: (goal: ScheduleGoal) => void;
  deleteGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<ScheduleGoal>) => void;
  toggleTaskComplete: (goalId: string, taskId: string) => void;

  // Task CRUD actions
  addTask: (goalId: string, label: string) => string;
  updateTask: (
    goalId: string,
    taskId: string,
    updates: Partial<ScheduleTask>,
  ) => void;
  deleteTask: (goalId: string, taskId: string) => void;

  // Subtask CRUD actions
  addSubtask: (goalId: string, taskId: string, label: string) => void;
  updateSubtask: (
    goalId: string,
    taskId: string,
    subtaskId: string,
    label: string,
  ) => void;
  toggleSubtaskComplete: (
    goalId: string,
    taskId: string,
    subtaskId: string,
  ) => void;
  deleteSubtask: (goalId: string, taskId: string, subtaskId: string) => void;

  // Milestone CRUD actions
  addMilestone: (goalId: string, label: string) => string;
  updateMilestone: (goalId: string, milestoneId: string, label: string) => void;
  toggleMilestoneComplete: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  /** Toggle whether milestones are enabled for a goal */
  toggleMilestonesEnabled: (goalId: string) => void;

  // Scheduling actions (from drag-drop)
  scheduleGoal: (
    goalId: string,
    dayIndex: number,
    startMinutes: number,
  ) => void;
  scheduleTask: (
    goalId: string,
    taskId: string,
    dayIndex: number,
    startMinutes: number,
  ) => void;
  scheduleEssential: (
    essentialId: string,
    dayIndex: number,
    startMinutes: number,
  ) => void;

  // Deadline actions
  setTaskDeadline: (goalId: string, taskId: string, date: string) => void;
  clearTaskDeadline: (goalId: string, taskId: string) => void;

  // Calendar event actions
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
  markEventComplete: (eventId: string) => void;
  markEventIncomplete: (eventId: string) => void;

  // Task assignment to blocks (for goal blocks)
  assignTaskToBlock: (blockId: string, taskId: string) => void;
  unassignTaskFromBlock: (blockId: string, taskId: string) => void;

  // Block drop handlers (for dropping tasks onto existing blocks)
  /** Assign a task to an existing goal block (removes from any previous block) */
  assignTaskToGoalBlock: (
    blockId: string,
    goalId: string,
    taskId: string,
  ) => void;
  /** Convert a task block into a goal block containing both tasks */
  convertTaskBlockToGoalBlock: (blockId: string, droppedTaskId: string) => void;

  // Handler to process drops from drag context (supports grid, header, and block drops)
  handleDrop: (
    item: DragItem,
    position: DropPosition,
    weekDates: Date[],
  ) => void;

  // Hover state (for keyboard shortcuts)
  hoveredEvent: CalendarEvent | null;
  hoverPosition: HoverPosition | null;
  hoveredDayIndex: number | null;

  // Standard calendar handlers (spread onto Calendar component)
  calendarHandlers: {
    onEventResize: (
      eventId: string,
      newStartMinutes: number,
      newDurationMinutes: number,
    ) => void;
    onEventResizeEnd: () => void;
    onEventDragEnd: (
      eventId: string,
      newDayIndex: number,
      newStartMinutes: number,
    ) => void;
    onEventDuplicate: (
      sourceEventId: string,
      newDayIndex: number,
      newStartMinutes: number,
    ) => void;
    onGridDoubleClick: (dayIndex: number, startMinutes: number) => void;
    onGridDragCreate: (
      dayIndex: number,
      startMinutes: number,
      durationMinutes: number,
    ) => void;
    onEventCopy: (event: CalendarEvent) => void;
    onEventDelete: (eventId: string) => void;
    onEventStatusChange: (eventId: string, status: BlockStatus) => void;
    onEventPaste: (dayIndex: number, startMinutes: number) => void;
    hasClipboardContent: boolean;
    onEventHover: (event: CalendarEvent | null) => void;
    onGridPositionHover: (position: HoverPosition | null) => void;
    onDayHeaderHover: (dayIndex: number | null) => void;
    onMarkDayComplete: (dayIndex: number) => void;
  };
}
