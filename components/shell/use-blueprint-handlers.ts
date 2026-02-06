/**
 * =============================================================================
 * File: use-blueprint-handlers.ts
 * =============================================================================
 *
 * Shell hook that encapsulates all blueprint-related interaction logic.
 *
 * Coordinates:
 * - Entering and exiting blueprint edit mode
 * - Converting between calendar events and blueprint blocks
 * - Saving blueprint changes and propagating them to future weeks
 * - Managing essentials within blueprint context
 * - Handling onboarding blueprint creation
 *
 * This hook operates as a mediator between shell orchestration and
 * blueprint domain utilities.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Snapshot and restore calendar events around blueprint edit mode.
 * - Generate blueprint from current events and persist it.
 * - Populate future unplanned weeks from blueprint.
 * - Create, delete, and sync essentials with calendar during blueprint editing.
 * - Expose high-level handlers for UI consumption.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering UI.
 * - Persisting data to storage.
 * - Validating business invariants.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Blueprint edit mode is event-snapshot based.
 * - Future weeks are only regenerated if they are not already planned.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useBlueprintHandlers
 * - UseBlueprintHandlersOptions
 * - UseBlueprintHandlersReturn
 */

"use client";

import * as React from "react";
import type { CalendarEvent } from "@/components/calendar";
import type { ScheduleEssential } from "@/lib/unified-schedule";
import type { Blueprint } from "@/lib/blueprint";
import type { EssentialTemplate, EssentialSlot } from "@/lib/essentials";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";
import type { WeekStartDay } from "@/lib/preferences";
import {
  blueprintToEvents,
  eventsToBlueprint,
  eventsEssentialsNeedUpdate,
  generateBlueprintEventsForWeeks,
} from "@/lib/blueprint";
import { importEssentialsToEvents } from "@/lib/essentials";

// =============================================================================
// Types
// =============================================================================

export interface UseBlueprintHandlersOptions {
  /** User's weekly blueprint (null if not set) */
  blueprint: Blueprint | null;
  /** Current calendar events */
  events: CalendarEvent[];
  /** The 7 dates of the current week */
  weekDates: Date[];
  /** Day the week starts on */
  weekStartsOn: WeekStartDay;
  /** Replace all events with a new array */
  onReplaceEvents: (events: CalendarEvent[]) => void;
  /** Save blueprint */
  onSaveBlueprint: (blueprint: Blueprint) => void;
  /** Add a calendar event */
  onAddEvent: (event: CalendarEvent) => void;
  /** Enter blueprint edit mode (from layout hook) */
  enterBlueprintEditMode: () => void;
  /** Exit blueprint edit mode (from layout hook) */
  exitBlueprintEditMode: () => void;
  /** Whether blueprint edit mode is active */
  isBlueprintEditMode: boolean;
  /** Check if a week has been planned */
  hasWeeklyPlan: (weekStartDate: string) => boolean;
  /** Complete onboarding and go into planning */
  onCompleteOnboardingIntoPlanning: () => void;
  /** Skip blueprint creation during onboarding */
  onSkipBlueprintCreation: () => void;
  /** All available essentials */
  allEssentials: ScheduleEssential[];
  /** Essential schedule templates */
  essentialTemplates: EssentialTemplate[];
  /** Calendar handler for deleting events */
  calendarHandlers: { onEventDelete: (eventId: string) => void };
  /** Create a new essential (returns generated ID) */
  onCreateEssential: (
    data: { label: string; icon: IconComponent; color: GoalColor },
    slots: EssentialSlot[],
  ) => string;
  /** Delete an essential */
  onDeleteEssential: (essentialId: string) => void;
  /** Save an essential's schedule */
  onSaveEssentialSchedule: (
    essentialId: string,
    slots: EssentialSlot[],
  ) => void;
}

