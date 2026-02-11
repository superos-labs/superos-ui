/**
 * Curated goal suggestions for the onboarding experience.
 * A focused subset of goals that represent common use cases.
 */

import {
  RiRunLine,
  RiHeart2Line,
  RiMedalLine,
  RiMoneyDollarCircleLine,
  RiGlobeLine,
  RiRocketLine,
  RiHandHeartLine,
  RiCompass3Line,
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
    icon: RiMedalLine,
    color: "violet",
    lifeAreaId: "work",
  },

  // Life (color: pink)
  {
    id: "quality-time",
    label: "Prioritize quality time",
    icon: RiHeart2Line,
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
    icon: RiGlobeLine,
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
    icon: RiHandHeartLine,
    color: "amber",
    lifeAreaId: "life",
  },

  // Life (color: cyan)
  {
    id: "explore-local",
    label: "Explore local hidden gems",
    icon: RiCompass3Line,
    color: "cyan",
    lifeAreaId: "life",
  },
];
