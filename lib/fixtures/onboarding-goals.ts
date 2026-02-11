/**
 * =============================================================================
 * File: onboarding-goals.ts
 * =============================================================================
 *
 * Curated goal suggestions for the onboarding experience.
 *
 * Provides a focused subset of goal suggestions that represent common use
 * cases across different life areas to help users get started quickly.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define onboarding goal suggestion templates with icons, colors, and areas.
 * - Provide representative examples across diverse life domains.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Suggestions are editable — users can modify label, icon, color before adding.
 * - Colors are hardcoded to match LIFE_AREAS for visual consistency.
 * - Icon selection represents the new curated goal icon set.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - OnboardingGoalSuggestion
 * - ONBOARDING_GOAL_SUGGESTIONS
 */

import {
  RiRunLine,
  RiHeartLine,
  RiGraduationCapLine,
  RiMoneyDollarCircleLine,
  RiTranslate,
  RiRocketLine,
  RiUserHeartLine,
  RiCompassLine,
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
  // Life (color: rose)
  {
    id: "train-5k",
    label: "Train for a 5K race",
    icon: RiRunLine,
    color: "rose",
    lifeAreaId: "life",
  },

  // Work (color: violet)
  {
    id: "certification",
    label: "Complete a certification",
    icon: RiGraduationCapLine,
    color: "violet",
    lifeAreaId: "work",
  },

  // Life (color: pink)
  {
    id: "quality-time",
    label: "Prioritize quality time",
    icon: RiHeartLine,
    color: "pink",
    lifeAreaId: "life",
  },

  // Life (color: emerald)
  {
    id: "budget",
    label: "Master my personal budget",
    icon: RiMoneyDollarCircleLine,
    color: "emerald",
    lifeAreaId: "life",
  },

  // Life (color: lime)
  {
    id: "learn-language",
    label: "Learn a new language",
    icon: RiTranslate,
    color: "lime",
    lifeAreaId: "life",
  },

  // Work (color: teal)
  {
    id: "passion-project",
    label: "Launch a passion project",
    icon: RiRocketLine,
    color: "teal",
    lifeAreaId: "work",
  },

  // Life (color: amber)
  {
    id: "volunteer",
    label: "Volunteer locally",
    icon: RiUserHeartLine,
    color: "amber",
    lifeAreaId: "life",
  },

  // Life (color: cyan)
  {
    id: "explore-local",
    label: "Explore local hidden gems",
    icon: RiCompassLine,
    color: "cyan",
    lifeAreaId: "life",
  },
];
