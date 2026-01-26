"use client";

import * as React from "react";
import { WeeklyAnalytics } from "./weekly-analytics";
import type { WeeklyAnalyticsItem } from "./weekly-analytics";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
} from "@/components/_playground/knobs";
import {
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiDropLine,
  RiHome4Line,
  RiRocketLine,
  RiMedalLine,
  RiPenNibLine,
  RiTranslate2,
} from "@remixicon/react";

const SAMPLE_COMMITMENTS: WeeklyAnalyticsItem[] = [
  {
    id: "sleep",
    label: "Sleep",
    icon: RiMoonLine,
    color: "text-indigo-500",
    plannedHours: 56,
    completedHours: 48,
  },
  {
    id: "eat",
    label: "Eat",
    icon: RiRestaurantLine,
    color: "text-amber-500",
    plannedHours: 14,
    completedHours: 12,
  },
  {
    id: "commute",
    label: "Commute",
    icon: RiCarLine,
    color: "text-slate-500",
    plannedHours: 10,
    completedHours: 8,
  },
  {
    id: "exercise",
    label: "Exercise",
    icon: RiRunLine,
    color: "text-green-500",
    plannedHours: 5,
    completedHours: 3,
  },
  {
    id: "hygiene",
    label: "Hygiene",
    icon: RiDropLine,
    color: "text-cyan-500",
    plannedHours: 7,
    completedHours: 7,
  },
  {
    id: "chores",
    label: "Chores",
    icon: RiHome4Line,
    color: "text-orange-500",
    plannedHours: 4,
    completedHours: 2,
  },
];

const SAMPLE_GOALS: WeeklyAnalyticsItem[] = [
  {
    id: "superos",
    label: "SuperOS",
    icon: RiRocketLine,
    color: "text-violet-500",
    plannedHours: 20,
    completedHours: 12,
  },
  {
    id: "marathon",
    label: "Marathon Training",
    icon: RiMedalLine,
    color: "text-rose-500",
    plannedHours: 6,
    completedHours: 4,
  },
  {
    id: "book",
    label: "Write Book",
    icon: RiPenNibLine,
    color: "text-teal-500",
    plannedHours: 7,
    completedHours: 5,
  },
  {
    id: "spanish",
    label: "Learn Spanish",
    icon: RiTranslate2,
    color: "text-blue-500",
    plannedHours: 5,
    completedHours: 5,
  },
];

export function WeeklyAnalyticsExample() {
  const [showSummary, setShowSummary] = React.useState(true);

  return (
    <KnobsProvider>
      <WeeklyAnalytics
        commitments={SAMPLE_COMMITMENTS}
        goals={SAMPLE_GOALS}
        weekLabel="Jan 20 – 26"
        showSummary={showSummary}
      />

      <KnobsToggle />
      <KnobsPanel>
        <KnobBoolean
          label="Show Summary"
          value={showSummary}
          onChange={setShowSummary}
        />
      </KnobsPanel>
    </KnobsProvider>
  );
}
