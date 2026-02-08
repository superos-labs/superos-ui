/**
 * =============================================================================
 * File: types.ts
 * =============================================================================
 *
 * Canonical type definitions for the unified schedule system.
 *
 * Serves as the single source of truth for all schedule-related domain,
 * derived, and hook interface types used across the app. Also contains
 * goal creation and inspiration gallery types (merged from lib/goals).
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define core calendar event and hover/grid positioning types.
 * - Define goal, task, subtask, milestone, and essential domain models.
 * - Define external calendar sync configuration and computed sync state.
 * - Define computed/derived data shapes (stats, deadlines, schedule info).
 * - Define option and return types for unified schedule hooks.
 * - Define goal creation data and inspiration gallery types.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Other modules may re-export these types, but this file is authoritative.
 * - Types are intentionally UI-agnostic and persistence-agnostic.
 * - Prefer extending types here rather than redefining them elsewhere.
 * - Goal creation and inspiration types were consolidated here from the
 *   former lib/goals module to reduce indirection.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - CalendarEvent, HoverPosition, BlockStatus
 * - ScheduleGoal, ScheduleTask, Subtask, Milestone, ScheduleEssential
 * - Sync-related types (GoalSyncSettings, BlockSyncSettings, BlockSyncState)
 * - Computed/derived types and hook option/return types
 * - NewGoalData, InspirationGoal, InspirationCategory
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

  // --- External Calendar Integration ---
  /** Provider for external events (google, apple, outlook) */
  sourceProvider?: import("@/lib/calendar-sync").CalendarProvider;
  /** Source calendar ID within the provider */
  sourceCalendarId?: string;
  /** Source calendar name (for display) */
  sourceCalendarName?: string;
  /** Whether this is a read-only external event */
  isExternal?: boolean;
  /** Custom hex color override (for external blocks using provider calendar colors) */
  customColor?: string;

  // --- External Calendar Sync Settings (for exporting to external calendars) ---
  /** Block-level sync settings (overrides goal and global settings) */
  syncSettings?: BlockSyncSettings;
}

// ============================================================================
// External Calendar Sync Settings
// ============================================================================

import type { AppearanceOverride } from "@/lib/calendar-sync/types";

/**
 * Goal-level sync settings for external calendar export.
 * These settings override the global defaults set at the provider level.
 */
export interface GoalSyncSettings {
  /** Whether this goal's blocks should sync to external calendars */
  syncEnabled: boolean;
  /** How blocks from this goal appear (use_default falls back to global) */
  appearanceOverride: AppearanceOverride;
  /** Custom label when appearanceOverride is "custom" */
  customLabel?: string;
}

/**
 * Block-level sync settings for external calendar export.
 * These settings override both goal-level and global settings.
 */
export interface BlockSyncSettings {
  /** How this specific block appears (use_default falls back to goal setting) */
  appearanceOverride: AppearanceOverride;
  /** Custom label when appearanceOverride is "custom" */
  customLabel?: string;
}

/**
 * Sync destination info for a single provider.
 */
export interface SyncDestination {
  /** Provider key (e.g., "google", "apple", "outlook") */
  provider: "google" | "apple" | "outlook";
  /** Provider name for display (e.g., "Google Calendar") */
  providerName: string;
  /** Target calendar name for display */
  calendarName: string;
  /** Target calendar color (hex) for display */
  calendarColor: string;
  /** How this block appears in the external calendar (appearance mode) */
  syncedAs:
    | "blocked_superos"
    | "busy"
    | "goal_title"
    | "block_title"
    | "custom";
  /** The actual display text that will appear in the external calendar */
  displayText: string;
}

/**
 * Computed sync state for a block (for UI display).
 */
export interface BlockSyncState {
  /** Whether this block is currently being synced to any external calendar */
  isSynced: boolean;
  /** Whether the goal participates in sync (if false, hide the section entirely) */
  goalParticipates?: boolean;
  /** All sync destinations for this block */
  destinations: SyncDestination[];
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
  /** Optional target completion date (ISO date string, e.g., "2026-03-15") */
  deadline?: string;
}