export interface UseBlueprintHandlersReturn {
  /** Enter blueprint edit mode (snapshots events, loads blueprint) */
  handleEnterBlueprintEdit: () => void;
  /** Cancel blueprint edit (restores original events) */
  handleCancelBlueprintEdit: () => void;
  /** Save blueprint edit (saves blueprint, updates future weeks) */
  handleSaveBlueprintEdit: () => void;
  /** Save blueprint during onboarding (keeps events, populates future weeks) */
  handleSaveOnboardingBlueprint: () => void;
  /** Skip blueprint creation during onboarding */
  handleSkipOnboardingBlueprint: () => void;
  /** Whether essentials in the blueprint need updating */
  essentialsNeedUpdateInBlueprint: boolean;
  /** Update essentials in blueprint to match current templates */
  handleUpdateBlueprintEssentials: () => void;
  /** Create an essential and auto-import to calendar */
  handleAddEssentialWithImport: (
    data: { label: string; icon: IconComponent; color: GoalColor },
    slots: EssentialSlot[],
  ) => void;
  /** Delete an essential and remove its calendar events */
  handleDeleteEssentialWithCleanup: (essentialId: string) => void;
  /** Save essential schedule and sync to calendar in blueprint edit mode */
  handleSaveEssentialScheduleWithSync: (
    essentialId: string,
    slots: EssentialSlot[],
  ) => void;
}

// =============================================================================
// Hook
// =============================================================================

