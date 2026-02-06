/**
 * =============================================================================
 * File: app/page.tsx
 * =============================================================================
 *
 * Main application entry page for the SuperOS prototype shell.
 *
 * Composes global interaction providers and boots the shell using a selected
 * fixture data set. Supports switching from an empty state to a complete state
 * to simulate onboarding completion.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Wrap the app with Preferences, Undo, and Drag providers.
 * - Select and load a fixture data set.
 * - Initialize shell state via `useShellState`.
 * - Render the shell content component.
 * - Allow skipping onboarding by switching to the "complete" data set.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses in-memory fixture data only (non-persistent prototype).
 * - Changing `dataSetId` forces a full shell re-initialization.
 * - Keeps orchestration here; behavioral logic lives in hooks and shell modules.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - default: Page
 */

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
