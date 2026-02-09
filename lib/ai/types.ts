/**
 * =============================================================================
 * File: types.ts
 * =============================================================================
 *
 * Shared types and Zod schemas for the AI briefing feature.
 *
 * Defines the structured context sent to the model, the response shape
 * returned by the API, and the Zod schema used by both the server route
 * (streamObject) and the client hook (useObject) to ensure type-safe
 * structured output.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define BlockBriefingContext (multi-layer context sent to the model).
 * - Define BriefingResponseSchema (Zod schema for structured AI output).
 * - Export TypeScript types derived from the schema.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Context types are plain serializable objects (no React components, no
 *   functions) so they can be sent over the wire as JSON.
 * - The Zod schema is shared between server and client to guarantee the
 *   streaming object shape matches on both sides.
 * - Context layers are optional — the assembler populates what it can.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - BlockBriefingContext
 * - BriefingResponseSchema
 * - BriefingResponse (inferred type)
 * - NewTaskSuggestion
 */

import { z } from "zod";

// =============================================================================
// Briefing Context — sent to the model
// =============================================================================

/** Block-level context (time, duration, position in day) */
export interface BlockContext {
  durationMinutes: number;
  startTime: string; // "14:00"
  dayOfWeek: string; // "Monday"
  timeOfDay: "morning" | "afternoon" | "evening";
  /** Human-readable position in the day's sequence */
  daySequencePosition: string; // "first block" | "after lunch" | "last block"
}

/** Goal-level context (label, area, milestones, tasks) */
export interface GoalContext {
  label: string;
  lifeArea: string; // "Career"
  timeRange?: { start?: string; end?: string };
  currentMilestone?: {
    label: string;
    deadline?: string;
    completionPct: number;
  };
  tasks: TaskContext[];
}

/** Individual task context */
export interface TaskContext {
  id: string;
  label: string;
  completed: boolean;
  isWeeklyFocus: boolean;
  isAssignedToThisBlock: boolean;
  hasDeadline: boolean;
  deadline?: string;
  subtaskProgress?: string; // "2/5"
}

/** Week-level context (hours, previous blocks, focus tasks) */
export interface WeekContext {
  plannedHours: number;
  completedHours: number;
  focusedHours: number;
  weeklyFocusTaskLabels: string[];
  previousBlocksThisWeek: PreviousBlockContext[];
  goalBlockCountThisWeek: number;
}

/** Summary of a previous block this week for the same goal */
export interface PreviousBlockContext {
  date: string;
  dayOfWeek: string;
  status: string; // "completed" | "planned"
  durationMinutes: number;
  assignedTaskLabels: string[];
}

/** Day-level context (today's schedule shape) */
export interface DayContext {
  allBlocks: DayBlockSummary[];
  blockCount: number;
  isLightDay: boolean; // < 3 blocks
  isFirstGoalBlock: boolean;
  isLastGoalBlock: boolean;
}

/** Summary of a single block in today's schedule */
export interface DayBlockSummary {
  title: string;
  startTime: string;
  durationMinutes: number;
  blockType: string;
}

/** Full context object sent to the API */
export interface BlockBriefingContext {
  block: BlockContext;
  goal: GoalContext;
  week: WeekContext;
  day: DayContext;
}

// =============================================================================
// Briefing Response — structured output from the model
// =============================================================================

export const BriefingResponseSchema = z.object({
  briefing: z
    .string()
    .describe(
      "A concise 2-4 sentence paragraph contextualizing this block session. " +
        "Reference progress, upcoming deadlines, and what would make this " +
        "specific session successful given its duration and time of day.",
    ),
  suggestedExistingTaskIds: z
    .array(z.string())
    .describe(
      "IDs of existing goal tasks the user should focus on during this block, " +
        "ordered by priority. Prefer weekly focus tasks, then tasks with " +
        "upcoming deadlines, then unscheduled tasks.",
    ),
  newTaskSuggestions: z
    .array(
      z.object({
        label: z.string().describe("Short, actionable task label"),
        rationale: z
          .string()
          .describe("One-sentence reason this task is suggested"),
      }),
    )
    .describe(
      "Optional new tasks to propose when there are obvious gaps — e.g. a " +
        "milestone due soon with no tasks addressing it. Keep to 0-2 items.",
    ),
});

export type BriefingResponse = z.infer<typeof BriefingResponseSchema>;

/** A single new task suggestion from the model */
export type NewTaskSuggestion = BriefingResponse["newTaskSuggestions"][number];
