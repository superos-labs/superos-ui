/**
 * =============================================================================
 * File: types.ts
 * =============================================================================
 *
 * Goal domain types shared between components and app logic.
 *
 * Defines shapes for goal creation and the inspiration gallery. Core scheduling
 * goal structures live in the unified schedule domain.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define data needed to create new goals.
 * - Define inspiration gallery goal and category types.
 * - Re-export common goal-related types for convenience.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Keeps UI-level goal concerns separate from scheduling primitives.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - NewGoalData
 * - InspirationGoal
 * - InspirationCategory
 * - LifeArea
 * - GoalIconOption
 */

import type { GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea, GoalIconOption } from "@/lib/types";

// Re-export for convenience
export type { LifeArea, GoalIconOption };

// =============================================================================
// Goal Creation
// =============================================================================

/**
 * Data for creating a new goal.
 * Used by goal creation forms and inspiration gallery.
 */
export interface NewGoalData {
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
}

// =============================================================================
// Inspiration Gallery
// =============================================================================

/**
 * A goal suggestion in the inspiration gallery.
 */
export interface InspirationGoal {
  id: string;
  label: string;
  icon: IconComponent;
  /** Optional description shown on hover */
  description?: string;
}

/**
 * A category of inspiration goals grouped by life area.
 */
export interface InspirationCategory {
  lifeArea: LifeArea;
  goals: InspirationGoal[];
}
