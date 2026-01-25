/**
 * Sample data for the Shell example component.
 * Provides a realistic dataset showcasing goals, tasks, and calendar events.
 */

import {
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiDropLine,
  RiHome4Line,
  RiRocketLine,
  RiCodeLine,
  RiMedalLine,
  RiPenNibLine,
} from "@remixicon/react";
import type { CalendarEvent } from "@/components/calendar";
import type { ScheduleGoal, ScheduleCommitment } from "@/hooks/use-unified-schedule";

// =============================================================================
// Data Set Types
// =============================================================================

export type DataSetId = "sample" | "empty";

export interface DataSet {
  commitments: ScheduleCommitment[];
  goals: ScheduleGoal[];
  events: CalendarEvent[];
}

// =============================================================================
// Commitments (recurring essentials)
// =============================================================================

/**
 * All available commitments with mandatory flag.
 * Mandatory commitments (Sleep, Eat) cannot be disabled by the user.
 */
export const ALL_COMMITMENTS: ScheduleCommitment[] = [
  { id: "sleep", label: "Sleep", icon: RiMoonLine, color: "indigo", mandatory: true },
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "amber", mandatory: true },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "slate" },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "green" },
  { id: "hygiene", label: "Hygiene", icon: RiDropLine, color: "cyan" },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "orange" },
];

/** @deprecated Use ALL_COMMITMENTS instead */
export const SHELL_COMMITMENTS: ScheduleCommitment[] = ALL_COMMITMENTS;

/** Default enabled commitment IDs (all enabled by default) */
export const DEFAULT_ENABLED_COMMITMENT_IDS = ALL_COMMITMENTS.map(c => c.id);

/** Mandatory commitment IDs that cannot be disabled */
export const MANDATORY_COMMITMENT_IDS = new Set(
  ALL_COMMITMENTS.filter(c => c.mandatory).map(c => c.id)
);

// =============================================================================
// Goals with Tasks
// =============================================================================

export const SHELL_GOALS: ScheduleGoal[] = [
  {
    id: "superos",
    label: "Get SuperOS to $1M ARR",
    icon: RiRocketLine,
    color: "violet",
    milestone: "Ship billing integration",
    tasks: [
      { id: "superos-1", label: "Set up Stripe webhook handlers", completed: true, scheduledBlockId: "shell-superos-task-1" },
      { id: "superos-2", label: "Build subscription management UI", completed: false },
      { id: "superos-3", label: "Add invoice generation", completed: false },
    ],
  },
  {
    id: "marathon",
    label: "Run a marathon",
    icon: RiMedalLine,
    color: "rose",
    milestone: "Complete 10K under 50min",
    tasks: [
      { id: "marathon-1", label: "Run 5K three times this week", completed: true },
      { id: "marathon-2", label: "Do interval training on Saturday", completed: false },
    ],
  },
  {
    id: "book",
    label: "Write a book",
    icon: RiPenNibLine,
    color: "teal",
    milestone: "Finish chapter 3 draft",
    tasks: [
      { id: "book-1", label: "Outline the main conflict", completed: true },
      { id: "book-2", label: "Write the opening scene", completed: true },
      { id: "book-3", label: "Develop supporting characters", completed: false },
    ],
  },
  {
    id: "spanish",
    label: "Become fluent in Spanish",
    icon: RiCodeLine,
    color: "blue",
    milestone: "Complete A2 certification",
    tasks: [
      { id: "spanish-1", label: "Complete Duolingo lesson", completed: true },
      { id: "spanish-2", label: "Watch Spanish movie with subtitles", completed: false },
      { id: "spanish-3", label: "Practice conversation with tutor", completed: false },
    ],
  },
];

// =============================================================================
// Calendar Events
// =============================================================================

/** Helper to convert hours to minutes for startMinutes */
const hoursToMinutes = (hours: number) => hours * 60;

