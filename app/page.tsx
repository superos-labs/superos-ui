"use client";

import * as React from "react";
import { DragProvider } from "@/components/drag";
import { PreferencesProvider } from "@/lib/preferences";
import { ShellContentComponent } from "@/components/shell/shell-content";
import { useShellState } from "@/components/shell/use-shell-state";
import {
  DATA_SETS,
  ALL_ESSENTIALS,
  LIFE_AREAS,
  GOAL_ICONS,
  DEMO_ENABLED_ESSENTIAL_IDS,
  type DataSetId,
} from "@/lib/fixtures/shell-data";
import { INSPIRATION_CATEGORIES } from "@/lib/fixtures/goal-inspiration-data";

interface ShellContentProps {
  dataSetId: DataSetId;
  onClearSampleData: () => void;
  onLoadSampleData: () => void;
}

function ShellContent({
  dataSetId,
  onClearSampleData,
  onLoadSampleData,
}: ShellContentProps) {
  const dataSet = DATA_SETS[dataSetId];

  // Determine initial enabled essential IDs based on data set
  const initialEnabledEssentialIds =
    dataSetId === "empty"
      ? []
      : dataSetId === "demo"
        ? DEMO_ENABLED_ESSENTIAL_IDS
        : undefined;

  const state = useShellState({
    initialGoals: dataSet.goals,
    allEssentials: ALL_ESSENTIALS,
    initialEnabledEssentialIds,
    initialEvents: dataSet.events,
    lifeAreas: LIFE_AREAS,
    goalIcons: GOAL_ICONS,
  });

  return (
    <ShellContentComponent
      {...state}
      inspirationCategories={INSPIRATION_CATEGORIES}
      onClearSampleData={onClearSampleData}
      onLoadSampleData={onLoadSampleData}
    />
  );
}

export default function Page() {
  const [dataSetId, setDataSetId] = React.useState<DataSetId>("empty");

  const handleClearSampleData = React.useCallback(() => {
    setDataSetId("empty");
  }, []);

  const handleLoadSampleData = React.useCallback(() => {
    setDataSetId("demo");
  }, []);

  return (
    <PreferencesProvider>
      <DragProvider>
        <ShellContent
          key={dataSetId}
          dataSetId={dataSetId}
          onClearSampleData={handleClearSampleData}
          onLoadSampleData={handleLoadSampleData}
        />
      </DragProvider>
    </PreferencesProvider>
  );
}
