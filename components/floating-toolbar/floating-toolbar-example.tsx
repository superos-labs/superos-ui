"use client";

import * as React from "react";
import { FloatingToolbar } from "./floating-toolbar";
import type {
  SuggestionItem,
  GoalsTabDefinition,
  GoalsByTab,
  TimeAllocationItem,
  ColorOption,
  DayOfWeek,
  IconType,
} from "./floating-toolbar-types";
import { KnobsProvider, KnobsToggle, KnobsPanel, KnobBoolean } from "@/components/knobs";
import {
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiDropLine,
  RiHome4Line,
  RiRocketLine,
  RiCodeLine,
  RiMedalLine,
  RiPenNibLine,
  RiBriefcaseLine,
  RiHeartLine,
  RiBookLine,
  RiMusicLine,
  RiGamepadLine,
  RiPlantLine,
  RiCameraLine,
  RiCupLine,
  RiFlightTakeoffLine,
  RiGraduationCapLine,
  RiLightbulbLine,
  RiPaletteLine,
  RiShoppingBagLine,
  RiStarLine,
  RiSunLine,
  RiToolsLine,
  RiUserLine,
  RiWalkLine,
  RiWifiLine,
  RiBankLine,
  RiCalendarCheckLine,
  RiChat1Line,
} from "@remixicon/react";

// =============================================================================
// Sample Data
// =============================================================================

const COMMITMENT_SUGGESTIONS: SuggestionItem[] = [
  { label: "Sleep", icon: RiMoonLine, color: "text-indigo-500" },
  { label: "Eat", icon: RiRestaurantLine, color: "text-amber-500" },
  { label: "Commute", icon: RiCarLine, color: "text-slate-500" },
  { label: "Exercise", icon: RiRunLine, color: "text-green-500" },
  { label: "Hygiene", icon: RiDropLine, color: "text-cyan-500" },
  { label: "Chores", icon: RiHome4Line, color: "text-orange-500" },
];

const GOALS_TABS: GoalsTabDefinition[] = [
  { id: "popular", label: "Popular" },
  { id: "health", label: "Health" },
  { id: "wealth", label: "Wealth" },
  { id: "relationships", label: "Relationships" },
  { id: "growth", label: "Growth" },
];

const GOALS_BY_TAB: GoalsByTab = {
  popular: [
    { label: "Ship new feature", icon: RiRocketLine, color: "text-violet-500" },
    { label: "Run a marathon", icon: RiMedalLine, color: "text-rose-500" },
    { label: "Write daily", icon: RiPenNibLine, color: "text-teal-500" },
    { label: "Learn TypeScript", icon: RiCodeLine, color: "text-blue-500" },
  ],
  health: [
    { label: "Run a marathon", icon: RiMedalLine, color: "text-rose-500" },
    { label: "Lose 10 pounds", icon: RiRunLine, color: "text-green-500" },
    { label: "Sleep 8 hours", icon: RiMoonLine, color: "text-indigo-500" },
    { label: "Meditate daily", icon: RiDropLine, color: "text-cyan-500" },
  ],
  wealth: [
    { label: "Save $10k", icon: RiRocketLine, color: "text-amber-500" },
    { label: "Start a side project", icon: RiCodeLine, color: "text-violet-500" },
    { label: "Get promoted", icon: RiMedalLine, color: "text-yellow-500" },
    { label: "Learn investing", icon: RiPenNibLine, color: "text-green-500" },
  ],
  relationships: [
    { label: "Call family weekly", icon: RiHome4Line, color: "text-orange-500" },
    { label: "Make 5 new friends", icon: RiRunLine, color: "text-pink-500" },
    { label: "Plan monthly dates", icon: RiRestaurantLine, color: "text-rose-500" },
    { label: "Join a community", icon: RiMedalLine, color: "text-blue-500" },
  ],
  growth: [
    { label: "Read 24 books", icon: RiPenNibLine, color: "text-teal-500" },
    { label: "Learn a language", icon: RiCodeLine, color: "text-indigo-500" },
    { label: "Take an online course", icon: RiRocketLine, color: "text-violet-500" },
    { label: "Write daily", icon: RiPenNibLine, color: "text-amber-500" },
  ],
};

