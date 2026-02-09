/**
 * =============================================================================
 * File: briefing-section.tsx
 * =============================================================================
 *
 * AI-powered briefing section for the block sidebar.
 *
 * Provides a "Generate Briefing" trigger button and, after generation,
 * renders suggested tasks (existing tasks to assign + new task proposals).
 *
 * The briefing text itself streams directly into the notes textarea
 * (handled by the parent sidebar via onNotesChange), so this component
 * only manages the trigger button and task suggestion UI.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render the "Generate Briefing" / "Regenerate" button.
 * - Display a loading indicator during generation.
 * - Show suggested existing tasks with "Assign" affordance.
 * - Show new task suggestions with "Create" affordance.
 * - Provide "Assign all" batch action when multiple suggestions exist.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Making API calls (delegated to useBlockBriefing via parent).
 * - Persisting notes or task state.
 * - Owning block or goal data.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - BriefingTrigger
 * - BriefingSuggestions
 */

"use client";

import { cn } from "@/lib/utils";
import {
  RiSparklingLine,
  RiLoader4Line,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
} from "@remixicon/react";
import type { NewTaskSuggestion } from "@/lib/ai";

// =============================================================================
// Briefing Trigger Button
// =============================================================================

interface BriefingTriggerProps {
  /** Trigger briefing generation */
  onGenerate: () => void;
  /** Whether generation is currently in progress */
  isGenerating: boolean;
  /** Whether a result has already been generated (shows "Regenerate") */
  hasResult: boolean;
  className?: string;
}

export function BriefingTrigger({
  onGenerate,
  isGenerating,
  hasResult,
  className,
}: BriefingTriggerProps) {
  return (
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all",
        isGenerating
          ? "cursor-wait text-muted-foreground/60"
          : "text-muted-foreground/50 hover:bg-muted/60 hover:text-muted-foreground/80",
        className,
      )}
    >
      {isGenerating ? (
        <RiLoader4Line className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <RiSparklingLine
          className={cn(
            "size-3.5 shrink-0 transition-colors",
            hasResult
              ? "text-muted-foreground/40"
              : "text-muted-foreground/50 group-hover:text-muted-foreground/70",
          )}
        />
      )}
      <span className="text-xs">
        {isGenerating
          ? "Generating briefing…"
          : hasResult
            ? "Regenerate briefing"
            : "Generate briefing"}
      </span>
    </button>
  );
}

// =============================================================================
// Briefing Suggestions (existing tasks + new task proposals)
// =============================================================================

interface BriefingSuggestionsProps {
  /** IDs of existing tasks the model suggests focusing on */
  suggestedTaskIds: string[];
  /** Map of task IDs → labels (for display) */
  taskLabels: Map<string, string>;
  /** Set of task IDs already assigned to this block */
  assignedTaskIds: Set<string>;
  /** New task suggestions from the model */
  newTaskSuggestions: NewTaskSuggestion[];
  /** Assign an existing task to this block */
  onAssignTask?: (taskId: string) => void;
  /** Create a new task and assign to this block */
  onCreateTask?: (label: string) => void;
  /** Dismiss a new task suggestion */
  onDismissSuggestion?: (index: number) => void;
  className?: string;
}

export function BriefingSuggestions({
  suggestedTaskIds,
  taskLabels,
  assignedTaskIds,
  newTaskSuggestions,
  onAssignTask,
  onCreateTask,
  onDismissSuggestion,
  className,
}: BriefingSuggestionsProps) {
  // Filter to only show unassigned suggested tasks
  const unassignedSuggestions = suggestedTaskIds.filter(
    (id) => !assignedTaskIds.has(id) && taskLabels.has(id),
  );

  if (unassignedSuggestions.length === 0 && newTaskSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Section label */}
      <div className="flex items-center gap-2 px-2">
        <RiSparklingLine className="size-3 text-muted-foreground/40" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
          Suggested tasks
        </span>
      </div>

      {/* Existing task suggestions */}
      {unassignedSuggestions.map((taskId) => (
        <button
          key={taskId}
          onClick={() => onAssignTask?.(taskId)}
          className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-all hover:bg-muted/60"
        >
          <div className="flex size-4 shrink-0 items-center justify-center rounded border border-dashed border-violet-400/40 text-violet-400/50 transition-colors group-hover:border-violet-400/60 group-hover:text-violet-400/70">
            <RiArrowRightLine className="size-2.5" />
          </div>
          <span className="flex-1 truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            {taskLabels.get(taskId)}
          </span>
          <span className="text-[10px] text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
            Assign
          </span>
        </button>
      ))}

      {/* Already-assigned suggestions (shown as confirmed) */}
      {suggestedTaskIds
        .filter((id) => assignedTaskIds.has(id) && taskLabels.has(id))
        .map((taskId) => (
          <div
            key={taskId}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
          >
            <div className="flex size-4 shrink-0 items-center justify-center rounded border border-emerald-400/40 text-emerald-400/60">
              <RiCheckLine className="size-2.5" />
            </div>
            <span className="flex-1 truncate text-sm text-muted-foreground/60">
              {taskLabels.get(taskId)}
            </span>
            <span className="text-[10px] text-emerald-500/50">Assigned</span>
          </div>
        ))}

      {/* New task suggestions */}
      {newTaskSuggestions.map((suggestion, index) => (
        <div
          key={`new-${index}`}
          className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all hover:bg-muted/60"
        >
          <button
            onClick={() => onCreateTask?.(suggestion.label)}
            className="flex flex-1 items-center gap-2.5 text-left"
          >
            <div className="flex size-4 shrink-0 items-center justify-center rounded-md border border-dashed border-amber-400/40 text-amber-400/50 transition-colors group-hover:border-amber-400/60 group-hover:text-amber-400/70">
              <RiAddLine className="size-2.5" />
            </div>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {suggestion.label}
              </span>
              <span className="truncate text-[11px] text-muted-foreground/40">
                {suggestion.rationale}
              </span>
            </div>
          </button>
          {onDismissSuggestion && (
            <button
              onClick={() => onDismissSuggestion(index)}
              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/30 opacity-0 transition-all hover:bg-muted hover:text-muted-foreground group-hover:opacity-100"
              aria-label="Dismiss suggestion"
            >
              <RiCloseLine className="size-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