export function useBlueprintHandlers({
  blueprint,
  events,
  weekDates,
  weekStartsOn,
  onReplaceEvents,
  onSaveBlueprint,
  onAddEvent,
  enterBlueprintEditMode,
  exitBlueprintEditMode,
  isBlueprintEditMode,
  hasWeeklyPlan,
  onCompleteOnboardingIntoPlanning,
  onSkipBlueprintCreation,
  allEssentials,
  essentialTemplates,
  calendarHandlers,
  onCreateEssential,
  onDeleteEssential,
  onSaveEssentialSchedule,
}: UseBlueprintHandlersOptions): UseBlueprintHandlersReturn {
  // -------------------------------------------------------------------------
  // Essential Sync Handlers (used during blueprint edit & onboarding)
  // -------------------------------------------------------------------------

  // Create an essential and auto-import its events to the calendar
  const handleAddEssentialWithImport = React.useCallback(
    (
      data: { label: string; icon: IconComponent; color: GoalColor },
      slots: EssentialSlot[],
    ) => {
      // Create the essential and get the generated ID
      const essentialId = onCreateEssential(data, slots);

      // Auto-import the new essential to the calendar
      const newEvents = importEssentialsToEvents({
        templates: [{ essentialId, slots }],
        weekDates,
        essentials: [{ id: essentialId, label: data.label, color: data.color }],
      });

      newEvents.forEach((event) => {
        onAddEvent(event);
      });
    },
    [onCreateEssential, weekDates, onAddEvent],
  );

  // Delete an essential and remove all its calendar events
  const handleDeleteEssentialWithCleanup = React.useCallback(
    (essentialId: string) => {
      onDeleteEssential(essentialId);

      // Remove all calendar events for this essential
      const eventsToRemove = events.filter(
        (e) =>
          e.blockType === "essential" && e.sourceEssentialId === essentialId,
      );
      eventsToRemove.forEach((event) => {
        calendarHandlers.onEventDelete(event.id);
      });
    },
    [onDeleteEssential, events, calendarHandlers],
  );

  // Save essential schedule and sync to calendar in blueprint edit mode
  const handleSaveEssentialScheduleWithSync = React.useCallback(
    (essentialId: string, slots: EssentialSlot[]) => {
      // Save the schedule template
      onSaveEssentialSchedule(essentialId, slots);

      // In blueprint edit mode, update the calendar events for this essential
      if (isBlueprintEditMode) {
        const essential = allEssentials.find((e) => e.id === essentialId);
        if (!essential) return;

        // Remove existing calendar events for this essential
        const eventsToRemove = events.filter(
          (e) =>
            e.blockType === "essential" && e.sourceEssentialId === essentialId,
        );
        eventsToRemove.forEach((event) => {
          calendarHandlers.onEventDelete(event.id);
        });

        // Import new events with the updated schedule
        const newEvents = importEssentialsToEvents({
          templates: [{ essentialId, slots }],
          weekDates,
          essentials: [
            { id: essentialId, label: essential.label, color: essential.color },
          ],
        });

        newEvents.forEach((event) => {
          onAddEvent(event);
        });
      }
    },
    [
      onSaveEssentialSchedule,
      isBlueprintEditMode,
      allEssentials,
      events,
      calendarHandlers,
      weekDates,
      onAddEvent,
    ],
  );

  // -------------------------------------------------------------------------
  // Blueprint Edit Mode
  // -------------------------------------------------------------------------

  const [originalEventsSnapshot, setOriginalEventsSnapshot] = React.useState<
    CalendarEvent[] | null
  >(null);

  const handleEnterBlueprintEdit = React.useCallback(() => {
    if (!blueprint) return;
    // Snapshot current events for restoration
    setOriginalEventsSnapshot([...events]);
    // Replace calendar with blueprint blocks
    const blueprintEvents = blueprintToEvents(blueprint, weekDates);
    onReplaceEvents(blueprintEvents);
    // Enter edit mode (clears selections and sidebars)
    enterBlueprintEditMode();
  }, [blueprint, events, weekDates, onReplaceEvents, enterBlueprintEditMode]);

  const handleCancelBlueprintEdit = React.useCallback(() => {
    if (originalEventsSnapshot) {
      // Restore original events
      onReplaceEvents(originalEventsSnapshot);
      setOriginalEventsSnapshot(null);
    }
    exitBlueprintEditMode();
  }, [originalEventsSnapshot, onReplaceEvents, exitBlueprintEditMode]);

  const handleSaveBlueprintEdit = React.useCallback(() => {
    // Convert current events to blueprint and save
    const newBlueprintBlocks = eventsToBlueprint(events, weekDates);
    const newBlueprint = {
      blocks: newBlueprintBlocks,
      updatedAt: new Date().toISOString(),
    };
    onSaveBlueprint(newBlueprint);

    // Restore original events for the current week
    // Then update future unplanned weeks with the new blueprint
    if (originalEventsSnapshot) {
      // Get current week's date range
      const currentWeekStartDate = weekDates[0].toISOString().split("T")[0];
      const currentWeekEndDate = weekDates[6].toISOString().split("T")[0];

      // Separate original events into:
      // 1. Current week events (restore these)
      // 2. Planned week events (restore these)
      // 3. Unplanned future week events (will be replaced with new blueprint)
      const eventsToRestore: CalendarEvent[] = [];

      originalEventsSnapshot.forEach((event) => {
        const eventDate = event.date;
        // Check if event is in current week
        if (
          eventDate >= currentWeekStartDate &&
          eventDate <= currentWeekEndDate
        ) {
          eventsToRestore.push(event);
        } else {
          // For future weeks, check if they're planned
          const eventDateObj = new Date(eventDate);
          const dayOfWeek = eventDateObj.getDay();
          const weekStartOffset = (dayOfWeek - weekStartsOn + 7) % 7;
          const weekStartDate = new Date(eventDateObj);
          weekStartDate.setDate(weekStartDate.getDate() - weekStartOffset);
          const weekStartStr = weekStartDate.toISOString().split("T")[0];

          if (hasWeeklyPlan(weekStartStr)) {
            // This week has been planned, keep the event
            eventsToRestore.push(event);
          }
          // Otherwise: unplanned week - will be regenerated from blueprint
        }
      });

      // Generate new blueprint events for unplanned weeks
      const futureEvents = generateBlueprintEventsForWeeks(
        newBlueprint,
        weekDates,
        4, // 4 weeks ahead
        hasWeeklyPlan,
        eventsToRestore, // Use restored events as base to avoid duplicates
      );

      // Combine restored events with new blueprint events for future weeks
      onReplaceEvents([...eventsToRestore, ...futureEvents]);
      setOriginalEventsSnapshot(null);
    }
    exitBlueprintEditMode();
  }, [
    events,
    weekDates,
    weekStartsOn,
    onSaveBlueprint,
    originalEventsSnapshot,
    onReplaceEvents,
    hasWeeklyPlan,
    exitBlueprintEditMode,
  ]);

  // -------------------------------------------------------------------------
  // Onboarding Blueprint Creation
  // -------------------------------------------------------------------------

  const handleSaveOnboardingBlueprint = React.useCallback(() => {
    // Convert current events to blueprint and save
    const blueprintBlocks = eventsToBlueprint(events, weekDates);
    const newBlueprint = {
      blocks: blueprintBlocks,
      updatedAt: new Date().toISOString(),
    };
    onSaveBlueprint(newBlueprint);

    // Keep events in calendar - they become the user's actual schedule
    // Also populate future weeks (1-4 weeks ahead) with blueprint blocks
    const futureEvents = generateBlueprintEventsForWeeks(
      newBlueprint,
      weekDates,
      4, // 4 weeks ahead
      hasWeeklyPlan,
      events, // Pass current events to avoid duplicates
    );

    // Add all future events
    futureEvents.forEach((event) => {
      onAddEvent(event);
    });

    // Complete onboarding and go straight into weekly planning
    onCompleteOnboardingIntoPlanning();
  }, [
    events,
    weekDates,
    onSaveBlueprint,
    hasWeeklyPlan,
    onAddEvent,
    onCompleteOnboardingIntoPlanning,
  ]);

  // Skip blueprint creation and clear any events added during the step
  const handleSkipOnboardingBlueprint = React.useCallback(() => {
    onReplaceEvents([]);
    onSkipBlueprintCreation();
  }, [onReplaceEvents, onSkipBlueprintCreation]);

  // -------------------------------------------------------------------------
  // Essentials Update Check (for blueprint edit mode)
  // -------------------------------------------------------------------------

  // Compute if current events' essentials differ from essential templates
  const essentialsNeedUpdateInBlueprint = React.useMemo(() => {
    if (!isBlueprintEditMode) return false;
    return eventsEssentialsNeedUpdate(
      events,
      weekDates,
      essentialTemplates,
      allEssentials.map((e) => e.id),
    );
  }, [
    isBlueprintEditMode,
    events,
    weekDates,
    essentialTemplates,
    allEssentials,
  ]);

  // Update essentials in blueprint edit mode to match current templates
  const handleUpdateBlueprintEssentials = React.useCallback(() => {
    // Remove all existing essential events
    const nonEssentialEvents = events.filter(
      (e) => e.blockType !== "essential",
    );

    // Get enabled templates
    const enabledTemplates = essentialTemplates.filter((t) =>
      allEssentials.some((e) => e.id === t.essentialId),
    );

    // Map essentials to the format expected by importEssentialsToEvents
    const essentialsData = allEssentials.map((e) => ({
      id: e.id,
      label: e.label,
      color: e.color,
    }));

    // Import fresh essentials from templates
    const newEssentialEvents = importEssentialsToEvents({
      templates: enabledTemplates,
      weekDates,
      essentials: essentialsData,
    });

    // Replace events with non-essential events + new essential events
    onReplaceEvents([...nonEssentialEvents, ...newEssentialEvents]);
  }, [events, essentialTemplates, allEssentials, weekDates, onReplaceEvents]);

  return {
    handleEnterBlueprintEdit,
    handleCancelBlueprintEdit,
    handleSaveBlueprintEdit,
    handleSaveOnboardingBlueprint,
    handleSkipOnboardingBlueprint,
    essentialsNeedUpdateInBlueprint,
    handleUpdateBlueprintEssentials,
    handleAddEssentialWithImport,
    handleDeleteEssentialWithCleanup,
    handleSaveEssentialScheduleWithSync,
  };
}