const TIME_ALLOCATIONS: TimeAllocationItem[] = [
  { label: "Sleep", hours: 56, icon: RiMoonLine, color: "bg-indigo-500" },
  { label: "Work", hours: 40, icon: RiCodeLine, color: "bg-violet-500" },
  { label: "Eat", hours: 14, icon: RiRestaurantLine, color: "bg-amber-500" },
  { label: "Commute", hours: 10, icon: RiCarLine, color: "bg-slate-500" },
  { label: "Exercise", hours: 5, icon: RiRunLine, color: "bg-green-500" },
  { label: "Learning", hours: 7, icon: RiPenNibLine, color: "bg-teal-500" },
];

const AVAILABLE_ICONS: IconType[] = [
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiDropLine,
  RiHome4Line,
  RiRocketLine,
  RiCodeLine,
  RiMedalLine,
  RiPenNibLine,
  RiBriefcaseLine,
  RiHeartLine,
  RiBookLine,
  RiMusicLine,
  RiGamepadLine,
  RiPlantLine,
  RiCameraLine,
  RiCupLine,
  RiFlightTakeoffLine,
  RiGraduationCapLine,
  RiLightbulbLine,
  RiPaletteLine,
  RiShoppingBagLine,
  RiStarLine,
  RiSunLine,
  RiToolsLine,
  RiUserLine,
  RiWalkLine,
  RiWifiLine,
  RiBankLine,
  RiCalendarCheckLine,
  RiChat1Line,
];

const AVAILABLE_COLORS: ColorOption[] = [
  { textColor: "text-red-500", bgColor: "bg-red-500" },
  { textColor: "text-orange-500", bgColor: "bg-orange-500" },
  { textColor: "text-amber-500", bgColor: "bg-amber-500" },
  { textColor: "text-yellow-500", bgColor: "bg-yellow-500" },
  { textColor: "text-lime-500", bgColor: "bg-lime-500" },
  { textColor: "text-green-500", bgColor: "bg-green-500" },
  { textColor: "text-emerald-500", bgColor: "bg-emerald-500" },
  { textColor: "text-teal-500", bgColor: "bg-teal-500" },
  { textColor: "text-cyan-500", bgColor: "bg-cyan-500" },
  { textColor: "text-sky-500", bgColor: "bg-sky-500" },
  { textColor: "text-blue-500", bgColor: "bg-blue-500" },
  { textColor: "text-indigo-500", bgColor: "bg-indigo-500" },
  { textColor: "text-violet-500", bgColor: "bg-violet-500" },
  { textColor: "text-purple-500", bgColor: "bg-purple-500" },
  { textColor: "text-fuchsia-500", bgColor: "bg-fuchsia-500" },
  { textColor: "text-pink-500", bgColor: "bg-pink-500" },
  { textColor: "text-rose-500", bgColor: "bg-rose-500" },
  { textColor: "text-slate-500", bgColor: "bg-slate-500" },
];

const DAYS_OF_WEEK: DayOfWeek[] = [
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
  { id: "sun", label: "S" },
];

// =============================================================================
// Example Component
// =============================================================================

export function FloatingToolbarExample() {
  const [hasAllocations, setHasAllocations] = React.useState(false);

  return (
    <KnobsProvider>
      <FloatingToolbar
        commitmentSuggestions={COMMITMENT_SUGGESTIONS}
        goalsTabs={GOALS_TABS}
        goalsByTab={GOALS_BY_TAB}
        timeAllocations={TIME_ALLOCATIONS}
        hasAllocations={hasAllocations}
        availableIcons={AVAILABLE_ICONS}
        availableColors={AVAILABLE_COLORS}
        daysOfWeek={DAYS_OF_WEEK}
      />

      <KnobsToggle />
      <KnobsPanel>
        <KnobBoolean
          label="Has Allocations"
          value={hasAllocations}
          onChange={setHasAllocations}
        />
      </KnobsPanel>
    </KnobsProvider>
  );
}
