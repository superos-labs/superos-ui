"use client";

/**
 * Shell Example - Demo wrapper for the Shell feature component.
 * 
 * This is an example component that provides sample data and playground
 * controls for demonstrating the ShellContentComponent.
 * 
 * Following the architecture guidelines:
 * - All sample data lives here, not in the core component
 * - State management for demo interactions lives here
 * - Wrapped with KnobsProvider for consistent control UI
 */

import * as React from "react";
import { DragProvider } from "@/components/drag";
import { PreferencesProvider } from "@/lib/preferences";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
  KnobSelect,
} from "@/components/_playground/knobs";

// Import the core component and state hook
import { ShellContentComponent } from "./shell-content";
import { useShellState } from "./use-shell-state";

// Sample data from fixtures
import {
  DATA_SETS,
  ALL_COMMITMENTS,
  LIFE_AREAS,
  GOAL_ICONS,
  type DataSetId,
} from "@/lib/fixtures/shell-data";
import { INSPIRATION_CATEGORIES } from "@/lib/fixtures/goal-inspiration-data";

// =============================================================================
// Demo Content Component
// =============================================================================

interface ShellDemoContentProps {
  dataSetId: DataSetId;
  onDataSetChange: (id: DataSetId) => void;
}

function ShellDemoContent({ dataSetId, onDataSetChange }: ShellDemoContentProps) {
  const dataSet = DATA_SETS[dataSetId];

  // Get all state and handlers from the composed hook
  const state = useShellState({
    initialGoals: dataSet.goals,
    allCommitments: ALL_COMMITMENTS,
    initialEnabledCommitmentIds: dataSetId === "empty" ? [] : undefined,
    initialEvents: dataSet.events,
    lifeAreas: LIFE_AREAS,
    goalIcons: GOAL_ICONS,
  });

  // Demo-only UI toggles (not part of the core component)
  const [showSidebarKnob, setShowSidebarKnob] = React.useState(true);
  const [showAnalyticsKnob, setShowAnalyticsKnob] = React.useState(false);
  const [showPlanWeekKnob, setShowPlanWeekKnob] = React.useState(true);
  const [showCalendarKnob, setShowCalendarKnob] = React.useState(true);

  return (
    <>
      <ShellContentComponent
        {...state}
        inspirationCategories={INSPIRATION_CATEGORIES}
      />

      <KnobsToggle />
      <KnobsPanel>
        <KnobSelect
          label="Data Set"
          value={dataSetId}
          onChange={onDataSetChange}
          options={[
            { label: "Sample Data", value: "sample" },
            { label: "Empty", value: "empty" },
          ]}
        />
        <KnobBoolean
          label="Show Sidebar"
          value={showSidebarKnob}
          onChange={setShowSidebarKnob}
        />
        <KnobBoolean
          label="Show Analytics"
          value={showAnalyticsKnob}
          onChange={setShowAnalyticsKnob}
        />
        <KnobBoolean
          label="Show Plan Week button"
          value={showPlanWeekKnob}
          onChange={setShowPlanWeekKnob}
        />
        <KnobBoolean
          label="Show Calendar"
          value={showCalendarKnob}
          onChange={setShowCalendarKnob}
        />
      </KnobsPanel>
    </>
  );
}

// =============================================================================
// Shell Demo (with providers)
// =============================================================================

function ShellDemo() {
  const [dataSetId, setDataSetId] = React.useState<DataSetId>("sample");

  return (
    <PreferencesProvider>
      <DragProvider>
        <ShellDemoContent
          key={dataSetId}
          dataSetId={dataSetId}
          onDataSetChange={setDataSetId}
        />
      </DragProvider>
    </PreferencesProvider>
  );
}

// =============================================================================
// Exported Example Component
// =============================================================================

export function ShellExample() {
  return (
    <KnobsProvider>
      <ShellDemo />
    </KnobsProvider>
  );
}
