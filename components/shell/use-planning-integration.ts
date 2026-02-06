/**
 * =============================================================================
 * File: use-planning-integration.ts
 * =============================================================================
 *
 * Shell hook that bridges weekly planning flow with shell orchestration.
 *
 * Coordinates:
 * - Planning flow state machine
 * - Weekly plan persistence
 * - Optional blueprint creation from planned week
 * - Essentials import during planning
 * - Budget sidebar auto-opening
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Initialize and expose planning flow.
 * - Persist weekly plan and weekly focus tasks.
 * - Save blueprint on first planning when opted in.
 * - Expose helpers for duplicating last week from blueprint.
 * - Derive whether calendar sync is available.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering UI.
 * - Implementing planning step UI.
 * - Managing blueprint edit mode.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses usePlanningFlow as underlying state machine.
 * - Planning confirmation is the single exit point from planning mode.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - usePlanningIntegration
 * - UsePlanningIntegrationOptions
 * - UsePlanningIntegrationReturn
 */

"use client";

import * as React from "react";
import type { CalendarEvent } from "@/components/calendar";
import type { Blueprint } from "@/lib/blueprint";
import type { WeeklyPlan } from "@/lib/weekly-planning";
import type {
  CalendarProvider,
  CalendarIntegrationState,
} from "@/lib/calendar-sync";
import { blueprintToEvents, eventsToBlueprint } from "@/lib/blueprint";
import { usePlanningFlow } from "@/lib/weekly-planning";

// =============================================================================
// Types
// =============================================================================

export interface UsePlanningIntegrationOptions {
  /** Whether planning mode is active */
  isPlanningMode: boolean;
  /** Set planning mode */
  setIsPlanningMode: (mode: boolean) => void;
  /** The 7 dates of the current week */
  weekDates: Date[];
  /** Current calendar events */
  events: CalendarEvent[];
  /** Save weekly plan */
  onSaveWeeklyPlan: (plan: WeeklyPlan) => void;
  /** Set weekly focus tasks */
  onSetWeeklyFocus: (taskIds: Set<string>, weekStartDate: string) => void;
  /** Save blueprint */
  onSaveBlueprint: (blueprint: Blueprint) => void;
  /** Add a calendar event */
  onAddEvent: (event: CalendarEvent) => void;
  /** Whether user has a blueprint */
  hasBlueprint: boolean;
  /** User's blueprint (null if not set) */
  blueprint: Blueprint | null;
  /** Check if a week has been planned */
  hasWeeklyPlan: (weekStartDate: string) => boolean;
  /** Calendar integration states */
  calendarIntegrations: Map<CalendarProvider, CalendarIntegrationState>;
  /** Import essentials to the current week */
  onImportEssentialsToWeek: () => void;
  /** Whether we're in the planning step (from layout) */
  isPlanning: boolean;
  /** Whether we're in onboarding blueprint mode */
  isOnboardingBlueprint: boolean;
  /** Set right sidebar visibility */
  setShowRightSidebar: (show: boolean) => void;
}

export interface UsePlanningIntegrationReturn {
  /** The planning flow state machine */
  planningFlow: ReturnType<typeof usePlanningFlow>;
  /** ISO date string of the current week start */
  weekStartDate: string;
  /** Whether any calendar integration has export enabled */
  hasSyncAvailable: boolean;
  /** Whether essentials have been added to the calendar this session */
  hasAddedEssentialsThisSession: boolean;
  /** Handler for "Add essentials to calendar" button */
  handleAddEssentialsToCalendar: () => void;
  /** Duplicate last week's schedule from blueprint */
  handleDuplicateLastWeek: () => void;
}

// =============================================================================
// Hook
// =============================================================================

