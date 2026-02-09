/**
 * =============================================================================
 * File: route.ts
 * =============================================================================
 *
 * API route handler for generating AI-powered block briefings.
 *
 * Receives a structured BlockBriefingContext from the client, constructs a
 * system + user prompt, and streams a structured BriefingResponse back
 * using the Vercel AI SDK's streamObject primitive.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Parse the incoming briefing context from the request body.
 * - Construct the system prompt (developer role) and user prompt.
 * - Call the OpenAI model via AI SDK streamObject.
 * - Return a streaming text response consumable by useObject on the client.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses gpt-5-mini for fast, cheap structured generation.
 * - System prompt uses the "developer" role per 2026 conventions.
 * - The prompt is objective-oriented (defines outcome, not steps).
 * - Context is serialized as compact JSON in the user message.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - POST handler
 * - maxDuration config
 */

import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { BriefingResponseSchema } from "@/lib/ai/types";

export const maxDuration = 15;

// =============================================================================
// System Prompt
// =============================================================================

const SYSTEM_PROMPT = `You are a concise productivity coach embedded in a time-blocking calendar app called SuperOS.

Your job: given structured context about a user's upcoming work block, produce a brief (2–4 sentences) that contextualizes the session and suggest which tasks to focus on.

Guidelines:
- Be specific and actionable. Reference the user's own task labels, deadlines, and progress.
- Never invent facts. Only reference data present in the provided context.
- Adapt tone to time-of-day: energizing for morning, focused for afternoon, winding-down for evening.
- For short blocks (< 60 min), suggest 1-2 focused tasks. For long blocks (> 90 min), suggest 2-4.
- Prioritize weekly focus tasks, then tasks with upcoming deadlines, then unfinished work from earlier this week.
- Only suggest new tasks when there is an obvious gap (e.g. a milestone approaching with no tasks covering it). Keep new suggestions to 0-2 items max.
- Keep the briefing paragraph compact. No bullet points, no headings — just a natural, coach-like paragraph.`;

// =============================================================================
// Route Handler
// =============================================================================

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai("gpt-5-mini"),
    schema: BriefingResponseSchema,
    system: SYSTEM_PROMPT,
    prompt: JSON.stringify(context, null, 2),
  });

  return result.toTextStreamResponse();
}
