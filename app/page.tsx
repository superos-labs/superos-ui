"use client"

import * as React from "react"
import { DragProvider } from "@/components/drag"
import { PreferencesProvider } from "@/lib/preferences"
import { ShellContentComponent } from "@/components/shell/shell-content"
import { useShellState } from "@/components/shell/use-shell-state"
import {
  DATA_SETS,
  ALL_ESSENTIALS,
  LIFE_AREAS,
  GOAL_ICONS,
} from "@/lib/fixtures/shell-data"
import { INSPIRATION_CATEGORIES } from "@/lib/fixtures/goal-inspiration-data"

function ShellContent() {
  const dataSet = DATA_SETS["sample"]

  const state = useShellState({
    initialGoals: dataSet.goals,
    allEssentials: ALL_ESSENTIALS,
    initialEvents: dataSet.events,
    lifeAreas: LIFE_AREAS,
    goalIcons: GOAL_ICONS,
  })

  return (
    <ShellContentComponent
      {...state}
      inspirationCategories={INSPIRATION_CATEGORIES}
    />
  )
}

export default function Page() {
  return (
    <PreferencesProvider>
      <DragProvider>
        <ShellContent />
      </DragProvider>
    </PreferencesProvider>
  )
}
