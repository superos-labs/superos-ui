/**
 * =============================================================================
 * File: onboarding-goals-card.tsx
 * =============================================================================
 *
 * Card-based surface for setting initial goals during onboarding.
 *
 * Combines:
 * - Custom goal creation.
 * - Editing and deleting added goals.
 * - Adding goals from predefined suggestions.
 *
 * Designed as a self-contained orchestration component that coordinates
 * multiple goal-related primitives.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render onboarding header, content, and footer.
 * - Track which row/editor is currently active.
 * - Bridge add, update, and delete actions to parent.
 * - Enable Continue only after at least one goal exists.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting goals.
 * - Defining suggestion data.
 * - Validating goal semantics.
 *
 * -----------------------------------------------------------------------------
 * KEY DEPENDENCIES
 * -----------------------------------------------------------------------------
 * - InlineGoalEditor
 * - GoalSuggestionRow
 * - AddedGoalRow
 * - framer-motion
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Suggestions are filtered once added.
 * - Custom goal entry is placed at the top for visibility.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - OnboardingGoalsCard
 * - OnboardingGoalsCardProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { RiAddLine, RiStarLine } from "@remixicon/react";
import type { LifeArea, GoalIconOption, IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import type { OnboardingGoalSuggestion } from "@/lib/fixtures/onboarding-goals";
import { GoalSuggestionRow } from "./goal-suggestion-row";
import { AddedGoalRow, type AddedGoal } from "./added-goal-row";
import {
  InlineGoalEditor,
  type InlineGoalEditorData,
} from "./inline-goal-editor";

// =============================================================================
// Types
// =============================================================================

export interface OnboardingGoalsCardProps {
  /** Goals that have been added */
  goals: AddedGoal[];
  /** Callback when a goal is added */
  onAddGoal: (data: InlineGoalEditorData) => void;
  /** Callback when a goal is updated */
  onUpdateGoal: (goalId: string, data: InlineGoalEditorData) => void;
  /** Callback when a goal is removed */
  onRemoveGoal: (goalId: string) => void;
  /** Callback when user clicks Continue */
  onContinue: () => void;
  /** Goal suggestions to display */
  suggestions: OnboardingGoalSuggestion[];
  /** Available life areas */
  lifeAreas: LifeArea[];
  /** Available icons */
  goalIcons: GoalIconOption[];
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function OnboardingGoalsCard({
  goals,
  onAddGoal,
  onUpdateGoal,
  onRemoveGoal,
  onContinue,
  suggestions,
  lifeAreas,
  goalIcons,
  className,
}: OnboardingGoalsCardProps) {
  // Track which item is being edited
  // Format: "suggestion:{id}" | "goal:{id}" | "custom" | null
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Get suggestion IDs that have already been added (to filter them out)
  // We track by matching suggestion ID to added goal's originSuggestionId
  const [addedSuggestionIds, setAddedSuggestionIds] = React.useState<
    Set<string>
  >(new Set());

  // Filter suggestions to exclude already-added ones
  const availableSuggestions = suggestions.filter(
    (s) => !addedSuggestionIds.has(s.id),
  );

  // Handle adding a goal from a suggestion
  const handleAddFromSuggestion = (
    suggestionId: string,
    data: InlineGoalEditorData,
  ) => {
    onAddGoal(data);
    setAddedSuggestionIds((prev) => new Set(prev).add(suggestionId));
    setEditingId(null);
  };

  // Handle adding a custom goal
  const handleAddCustom = (data: InlineGoalEditorData) => {
    onAddGoal(data);
    setEditingId(null);
  };

  // Handle updating an existing goal
  const handleUpdateGoal = (goalId: string, data: InlineGoalEditorData) => {
    onUpdateGoal(goalId, data);
    setEditingId(null);
  };

  // Handle deleting a goal
  const handleDeleteGoal = (goalId: string) => {
    onRemoveGoal(goalId);
    setEditingId(null);
  };

  // Handle starting to add a custom goal
  const handleStartCustom = () => {
    setEditingId("custom");
  };

  // Get default values for custom goal
  const getDefaultCustomData = (): InlineGoalEditorData => {
    const defaultLifeArea = lifeAreas[0];
    const defaultIcon = goalIcons[0]?.icon ?? RiStarLine;
    return {
      label: "",
      icon: defaultIcon,
      color: defaultLifeArea?.color ?? "violet",
      lifeAreaId: defaultLifeArea?.id ?? "",
    };
  };

  const canContinue = goals.length > 0;

  return (
    <div
      className={cn(
        "flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border px-6 py-5">
        <h2 className="text-xl font-semibold text-foreground">
          Set your goals
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a goal to start planning time around what matters. You can
          start small and change it anytime.
        </p>
      </div>

      {/* Content - scrollable */}
      <div className="scrollbar-hidden flex max-h-[400px] flex-1 flex-col overflow-y-auto px-3 py-3">
        {/* Custom goal creator - at top for visibility */}
        {editingId === "custom" ? (
          <InlineGoalEditor
            initialData={getDefaultCustomData()}
            lifeAreas={lifeAreas}
            goalIcons={goalIcons}
            onSave={handleAddCustom}
            onCancel={() => setEditingId(null)}
            mode="add"
          />
        ) : (
          <button
            onClick={handleStartCustom}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted/60"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <RiAddLine className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Add your own</span>
          </button>
        )}

        {/* Added goals */}
        <AnimatePresence mode="sync">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AddedGoalRow
                goal={goal}
                isEditing={editingId === `goal:${goal.id}`}
                onStartEdit={() => setEditingId(`goal:${goal.id}`)}
                onSave={(data) => handleUpdateGoal(goal.id, data)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDeleteGoal(goal.id)}
                lifeAreas={lifeAreas}
                goalIcons={goalIcons}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Divider if there are added goals */}
        {goals.length > 0 && availableSuggestions.length > 0 && (
          <div className="my-2 border-t border-border/50" />
        )}

        {/* Goal suggestions */}
        <AnimatePresence mode="sync">
          {availableSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <GoalSuggestionRow
                suggestion={suggestion}
                isEditing={editingId === `suggestion:${suggestion.id}`}
                onStartEdit={() => setEditingId(`suggestion:${suggestion.id}`)}
                onSave={(data) => handleAddFromSuggestion(suggestion.id, data)}
                onCancel={() => setEditingId(null)}
                lifeAreas={lifeAreas}
                goalIcons={goalIcons}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer with Continue button */}
      <div className="border-t border-border px-6 py-4">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
            canContinue
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
