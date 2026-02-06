/**
 * =============================================================================
 * File: weekly-analytics-example.tsx
 * =============================================================================
 *
 * Playground example for the WeeklyAnalytics component.
 *
 * Provides sample goal analytics data and a minimal set of knobs to
 * toggle high-level presentation states.
 *
 * Intended for internal development, visual QA, and design iteration.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define representative WeeklyAnalyticsItem sample data.
 * - Manage local state for demo-only toggles.
 * - Render WeeklyAnalytics inside a knobs playground.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting analytics data.
 * - Computing planned or completed hours.
 * - Representing production usage patterns.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses Remix Icons to mirror real app icon usage.
 * - Week label is hard-coded for demo purposes.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - WeeklyAnalyticsExample
 */

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
  RiRocketLine,
  RiMedalLine,
  RiPenNibLine,
  RiTranslate2,
} from "@remixicon/react";

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
