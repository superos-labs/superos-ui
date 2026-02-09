/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public entry point for the AI module.
 *
 * Aggregates and re-exports the block briefing hook, context assembler,
 * and shared types used by the briefing feature.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Expose the useBlockBriefing hook for sidebar integration.
 * - Expose the context assembler for testing or alternative consumers.
 * - Re-export shared types and schemas.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useBlockBriefing (hook)
 * - assembleBlockContext (pure function)
 * - BriefingResponseSchema (Zod schema)
 * - Types: BlockBriefingContext, BriefingResponse, NewTaskSuggestion,
 *          TaskContext, TaskSummary, BlockReference, etc.
 */

// Hook
export { useBlockBriefing } from "./use-block-briefing";
export type {
  UseBlockBriefingOptions,
  UseBlockBriefingReturn,
} from "./use-block-briefing";

// Context assembler
export { assembleBlockContext } from "./assemble-block-context";
export type { AssembleBlockContextParams } from "./assemble-block-context";

// Types and schemas
export { BriefingResponseSchema } from "./types";
export type {
  BlockBriefingContext,
  BriefingResponse,
  NewTaskSuggestion,
  BlockContext,
  GoalContext,
  WeekContext,
  DayContext,
  TaskContext,
  TaskSummary,
  BlockReference,
} from "./types";
