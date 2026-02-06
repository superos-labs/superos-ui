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
  RiRocketLine,
  RiCrosshair2Line,
  RiTrophyLine,
  RiMedalLine,
  RiStarLine,
  RiFlagLine,
  RiLightbulbLine,
  RiSparklingLine,
  // Work & Productivity
  RiBriefcaseLine,
  RiCodeLine,
  RiTerminalBoxLine,
  RiPresentationLine,
  RiLineChartLine,
  RiPieChartLine,
  RiDatabase2Line,
  RiCpuLine,
  RiToolsLine,
  RiSettings3Line,
  // Creative
  RiPenNibLine,
  RiQuillPenLine,
  RiPaletteLine,
  RiPaintBrushLine,
  RiImageLine,
  RiCameraLine,
  RiMovie2Line,
  RiMusic2Line,
  RiMicLine,
  RiDraftLine,
  // Learning & Growth
  RiBookLine,
  RiGraduationCapLine,
  RiBubbleChartLine,
  RiFileTextLine,
  RiSearchLine,
  RiCompassLine,
  RiRoadMapLine,
  RiMap2Line,
  // Health & Wellness
  RiHeartLine,
  RiPulseLine,
  RiRunLine,
  RiWalkLine,
  RiHealthBookLine,
  RiPlantLine,
  RiLeafLine,
  RiSunLine,
  RiMoonLine,
  RiWaterFlashLine,
  // Social & Relationships
  RiGroupLine,
  RiTeamLine,
  RiUserLine,
  RiHandHeartLine,
  RiChat4Line,
  RiMailLine,
  RiGiftLine,
  RiEmotionHappyLine,
  // Finance & Business
  RiMoneyDollarCircleLine,
  RiShoppingBag3Line,
  RiScales3Line,
  RiGovernmentLine,
  RiVipCrownLine,
  // Home & Life
  RiHomeLine,
  RiHome4Line,
  RiCalendarLine,
  RiTimeLine,
  RiNotification3Line,
  RiCheckboxCircleLine,
  // Adventure & Fun
  RiGlobalLine,
  RiEarthLine,
  RiGlobeLine,
  RiGamepadLine,
  RiSwordLine,
  RiMagicLine,
  RiFlashlightLine,
  RiRadarLine,
  // Tech & Digital
  RiWifiLine,
  RiLinksLine,
  RiStackLine,
  RiShieldLine,
  RiLock2Line,
  RiKey2Line,
  RiZoomInLine,
  RiPrinterLine,
  RiSpeaker3Line,
  // Energy & Power
  RiThunderstormsLine,
  RiSpeedLine,
  RiInfinityLine,
} from "@remixicon/react";
import type { GoalIconOption } from "@/lib/types";

// =============================================================================
// Goal Icons (curated list for goal creation)
// =============================================================================

