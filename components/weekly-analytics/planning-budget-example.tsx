/**
 * =============================================================================
 * File: planning-budget-example.tsx
 * =============================================================================
 *
 * Playground example for the PlanningBudget component.
 *
 * Provides representative sample goals, essentials, and sleep configuration,
 * along with interactive knobs to simulate different weekly planning scenarios.
 *
 * Intended for internal development, design iteration, and visual QA.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define sample PlanningBudgetGoal and PlanningBudgetEssential data.
 * - Manage local state for simulated scheduled hours and sleep settings.
 * - Render PlanningBudget with controllable inputs.
 * - Expose knobs for real-time parameter tweaking.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting any data.
 * - Enforcing business rules.
 * - Representing production usage patterns.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses Remix Icons to mirror real app icon usage.
 * - Knobs are grouped by concern (sleep, then goals).
 * - Week label is hard-coded for demo purposes.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - PlanningBudgetExample
 */

"use client";

import * as React from "react";
import { PlanningBudget } from "./planning-budget";
import type {
  PlanningBudgetGoal,
  PlanningBudgetEssential,
} from "./planning-budget";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
  KnobNumber,
} from "@/components/_playground/knobs";
import {
  RiRocketLine,
  RiMedalLine,
  RiPenNibLine,
  RiTranslate2,
  RiRestaurantLine,
  RiCarLine,
} from "@remixicon/react";

// =============================================================================
// Sample Data
// =============================================================================

const SAMPLE_GOALS: PlanningBudgetGoal[] = [
  {
    id: "superos",
    label: "SuperOS",
    icon: RiRocketLine,
    color: "violet",
    lifeAreaId: "career",
    scheduledHours: 12,
  },
  {
    id: "marathon",
    label: "Marathon Training",
    icon: RiMedalLine,
    color: "rose",
    lifeAreaId: "health",
    scheduledHours: 6,
  },
  {
    id: "book",
    label: "Write Book",
    icon: RiPenNibLine,
    color: "teal",
    lifeAreaId: "creativity",
    scheduledHours: 4,
  },
  {
    id: "spanish",
    label: "Learn Spanish",
    icon: RiTranslate2,
    color: "blue",
    lifeAreaId: "personal-growth",
    scheduledHours: 3,
  },
];

const SAMPLE_ESSENTIALS: PlanningBudgetEssential[] = [
  {
    id: "lunch",
    label: "Lunch",
    icon: RiRestaurantLine,
    color: "amber",
    scheduledHours: 7, // 1h/day
  },
  {
    id: "dinner",
    label: "Dinner",
    icon: RiRestaurantLine,
    color: "amber",
    scheduledHours: 7, // 1h/day
  },
  {
    id: "commute",
    label: "Commute",
    icon: RiCarLine,
    color: "slate",
    scheduledHours: 5, // 30min × 2 × 5 days
  },
];

// =============================================================================
// Example Component
// =============================================================================

export function PlanningBudgetExample() {
  // Sleep config
  const [isSleepConfigured, setIsSleepConfigured] = React.useState(true);
  const [wakeUpMinutes, setWakeUpMinutes] = React.useState(420); // 7:00 AM
  const [windDownMinutes, setWindDownMinutes] = React.useState(1380); // 11:00 PM

  // Simulated goal scheduling (interactive demo)
  const [goalHours, setGoalHours] = React.useState({
    superos: 12,
    marathon: 6,
    book: 4,
    spanish: 3,
  });

  const goals = SAMPLE_GOALS.map((goal) => ({
    ...goal,
    scheduledHours: goalHours[goal.id as keyof typeof goalHours] ?? 0,
  }));

  return (
    <KnobsProvider>
      <div className="flex flex-col gap-6">
        <PlanningBudget
          goals={goals}
          essentials={SAMPLE_ESSENTIALS}
          wakeUpMinutes={wakeUpMinutes}
          windDownMinutes={windDownMinutes}
          isSleepConfigured={isSleepConfigured}
          weekLabel="Jan 20 – 26"
        />

        <KnobsToggle />
        <KnobsPanel>
          <KnobBoolean
            label="Sleep Configured"
            value={isSleepConfigured}
            onChange={setIsSleepConfigured}
          />
          <KnobNumber
            label="Wake Up (min)"
            value={wakeUpMinutes}
            onChange={setWakeUpMinutes}
            min={0}
            max={720}
            step={30}
          />
          <KnobNumber
            label="Wind Down (min)"
            value={windDownMinutes}
            onChange={setWindDownMinutes}
            min={1080}
            max={1440}
            step={30}
          />
          <div className="border-t border-border pt-2 mt-2">
            <span className="text-xs font-medium text-muted-foreground">
              Goal Hours
            </span>
          </div>
          <KnobNumber
            label="SuperOS"
            value={goalHours.superos}
            onChange={(v) => setGoalHours((prev) => ({ ...prev, superos: v }))}
            min={0}
            max={40}
            step={1}
          />
          <KnobNumber
            label="Marathon"
            value={goalHours.marathon}
            onChange={(v) => setGoalHours((prev) => ({ ...prev, marathon: v }))}
            min={0}
            max={20}
            step={1}
          />
          <KnobNumber
            label="Book"
            value={goalHours.book}
            onChange={(v) => setGoalHours((prev) => ({ ...prev, book: v }))}
            min={0}
            max={20}
            step={1}
          />
          <KnobNumber
            label="Spanish"
            value={goalHours.spanish}
            onChange={(v) => setGoalHours((prev) => ({ ...prev, spanish: v }))}
            min={0}
            max={20}
            step={1}
          />
        </KnobsPanel>
      </div>
    </KnobsProvider>
  );
}
