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
  type DataSetId,
} from "@/lib/fixtures/shell-data";
import { INSPIRATION_CATEGORIES } from "@/lib/fixtures/goal-inspiration-data";

interface ShellContentProps {
  dataSetId: DataSetId;
  onClearSampleData: () => void;
}

function ShellContent({ dataSetId, onClearSampleData }: ShellContentProps) {
  const dataSet = DATA_SETS[dataSetId];

  const state = useShellState({
    initialGoals: dataSet.goals,
    allEssentials: ALL_ESSENTIALS,
    initialEnabledEssentialIds: dataSetId === "empty" ? [] : undefined,
    initialEvents: dataSet.events,
    lifeAreas: LIFE_AREAS,
    goalIcons: GOAL_ICONS,
  });

  return (
    <ShellContentComponent
      {...state}
      inspirationCategories={INSPIRATION_CATEGORIES}
      onClearSampleData={onClearSampleData}
    />
  );
}

export default function Page() {
  const [dataSetId, setDataSetId] = React.useState<DataSetId>("sample");

  const handleClearSampleData = React.useCallback(() => {
    setDataSetId("empty");
  }, []);

  return (
    <PreferencesProvider>
      <DragProvider>
        <ShellContent
          key={dataSetId}
          dataSetId={dataSetId}
          onClearSampleData={handleClearSampleData}
        />
      </DragProvider>
    </PreferencesProvider>
  );
}
