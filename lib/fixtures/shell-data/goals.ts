/**
 * =============================================================================
 * File: goals.ts
 * =============================================================================
 *
 * Fixture goal definitions for shell/sample and complete data sets.
 *
 * Provides realistic example goals, including milestones and tasks, to populate
 * demos, onboarding previews, and the shell experience. Also includes a minimal
 * goal set used when skipping onboarding.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define sample goals with milestones, tasks, subtasks, and granular dates.
 * - Define a clean set of goals without tasks/milestones for dev flows.
 * - Expose an empty goals array for initialization and resets.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Sample goals mirror common life areas (career, health, creativity, growth).
 * - IDs are stable and referenced by fixture calendar events.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - SHELL_GOALS
 * - COMPLETE_GOALS
 * - EMPTY_GOALS
 */

import {
  RiRocketLine,
  RiMedalLine,
  RiPenNibLine,
  RiCodeLine,
  RiGlobeLine,
} from "@remixicon/react";
import type { ScheduleGoal } from "@/lib/unified-schedule";

// =============================================================================
// Sample Goals (with tasks and milestones for demo)
// =============================================================================

export const SHELL_GOALS: ScheduleGoal[] = [
  {
    id: "superos",
    label: "Get SuperOS to $1M ARR",
    icon: RiRocketLine,
    color: "violet",
    lifeAreaId: "career",
    startDate: "2026-01-01",
    startDateGranularity: "quarter",
    deadline: "2026-06-30",
    deadlineGranularity: "quarter",
    milestones: [
      { id: "superos-m1", label: "Research competitors", completed: true, deadline: "2026-03-31", deadlineGranularity: "quarter" },
      { id: "superos-m2", label: "Write product spec", completed: true, deadline: "2026-03-31", deadlineGranularity: "quarter" },
      { id: "superos-m3", label: "Design billing UI", completed: true, deadline: "2026-03-31", deadlineGranularity: "quarter" },
      { id: "superos-m4", label: "Ship billing integration", completed: false, deadline: "2026-06-30", deadlineGranularity: "quarter" },
      { id: "superos-m5", label: "Launch to beta users", completed: false, deadline: "2026-06-30", deadlineGranularity: "quarter" },
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
    startDate: "2026-07-01",
    startDateGranularity: "quarter",
    deadline: "2026-09-30",
    deadlineGranularity: "quarter",
    milestones: [
      { id: "marathon-m1", label: "Run 5K without stopping", completed: true, deadline: "2026-07-31", deadlineGranularity: "month" },
      { id: "marathon-m2", label: "Complete 10K under 50min", completed: false, deadline: "2026-08-31", deadlineGranularity: "month" },
      { id: "marathon-m3", label: "Run half marathon", completed: false, deadline: "2026-09-15" },
      { id: "marathon-m4", label: "Complete full marathon", completed: false, deadline: "2026-09-30", deadlineGranularity: "quarter" },
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
    startDate: "2026-03-01",
    startDateGranularity: "month",
    deadline: "2026-06-30",
    deadlineGranularity: "month",
    milestones: [
      { id: "book-m1", label: "Complete outline", completed: true, deadline: "2026-03-31", deadlineGranularity: "month" },
      { id: "book-m2", label: "Finish chapter 1 draft", completed: true, deadline: "2026-04-30", deadlineGranularity: "month" },
      { id: "book-m3", label: "Finish chapter 2 draft", completed: true, deadline: "2026-04-30", deadlineGranularity: "month" },
      { id: "book-m4", label: "Finish chapter 3 draft", completed: false, deadline: "2026-05-31", deadlineGranularity: "month" },
      { id: "book-m5", label: "Complete first draft", completed: false, deadline: "2026-06-30", deadlineGranularity: "month" },
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
// Complete Goals (clean goals without tasks/milestones for skip onboarding)
// =============================================================================

export const COMPLETE_GOALS: ScheduleGoal[] = [
  {
    id: "superos",
    label: "Get SuperOS to $1M ARR",
    icon: RiRocketLine,
    color: "violet",
    lifeAreaId: "career",
    tasks: [],
  },
  {
    id: "marathon",
    label: "Run a marathon",
    icon: RiMedalLine,
    color: "rose",
    lifeAreaId: "health",
    tasks: [],
  },
  {
    id: "book",
    label: "Write a book",
    icon: RiPenNibLine,
    color: "teal",
    lifeAreaId: "creativity",
    tasks: [],
  },
  {
    id: "spanish",
    label: "Become fluent in Spanish",
    icon: RiGlobeLine,
    color: "lime",
    lifeAreaId: "personal-growth",
    tasks: [],
  },
];

// =============================================================================
// Empty Data Set
// =============================================================================

export const EMPTY_GOALS: ScheduleGoal[] = [];
