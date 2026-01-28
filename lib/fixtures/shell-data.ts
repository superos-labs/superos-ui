/**
 * Sample data for the Shell example component.
 * Provides a realistic dataset showcasing goals, tasks, and calendar events.
 */

import {
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiHome4Line,
  RiSofaLine,
  RiRocketLine,
  RiCodeLine,
  RiMedalLine,
  RiPenNibLine,
  RiBriefcaseLine,
  RiHeartLine,
  RiBookLine,
  RiMoneyDollarCircleLine,
  RiStarLine,
  RiFlagLine,
  RiGlobalLine,
  RiLightbulbLine,
  RiMusic2Line,
  RiPaletteLine,
  RiPlantLine,
} from "@remixicon/react";
import type { GoalIconOption } from "@/lib/types";
import type { CalendarEvent } from "@/components/calendar";
import { getWeekDates } from "@/components/calendar";
import type { ScheduleGoal, ScheduleEssential } from "@/lib/unified-schedule";

// Re-export life areas from canonical source
export { LIFE_AREAS, LIFE_AREAS_BY_ID, getLifeArea } from "@/lib/life-areas";
export type { LifeAreaId } from "@/lib/life-areas";

// Re-export types for convenience
export type { LifeArea, GoalIconOption } from "@/lib/types";

// =============================================================================
// Data Set Types
// =============================================================================

export type DataSetId = "sample" | "empty";

export interface DataSet {
  essentials: ScheduleEssential[];
  goals: ScheduleGoal[];
  events: CalendarEvent[];
}

// =============================================================================
// Goal Icons (curated list for goal creation)
// =============================================================================

export const GOAL_ICONS: GoalIconOption[] = [
  { icon: RiRocketLine, label: "Rocket" },
  { icon: RiMedalLine, label: "Medal" },
  { icon: RiPenNibLine, label: "Pen" },
  { icon: RiCodeLine, label: "Code" },
  { icon: RiHeartLine, label: "Heart" },
  { icon: RiMoneyDollarCircleLine, label: "Money" },
  { icon: RiFlagLine, label: "Flag" },
  { icon: RiStarLine, label: "Star" },
  { icon: RiBookLine, label: "Book" },
  { icon: RiGlobalLine, label: "Globe" },
  { icon: RiLightbulbLine, label: "Idea" },
  { icon: RiMusic2Line, label: "Music" },
  { icon: RiPaletteLine, label: "Art" },
  { icon: RiPlantLine, label: "Plant" },
  { icon: RiRunLine, label: "Run" },
  { icon: RiBriefcaseLine, label: "Briefcase" },
];

// =============================================================================
// Essentials (recurring non-negotiables)
// =============================================================================

/**
 * All available essentials with mandatory flag.
 * Mandatory essentials (Sleep, Eat) cannot be disabled by the user.
 */
export const ALL_ESSENTIALS: ScheduleEssential[] = [
  { id: "sleep", label: "Sleep", icon: RiMoonLine, color: "indigo", mandatory: true },
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "amber", mandatory: true },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "slate" },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "green" },
  { id: "downtime", label: "Downtime", icon: RiSofaLine, color: "cyan" },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "orange" },
];

/** @deprecated Use ALL_ESSENTIALS instead */
export const SHELL_ESSENTIALS: ScheduleEssential[] = ALL_ESSENTIALS;

/** Default enabled essential IDs (all enabled by default) */
export const DEFAULT_ENABLED_ESSENTIAL_IDS = ALL_ESSENTIALS.map(c => c.id);

