/**
 * =============================================================================
 * File: use-block-briefing.ts
 * =============================================================================
 *
 * Client-side React hook for generating AI block briefings.
 *
 * Uses the Vercel AI SDK's useObject hook to stream structured briefing
 * data from the /api/briefing route. The hook assembles context from the
 * current schedule state and provides streaming results to the UI.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Assemble block context from schedule state on demand.
 * - Stream structured briefing responses via useObject.
 * - Expose generate / stop / reset controls to the UI.
 * - Provide partial briefing text and task suggestions during streaming.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting briefing text to block notes (caller handles this).
 * - Rendering UI.
 * - Managing block or goal state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - The hook is intentionally thin — it coordinates context assembly and
 *   streaming, but delegates persistence and rendering to the consumer.
 * - Pre-existing notes are captured at generation time so the caller can
 *   merge the briefing with existing content.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useBlockBriefing
 * - UseBlockBriefingOptions
 * - UseBlockBriefingReturn
 */

"use client";

import * as React from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import type { CalendarEvent, ScheduleGoal } from "@/lib/unified-schedule";
import { BriefingResponseSchema } from "./types";
import type { NewTaskSuggestion } from "./types";
import { assembleBlockContext } from "./assemble-block-context";

// =============================================================================
// Types
// =============================================================================

export interface UseBlockBriefingOptions {
  /** The CalendarEvent being viewed (null when no block selected) */
  event: CalendarEvent | null;
  /** Full goal data for the event's source goal */
  sourceGoal?: ScheduleGoal;
  /** All events for the current week */
  weekEvents: CalendarEvent[];
  /** Current week dates (Monday–Sunday) */
  weekDates: Date[];
}

export interface UseBlockBriefingReturn {
  /** Trigger briefing generation */
  generate: () => void;
  /** Stop in-flight generation */
  stop: () => void;
  /** Clear all briefing state */
  reset: () => void;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Streaming briefing text (partial during generation, full after) */
  briefingText: string;
  /** IDs of existing tasks suggested for this block */
  suggestedTaskIds: string[];
  /** New task suggestions from the model */
  newTaskSuggestions: NewTaskSuggestion[];
  /** Whether a completed result is available */
  hasResult: boolean;
  /** Pre-existing notes captured at generation start */
  preExistingNotes: string;
  /** Any error from the generation */
  error: Error | undefined;
}

// =============================================================================
// Hook
// =============================================================================

export function useBlockBriefing({
  event,
  sourceGoal,
  weekEvents,
  weekDates,
}: UseBlockBriefingOptions): UseBlockBriefingReturn {
  const preExistingNotesRef = React.useRef<string>("");

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/briefing",
    schema: BriefingResponseSchema,
  });

  const generate = React.useCallback(() => {
    if (!event) return;

    // Capture existing notes before generation starts
    preExistingNotesRef.current = event.notes ?? "";

    // Assemble context and submit to the API
    const context = assembleBlockContext({
      event,
      goal: sourceGoal,
      events: weekEvents,
      weekDates,
    });

    submit(context);
  }, [event, sourceGoal, weekEvents, weekDates, submit]);

  const reset = React.useCallback(() => {
    preExistingNotesRef.current = "";
  }, []);

  // Compute derived state from the streaming object
  const briefingText = (object?.briefing as string) ?? "";
  const suggestedTaskIds =
    (object?.suggestedExistingTaskIds as string[]) ?? [];
  const newTaskSuggestions =
    (object?.newTaskSuggestions as NewTaskSuggestion[]) ?? [];
  const hasResult = !isLoading && briefingText.length > 0;

  return {
    generate,
    stop,
    reset,
    isGenerating: isLoading,
    briefingText,
    suggestedTaskIds,
    newTaskSuggestions,
    hasResult,
    preExistingNotes: preExistingNotesRef.current,
    error,
  };
}
