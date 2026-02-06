/**
 * Calendar event definitions for sample and complete data sets.
 * Events are generated dynamically based on the current week.
 */

import { getWeekDates } from "@/components/calendar";
import type { CalendarEvent } from "@/lib/unified-schedule";

// =============================================================================
// Helpers
// =============================================================================

/** Convert hours to minutes for startMinutes */
const hoursToMinutes = (hours: number) => hours * 60;

// =============================================================================
// Sample Events
// =============================================================================

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
    // =========================================================================
    // SuperOS Goal - Morning blocks
    // M/W/F: 8a-10:45a (165 min), Tu/Th: 8a-12:30p (270 min)
    // =========================================================================
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

    // =========================================================================
    // SuperOS Goal - Afternoon blocks
    // Mon: 12p-6p (360 min), Tu-Fri: 2p-6p (240 min)
    // =========================================================================
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

    // =========================================================================
    // Marathon Goal - Morning runs (6:30a-7:30a on Tu/Th/Sat)
    // =========================================================================
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

    // =========================================================================
    // Write a Book - Evening writing sessions
    // Mon/Wed: 7p-9p, Sun: 8p-10p
    // =========================================================================
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

    // =========================================================================
    // Spanish Learning - Lunch breaks (1p-1:30p Tu/Th) and weekend (10a-11a Sat)
    // =========================================================================
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

    // =========================================================================
    // Weekend - SuperOS catch-up on Sunday afternoon
    // =========================================================================
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
// Complete Events (for dev skip onboarding)
// =============================================================================

/**
 * Generate calendar events for the complete data set.
 * Creates a realistic week with goal blocks scheduled.
 */
function createCompleteEvents(): CalendarEvent[] {
  const weekDates = getWeekDates(new Date());
  const getDate = (dayIndex: number) =>
    weekDates[dayIndex].toISOString().split("T")[0];

  return [
    // SuperOS - weekday mornings (9am-12pm)
    {
      id: "complete-superos-1",
      title: "Get SuperOS to $1M ARR",
      date: getDate(1),
      dayIndex: 1,
      startMinutes: 9 * 60,
      durationMinutes: 180,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "complete-superos-2",
      title: "Get SuperOS to $1M ARR",
      date: getDate(2),
      dayIndex: 2,
      startMinutes: 9 * 60,
      durationMinutes: 180,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "complete-superos-3",
      title: "Get SuperOS to $1M ARR",
      date: getDate(3),
      dayIndex: 3,
      startMinutes: 9 * 60,
      durationMinutes: 180,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "complete-superos-4",
      title: "Get SuperOS to $1M ARR",
      date: getDate(4),
      dayIndex: 4,
      startMinutes: 9 * 60,
      durationMinutes: 180,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },
    {
      id: "complete-superos-5",
      title: "Get SuperOS to $1M ARR",
      date: getDate(5),
      dayIndex: 5,
      startMinutes: 9 * 60,
      durationMinutes: 120,
      color: "violet",
      blockType: "goal",
      sourceGoalId: "superos",
    },

    // Marathon - morning runs (6:30am-7:30am on Tu/Th/Sat)
    {
      id: "complete-marathon-1",
      title: "Run a marathon",
      date: getDate(1),
      dayIndex: 1,
      startMinutes: 6 * 60 + 30,
      durationMinutes: 60,
      color: "rose",
      blockType: "goal",
      sourceGoalId: "marathon",
    },
    {
      id: "complete-marathon-3",
      title: "Run a marathon",
      date: getDate(3),
      dayIndex: 3,
      startMinutes: 6 * 60 + 30,
      durationMinutes: 60,
      color: "rose",
      blockType: "goal",
      sourceGoalId: "marathon",
    },
    {
      id: "complete-marathon-5",
      title: "Run a marathon",
      date: getDate(5),
      dayIndex: 5,
      startMinutes: 7 * 60,
      durationMinutes: 90,
      color: "rose",
      blockType: "goal",
      sourceGoalId: "marathon",
    },

    // Write a book - evening sessions (7pm-9pm on Mon/Wed/Sun)
    {
      id: "complete-book-0",
      title: "Write a book",
      date: getDate(0),
      dayIndex: 0,
      startMinutes: 19 * 60,
      durationMinutes: 120,
      color: "teal",
      blockType: "goal",
      sourceGoalId: "book",
    },
    {
      id: "complete-book-2",
      title: "Write a book",
      date: getDate(2),
      dayIndex: 2,
      startMinutes: 19 * 60,
      durationMinutes: 120,
      color: "teal",
      blockType: "goal",
      sourceGoalId: "book",
    },
    {
      id: "complete-book-6",
      title: "Write a book",
      date: getDate(6),
      dayIndex: 6,
      startMinutes: 19 * 60,
      durationMinutes: 120,
      color: "teal",
      blockType: "goal",
      sourceGoalId: "book",
    },

    // Spanish - lunch breaks and weekend
    {
      id: "complete-spanish-1",
      title: "Become fluent in Spanish",
      date: getDate(1),
      dayIndex: 1,
      startMinutes: 13 * 60,
      durationMinutes: 30,
      color: "lime",
      blockType: "goal",
      sourceGoalId: "spanish",
    },
    {
      id: "complete-spanish-3",
      title: "Become fluent in Spanish",
      date: getDate(3),
      dayIndex: 3,
      startMinutes: 13 * 60,
      durationMinutes: 30,
      color: "lime",
      blockType: "goal",
      sourceGoalId: "spanish",
    },
    {
      id: "complete-spanish-5",
      title: "Become fluent in Spanish",
      date: getDate(5),
      dayIndex: 5,
      startMinutes: 11 * 60,
      durationMinutes: 60,
      color: "lime",
      blockType: "goal",
      sourceGoalId: "spanish",
    },
  ];
}

export const COMPLETE_CALENDAR_EVENTS: CalendarEvent[] = createCompleteEvents();

// =============================================================================
// Empty Data Set
// =============================================================================

export const EMPTY_CALENDAR_EVENTS: CalendarEvent[] = [];