/** Mandatory essential IDs that cannot be disabled */
export const MANDATORY_ESSENTIAL_IDS = new Set(
  ALL_ESSENTIALS.filter(c => c.mandatory).map(c => c.id)
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
    lifeAreaId: "career",
    milestones: [
      { id: "superos-m1", label: "Research competitors", completed: true },
      { id: "superos-m2", label: "Write product spec", completed: true },
      { id: "superos-m3", label: "Design billing UI", completed: true },
      { id: "superos-m4", label: "Ship billing integration", completed: false },
      { id: "superos-m5", label: "Launch to beta users", completed: false },
    ],
    tasks: [
      { 
        id: "superos-1", 
        label: "Set up Stripe webhook handlers", 
        completed: true, 
        scheduledBlockId: "shell-superos-task-1",
        description: "Handle subscription.created, subscription.updated, and payment_failed events.",
      },
      { 
        id: "superos-2", 
        label: "Build subscription management UI", 
        completed: false,
        description: "Allow users to view their current plan, upgrade/downgrade, and cancel.",
        subtasks: [
          { id: "superos-2-1", label: "Design plan comparison table", completed: true },
          { id: "superos-2-2", label: "Implement plan selector component", completed: false },
          { id: "superos-2-3", label: "Add confirmation modal", completed: false },
        ],
      },
      { id: "superos-3", label: "Add invoice generation", completed: false },
    ],
  },
  {
    id: "marathon",
    label: "Run a marathon",
    icon: RiMedalLine,
    color: "rose",
    lifeAreaId: "health",
    milestones: [
      { id: "marathon-m1", label: "Run 5K without stopping", completed: true },
      { id: "marathon-m2", label: "Complete 10K under 50min", completed: false },
      { id: "marathon-m3", label: "Run half marathon", completed: false },
      { id: "marathon-m4", label: "Complete full marathon", completed: false },
    ],
    tasks: [
      { id: "marathon-1", label: "Run 5K three times this week", completed: true },
      { 
        id: "marathon-2", 
        label: "Do interval training on Saturday", 
        completed: false,
        description: "8x400m repeats with 90s recovery. Target pace: 1:45 per 400m.",
      },
    ],
  },
  {
    id: "book",
    label: "Write a book",
    icon: RiPenNibLine,
    color: "teal",
    lifeAreaId: "creativity",
    milestones: [
      { id: "book-m1", label: "Complete outline", completed: true },
      { id: "book-m2", label: "Finish chapter 1 draft", completed: true },
      { id: "book-m3", label: "Finish chapter 2 draft", completed: true },
      { id: "book-m4", label: "Finish chapter 3 draft", completed: false },
      { id: "book-m5", label: "Complete first draft", completed: false },
    ],
    tasks: [
      { id: "book-1", label: "Outline the main conflict", completed: true },
      { id: "book-2", label: "Write the opening scene", completed: true },
      { 
        id: "book-3", 
        label: "Develop supporting characters", 
        completed: false,
        description: "Focus on the mentor figure and the antagonist's backstory.",
        subtasks: [
          { id: "book-3-1", label: "Write character backstory for mentor", completed: false },
          { id: "book-3-2", label: "Define antagonist motivations", completed: false },
        ],
      },
    ],
  },
  {
    id: "spanish",
    label: "Become fluent in Spanish",
    icon: RiCodeLine,
    color: "blue",
    lifeAreaId: "personal-growth",
    milestones: [
      { id: "spanish-m1", label: "Complete A1 basics", completed: true },
      { id: "spanish-m2", label: "Complete A2 certification", completed: false },
      { id: "spanish-m3", label: "Pass B1 exam", completed: false },
      { id: "spanish-m4", label: "Achieve conversational fluency", completed: false },
    ],
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

/**
 * Generate sample events for the current week.
 * Events are created with dates based on the current week to demonstrate
 * the week navigation feature.
 */
function createSampleEvents(): CalendarEvent[] {
  const weekDates = getWeekDates(new Date());
  const getDate = (dayIndex: number) => weekDates[dayIndex].toISOString().split("T")[0];

  return [
    // =============================================================================
    // Sleep - 12a-7a (7 hours) every day
    // =============================================================================
    { id: "shell-sleep-0", title: "Sleep", date: getDate(0), dayIndex: 0, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", blockType: "essential", sourceEssentialId: "sleep", status: "completed" },
    { id: "shell-sleep-1", title: "Sleep", date: getDate(1), dayIndex: 1, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", blockType: "essential", sourceEssentialId: "sleep", status: "completed" },
    { id: "shell-sleep-2", title: "Sleep", date: getDate(2), dayIndex: 2, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", blockType: "essential", sourceEssentialId: "sleep" },
    { id: "shell-sleep-3", title: "Sleep", date: getDate(3), dayIndex: 3, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", blockType: "essential", sourceEssentialId: "sleep" },
    { id: "shell-sleep-4", title: "Sleep", date: getDate(4), dayIndex: 4, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", blockType: "essential", sourceEssentialId: "sleep" },
    { id: "shell-sleep-5", title: "Sleep", date: getDate(5), dayIndex: 5, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", blockType: "essential", sourceEssentialId: "sleep" },
    { id: "shell-sleep-6", title: "Sleep", date: getDate(6), dayIndex: 6, startMinutes: 0, durationMinutes: hoursToMinutes(7), color: "indigo", blockType: "essential", sourceEssentialId: "sleep" },

    // =============================================================================
    // SuperOS Goal - Morning blocks
    // M/W/F: 8a-10:45a (165 min), Tu/Th: 8a-12:30p (270 min)
    // =============================================================================
    { id: "shell-superos-am-0", title: "Get SuperOS to $1M ARR", date: getDate(0), dayIndex: 0, startMinutes: hoursToMinutes(8), durationMinutes: 165, color: "violet", blockType: "goal", sourceGoalId: "superos", status: "completed" },
    { id: "shell-superos-am-1", title: "Get SuperOS to $1M ARR", date: getDate(1), dayIndex: 1, startMinutes: hoursToMinutes(8), durationMinutes: 270, color: "violet", blockType: "goal", sourceGoalId: "superos" },
    { id: "shell-superos-am-2", title: "Get SuperOS to $1M ARR", date: getDate(2), dayIndex: 2, startMinutes: hoursToMinutes(8), durationMinutes: 165, color: "violet", blockType: "goal", sourceGoalId: "superos" },
    { id: "shell-superos-am-3", title: "Get SuperOS to $1M ARR", date: getDate(3), dayIndex: 3, startMinutes: hoursToMinutes(8), durationMinutes: 270, color: "violet", blockType: "goal", sourceGoalId: "superos" },
    { id: "shell-superos-am-4", title: "Get SuperOS to $1M ARR", date: getDate(4), dayIndex: 4, startMinutes: hoursToMinutes(8), durationMinutes: 165, color: "violet", blockType: "goal", sourceGoalId: "superos" },

    // =============================================================================
    // Exercise - 11a-12:30p (90 min) on M/W/F
    // =============================================================================
    { id: "shell-exercise-0", title: "Exercise", date: getDate(0), dayIndex: 0, startMinutes: hoursToMinutes(11), durationMinutes: 90, color: "green", blockType: "essential", sourceEssentialId: "exercise", status: "completed" },
    { id: "shell-exercise-2", title: "Exercise", date: getDate(2), dayIndex: 2, startMinutes: hoursToMinutes(11), durationMinutes: 90, color: "green", blockType: "essential", sourceEssentialId: "exercise" },
    { id: "shell-exercise-4", title: "Exercise", date: getDate(4), dayIndex: 4, startMinutes: hoursToMinutes(11), durationMinutes: 90, color: "green", blockType: "essential", sourceEssentialId: "exercise" },

    // =============================================================================
    // Eat (Lunch) - 12:30p-1p on Mon (completed), 1p-2p Tu-Fri
    // =============================================================================
    { id: "shell-eat-lunch-0", title: "Eat", date: getDate(0), dayIndex: 0, startMinutes: hoursToMinutes(12.5), durationMinutes: 30, color: "amber", blockType: "essential", sourceEssentialId: "eat", status: "completed" },
    { id: "shell-eat-lunch-1", title: "Eat", date: getDate(1), dayIndex: 1, startMinutes: hoursToMinutes(13), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },
    { id: "shell-eat-lunch-2", title: "Eat", date: getDate(2), dayIndex: 2, startMinutes: hoursToMinutes(13), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },
    { id: "shell-eat-lunch-3", title: "Eat", date: getDate(3), dayIndex: 3, startMinutes: hoursToMinutes(13), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },
    { id: "shell-eat-lunch-4", title: "Eat", date: getDate(4), dayIndex: 4, startMinutes: hoursToMinutes(13), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },

    // =============================================================================
    // SuperOS Goal - Afternoon blocks (1p-7:45p = 405 min on Mon, 2p-6p = 240 min Tu-Fri)
    // =============================================================================
    { id: "shell-superos-pm-0", title: "Get SuperOS to $1M ARR", date: getDate(0), dayIndex: 0, startMinutes: hoursToMinutes(13), durationMinutes: 405, color: "violet", blockType: "goal", sourceGoalId: "superos", status: "completed" },
    { id: "shell-superos-pm-1", title: "Get SuperOS to $1M ARR", date: getDate(1), dayIndex: 1, startMinutes: hoursToMinutes(14), durationMinutes: 240, color: "violet", blockType: "goal", sourceGoalId: "superos" },
    { id: "shell-superos-pm-2", title: "Get SuperOS to $1M ARR", date: getDate(2), dayIndex: 2, startMinutes: hoursToMinutes(14), durationMinutes: 240, color: "violet", blockType: "goal", sourceGoalId: "superos" },
    { id: "shell-superos-pm-3", title: "Get SuperOS to $1M ARR", date: getDate(3), dayIndex: 3, startMinutes: hoursToMinutes(14), durationMinutes: 240, color: "violet", blockType: "goal", sourceGoalId: "superos" },
    { id: "shell-superos-pm-4", title: "Get SuperOS to $1M ARR", date: getDate(4), dayIndex: 4, startMinutes: hoursToMinutes(14), durationMinutes: 240, color: "violet", blockType: "goal", sourceGoalId: "superos" },

    // =============================================================================
    // Chores - 6:30p-7:30p (60 min) Tu-Fri
    // =============================================================================
    { id: "shell-chores-1", title: "Chores", date: getDate(1), dayIndex: 1, startMinutes: hoursToMinutes(18.5), durationMinutes: 60, color: "orange", blockType: "essential", sourceEssentialId: "chores" },
    { id: "shell-chores-2", title: "Chores", date: getDate(2), dayIndex: 2, startMinutes: hoursToMinutes(18.5), durationMinutes: 60, color: "orange", blockType: "essential", sourceEssentialId: "chores" },
    { id: "shell-chores-3", title: "Chores", date: getDate(3), dayIndex: 3, startMinutes: hoursToMinutes(18.5), durationMinutes: 60, color: "orange", blockType: "essential", sourceEssentialId: "chores" },
    { id: "shell-chores-4", title: "Chores", date: getDate(4), dayIndex: 4, startMinutes: hoursToMinutes(18.5), durationMinutes: 60, color: "orange", blockType: "essential", sourceEssentialId: "chores" },

    // =============================================================================
    // Eat (Dinner) - 8p-9p (60 min) Mon-Fri
    // =============================================================================
    { id: "shell-eat-dinner-0", title: "Eat", date: getDate(0), dayIndex: 0, startMinutes: hoursToMinutes(20), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat", status: "completed" },
    { id: "shell-eat-dinner-1", title: "Eat", date: getDate(1), dayIndex: 1, startMinutes: hoursToMinutes(20), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },
    { id: "shell-eat-dinner-2", title: "Eat", date: getDate(2), dayIndex: 2, startMinutes: hoursToMinutes(20), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },
    { id: "shell-eat-dinner-3", title: "Eat", date: getDate(3), dayIndex: 3, startMinutes: hoursToMinutes(20), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },
    { id: "shell-eat-dinner-4", title: "Eat", date: getDate(4), dayIndex: 4, startMinutes: hoursToMinutes(20), durationMinutes: 60, color: "amber", blockType: "essential", sourceEssentialId: "eat" },

    // =============================================================================
    // SuperOS Goal - Evening block (10:30p-12a = 90 min on Mon)
    // =============================================================================
    { id: "shell-superos-eve-0", title: "Get SuperOS to $1M ARR", date: getDate(0), dayIndex: 0, startMinutes: hoursToMinutes(22.5), durationMinutes: 90, color: "violet", blockType: "goal", sourceGoalId: "superos", status: "completed" },
  ];
}

// Generate events lazily for the current week
export const SHELL_CALENDAR_EVENTS: CalendarEvent[] = createSampleEvents();

// =============================================================================
// Empty Data Set (clean slate)
// =============================================================================

export const EMPTY_ESSENTIALS: ScheduleEssential[] = [];
export const EMPTY_GOALS: ScheduleGoal[] = [];
export const EMPTY_CALENDAR_EVENTS: CalendarEvent[] = [];

// =============================================================================
// Data Set Configuration
// =============================================================================

export const DATA_SETS: Record<DataSetId, DataSet> = {
  sample: {
    essentials: SHELL_ESSENTIALS,
    goals: SHELL_GOALS,
    events: SHELL_CALENDAR_EVENTS,
  },
  empty: {
    essentials: EMPTY_ESSENTIALS,
    goals: EMPTY_GOALS,
    events: EMPTY_CALENDAR_EVENTS,
  },
};
