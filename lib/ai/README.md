# AI Module

**Purpose:** AI-powered features for the SuperOS application, starting with block briefing generation that contextualizes upcoming work sessions.

## Core Files

### Types & Schema
- **`types.ts`** — Shared types and Zod schemas for the AI briefing feature
  - `BlockBriefingContext` — multi-layer context object sent to the model (block, goal, week, day layers)
  - `BriefingResponseSchema` — Zod schema shared between server route and client hook
  - `BriefingResponse`, `NewTaskSuggestion` — TypeScript types derived from the schema
  - Context types are plain serializable objects (no React components)

### Context Assembly
- **`assemble-block-context.ts`** — Pure function that derives the briefing context from schedule state
  - Classifies block time-of-day (morning / afternoon / evening)
  - Determines block position in the day's sequence
  - Computes milestone completion percentages
  - Identifies previous blocks for the same goal this week
  - Summarizes today's schedule shape
  - No side effects, fully testable

### Client Hook
- **`use-block-briefing.ts`** — React hook for streaming AI block briefings
  - Wraps `experimental_useObject` from `@ai-sdk/react`
  - Assembles context from schedule state on demand
  - Streams structured briefing responses (text + task suggestions)
  - Exposes `generate` / `stop` / `reset` controls

### Barrel
- **`index.ts`** — Public entry point re-exporting hook, assembler, types, and schema

## Server Route

The API route lives at `app/api/briefing/route.ts`:
- Uses `streamObject` from Vercel AI SDK with `gpt-5-mini`
- Receives `BlockBriefingContext` as JSON body
- Returns streaming structured output matching `BriefingResponseSchema`

## Design Principles

- **Structured output**: Uses Zod schema for type-safe streaming (no regex parsing)
- **Context-only prompting**: Model only sees data from the context object — no hallucinated facts
- **Separation of concerns**: Context assembly is pure; API route is thin; hook manages streaming lifecycle
- **Graceful degradation**: Missing context layers (no milestones, no previous blocks) degrade to sensible defaults

## Directory Structure

```
lib/ai/
├── index.ts                    # Barrel exports
├── types.ts                    # Shared types and Zod schema
├── assemble-block-context.ts   # Pure context assembler
└── use-block-briefing.ts       # Client hook
```

**Total Files:** 4