/** Task within a goal */
export interface ScheduleTask {
  id: string;
  label: string;
  completed?: boolean;
  /** Milestone this task belongs to (required when milestones are enabled) */
  milestoneId?: string;
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
  /** Optional target completion date (ISO date string, e.g., "2026-03-15") */
  deadline?: string;
  /** Ordered milestones (sequential steps toward the goal) */
  milestones?: Milestone[];
  /** Whether milestones are enabled for this goal (defaults to true if milestones exist) */
  milestonesEnabled?: boolean;
  tasks?: ScheduleTask[];
  /** External calendar sync settings for this goal */
  syncSettings?: GoalSyncSettings;
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

/** Goal with deadline info for display in the deadline tray */
export interface DeadlineGoal {
  goalId: string;
  label: string;
  color: GoalColor;
  icon: IconComponent;
}

/** Milestone with deadline info for display in the deadline tray */
export interface DeadlineMilestone {
  milestoneId: string;
  goalId: string;
  label: string;
  goalLabel: string;
  goalColor: GoalColor;
  completed: boolean;
}

/** Unified deadline item for quarter view (goals, milestones, and tasks) */
export interface QuarterDeadlineItem {
  /** Type of deadline (goal, milestone, or task) */
  type: "goal" | "milestone" | "task";
  /** Unique identifier (goalId, milestoneId, or taskId depending on type) */
  id: string;
  /** Display label */
  label: string;
  /** ISO date string for the deadline */
  deadline: string;
  /** Parent goal ID */
  goalId: string;
  /** Parent goal label */
  goalLabel: string;
  /** Parent goal color */
  goalColor: GoalColor;
  /** Parent goal icon */
  goalIcon: IconComponent;
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
  getWeekGoalDeadlines: (weekDates: Date[]) => Map<string, DeadlineGoal[]>;
  getWeekMilestoneDeadlines: (
    weekDates: Date[],
  ) => Map<string, DeadlineMilestone[]>;
  /** Get all incomplete deadlines for the current calendar quarter */
  getQuarterDeadlines: (currentDate: Date) => QuarterDeadlineItem[];

  // Goal sync settings
  /** Update sync settings for a goal */
  updateGoalSyncSettings: (
    goalId: string,
    settings: Partial<GoalSyncSettings>,
  ) => void;

  // Block sync settings
  /** Update sync settings for a block */
  updateBlockSyncSettings: (
    blockId: string,
    settings: Partial<BlockSyncSettings>,
  ) => void;

  // Backlog actions
  addGoal: (goal: ScheduleGoal) => void;
  deleteGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<ScheduleGoal>) => void;
  toggleTaskComplete: (goalId: string, taskId: string) => void;

  // Task CRUD actions
  addTask: (goalId: string, label: string, milestoneId?: string) => string;
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
  updateMilestoneDeadline: (
    goalId: string,
    milestoneId: string,
    deadline: string | undefined,
  ) => void;
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
  /** Replace all events with a new array (for blueprint edit mode) */
  replaceEvents: (events: CalendarEvent[]) => void;

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

// ============================================================================
// Goal Creation & Inspiration Types (merged from lib/goals)
// ============================================================================

/**
 * Data for creating a new goal.
 * Used by goal creation forms and inspiration gallery.
 */
export interface NewGoalData {
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
}

/**
 * A goal suggestion in the inspiration gallery.
 */
export interface InspirationGoal {
  id: string;
  label: string;
  icon: IconComponent;
  /** Optional description shown on hover */
  description?: string;
}

/**
 * A category of inspiration goals grouped by life area.
 */
export interface InspirationCategory {
  lifeArea: import("@/lib/types").LifeArea;
  goals: InspirationGoal[];
}