export function usePlanningIntegration({
  isPlanningMode,
  setIsPlanningMode,
  weekDates,
  events,
  onSaveWeeklyPlan,
  onSetWeeklyFocus,
  onSaveBlueprint,
  onAddEvent,
  hasBlueprint,
  blueprint,
  hasWeeklyPlan,
  calendarIntegrations,
  onImportEssentialsToWeek,
  isPlanning,
  isOnboardingBlueprint,
  setShowRightSidebar,
}: UsePlanningIntegrationOptions): UsePlanningIntegrationReturn {
  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const weekStartDate = weekDates[0]?.toISOString().split("T")[0] ?? "";

  // Check if any calendar integration is connected and has export enabled
  const hasSyncAvailable = React.useMemo(() => {
    if (!calendarIntegrations) return false;

    for (const [_, state] of calendarIntegrations) {
      if (state.status === "connected" && state.exportEnabled) {
        return true;
      }
    }
    return false;
  }, [calendarIntegrations]);

  // -------------------------------------------------------------------------
  // Planning Flow
  // -------------------------------------------------------------------------

  const planningFlowRef = React.useRef<{
    weeklyFocusTaskIds: Set<string>;
  }>({ weeklyFocusTaskIds: new Set() });

  const planningFlow = usePlanningFlow({
    isActive: isPlanningMode,
    weekDates,
    onConfirm: (saveAsBlueprint: boolean) => {
      // Persist weekly focus to tasks before exiting
      if (planningFlowRef.current.weeklyFocusTaskIds.size > 0) {
        onSetWeeklyFocus(
          planningFlowRef.current.weeklyFocusTaskIds,
          weekStartDate,
        );
      }

      // Save the weekly plan
      onSaveWeeklyPlan({
        weekStartDate,
        plannedAt: new Date().toISOString(),
      });

      // On first planning, save the blueprint if user opted in
      if (!hasBlueprint && saveAsBlueprint) {
        const blueprintBlocks = eventsToBlueprint(events, weekDates);
        onSaveBlueprint({
          blocks: blueprintBlocks,
          updatedAt: new Date().toISOString(),
        });
      }

      // Exit planning mode
      setIsPlanningMode(false);
    },
    onCancel: () => {
      setIsPlanningMode(false);
    },
  });

  // Keep ref in sync with planning flow state
  React.useEffect(() => {
    planningFlowRef.current.weeklyFocusTaskIds =
      planningFlow.weeklyFocusTaskIds;
  }, [planningFlow.weeklyFocusTaskIds]);

  // -------------------------------------------------------------------------
  // Essentials Session Tracking
  // -------------------------------------------------------------------------

  // Track if user has added essentials this session (for "Add essentials to calendar" button)
  const [hasAddedEssentialsThisSession, setHasAddedEssentialsThisSession] =
    React.useState(false);

  // Reset the flag when planning mode or onboarding blueprint mode is exited
  React.useEffect(() => {
    if (!isPlanningMode && !isOnboardingBlueprint) {
      setHasAddedEssentialsThisSession(false);
    }
  }, [isPlanningMode, isOnboardingBlueprint]);

  // Handler for "Add essentials to calendar" button
  const handleAddEssentialsToCalendar = React.useCallback(() => {
    onImportEssentialsToWeek();
    setHasAddedEssentialsThisSession(true);
  }, [onImportEssentialsToWeek]);

  // -------------------------------------------------------------------------
  // Auto-open Budget Sidebar
  // -------------------------------------------------------------------------

  // Auto-open planning budget sidebar when entering schedule step or blueprint creation
  React.useEffect(() => {
    if (isPlanning && planningFlow.step === "schedule") {
      setShowRightSidebar(true);
    }
    if (isOnboardingBlueprint) {
      setShowRightSidebar(true);
    }
  }, [
    isPlanning,
    planningFlow.step,
    isOnboardingBlueprint,
    setShowRightSidebar,
  ]);

  // -------------------------------------------------------------------------
  // Blueprint Duplication
  // -------------------------------------------------------------------------

  // Duplicate last week's schedule from blueprint
  const handleDuplicateLastWeek = React.useCallback(() => {
    if (!blueprint) return;
    const importedEvents = blueprintToEvents(blueprint, weekDates);
    importedEvents.forEach((event) => {
      onAddEvent(event);
    });
  }, [blueprint, weekDates, onAddEvent]);

  return {
    planningFlow,
    weekStartDate,
    hasSyncAvailable,
    hasAddedEssentialsThisSession,
    handleAddEssentialsToCalendar,
    handleDuplicateLastWeek,
  };
}
