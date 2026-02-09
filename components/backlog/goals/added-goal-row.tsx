/**
 * =============================================================================
 * File: added-goal-row.tsx
 * =============================================================================
 *
 * Row component for displaying and editing an already-added Goal in backlog
 * and onboarding goal lists.
 *
 * Renders either:
 * - A compact, clickable summary row.
 * - An InlineGoalEditor when in editing mode.
 *
 * This component owns no persistence logic and simply bridges user actions
 * to parent handlers.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Display goal label, icon, color, life area, optional start date, and optional target date.
 * - Toggle between display and inline edit modes.
 * - Forward save, cancel, and delete events.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Validating goal data.
 * - Persisting changes.
 * - Fetching life areas or icons.
 *
 * -----------------------------------------------------------------------------
 * KEY DEPENDENCIES
 * -----------------------------------------------------------------------------
 * - InlineGoalEditor
 * - formatGranularDate (from lib/unified-schedule)
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Clicking the row enters edit mode.
 * - Dates formatted using granular display (day/month/quarter).
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - AddedGoalRow
 * - AddedGoalRowProps
 */

"use client";

import { cn } from "@/lib/utils";
import { getIconColorClass, getIconBgSoftClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea, GoalIconOption } from "@/lib/types";
import type { DateGranularity } from "@/lib/unified-schedule";
import { formatGranularDate } from "@/lib/unified-schedule";
import { RiCalendarLine } from "@remixicon/react";
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
  /** Optional start date (ISO date string) */
  startDate?: string;
  /** Granularity of the start date */
  startDateGranularity?: DateGranularity;
  /** Optional target completion date (ISO date string) */
  deadline?: string;
  /** Granularity of the target date */
  deadlineGranularity?: DateGranularity;
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
          startDate: goal.startDate,
          startDateGranularity: goal.startDateGranularity,
          deadline: goal.deadline,
          deadlineGranularity: goal.deadlineGranularity,
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
        "hover:bg-muted/60",
      )}
    >
      {/* Icon with colored background */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          getIconBgSoftClass(goal.color),
        )}
      >
        <IconComponent
          className={cn("size-4", getIconColorClass(goal.color))}
        />
      </div>

      {/* Label and metadata */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {goal.label}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lifeArea && <span>{lifeArea.label}</span>}
          {lifeArea && (goal.startDate || goal.deadline) && (
            <span className="text-muted-foreground/40">·</span>
          )}
          {goal.startDate && (
            <span className="flex items-center gap-1">
              <RiCalendarLine className="size-3" />
              {formatGranularDate(
                goal.startDate,
                goal.startDateGranularity ?? "day",
              )}
            </span>
          )}
          {goal.startDate && goal.deadline && (
            <span className="text-muted-foreground/40">–</span>
          )}
          {goal.deadline && (
            <span className="flex items-center gap-1">
              {!goal.startDate && <RiCalendarLine className="size-3" />}
              {formatGranularDate(
                goal.deadline,
                goal.deadlineGranularity ?? "day",
              )}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
