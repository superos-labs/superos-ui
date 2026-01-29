/**
 * Seed data for the Goal Inspiration Gallery.
 * Goals that benefit from time allocation and weekly recurrence.
 */

import {
  // Health icons
  RiRunLine,
  RiHeartLine,
  RiMoonLine,
  RiDropLine,
  RiMentalHealthLine,
  RiLeafLine,
  RiFirstAidKitLine,
  RiRestaurantLine,
  // Career icons
  RiFocusLine,
  RiBookLine,
  RiUserHeartLine,
  RiCodeLine,
  RiMedalLine,
  RiMicLine,
  RiTeamLine,
  RiSearchLine,
  RiArtboardLine,
  RiNewspaperLine,
  // Relationships icons
  RiHeart2Line,
  RiPhoneLine,
  RiGroupLine,
  RiMailLine,
  RiEmotionHappyLine,
  RiMapPinLine,
  // Finance icons
  RiCalculatorLine,
  RiLineChartLine,
  RiWalletLine,
  RiBankLine,
  RiSafeLine,
  RiFileTextLine,
  RiHandCoinLine,
  // Personal Growth icons
  RiQuillPenLine,
  RiBookOpenLine,
  RiTranslate2,
  RiUserSearchLine,
  RiLoopLeftLine,
  RiHome3Line,
  RiEditLine,
  RiGraduationCapLine,
  // Creativity icons
  RiBrushLine,
  RiMusic2Line,
  RiCameraLine,
  RiScissorsCutLine,
  RiVideoChatLine,
  RiPencilRulerLine,
  // Community icons
  RiHandHeartLine,
  RiCalendarEventLine,
  RiFlagLine,
  RiHome2Line,
  RiUserStarLine,
  // Recreation icons
  RiGamepadLine,
  RiCompass3Line,
  RiBasketballLine,
  RiPlaneLine,
  RiFilmLine,
  RiLightbulbLine,
  RiSeedlingLine,
  RiFootballLine,
} from "@remixicon/react";
import type { InspirationCategory } from "@/components/backlog";
import { LIFE_AREAS_BY_ID } from "@/lib/life-areas";

// =============================================================================
// Goal Inspiration Data
// =============================================================================

