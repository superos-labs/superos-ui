/**
 * =============================================================================
 * File: assemble-block-context.ts
 * =============================================================================
 *
 * Pure function that assembles the multi-layer context object sent to the
 * AI model for block briefing generation.
 *
 * Derives all context from existing schedule state — no API calls, no side
 * effects. The output is a plain serializable object suitable for JSON
 * transport.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Classify block time-of-day (morning / afternoon / evening).
 * - Determine block position in the day's sequence.
 * - Compute milestone completion percentages.
 * - Identify previous blocks for the same goal this week.
 * - Summarize today's schedule shape.
 * - Assemble all layers into a single BlockBriefingContext.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Making API calls or performing side effects.
 * - Rendering UI.
 * - Persisting or mutating state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - All inputs are typed references from the unified schedule system.
 * - Output is intentionally flat / serializable (no IconComponent, etc.).
 * - Missing data is handled gracefully — layers degrade to sensible defaults.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - assembleBlockContext
 * - AssembleBlockContextParams
 */

import type {
  CalendarEvent,
  ScheduleGoal,
  ScheduleTask,
} from "@/lib/unified-schedule";
import { getLifeArea } from "@/lib/life-areas";
import type {
  BlockBriefingContext,
  BlockContext,
  GoalContext,
  WeekContext,
  DayContext,
  TaskContext,
  PreviousBlockContext,
} from "./types";

// =============================================================================
// Params
// =============================================================================

export interface AssembleBlockContextParams {
  /** The CalendarEvent being briefed */
  event: CalendarEvent;
  /** Full goal data for the event's source goal (if available) */
  goal?: ScheduleGoal;
  /** All events for the current week (already filtered by useUnifiedSchedule) */
  events: CalendarEvent[];
  /** Current week's 7 Date objects (Monday–Sunday) */
  weekDates: Date[];
}

// =============================================================================
// Helpers
// =============================================================================

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function classifyTimeOfDay(
  startMinutes: number,
): "morning" | "afternoon" | "evening" {
  if (startMinutes < 720) return "morning"; // before noon
  if (startMinutes < 1020) return "afternoon"; // before 5 PM
  return "evening";
}

function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  return DAYS_OF_WEEK[dayIndex] ?? "Unknown";
}

function getCurrentWeekStart(weekDates: Date[]): string {
  return weekDates[0]?.toISOString().split("T")[0] ?? "";
}

// =============================================================================
// Block Layer
// =============================================================================

function buildBlockContext(
  event: CalendarEvent,
  todayBlocks: CalendarEvent[],
): BlockContext {
  const startTime = minutesToTime(event.startMinutes);
  const dayOfWeek = getDayOfWeek(event.date);
  const timeOfDay = classifyTimeOfDay(event.startMinutes);

  // Determine position in day's sequence
  const sorted = [...todayBlocks].sort(
    (a, b) => a.startMinutes - b.startMinutes,
  );
  const index = sorted.findIndex((e) => e.id === event.id);
  let daySequencePosition: string;

  if (sorted.length <= 1) {
    daySequencePosition = "only block today";
  } else if (index === 0) {
    daySequencePosition = "first block of the day";
  } else if (index === sorted.length - 1) {
    daySequencePosition = "last block of the day";
  } else {
    // Check if previous block ended more than 60 min ago → "after a break"
    const prev = sorted[index - 1];
    const prevEnd = prev.startMinutes + prev.durationMinutes;
    const gap = event.startMinutes - prevEnd;
    if (gap >= 60) {
      daySequencePosition = "after a break";
    } else {
      daySequencePosition = `block ${index + 1} of ${sorted.length}`;
    }
  }

  return {
    durationMinutes: event.durationMinutes,
    startTime,
    dayOfWeek,
    timeOfDay,
    daySequencePosition,
  };
}

// =============================================================================
// Goal Layer
// =============================================================================

function buildTaskContext(
  task: ScheduleTask,
  assignedTaskIds: string[],
  weekStartDate: string,
): TaskContext {
  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return {
    id: task.id,
    label: task.label,
    completed: task.completed ?? false,
    isWeeklyFocus: task.weeklyFocusWeek === weekStartDate,
    isAssignedToThisBlock: assignedTaskIds.includes(task.id),
    hasDeadline: !!task.deadline,
    deadline: task.deadline,
    subtaskProgress:
      subtasks.length > 0
        ? `${completedSubtasks}/${subtasks.length}`
        : undefined,
  };
}

