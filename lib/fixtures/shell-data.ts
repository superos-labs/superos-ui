/**
 * Sample data for the Shell example component.
 * Provides a realistic dataset showcasing goals, tasks, and calendar events.
 */

import {
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
  // Additional icons for expanded picker
  RiCameraLine,
  RiCalendarLine,
  RiChat4Line,
  RiCheckboxCircleLine,
  RiCompassLine,
  RiCpuLine,
  RiDatabase2Line,
  RiDraftLine,
  RiEarthLine,
  RiEmotionHappyLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiGamepadLine,
  RiGiftLine,
  RiGovernmentLine,
  RiGraduationCapLine,
  RiGroupLine,
  RiHandHeartLine,
  RiHealthBookLine,
  RiHomeLine,
  RiImageLine,
  RiInfinityLine,
  RiKey2Line,
  RiLeafLine,
  RiLineChartLine,
  RiLinksLine,
  RiLock2Line,
  RiMagicLine,
  RiMailLine,
  RiMap2Line,
  RiMicLine,
  RiBubbleChartLine,
  RiMoonLine,
  RiMovie2Line,
  RiNotification3Line,
  RiPaintBrushLine,
  RiPieChartLine,
  RiGlobeLine,
  RiPresentationLine,
  RiPrinterLine,
  RiPulseLine,
  RiQuillPenLine,
  RiRadarLine,
  RiRoadMapLine,
  RiScales3Line,
  RiSearchLine,
  RiSettings3Line,
  RiShieldLine,
  RiShoppingBag3Line,
  RiSparklingLine,
  RiSpeaker3Line,
  RiSpeedLine,
  RiStackLine,
  RiSunLine,
  RiSwordLine,
  RiCrosshair2Line,
  RiTeamLine,
  RiTerminalBoxLine,
  RiThunderstormsLine,
  RiTimeLine,
  RiToolsLine,
  RiTrophyLine,
  RiUserLine,
  RiVipCrownLine,
  RiWalkLine,
  RiWaterFlashLine,
  RiWifiLine,
  RiZoomInLine,
} from "@remixicon/react";
import type { GoalIconOption } from "@/lib/types";
import { getWeekDates } from "@/components/calendar";
import type {
  CalendarEvent,
  ScheduleGoal,
  ScheduleEssential,
} from "@/lib/unified-schedule";

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
  // Primary / Featured
  { icon: RiRocketLine, label: "Rocket" },
  { icon: RiCrosshair2Line, label: "Target" },
  { icon: RiTrophyLine, label: "Trophy" },
  { icon: RiMedalLine, label: "Medal" },
  { icon: RiStarLine, label: "Star" },
  { icon: RiFlagLine, label: "Flag" },
  { icon: RiLightbulbLine, label: "Idea" },
  { icon: RiSparklingLine, label: "Sparkle" },
  // Work & Productivity
  { icon: RiBriefcaseLine, label: "Briefcase" },
  { icon: RiCodeLine, label: "Code" },
  { icon: RiTerminalBoxLine, label: "Terminal" },
  { icon: RiPresentationLine, label: "Presentation" },
  { icon: RiLineChartLine, label: "Chart" },
  { icon: RiPieChartLine, label: "Pie Chart" },
  { icon: RiDatabase2Line, label: "Database" },
  { icon: RiCpuLine, label: "CPU" },
  { icon: RiToolsLine, label: "Tools" },
  { icon: RiSettings3Line, label: "Settings" },
  // Creative
  { icon: RiPenNibLine, label: "Pen" },
  { icon: RiQuillPenLine, label: "Quill" },
  { icon: RiPaletteLine, label: "Palette" },
  { icon: RiPaintBrushLine, label: "Brush" },
  { icon: RiImageLine, label: "Image" },
  { icon: RiCameraLine, label: "Camera" },
  { icon: RiMovie2Line, label: "Film" },
  { icon: RiMusic2Line, label: "Music" },
  { icon: RiMicLine, label: "Mic" },
  { icon: RiDraftLine, label: "Draft" },
  // Learning & Growth
  { icon: RiBookLine, label: "Book" },
  { icon: RiGraduationCapLine, label: "Graduate" },
  { icon: RiBubbleChartLine, label: "Mind Map" },
  { icon: RiFileTextLine, label: "Document" },
  { icon: RiSearchLine, label: "Search" },
  { icon: RiCompassLine, label: "Compass" },
  { icon: RiRoadMapLine, label: "Roadmap" },
  { icon: RiMap2Line, label: "Map" },
  // Health & Wellness
  { icon: RiHeartLine, label: "Heart" },
  { icon: RiPulseLine, label: "Pulse" },
  { icon: RiRunLine, label: "Run" },
  { icon: RiWalkLine, label: "Walk" },
  { icon: RiHealthBookLine, label: "Health" },
  { icon: RiPlantLine, label: "Plant" },
  { icon: RiLeafLine, label: "Leaf" },
  { icon: RiSunLine, label: "Sun" },
  { icon: RiMoonLine, label: "Moon" },
  { icon: RiWaterFlashLine, label: "Water" },
  // Social & Relationships
  { icon: RiGroupLine, label: "Group" },
  { icon: RiTeamLine, label: "Team" },
  { icon: RiUserLine, label: "User" },
  { icon: RiHandHeartLine, label: "Care" },
  { icon: RiChat4Line, label: "Chat" },
  { icon: RiMailLine, label: "Mail" },
  { icon: RiGiftLine, label: "Gift" },
  { icon: RiEmotionHappyLine, label: "Emotion" },
  // Finance & Business
  { icon: RiMoneyDollarCircleLine, label: "Money" },
  { icon: RiShoppingBag3Line, label: "Shopping" },
  { icon: RiScales3Line, label: "Balance" },
  { icon: RiGovernmentLine, label: "Institution" },
  { icon: RiVipCrownLine, label: "Crown" },
  // Home & Life
  { icon: RiHomeLine, label: "Home" },
  { icon: RiHome4Line, label: "House" },
  { icon: RiCalendarLine, label: "Calendar" },
  { icon: RiTimeLine, label: "Time" },
  { icon: RiNotification3Line, label: "Notification" },
  { icon: RiCheckboxCircleLine, label: "Check" },
  // Adventure & Fun
  { icon: RiGlobalLine, label: "Globe" },
  { icon: RiEarthLine, label: "Earth" },
  { icon: RiGlobeLine, label: "Planet" },
  { icon: RiGamepadLine, label: "Game" },
  { icon: RiSwordLine, label: "Sword" },
  { icon: RiMagicLine, label: "Magic" },
  { icon: RiFlashlightLine, label: "Flashlight" },
  { icon: RiRadarLine, label: "Radar" },
  // Tech & Digital
  { icon: RiWifiLine, label: "Wifi" },
  { icon: RiLinksLine, label: "Link" },
  { icon: RiStackLine, label: "Stack" },
  { icon: RiShieldLine, label: "Shield" },
  { icon: RiLock2Line, label: "Lock" },
  { icon: RiKey2Line, label: "Key" },
  { icon: RiZoomInLine, label: "Zoom" },
  { icon: RiPrinterLine, label: "Printer" },
  { icon: RiSpeaker3Line, label: "Speaker" },
  // Energy & Power
  { icon: RiThunderstormsLine, label: "Thunder" },
  { icon: RiSpeedLine, label: "Speed" },
  { icon: RiInfinityLine, label: "Infinity" },
];

