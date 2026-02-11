/**
 * =============================================================================
 * File: goal-icons.ts
 * =============================================================================
 *
 * Curated icon catalog for goal creation and editing.
 *
 * Provides a broad but intentional set of icon options grouped by common
 * life areas (work, creative, health, learning, social, finance, etc.) to help
 * users quickly visually identify goals.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define the list of selectable goal icon options.
 * - Pair each icon with a human-readable label.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Icons are sourced from Remix Icon for consistency.
 * - List is intentionally curated (not exhaustive) to reduce choice overload.
 * - Labels are short and UI-friendly.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GOAL_ICONS
 */

import {
  // Health & Fitness
  RiRunLine,
  RiHeartPulseLine,
  RiRidingLine,
  RiMentalHealthLine,
  RiRestTimeLine,
  RiCapsuleLine,
  RiDropLine,
  RiRestaurantLine,
  RiBodyScanLine,
  RiZzzLine,
  // Finance
  RiMoneyDollarCircleLine,
  RiWallet3Line,
  RiBankCardLine,
  RiCoinLine,
  RiSafe3Line,
  RiExchangeDollarLine,
  RiStockLine,
  RiHandCoinLine,
  // Career & Work
  RiBriefcaseLine,
  RiPresentationLine,
  RiCodeSSlashLine,
  RiBrainLine,
  RiRobotLine,
  RiRocketLine,
  RiTerminalLine,
  // Productivity & Focus
  RiFocus2Line,
  RiCalendarEventLine,
  RiTimerLine,
  // Learning & Education
  RiBookOpenLine,
  RiGraduationCapLine,
  RiPencilLine,
  RiTranslate,
  RiMicroscopeLine,
  // Creativity
  RiPaletteLine,
  RiLightbulbLine,
  // Environment & Nature
  RiEarthLine,
  // Home & Living
  RiHome4Line,
  RiPlantLine,
  RiFridgeLine,
  RiToolsLine,
  RiShoppingCartLine,
  RiDoorOpenLine,
  // Social & Relationships
  RiUserHeartLine,
  RiCupLine,
  RiUserSmileLine,
  RiTeamLine,
  RiHeartLine,
  RiChatSmile3Line,
  RiCakeLine,
  // Hospitality & Service
  RiServiceBellLine,
  // Travel & Adventure
  RiPlaneLine,
  RiSuitcaseLine,
  RiCompassLine,
  RiCamera3Line,
  // Entertainment & Leisure
  RiMusic2Line,
  RiGamepadLine,
  RiMovie2Line,
  RiTentLine,
  RiShip2Line,
  RiCarLine,
} from "@remixicon/react";
import type { GoalIconOption } from "@/lib/types";

// =============================================================================
// Goal Icons (curated list for goal creation)
// =============================================================================

export const GOAL_ICONS: GoalIconOption[] = [
  // Health & Fitness
  { icon: RiRunLine, label: "Run" },
  { icon: RiHeartPulseLine, label: "Heart Rate" },
  { icon: RiRidingLine, label: "Cycling" },
  { icon: RiMentalHealthLine, label: "Mental Health" },
  { icon: RiRestTimeLine, label: "Rest" },
  { icon: RiCapsuleLine, label: "Medicine" },
  { icon: RiDropLine, label: "Hydration" },
  { icon: RiRestaurantLine, label: "Nutrition" },
  { icon: RiBodyScanLine, label: "Body Scan" },
  { icon: RiZzzLine, label: "Sleep" },
  // Finance
  { icon: RiMoneyDollarCircleLine, label: "Money" },
  { icon: RiWallet3Line, label: "Wallet" },
  { icon: RiBankCardLine, label: "Card" },
  { icon: RiCoinLine, label: "Coin" },
  { icon: RiSafe3Line, label: "Savings" },
  { icon: RiExchangeDollarLine, label: "Exchange" },
  { icon: RiStockLine, label: "Stocks" },
  { icon: RiHandCoinLine, label: "Investment" },
  // Career & Work
  { icon: RiBriefcaseLine, label: "Briefcase" },
  { icon: RiPresentationLine, label: "Presentation" },
  { icon: RiCodeSSlashLine, label: "Code" },
  { icon: RiBrainLine, label: "AI" },
  { icon: RiRobotLine, label: "Automation" },
  { icon: RiRocketLine, label: "Launch" },
  { icon: RiTerminalLine, label: "Terminal" },
  // Productivity & Focus
  { icon: RiFocus2Line, label: "Focus" },
  { icon: RiCalendarEventLine, label: "Event" },
  { icon: RiTimerLine, label: "Timer" },
  // Learning & Education
  { icon: RiBookOpenLine, label: "Book" },
  { icon: RiGraduationCapLine, label: "Graduate" },
  { icon: RiPencilLine, label: "Writing" },
  { icon: RiTranslate, label: "Language" },
  { icon: RiMicroscopeLine, label: "Research" },
  // Creativity
  { icon: RiPaletteLine, label: "Art" },
  { icon: RiLightbulbLine, label: "Idea" },
  // Environment & Nature
  { icon: RiEarthLine, label: "Earth" },
  // Home & Living
  { icon: RiHome4Line, label: "Home" },
  { icon: RiPlantLine, label: "Plant" },
  { icon: RiFridgeLine, label: "Kitchen" },
  { icon: RiToolsLine, label: "Tools" },
  { icon: RiShoppingCartLine, label: "Shopping" },
  { icon: RiDoorOpenLine, label: "Access" },
  // Social & Relationships
  { icon: RiUserHeartLine, label: "Care" },
  { icon: RiCupLine, label: "Coffee" },
  { icon: RiUserSmileLine, label: "Happy" },
  { icon: RiTeamLine, label: "Team" },
  { icon: RiHeartLine, label: "Love" },
  { icon: RiChatSmile3Line, label: "Chat" },
  { icon: RiCakeLine, label: "Celebration" },
  // Hospitality & Service
  { icon: RiServiceBellLine, label: "Service" },
  // Travel & Adventure
  { icon: RiPlaneLine, label: "Flight" },
  { icon: RiSuitcaseLine, label: "Travel" },
  { icon: RiCompassLine, label: "Explore" },
  { icon: RiCamera3Line, label: "Photography" },
  // Entertainment & Leisure
  { icon: RiMusic2Line, label: "Music" },
  { icon: RiGamepadLine, label: "Gaming" },
  { icon: RiMovie2Line, label: "Movies" },
  { icon: RiTentLine, label: "Camping" },
  { icon: RiShip2Line, label: "Cruise" },
  { icon: RiCarLine, label: "Driving" },
];
