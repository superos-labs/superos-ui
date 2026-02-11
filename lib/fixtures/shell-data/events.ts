/**
 * =============================================================================
 * File: events.ts
 * =============================================================================
 *
 * Fixture calendar events for shell/sample and complete data sets.
 *
 * Events are generated relative to the current week so that demos and previews
 * always appear populated with realistic, navigable schedules.
 *
 * Used by the shell experience, onboarding previews, and dev shortcuts
 * (e.g., skipping onboarding with a pre-filled calendar).
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Generate sample calendar events for the shell experience.
 * - Generate a rich "complete" event set spanning Q1 2026 for skip-onboarding.
 * - Expose an empty events array for initialization and resets.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Sample events are derived from the current week at runtime.
 * - Complete events span all of January (completed) + February (partial) for
 *   quarter view demonstration.
 * - All events represent goal blocks (not tasks) for clarity in demos.
 * - Patterns mirror believable weekly routines (morning deep work, workouts,
 *   evening creative sessions, etc.).
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - SHELL_CALENDAR_EVENTS
 * - COMPLETE_CALENDAR_EVENTS
 * - EMPTY_CALENDAR_EVENTS
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
// Complete Events (for dev skip onboarding — rich Q1 2026 data)
// =============================================================================

/**
 * Generate a full set of calendar events spanning January 2026 (all completed)
 * plus the current week in February 2026 (mix of completed and planned).
 *
 * Weekly routine modeled:
 * - SuperOS: Mon-Fri mornings 9a-12p (180 min) + Mon/Wed/Fri afternoons 2p-5p (180 min)
 * - Marathon: Tue/Thu 6:30a-7:30a (60 min) + Sat 7a-8:30a (90 min)
 * - Book: Mon/Wed 7p-9p (120 min) + Sun 8p-10p (120 min)
 * - Spanish: Tue/Thu 1p-1:30p (30 min) + Sat 10a-11a (60 min)
 *
 * January totals (4.3 weeks, all completed):
 * - SuperOS: ~108h  (heaviest investment)
 * - Marathon: ~15h
 * - Book:    ~21h
 * - Spanish: ~9h
 */
function createCompleteEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  let idCounter = 0;
  const nextId = (prefix: string) => `complete-${prefix}-${++idCounter}`;

  // -------------------------------------------------------------------------
  // Helper: get day-of-week (0=Mon, 6=Sun) from a Date
  // -------------------------------------------------------------------------
  function getDayIndex(d: Date): number {
    const jsDay = d.getDay(); // 0=Sun
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function toISO(d: Date): string {
    return d.toISOString().split("T")[0];
  }

  // -------------------------------------------------------------------------
  // Generate events for a date range using the weekly routine
  // -------------------------------------------------------------------------
  function generateWeek(
    weekStart: Date,
    status: "completed" | "planned" | undefined,
  ) {
    for (let dayOff = 0; dayOff < 7; dayOff++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + dayOff);
      const iso = toISO(d);
      const di = getDayIndex(d);

      // SuperOS: Mon-Fri mornings 9a-12p
      if (di >= 0 && di <= 4) {
        events.push({
          id: nextId("superos"),
          title: "Get SuperOS to $1M ARR",
          date: iso,
          dayIndex: di,
          startMinutes: 9 * 60,
          durationMinutes: 180,
          color: "violet",
          blockType: "goal",
          sourceGoalId: "superos",
          status,
        });
      }

      // SuperOS: Mon/Wed/Fri afternoons 2p-5p
      if (di === 0 || di === 2 || di === 4) {
        events.push({
          id: nextId("superos"),
          title: "Get SuperOS to $1M ARR",
          date: iso,
          dayIndex: di,
          startMinutes: 14 * 60,
          durationMinutes: 180,
          color: "violet",
          blockType: "goal",
          sourceGoalId: "superos",
          status,
        });
      }

      // Marathon: Tue/Thu 6:30a-7:30a
      if (di === 1 || di === 3) {
        events.push({
          id: nextId("marathon"),
          title: "Run a marathon",
          date: iso,
          dayIndex: di,
          startMinutes: 6 * 60 + 30,
          durationMinutes: 60,
          color: "rose",
          blockType: "goal",
          sourceGoalId: "marathon",
          status,
        });
      }

      // Marathon: Sat 7a-8:30a
      if (di === 5) {
        events.push({
          id: nextId("marathon"),
          title: "Run a marathon",
          date: iso,
          dayIndex: di,
          startMinutes: 7 * 60,
          durationMinutes: 90,
          color: "rose",
          blockType: "goal",
          sourceGoalId: "marathon",
          status,
        });
      }

      // Book: Mon/Wed 7p-9p
      if (di === 0 || di === 2) {
        events.push({
          id: nextId("book"),
          title: "Write a book",
          date: iso,
          dayIndex: di,
          startMinutes: 19 * 60,
          durationMinutes: 120,
          color: "teal",
          blockType: "goal",
          sourceGoalId: "book",
          status,
        });
      }

      // Book: Sun 8p-10p
      if (di === 6) {
        events.push({
          id: nextId("book"),
          title: "Write a book",
          date: iso,
          dayIndex: di,
          startMinutes: 20 * 60,
          durationMinutes: 120,
          color: "teal",
          blockType: "goal",
          sourceGoalId: "book",
          status,
        });
      }

      // Spanish: Tue/Thu 1p-1:30p
      if (di === 1 || di === 3) {
        events.push({
          id: nextId("spanish"),
          title: "Become fluent in Spanish",
          date: iso,
          dayIndex: di,
          startMinutes: 13 * 60,
          durationMinutes: 30,
          color: "lime",
          blockType: "goal",
          sourceGoalId: "spanish",
          status,
        });
      }

      // Spanish: Sat 10a-11a
      if (di === 5) {
        events.push({
          id: nextId("spanish"),
          title: "Become fluent in Spanish",
          date: iso,
          dayIndex: di,
          startMinutes: 10 * 60,
          durationMinutes: 60,
          color: "lime",
          blockType: "goal",
          sourceGoalId: "spanish",
          status,
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // January 2026 — all weeks completed
  // Week of Jan 5 (Mon), Jan 12, Jan 19, Jan 26
  // Also include partial first week Jan 1-4 (Thu-Sun)
  // -------------------------------------------------------------------------
  // Partial first week: Jan 1 (Thu) - Jan 4 (Sun)
  const jan1 = new Date(2026, 0, 1); // Thursday
  for (let dayOff = 0; dayOff < 4; dayOff++) {
    const d = new Date(jan1);
    d.setDate(d.getDate() + dayOff);
    const iso = toISO(d);
    const di = getDayIndex(d);

    // SuperOS: Fri afternoon
    if (di === 4) {
      events.push({
        id: nextId("superos"),
        title: "Get SuperOS to $1M ARR",
        date: iso,
        dayIndex: di,
        startMinutes: 9 * 60,
        durationMinutes: 180,
        color: "violet",
        blockType: "goal",
        sourceGoalId: "superos",
        status: "completed",
      });
      events.push({
        id: nextId("superos"),
        title: "Get SuperOS to $1M ARR",
        date: iso,
        dayIndex: di,
        startMinutes: 14 * 60,
        durationMinutes: 180,
        color: "violet",
        blockType: "goal",
        sourceGoalId: "superos",
        status: "completed",
      });
    }

    // Marathon: Sat
    if (di === 5) {
      events.push({
        id: nextId("marathon"),
        title: "Run a marathon",
        date: iso,
        dayIndex: di,
        startMinutes: 7 * 60,
        durationMinutes: 90,
        color: "rose",
        blockType: "goal",
        sourceGoalId: "marathon",
        status: "completed",
      });
    }

    // Spanish: Sat
    if (di === 5) {
      events.push({
        id: nextId("spanish"),
        title: "Become fluent in Spanish",
        date: iso,
        dayIndex: di,
        startMinutes: 10 * 60,
        durationMinutes: 60,
        color: "lime",
        blockType: "goal",
        sourceGoalId: "spanish",
        status: "completed",
      });
    }

    // Book: Sun
    if (di === 6) {
      events.push({
        id: nextId("book"),
        title: "Write a book",
        date: iso,
        dayIndex: di,
        startMinutes: 20 * 60,
        durationMinutes: 120,
        color: "teal",
        blockType: "goal",
        sourceGoalId: "book",
        status: "completed",
      });
    }
  }

  // Full weeks in January (all completed)
  const janWeekStarts = [
    new Date(2026, 0, 5),  // Jan 5 (Mon)
    new Date(2026, 0, 12), // Jan 12
    new Date(2026, 0, 19), // Jan 19
    new Date(2026, 0, 26), // Jan 26
  ];
  for (const ws of janWeekStarts) {
    generateWeek(ws, "completed");
  }

  // -------------------------------------------------------------------------
  // February 2026 — first week completed, current week is planned
  // -------------------------------------------------------------------------
  // Feb 2 week (Mon) — completed
  generateWeek(new Date(2026, 1, 2), "completed");

  // Current week — use getWeekDates to match what the shell expects
  const currentWeekDates = getWeekDates(new Date());
  const currentWeekStart = currentWeekDates[0];
  // Only add current week events if we haven't already (avoid dupes with Feb 2 week)
  const currentWeekISO = toISO(currentWeekStart);
  if (currentWeekISO !== "2026-02-02") {
    generateWeek(currentWeekStart, undefined); // planned (no status = planned)
  }

  return events;
}

export const COMPLETE_CALENDAR_EVENTS: CalendarEvent[] = createCompleteEvents();

// =============================================================================
// Empty Data Set
// =============================================================================

export const EMPTY_CALENDAR_EVENTS: CalendarEvent[] = [];