function buildGoalContext(
  goal: ScheduleGoal,
  event: CalendarEvent,
  weekStartDate: string,
): GoalContext {
  const lifeArea = getLifeArea(goal.lifeAreaId);
  const assignedTaskIds = event.assignedTaskIds ?? [];

  // Find current (first incomplete) milestone
  const currentMilestone = goal.milestones?.find((m) => !m.completed);
  let milestoneContext: GoalContext["currentMilestone"];

  if (currentMilestone && goal.tasks) {
    const milestoneTasks = goal.tasks.filter(
      (t) => t.milestoneId === currentMilestone.id,
    );
    const completedCount = milestoneTasks.filter(
      (t) => t.completed,
    ).length;
    const totalCount = milestoneTasks.length;
    milestoneContext = {
      label: currentMilestone.label,
      deadline: currentMilestone.deadline,
      completionPct:
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    };
  }

  // Build task contexts — weekly focus and incomplete first
  const tasks = (goal.tasks ?? []).map((t) =>
    buildTaskContext(t, assignedTaskIds, weekStartDate),
  );

  return {
    label: goal.label,
    lifeArea: lifeArea?.label ?? "Unknown",
    timeRange:
      goal.startDate || goal.deadline
        ? { start: goal.startDate, end: goal.deadline }
        : undefined,
    currentMilestone: milestoneContext,
    tasks,
  };
}

// =============================================================================
// Week Layer
// =============================================================================

function buildWeekContext(
  event: CalendarEvent,
  goal: ScheduleGoal,
  events: CalendarEvent[],
  weekStartDate: string,
): WeekContext {
  // Filter to this goal's blocks this week
  const goalBlocks = events.filter(
    (e) => e.sourceGoalId === goal.id,
  );

  // Compute hours
  const plannedMinutes = goalBlocks.reduce(
    (sum, e) => sum + e.durationMinutes,
    0,
  );
  const completedMinutes = goalBlocks
    .filter((e) => e.status === "completed")
    .reduce((sum, e) => sum + e.durationMinutes, 0);
  const focusedMinutes = goalBlocks.reduce(
    (sum, e) => sum + (e.focusedMinutes ?? 0),
    0,
  );

  // Weekly focus tasks
  const weeklyFocusTasks = (goal.tasks ?? []).filter(
    (t) => t.weeklyFocusWeek === weekStartDate && !t.completed,
  );

  // Previous blocks (before this event's date or earlier in the same day)
  const previousBlocks = goalBlocks
    .filter(
      (e) =>
        e.id !== event.id &&
        (e.date < event.date ||
          (e.date === event.date && e.startMinutes < event.startMinutes)),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.startMinutes - b.startMinutes);

  const previousBlockContexts: PreviousBlockContext[] = previousBlocks.map(
    (block) => {
      const assignedLabels = (block.assignedTaskIds ?? [])
        .map((tid) => (goal.tasks ?? []).find((t) => t.id === tid)?.label)
        .filter(Boolean) as string[];

      return {
        date: block.date,
        dayOfWeek: getDayOfWeek(block.date),
        status: block.status ?? "planned",
        durationMinutes: block.durationMinutes,
        assignedTaskLabels: assignedLabels,
      };
    },
  );

  return {
    plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
    completedHours: Math.round((completedMinutes / 60) * 10) / 10,
    focusedHours: Math.round((focusedMinutes / 60) * 10) / 10,
    weeklyFocusTaskLabels: weeklyFocusTasks.map((t) => t.label),
    previousBlocksThisWeek: previousBlockContexts,
    goalBlockCountThisWeek: goalBlocks.length,
  };
}

// =============================================================================
// Day Layer
// =============================================================================

function buildDayContext(
  event: CalendarEvent,
  events: CalendarEvent[],
): DayContext {
  const todayBlocks = events
    .filter((e) => e.date === event.date)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const goalBlocksToday = todayBlocks.filter(
    (e) => e.sourceGoalId === event.sourceGoalId,
  );
  const thisIndex = goalBlocksToday.findIndex((e) => e.id === event.id);

  return {
    allBlocks: todayBlocks.map((e) => ({
      title: e.title,
      startTime: minutesToTime(e.startMinutes),
      durationMinutes: e.durationMinutes,
      blockType: e.blockType ?? "goal",
    })),
    blockCount: todayBlocks.length,
    isLightDay: todayBlocks.length < 3,
    isFirstGoalBlock: thisIndex === 0,
    isLastGoalBlock: thisIndex === goalBlocksToday.length - 1,
  };
}

// =============================================================================
// Main Assembler
// =============================================================================

export function assembleBlockContext({
  event,
  goal,
  events,
  weekDates,
}: AssembleBlockContextParams): BlockBriefingContext {
  const todayBlocks = events.filter((e) => e.date === event.date);
  const weekStartDate = getCurrentWeekStart(weekDates);

  const blockCtx = buildBlockContext(event, todayBlocks);

  // Goal context — requires goal data
  const goalCtx: GoalContext = goal
    ? buildGoalContext(goal, event, weekStartDate)
    : {
        label: event.title,
        lifeArea: "Unknown",
        tasks: [],
      };

  // Week context — requires goal data
  const weekCtx: WeekContext = goal
    ? buildWeekContext(event, goal, events, weekStartDate)
    : {
        plannedHours: 0,
        completedHours: 0,
        focusedHours: 0,
        weeklyFocusTaskLabels: [],
        previousBlocksThisWeek: [],
        goalBlockCountThisWeek: 1,
      };

  const dayCtx = buildDayContext(event, events);

  return {
    block: blockCtx,
    goal: goalCtx,
    week: weekCtx,
    day: dayCtx,
  };
}
