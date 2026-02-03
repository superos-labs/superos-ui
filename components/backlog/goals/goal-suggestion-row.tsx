"use client";

/**
 * GoalSuggestionRow - Placeholder-style row for goal suggestions during onboarding.
 *
 * When clicked, expands into an inline editor for customizing the goal.
 * Follows the pattern from EssentialsCTA's PlaceholderRow.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { RiAddLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { OnboardingGoalSuggestion } from "@/lib/fixtures/onboarding-goals";
import {
  InlineGoalEditor,
  type InlineGoalEditorData,
} from "./inline-goal-editor";

// =============================================================================
// Types
// =============================================================================

export interface GoalSuggestionRowProps {
  /** The suggestion to display */
  suggestion: OnboardingGoalSuggestion;
  /** Whether this suggestion is currently being edited */
  isEditing: boolean;
  /** Called when user clicks to start editing */
  onStartEdit: () => void;
  /** Called when user saves the goal */
  onSave: (data: InlineGoalEditorData) => void;
  /** Called when user cancels editing */
  onCancel: () => void;
  /** Available life areas */
  lifeAreas: LifeArea[];
  /** Available icons */
  goalIcons: GoalIconOption[];
}

// =============================================================================
// Component
// =============================================================================

export function GoalSuggestionRow({
  suggestion,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  lifeAreas,
  goalIcons,
}: GoalSuggestionRowProps) {
  const IconComponent = suggestion.icon;
  const [isHovered, setIsHovered] = React.useState(false);

  if (isEditing) {
    return (
      <InlineGoalEditor
        initialData={{
          label: suggestion.label,
          icon: suggestion.icon,
          color: suggestion.color,
          lifeAreaId: suggestion.lifeAreaId,
        }}
        lifeAreas={lifeAreas}
        goalIcons={goalIcons}
        onSave={onSave}
        onCancel={onCancel}
        mode="add"
      />
    );
  }

  return (
    <button
      onClick={onStartEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/60"
      )}
    >
      {/* Icon */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40 transition-colors group-hover:bg-muted/60">
        <IconComponent
          className={cn(
            "size-4 transition-colors",
            isHovered
              ? getIconColorClass(suggestion.color)
              : "text-muted-foreground/40"
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 text-sm transition-colors",
          isHovered ? "text-muted-foreground" : "text-muted-foreground/50"
        )}
      >
        {suggestion.label}
      </span>

      {/* Plus icon - animated on hover */}
      <motion.div
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0.3,
          scale: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.15 }}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground"
      >
        <RiAddLine className="size-4" />
      </motion.div>
    </button>
  );
}