export const SHELL_CALENDAR_EVENTS: CalendarEvent[] = [
  // Commitment blocks - Sleep (recurring throughout the week)
  { id: "shell-sleep-0", title: "Sleep", dayIndex: 0, startMinutes: 0, durationMinutes: hoursToMinutes(6.5), color: "indigo", status: "completed", blockType: "commitment", sourceCommitmentId: "sleep" },
  { id: "shell-sleep-1", title: "Sleep", dayIndex: 1, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", status: "completed", blockType: "commitment", sourceCommitmentId: "sleep" },
  { id: "shell-sleep-2", title: "Sleep", dayIndex: 2, startMinutes: 0, durationMinutes: hoursToMinutes(6.5), color: "indigo", status: "completed", blockType: "commitment", sourceCommitmentId: "sleep" },
  { id: "shell-sleep-3", title: "Sleep", dayIndex: 3, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", status: "completed", blockType: "commitment", sourceCommitmentId: "sleep" },
  { id: "shell-sleep-4", title: "Sleep", dayIndex: 4, startMinutes: 0, durationMinutes: hoursToMinutes(6.5), color: "indigo", blockType: "commitment", sourceCommitmentId: "sleep" },
  { id: "shell-sleep-5", title: "Sleep", dayIndex: 5, startMinutes: 0, durationMinutes: hoursToMinutes(8), color: "indigo", blockType: "commitment", sourceCommitmentId: "sleep" },
  { id: "shell-sleep-6", title: "Sleep", dayIndex: 6, startMinutes: 0, durationMinutes: hoursToMinutes(8), color: "indigo", blockType: "commitment", sourceCommitmentId: "sleep" },

  // Commitment blocks - Exercise
  { id: "shell-exercise-0", title: "Exercise", dayIndex: 0, startMinutes: hoursToMinutes(6.5), durationMinutes: 60, color: "green", status: "completed", blockType: "commitment", sourceCommitmentId: "exercise" },
  { id: "shell-exercise-2", title: "Exercise", dayIndex: 2, startMinutes: hoursToMinutes(6.5), durationMinutes: 60, color: "green", status: "completed", blockType: "commitment", sourceCommitmentId: "exercise" },
  { id: "shell-exercise-4", title: "Exercise", dayIndex: 4, startMinutes: hoursToMinutes(6.5), durationMinutes: 60, color: "green", blockType: "commitment", sourceCommitmentId: "exercise" },

  // Morning routine (not linked to goals)
  { id: "shell-1", title: "Morning workout", dayIndex: 0, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "emerald", status: "completed" },

  // SuperOS goal work sessions (violet = superos color)
  { id: "shell-superos-1", title: "Get SuperOS to $1M ARR", dayIndex: 0, startMinutes: hoursToMinutes(9), durationMinutes: 120, color: "violet", status: "completed", blockType: "goal", sourceGoalId: "superos" },
  { id: "shell-superos-2", title: "Get SuperOS to $1M ARR", dayIndex: 1, startMinutes: hoursToMinutes(9), durationMinutes: 90, color: "violet", status: "completed", blockType: "goal", sourceGoalId: "superos" },
  { id: "shell-superos-3", title: "Get SuperOS to $1M ARR", dayIndex: 2, startMinutes: hoursToMinutes(14), durationMinutes: 120, color: "violet", status: "completed", blockType: "goal", sourceGoalId: "superos" },
  { id: "shell-superos-4", title: "Get SuperOS to $1M ARR", dayIndex: 4, startMinutes: hoursToMinutes(9), durationMinutes: 90, color: "violet", blockType: "goal", sourceGoalId: "superos" },

  // SuperOS task blocks
  { id: "shell-superos-task-1", title: "Set up Stripe webhook handlers", dayIndex: 0, startMinutes: hoursToMinutes(14), durationMinutes: 30, color: "violet", status: "completed", blockType: "task", sourceGoalId: "superos", sourceTaskId: "superos-1" },

  // Marathon goal work sessions (rose = marathon color)
  { id: "shell-marathon-1", title: "Run a marathon", dayIndex: 1, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "rose", status: "completed", blockType: "goal", sourceGoalId: "marathon" },
  { id: "shell-marathon-2", title: "Run a marathon", dayIndex: 3, startMinutes: hoursToMinutes(7), durationMinutes: 60, color: "rose", status: "completed", blockType: "goal", sourceGoalId: "marathon" },
  { id: "shell-marathon-3", title: "Run a marathon", dayIndex: 5, startMinutes: hoursToMinutes(8), durationMinutes: 90, color: "rose", blockType: "goal", sourceGoalId: "marathon" },

  // Book goal work sessions (teal = book color)
  { id: "shell-book-1", title: "Write a book", dayIndex: 2, startMinutes: hoursToMinutes(9), durationMinutes: 90, color: "teal", status: "completed", blockType: "goal", sourceGoalId: "book" },
  { id: "shell-book-2", title: "Write a book", dayIndex: 4, startMinutes: hoursToMinutes(14), durationMinutes: 60, color: "teal", status: "completed", blockType: "goal", sourceGoalId: "book" },
  { id: "shell-book-3", title: "Write a book", dayIndex: 6, startMinutes: hoursToMinutes(10), durationMinutes: 120, color: "teal", blockType: "goal", sourceGoalId: "book" },

  // Spanish goal work sessions (blue = spanish color)
  { id: "shell-spanish-1", title: "Become fluent in Spanish", dayIndex: 0, startMinutes: hoursToMinutes(18), durationMinutes: 60, color: "blue", status: "completed", blockType: "goal", sourceGoalId: "spanish" },
  { id: "shell-spanish-2", title: "Become fluent in Spanish", dayIndex: 2, startMinutes: hoursToMinutes(18), durationMinutes: 60, color: "blue", status: "completed", blockType: "goal", sourceGoalId: "spanish" },
  { id: "shell-spanish-3", title: "Become fluent in Spanish", dayIndex: 4, startMinutes: hoursToMinutes(18), durationMinutes: 60, color: "blue", status: "completed", blockType: "goal", sourceGoalId: "spanish" },

  // Other calendar events (meetings, etc.)
  { id: "shell-4", title: "1:1 with manager", dayIndex: 1, startMinutes: hoursToMinutes(14), durationMinutes: 60, color: "amber", status: "completed" },
  { id: "shell-5", title: "Lunch break", dayIndex: 1, startMinutes: hoursToMinutes(12), durationMinutes: 60, color: "orange", status: "completed" },
  { id: "shell-6", title: "Team sync", dayIndex: 3, startMinutes: hoursToMinutes(10), durationMinutes: 60, color: "indigo" },
  { id: "shell-7", title: "Team lunch", dayIndex: 3, startMinutes: hoursToMinutes(12), durationMinutes: 90, color: "orange" },

  // Blueprint blocks for planning
  { id: "shell-blueprint-1", title: "Deep focus time", dayIndex: 5, startMinutes: hoursToMinutes(14), durationMinutes: 180, color: "sky", status: "blueprint" },
  { id: "shell-blueprint-2", title: "Weekly review", dayIndex: 6, startMinutes: hoursToMinutes(15), durationMinutes: 60, color: "slate", status: "blueprint" },
];

// =============================================================================
// Empty Data Set (clean slate)
// =============================================================================

export const EMPTY_COMMITMENTS: ScheduleCommitment[] = [];
export const EMPTY_GOALS: ScheduleGoal[] = [];
export const EMPTY_CALENDAR_EVENTS: CalendarEvent[] = [];

// =============================================================================
// Data Set Configuration
// =============================================================================

export const DATA_SETS: Record<DataSetId, DataSet> = {
  sample: {
    commitments: SHELL_COMMITMENTS,
    goals: SHELL_GOALS,
    events: SHELL_CALENDAR_EVENTS,
  },
  empty: {
    commitments: EMPTY_COMMITMENTS,
    goals: EMPTY_GOALS,
    events: EMPTY_CALENDAR_EVENTS,
  },
};