export const GOAL_ICONS: GoalIconOption[] = [
  // Primary / Featured
  { icon: RiRocketLine, label: "Rocket" },
  { icon: RiCrosshair2Line, label: "Target" },
  { icon: RiTrophyLine, label: "Trophy" },
  { icon: RiMedalLine, label: "Medal" },
  { icon: RiStarLine, label: "Star" },
  { icon: RiFlagLine, label: "Flag" },
  { icon: RiLightbulbLine, label: "Idea" },
  { icon: RiSparklingLine, label: "Sparkle" },
  // Work & Productivity
  { icon: RiBriefcaseLine, label: "Briefcase" },
  { icon: RiCodeLine, label: "Code" },
  { icon: RiTerminalBoxLine, label: "Terminal" },
  { icon: RiPresentationLine, label: "Presentation" },
  { icon: RiLineChartLine, label: "Chart" },
  { icon: RiPieChartLine, label: "Pie Chart" },
  { icon: RiDatabase2Line, label: "Database" },
  { icon: RiCpuLine, label: "CPU" },
  { icon: RiToolsLine, label: "Tools" },
  { icon: RiSettings3Line, label: "Settings" },
  // Creative
  { icon: RiPenNibLine, label: "Pen" },
  { icon: RiQuillPenLine, label: "Quill" },
  { icon: RiPaletteLine, label: "Palette" },
  { icon: RiPaintBrushLine, label: "Brush" },
  { icon: RiImageLine, label: "Image" },
  { icon: RiCameraLine, label: "Camera" },
  { icon: RiMovie2Line, label: "Film" },
  { icon: RiMusic2Line, label: "Music" },
  { icon: RiMicLine, label: "Mic" },
  { icon: RiDraftLine, label: "Draft" },
  // Learning & Growth
  { icon: RiBookLine, label: "Book" },
  { icon: RiGraduationCapLine, label: "Graduate" },
  { icon: RiBubbleChartLine, label: "Mind Map" },
  { icon: RiFileTextLine, label: "Document" },
  { icon: RiSearchLine, label: "Search" },
  { icon: RiCompassLine, label: "Compass" },
  { icon: RiRoadMapLine, label: "Roadmap" },
  { icon: RiMap2Line, label: "Map" },
  // Health & Wellness
  { icon: RiHeartLine, label: "Heart" },
  { icon: RiPulseLine, label: "Pulse" },
  { icon: RiRunLine, label: "Run" },
  { icon: RiWalkLine, label: "Walk" },
  { icon: RiHealthBookLine, label: "Health" },
  { icon: RiPlantLine, label: "Plant" },
  { icon: RiLeafLine, label: "Leaf" },
  { icon: RiSunLine, label: "Sun" },
  { icon: RiMoonLine, label: "Moon" },
  { icon: RiWaterFlashLine, label: "Water" },
  // Social & Relationships
  { icon: RiGroupLine, label: "Group" },
  { icon: RiTeamLine, label: "Team" },
  { icon: RiUserLine, label: "User" },
  { icon: RiHandHeartLine, label: "Care" },
  { icon: RiChat4Line, label: "Chat" },
  { icon: RiMailLine, label: "Mail" },
  { icon: RiGiftLine, label: "Gift" },
  { icon: RiEmotionHappyLine, label: "Emotion" },
  // Finance & Business
  { icon: RiMoneyDollarCircleLine, label: "Money" },
  { icon: RiShoppingBag3Line, label: "Shopping" },
  { icon: RiScales3Line, label: "Balance" },
  { icon: RiGovernmentLine, label: "Institution" },
  { icon: RiVipCrownLine, label: "Crown" },
  // Home & Life
  { icon: RiHomeLine, label: "Home" },
  { icon: RiHome4Line, label: "House" },
  { icon: RiCalendarLine, label: "Calendar" },
  { icon: RiTimeLine, label: "Time" },
  { icon: RiNotification3Line, label: "Notification" },
  { icon: RiCheckboxCircleLine, label: "Check" },
  // Adventure & Fun
  { icon: RiGlobalLine, label: "Globe" },
  { icon: RiEarthLine, label: "Earth" },
  { icon: RiGlobeLine, label: "Planet" },
  { icon: RiGamepadLine, label: "Game" },
  { icon: RiSwordLine, label: "Sword" },
  { icon: RiMagicLine, label: "Magic" },
  { icon: RiFlashlightLine, label: "Flashlight" },
  { icon: RiRadarLine, label: "Radar" },
  // Tech & Digital
  { icon: RiWifiLine, label: "Wifi" },
  { icon: RiLinksLine, label: "Link" },
  { icon: RiStackLine, label: "Stack" },
  { icon: RiShieldLine, label: "Shield" },
  { icon: RiLock2Line, label: "Lock" },
  { icon: RiKey2Line, label: "Key" },
  { icon: RiZoomInLine, label: "Zoom" },
  { icon: RiPrinterLine, label: "Printer" },
  { icon: RiSpeaker3Line, label: "Speaker" },
  // Energy & Power
  { icon: RiThunderstormsLine, label: "Thunder" },
  { icon: RiSpeedLine, label: "Speed" },
  { icon: RiInfinityLine, label: "Infinity" },
];
