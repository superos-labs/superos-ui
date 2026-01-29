/**
 * Types for the unified schedule system.
 * Single source of truth for schedule-related type definitions.
 *
 * This file is the canonical location for domain types used across the app:
 * - CalendarEvent: The core calendar block data structure
 * - HoverPosition: Grid position for hover state
 * - BlockStatus: Completion state of blocks (re-exported from lib/types)
 *
 * Components re-export these types for convenience but this is the source of truth.
 */

import type { GoalColor } from "@/lib/colors";
import type { BlockType, BlockStatus, IconComponent } from "@/lib/types";

// Re-export BlockStatus for consumers who import from this module
export type { BlockStatus };

import type { DragItem, DropPosition } from "@/lib/drag-types";

// ============================================================================
// Calendar Event Types (Domain Layer)
// ============================================================================

/** Position on the calendar grid */
export interface HoverPosition {
  dayIndex: number;
  startMinutes: number;
}

/**
 * CalendarEvent represents a scheduled block on the calendar.
 * This is the core domain type for all calendar-related state management.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date string, e.g., "2026-01-22" */
  date: string;
  dayIndex: number; // 0 = Monday, 6 = Sunday (derived from date, kept for positioning)
  startMinutes: number; // Minutes from midnight (0-1440)
  durationMinutes: number;
  color: GoalColor;
  /** Number of incomplete tasks assigned to this block */
  pendingTaskCount?: number;
  /** Number of completed tasks assigned to this block */
  completedTaskCount?: number;
  status?: BlockStatus; // "planned" | "completed"

  // Block identity and source tracking
  /** Whether this block is for a goal work session, a specific task, or an essential */
  blockType?: BlockType;
  /** The goal this block is associated with (for goal/task blocks) */
  sourceGoalId?: string;
  /** For task blocks, which specific task this represents */
  sourceTaskId?: string;
  /** The essential this block is associated with (for essential blocks) */
  sourceEssentialId?: string;
  /** Optional notes for this block */
  notes?: string;
  /** For goal blocks: task IDs explicitly assigned to this block (empty by default) */
  assignedTaskIds?: string[];
  /** Accumulated focus time in minutes (from focus sessions) */
  focusedMinutes?: number;
}

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
  /** ISO week start date when this task was marked as weekly focus (e.g., "2026-01-26") */
  weeklyFocusWeek?: string;
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

  // Weekly focus
  /** Set weekly focus on multiple tasks at once (persists weeklyFocusWeek) */
  setWeeklyFocus: (taskIds: Set<string>, weekStartDate: string) => void;

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
