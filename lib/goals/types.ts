/**
 * Types for goals in the application.
 *
 * This module contains types specific to goal management that are shared
 * between the component layer and the app layer.
 *
 * Core data types (ScheduleGoal, ScheduleTask, Milestone, Subtask) are in
 * lib/unified-schedule/types.ts as they're part of the scheduling system.
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
