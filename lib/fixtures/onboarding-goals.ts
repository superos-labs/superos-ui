/**
 * Curated goal suggestions for the onboarding experience.
 * A focused subset of goals that represent common use cases.
 */

import {
  RiRunLine,
  RiMentalHealthLine,
  RiFocusLine,
  RiBookLine,
  RiCodeLine,
  RiBookOpenLine,
  RiQuillPenLine,
  RiHeart2Line,
} from "@remixicon/react";
import type { IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";

// =============================================================================
// Types
// =============================================================================

export interface OnboardingGoalSuggestion {
  /** Unique identifier for the suggestion */
  id: string;
  /** Default label (editable by user) */
  label: string;
  /** Default icon */
  icon: IconComponent;
  /** Default color (matches life area colors from lib/life-areas.ts) */
  color: GoalColor;
  /** Associated life area ID */
  lifeAreaId: string;
}

// =============================================================================
// Onboarding Goal Suggestions
// =============================================================================

/**
 * Curated goal suggestions for onboarding.
 * Selected for broad appeal and representing different life areas.
 * Colors are hardcoded to match LIFE_AREAS in lib/life-areas.ts.
 */
export const ONBOARDING_GOAL_SUGGESTIONS: OnboardingGoalSuggestion[] = [
  // Health (color: rose)
  {
    id: "workout",
    label: "Workout",
    icon: RiRunLine,
    color: "rose",
    lifeAreaId: "health",
  },
  {
    id: "meditation",
    label: "Meditate",
    icon: RiMentalHealthLine,
    color: "rose",
    lifeAreaId: "health",
  },

  // Career (color: violet)
  {
    id: "deep-work",
    label: "Deep work",
    icon: RiFocusLine,
    color: "violet",
    lifeAreaId: "career",
  },
  {
    id: "learn-skill",
    label: "Learn a skill",
    icon: RiBookLine,
    color: "violet",
    lifeAreaId: "career",
  },
  {
    id: "side-project",
    label: "Side project",
    icon: RiCodeLine,
    color: "violet",
    lifeAreaId: "career",
  },

  // Personal Growth (color: lime)
  {
    id: "reading",
    label: "Read",
    icon: RiBookOpenLine,
    color: "lime",
    lifeAreaId: "personal-growth",
  },
  {
    id: "journaling",
    label: "Journal",
    icon: RiQuillPenLine,
    color: "lime",
    lifeAreaId: "personal-growth",
  },

  // Relationships (color: pink)
  {
    id: "quality-time",
    label: "Quality time",
    icon: RiHeart2Line,
    color: "pink",
    lifeAreaId: "relationships",
  },
];