export const INSPIRATION_CATEGORIES: InspirationCategory[] = [
  {
    lifeArea: LIFE_AREAS_BY_ID.get("health")!,
    goals: [
      { id: "workout", label: "Workout", icon: RiRunLine },
      { id: "run", label: "Run", icon: RiRunLine },
      { id: "cook-at-home", label: "Cook at home", icon: RiRestaurantLine },
      {
        id: "resolve-pain",
        label: "Resolve recurring pain",
        icon: RiFirstAidKitLine,
      },
      { id: "mobility", label: "Daily mobility routine", icon: RiHeartLine },
      {
        id: "mood-tracking",
        label: "Track mood and symptoms",
        icon: RiMentalHealthLine,
      },
      {
        id: "sleep-routine",
        label: "Consistent sleep schedule",
        icon: RiMoonLine,
      },
      { id: "hydration", label: "Stay hydrated", icon: RiDropLine },
      { id: "meditation", label: "Meditate", icon: RiMentalHealthLine },
      { id: "nutrition", label: "Improve nutrition", icon: RiLeafLine },
    ],
  },
  {
    lifeArea: LIFE_AREAS_BY_ID.get("career")!,
    goals: [
      { id: "deep-work", label: "Deep work blocks", icon: RiFocusLine },
      { id: "learn-skill", label: "Learn a new skill", icon: RiBookLine },
      { id: "networking", label: "Network regularly", icon: RiUserHeartLine },
      { id: "side-project", label: "Work on side project", icon: RiCodeLine },
      { id: "certifications", label: "Get certified", icon: RiMedalLine },
      {
        id: "public-speaking",
        label: "Practice public speaking",
        icon: RiMicLine,
      },
      { id: "mentor", label: "Mentor someone", icon: RiTeamLine },
      { id: "job-search", label: "Job search efforts", icon: RiSearchLine },
      { id: "portfolio", label: "Update portfolio", icon: RiArtboardLine },
      {
        id: "industry-reading",
        label: "Industry reading",
        icon: RiNewspaperLine,
      },
    ],
  },
  {
    lifeArea: LIFE_AREAS_BY_ID.get("relationships")!,
    goals: [
      {
        id: "quality-time-partner",
        label: "Quality time with partner",
        icon: RiHeart2Line,
      },
      { id: "call-family", label: "Call family weekly", icon: RiPhoneLine },
      { id: "friend-dates", label: "Friend dates", icon: RiGroupLine },
      { id: "date-nights", label: "Date nights", icon: RiHeart2Line },
      { id: "write-letters", label: "Write letters", icon: RiMailLine },
      {
        id: "active-listening",
        label: "Practice active listening",
        icon: RiUserHeartLine,
      },
      {
        id: "gratitude-partner",
        label: "Express gratitude to partner",
        icon: RiEmotionHappyLine,
      },
      { id: "plan-trips", label: "Plan trips together", icon: RiMapPinLine },
    ],
  },
  {
    lifeArea: LIFE_AREAS_BY_ID.get("finance")!,
    goals: [
      {
        id: "budget-review",
        label: "Weekly budget review",
        icon: RiCalculatorLine,
      },
      { id: "investing", label: "Learn investing", icon: RiLineChartLine },
      { id: "expense-tracking", label: "Track expenses", icon: RiWalletLine },
      { id: "debt-payoff", label: "Debt payoff plan", icon: RiBankLine },
      { id: "savings-goal", label: "Save for a goal", icon: RiSafeLine },
      {
        id: "financial-reading",
        label: "Financial literacy reading",
        icon: RiBookOpenLine,
      },
      { id: "tax-prep", label: "Tax preparation", icon: RiFileTextLine },
      { id: "negotiate", label: "Practice negotiation", icon: RiHandCoinLine },
    ],
  },
  {
    lifeArea: LIFE_AREAS_BY_ID.get("personal-growth")!,
    goals: [
      { id: "journaling", label: "Daily journaling", icon: RiQuillPenLine },
      { id: "reading", label: "Read books", icon: RiBookOpenLine },
      { id: "language", label: "Learn a language", icon: RiTranslate2 },
      { id: "therapy", label: "Attend therapy", icon: RiMentalHealthLine },
      {
        id: "self-reflection",
        label: "Weekly self-reflection",
        icon: RiUserSearchLine,
      },
      { id: "habits", label: "Build new habits", icon: RiLoopLeftLine },
      { id: "declutter", label: "Declutter and organize", icon: RiHome3Line },
      { id: "creative-writing", label: "Creative writing", icon: RiEditLine },
      {
        id: "course",
        label: "Take an online course",
        icon: RiGraduationCapLine,
      },
    ],
  },
  {
    lifeArea: LIFE_AREAS_BY_ID.get("creativity")!,
    goals: [
      { id: "drawing", label: "Practice drawing", icon: RiBrushLine },
      { id: "music", label: "Practice instrument", icon: RiMusic2Line },
      { id: "photography", label: "Photography practice", icon: RiCameraLine },
      { id: "writing-fiction", label: "Write fiction", icon: RiQuillPenLine },
      { id: "crafting", label: "Crafting or DIY", icon: RiScissorsCutLine },
      { id: "video-editing", label: "Video creation", icon: RiVideoChatLine },
      { id: "design", label: "Design projects", icon: RiPencilRulerLine },
      {
        id: "cooking-creative",
        label: "Try new recipes",
        icon: RiRestaurantLine,
      },
    ],
  },
  {
    lifeArea: LIFE_AREAS_BY_ID.get("community")!,
    goals: [
      {
        id: "volunteering",
        label: "Volunteer regularly",
        icon: RiHandHeartLine,
      },
      {
        id: "local-events",
        label: "Attend local events",
        icon: RiCalendarEventLine,
      },
      { id: "club", label: "Join a club or group", icon: RiGroupLine },
      { id: "causes", label: "Support causes", icon: RiFlagLine },
      { id: "neighbor", label: "Connect with neighbors", icon: RiHome2Line },
      { id: "mentorship", label: "Community mentorship", icon: RiUserStarLine },
    ],
  },
  {
    lifeArea: LIFE_AREAS_BY_ID.get("recreation")!,
    goals: [
      {
        id: "outdoor-adventure",
        label: "Outdoor adventures",
        icon: RiCompass3Line,
      },
      { id: "sports", label: "Play a sport", icon: RiBasketballLine },
      { id: "travel", label: "Travel planning", icon: RiPlaneLine },
      { id: "gaming", label: "Gaming time", icon: RiGamepadLine },
      { id: "movies", label: "Movie nights", icon: RiFilmLine },
      { id: "hobbies", label: "Hobby time", icon: RiLightbulbLine },
      { id: "nature", label: "Time in nature", icon: RiSeedlingLine },
      {
        id: "social-sports",
        label: "Social sports leagues",
        icon: RiFootballLine,
      },
    ],
  },
];
