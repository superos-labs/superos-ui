"use client";

import * as React from "react";
import { DragProvider } from "@/components/drag";
import { PreferencesProvider } from "@/lib/preferences";
import { UndoProvider } from "@/lib/undo";
import { ShellContentComponent } from "@/components/shell/shell-content";
import { useShellState } from "@/components/shell/use-shell-state";
import {
  DATA_SETS,
  ALL_ESSENTIALS,
  LIFE_AREAS,
  GOAL_ICONS,
  COMPLETE_ENABLED_ESSENTIAL_IDS,
  type DataSetId,
} from "@/lib/fixtures/shell-data";
import { INSPIRATION_CATEGORIES } from "@/lib/fixtures/goal-inspiration-data";

interface ShellContentInnerProps {
  dataSetId: DataSetId;
  onSkipOnboarding: () => void;
}

function ShellContentInner({
  dataSetId,
  onSkipOnboarding,
}: ShellContentInnerProps) {
  const dataSet = DATA_SETS[dataSetId] ?? DATA_SETS.empty;

  // Determine initial enabled essential IDs based on data set
  const initialEnabledEssentialIds =
    dataSetId === "empty"
      ? []
      : dataSetId === "complete"
        ? COMPLETE_ENABLED_ESSENTIAL_IDS
        : undefined;

  const state = useShellState({
    initialGoals: dataSet.goals,
    allEssentials: ALL_ESSENTIALS,
    initialEnabledEssentialIds,
    initialEvents: dataSet.events,
    lifeAreas: LIFE_AREAS,
    goalIcons: GOAL_ICONS,
    // When complete data set is loaded, skip onboarding and mark week planned
    skipOnboarding: dataSetId === "complete",
  });

  return (
    <ShellContentComponent
      {...state}
      inspirationCategories={INSPIRATION_CATEGORIES}
      onSkipOnboarding={onSkipOnboarding}
    />
  );
}

export default function Page() {
  const [dataSetId, setDataSetId] = React.useState<DataSetId>("empty");

  const handleSkipOnboarding = React.useCallback(() => {
    setDataSetId("complete");
  }, []);

  return (
    <PreferencesProvider>
      <UndoProvider>
        <DragProvider>
          <ShellContentInner
            key={dataSetId}
            dataSetId={dataSetId}
            onSkipOnboarding={handleSkipOnboarding}
          />
        </DragProvider>
      </UndoProvider>
    </PreferencesProvider>
  );
}
