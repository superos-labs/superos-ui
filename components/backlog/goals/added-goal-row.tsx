"use client";

/**
 * AddedGoalRow - Row for goals that have been added during onboarding.
 *
 * Displays the goal with its icon/color and allows clicking to edit.
 * When editing, expands into the inline editor.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIconColorClass, getIconBgSoftClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea, GoalIconOption } from "@/lib/types";
import {
  InlineGoalEditor,
  type InlineGoalEditorData,
} from "./inline-goal-editor";

// =============================================================================
// Types
// =============================================================================

export interface AddedGoal {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
}

export interface AddedGoalRowProps {
  /** The goal to display */
  goal: AddedGoal;
  /** Whether this goal is currently being edited */
  isEditing: boolean;
  /** Called when user clicks to start editing */
  onStartEdit: () => void;
  /** Called when user saves changes */
  onSave: (data: InlineGoalEditorData) => void;
  /** Called when user cancels editing */
  onCancel: () => void;
  /** Called when user deletes the goal */
  onDelete: () => void;
  /** Available life areas */
  lifeAreas: LifeArea[];
  /** Available icons */
  goalIcons: GoalIconOption[];
}

// =============================================================================
// Component
// =============================================================================

export function AddedGoalRow({
  goal,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  lifeAreas,
  goalIcons,
}: AddedGoalRowProps) {
  const IconComponent = goal.icon;
  const lifeArea = lifeAreas.find((a) => a.id === goal.lifeAreaId);

  if (isEditing) {
    return (
      <InlineGoalEditor
        initialData={{
          label: goal.label,
          icon: goal.icon,
          color: goal.color,
          lifeAreaId: goal.lifeAreaId,
        }}
        lifeAreas={lifeAreas}
        goalIcons={goalIcons}
        onSave={onSave}
        onCancel={onCancel}
        onDelete={onDelete}
        mode="edit"
      />
    );
  }

  return (
    <button
      onClick={onStartEdit}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/60"
      )}
    >
      {/* Icon with colored background */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          getIconBgSoftClass(goal.color)
        )}
      >
        <IconComponent
          className={cn("size-4", getIconColorClass(goal.color))}
        />
      </div>

      {/* Label and life area */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {goal.label}
        </span>
        {lifeArea && (
          <span className="text-xs text-muted-foreground">
            {lifeArea.label}
          </span>
        )}
      </div>
    </button>
  );
}