// =============================================================================
// Essentials (recurring activities to track)
// =============================================================================

/**
 * All available essentials.
 * All essentials are optional - users choose which to track.
 * Note: Sleep is no longer an essential; it's handled via day boundaries in preferences.
 */
export const ALL_ESSENTIALS: ScheduleEssential[] = [
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "amber" },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "slate" },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "green" },
  { id: "downtime", label: "Downtime", icon: RiSofaLine, color: "cyan" },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "orange" },
];

/** Default enabled essential IDs (none enabled by default - user chooses) */
export const DEFAULT_ENABLED_ESSENTIAL_IDS: string[] = [];

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
        description:
          "Handle subscription.created, subscription.updated, and payment_failed events.",
      },
      {
        id: "superos-2",
        label: "Build subscription management UI",
        completed: false,
        description:
          "Allow users to view their current plan, upgrade/downgrade, and cancel.",
        subtasks: [
          {
            id: "superos-2-1",
            label: "Design plan comparison table",
            completed: true,
          },
          {
            id: "superos-2-2",
            label: "Implement plan selector component",
            completed: false,
          },
          {
            id: "superos-2-3",
            label: "Add confirmation modal",
            completed: false,
          },
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
      {
        id: "marathon-m2",
        label: "Complete 10K under 50min",
        completed: false,
      },
      { id: "marathon-m3", label: "Run half marathon", completed: false },
      { id: "marathon-m4", label: "Complete full marathon", completed: false },
    ],
    tasks: [
      {
        id: "marathon-1",
        label: "Run 5K three times this week",
        completed: true,
      },
      {
        id: "marathon-2",
        label: "Do interval training on Saturday",
        completed: false,
        description:
          "8x400m repeats with 90s recovery. Target pace: 1:45 per 400m.",
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
        description:
          "Focus on the mentor figure and the antagonist's backstory.",
        subtasks: [
          {
            id: "book-3-1",
            label: "Write character backstory for mentor",
            completed: false,
          },
          {
            id: "book-3-2",
            label: "Define antagonist motivations",
            completed: false,
          },
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
      {
        id: "spanish-m2",
        label: "Complete A2 certification",
        completed: false,
      },
      { id: "spanish-m3", label: "Pass B1 exam", completed: false },
      {
        id: "spanish-m4",
        label: "Achieve conversational fluency",
        completed: false,
      },
    ],
    tasks: [
      { id: "spanish-1", label: "Complete Duolingo lesson", completed: true },
      {
        id: "spanish-2",
        label: "Watch Spanish movie with subtitles",
        completed: false,
      },
      {
        id: "spanish-3",
        label: "Practice conversation with tutor",
        completed: false,
      },
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
  const getDate = (dayIndex: number) =>
    weekDates[dayIndex].toISOString().split("T")[0];

  return [
    // =============================================================================
    // SuperOS Goal - Morning blocks
    // M/W/F: 8a-10:45a (165 min), Tu/Th: 8a-12:30p (270 min)
    // =============================================================================
    {
      id: "shell-superos-am-0",
      title: "Get SuperOS to $1M ARR",
      date: getDate(0),
      dayIndex: 0,
      startMinutes: hoursToMinutes(8),
      durationMinutes: 165,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
      status: "completed",
    },
    {
      id: "shell-superos-am-1",
      title: "Get SuperOS to $1M ARR",
      date: getDate(1),
      dayIndex: 1,
      startMinutes: hoursToMinutes(8),
      durationMinutes: 270,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "shell-superos-am-2",
      title: "Get SuperOS to $1M ARR",
      date: getDate(2),
      dayIndex: 2,
      startMinutes: hoursToMinutes(8),
      durationMinutes: 165,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "shell-superos-am-3",
      title: "Get SuperOS to $1M ARR",
      date: getDate(3),
      dayIndex: 3,
      startMinutes: hoursToMinutes(8),
      durationMinutes: 270,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "shell-superos-am-4",
      title: "Get SuperOS to $1M ARR",
      date: getDate(4),
      dayIndex: 4,
      startMinutes: hoursToMinutes(8),
      durationMinutes: 165,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },

    // =============================================================================
    // SuperOS Goal - Afternoon blocks (12p-6p = 360 min on Mon, 2p-6p = 240 min Tu-Fri)
    // =============================================================================
    {
      id: "shell-superos-pm-0",
      title: "Get SuperOS to $1M ARR",
      date: getDate(0),
      dayIndex: 0,
      startMinutes: hoursToMinutes(12),
      durationMinutes: 360,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
      status: "completed",
    },
    {
      id: "shell-superos-pm-1",
      title: "Get SuperOS to $1M ARR",
      date: getDate(1),
      dayIndex: 1,
      startMinutes: hoursToMinutes(14),
      durationMinutes: 240,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "shell-superos-pm-2",
      title: "Get SuperOS to $1M ARR",
      date: getDate(2),
      dayIndex: 2,
      startMinutes: hoursToMinutes(14),
      durationMinutes: 240,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "shell-superos-pm-3",
      title: "Get SuperOS to $1M ARR",
      date: getDate(3),
      dayIndex: 3,
      startMinutes: hoursToMinutes(14),
      durationMinutes: 240,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "shell-superos-pm-4",
      title: "Get SuperOS to $1M ARR",
      date: getDate(4),
      dayIndex: 4,
      startMinutes: hoursToMinutes(14),
      durationMinutes: 240,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },

    // =============================================================================
    // Marathon Goal - Morning runs (6:30a-7:30a on Tu/Th/Sat)
    // =============================================================================
    {
      id: "shell-marathon-1",
      title: "Run a marathon",
      date: getDate(1),
      dayIndex: 1,
      startMinutes: hoursToMinutes(6.5),
      durationMinutes: 60,
      color: "rose",
      blockType: "goal",
      sourceGoalId: "marathon",
    },
    {
      id: "shell-marathon-3",
      title: "Run a marathon",
      date: getDate(3),
      dayIndex: 3,
      startMinutes: hoursToMinutes(6.5),
      durationMinutes: 60,
      color: "rose",
      blockType: "goal",
      sourceGoalId: "marathon",
    },
    {
      id: "shell-marathon-5",
      title: "Run a marathon",
      date: getDate(5),
      dayIndex: 5,
      startMinutes: hoursToMinutes(7),
      durationMinutes: 90,
      color: "rose",
      blockType: "goal",
      sourceGoalId: "marathon",
    },

    // =============================================================================
    // Write a Book - Evening writing sessions (7p-9p on Mon/Wed, 8p-10p on Sun)
    // =============================================================================
    {
      id: "shell-book-0",
      title: "Write a book",
      date: getDate(0),
      dayIndex: 0,
      startMinutes: hoursToMinutes(19),
      durationMinutes: 120,
      color: "teal",
      blockType: "goal",
      sourceGoalId: "book",
      status: "completed",
    },
    {
      id: "shell-book-2",
      title: "Write a book",
      date: getDate(2),
      dayIndex: 2,
      startMinutes: hoursToMinutes(19),
      durationMinutes: 120,
      color: "teal",
      blockType: "goal",
      sourceGoalId: "book",
    },
    {
      id: "shell-book-6",
      title: "Write a book",
      date: getDate(6),
      dayIndex: 6,
      startMinutes: hoursToMinutes(20),
      durationMinutes: 120,
      color: "teal",
      blockType: "goal",
      sourceGoalId: "book",
    },

    // =============================================================================
    // Spanish Learning - Lunch breaks (1p-1:30p Tu/Th) and weekend (10a-11a Sat)
    // =============================================================================
    {
      id: "shell-spanish-1",
      title: "Become fluent in Spanish",
      date: getDate(1),
      dayIndex: 1,
      startMinutes: hoursToMinutes(13),
      durationMinutes: 30,
      color: "blue",
      blockType: "goal",
      sourceGoalId: "spanish",
    },
    {
      id: "shell-spanish-3",
      title: "Become fluent in Spanish",
      date: getDate(3),
      dayIndex: 3,
      startMinutes: hoursToMinutes(13),
      durationMinutes: 30,
      color: "blue",
      blockType: "goal",
      sourceGoalId: "spanish",
    },
    {
      id: "shell-spanish-5",
      title: "Become fluent in Spanish",
      date: getDate(5),
      dayIndex: 5,
      startMinutes: hoursToMinutes(10),
      durationMinutes: 60,
      color: "blue",
      blockType: "goal",
      sourceGoalId: "spanish",
    },

    // =============================================================================
    // Weekend - More variety (SuperOS catch-up on Sunday afternoon)
    // =============================================================================
    {
      id: "shell-superos-sun",
      title: "Get SuperOS to $1M ARR",
      date: getDate(6),
      dayIndex: 6,
      startMinutes: hoursToMinutes(14),
      durationMinutes: 180,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
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
    essentials: ALL_ESSENTIALS,
    goals: SHELL_GOALS,
    events: SHELL_CALENDAR_EVENTS,
  },
  empty: {
    essentials: EMPTY_ESSENTIALS,
    goals: EMPTY_GOALS,
    events: EMPTY_CALENDAR_EVENTS,
  },
};
