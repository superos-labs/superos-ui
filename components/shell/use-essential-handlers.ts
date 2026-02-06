"use client";

/**
 * useEssentialHandlers - Essential configuration, scheduling, and CRUD.
 *
 * Manages:
 * - Essential template configuration (slots, enabled IDs)
 * - Schedule import (populating the week with essentials)
 * - Creating and deleting user-defined essentials
 *
 * This hook owns the `useEssentialConfig` state and all handlers that
 * mutate essential templates or the essentials list. The mutable essentials
 * state itself (`allEssentialsState`) lives in the parent orchestrator
 * because it feeds into `useUnifiedSchedule` before this hook is called.
 */

import * as React from "react";
import type { CalendarEvent } from "@/components/calendar";
import type { ScheduleEssential } from "@/lib/unified-schedule";
import {
  useEssentialConfig,
  importEssentialsToEvents,
  weekNeedsEssentialImport,
} from "@/lib/essentials";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import { DEFAULT_ESSENTIAL_SLOTS } from "@/lib/essentials";
import type { NewEssentialData } from "@/components/backlog";

// =============================================================================
// Types
// =============================================================================

export interface UseEssentialHandlersOptions {
  /** Current mutable essentials list */
  allEssentials: ScheduleEssential[];
  /** Setter for the mutable essentials list */
  setAllEssentials: React.Dispatch<React.SetStateAction<ScheduleEssential[]>>;
  /** Initial enabled essential IDs (defaults to all) */
  initialEnabledEssentialIds?: string[];
  /** Current week dates array (7 dates) */
  weekDates: Date[];
  /** Current calendar events from the unified schedule */
  scheduleEvents: CalendarEvent[];
  /** All essentials from the schedule (for import mapping) */
  scheduleAllEssentials: ScheduleEssential[];
  /** Add an event to the schedule */
  scheduleAddEvent: (event: CalendarEvent) => void;
  /** Toggle an essential's enabled state in the schedule */
  scheduleToggleEssentialEnabled: (essentialId: string) => void;
}

export interface UseEssentialHandlersReturn {
  /** Essential template configuration */
  essentialConfig: ReturnType<typeof useEssentialConfig>;
  /** Essential schedule templates */
  essentialTemplates: EssentialTemplate[];
  /** Save an essential's schedule slots */
  saveEssentialSchedule: (essentialId: string, slots: EssentialSlot[]) => void;
  /** Whether the week needs essential import */
  weekNeedsEssentialImport: boolean;
  /** Import essentials to the current week */
  importEssentialsToWeek: () => void;
  /** Create a new essential (returns the generated ID) */
  createEssential: (data: NewEssentialData, slots: EssentialSlot[]) => string;
  /** Delete an essential */
  deleteEssential: (essentialId: string) => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useEssentialHandlers({
  allEssentials,
  setAllEssentials,
  initialEnabledEssentialIds,
  weekDates,
  scheduleEvents,
  scheduleAllEssentials,
  scheduleAddEvent,
  scheduleToggleEssentialEnabled,
}: UseEssentialHandlersOptions): UseEssentialHandlersReturn {
  // -------------------------------------------------------------------------
  // Essential Config (templates)
  // -------------------------------------------------------------------------
  // Generate initial templates for enabled essentials with default slots
  const initialTemplates = React.useMemo(() => {
    const enabledIds =
      initialEnabledEssentialIds ?? allEssentials.map((e) => e.id);
    return enabledIds.map(
      (essentialId): EssentialTemplate => ({
        essentialId,
        slots: (DEFAULT_ESSENTIAL_SLOTS[essentialId] ?? []).map((slot) => ({
          ...slot,
          id: `slot-init-${essentialId}-${slot.id}`,
        })),
      })
    );
  }, [initialEnabledEssentialIds, allEssentials]);

  const essentialConfig = useEssentialConfig({
    initialEnabledIds:
      initialEnabledEssentialIds ?? allEssentials.map((e) => e.id),
    initialTemplates,
  });

  // -------------------------------------------------------------------------
  // Essential Schedule Handlers
  // -------------------------------------------------------------------------
  const saveEssentialSchedule = React.useCallback(
    (essentialId: string, slots: EssentialSlot[]) => {
      essentialConfig.setSlots(essentialId, slots);
    },
    [essentialConfig]
  );

  // Check if the week needs essential import
  const needsEssentialImport = React.useMemo(() => {
    return weekNeedsEssentialImport(
      scheduleEvents,
      essentialConfig.config.enabledIds
    );
  }, [scheduleEvents, essentialConfig.config.enabledIds]);

  const importEssentialsToWeek = React.useCallback(() => {
    // Skip if week already has essentials
    if (!needsEssentialImport) return;

    // Get enabled templates
    const enabledTemplates = essentialConfig.config.templates.filter((t) =>
      essentialConfig.config.enabledIds.includes(t.essentialId)
    );

    // Map essentials to the format expected by importEssentialsToEvents
    const essentialsData = scheduleAllEssentials.map((e) => ({
      id: e.id,
      label: e.label,
      color: e.color,
    }));

    // Import essentials to events
    const newEvents = importEssentialsToEvents({
      templates: enabledTemplates,
      weekDates,
      essentials: essentialsData,
    });

    // Add all new events
    newEvents.forEach((event) => {
      scheduleAddEvent(event);
    });
  }, [
    needsEssentialImport,
    essentialConfig.config,
    scheduleAllEssentials,
    weekDates,
    scheduleAddEvent,
  ]);

  // -------------------------------------------------------------------------
  // Create/Delete Essential Handlers
  // -------------------------------------------------------------------------
  const createEssential = React.useCallback(
    (data: NewEssentialData, slots: EssentialSlot[]): string => {
      // Generate a unique ID for the new essential
      const id = `essential-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      // Create the new essential
      const newEssential: ScheduleEssential = {
        id,
        label: data.label,
        icon: data.icon,
        color: data.color,
      };

      // Add to allEssentials state
      setAllEssentials((prev) => [...prev, newEssential]);

      // Enable the essential in the visibility system (for UI display)
      scheduleToggleEssentialEnabled(id);

      // Enable the essential and set its slots in config (for templates)
      essentialConfig.enableEssential(id);

      // Set the slots after enabling (with a small delay to ensure template exists)
      setTimeout(() => {
        essentialConfig.setSlots(id, slots);
      }, 0);

      return id;
    },
    [essentialConfig, setAllEssentials, scheduleToggleEssentialEnabled]
  );

  const deleteEssential = React.useCallback(
    (essentialId: string) => {
      // Don't allow deleting Sleep
      if (essentialId === "sleep") return;

      // Disable in config (removes from enabledIds and templates)
      essentialConfig.disableEssential(essentialId);

      // Remove from allEssentials state
      setAllEssentials((prev) => prev.filter((e) => e.id !== essentialId));
    },
    [essentialConfig, setAllEssentials]
  );

  return {
    essentialConfig,
    essentialTemplates: essentialConfig.config.templates,
    saveEssentialSchedule,
    weekNeedsEssentialImport: needsEssentialImport,
    importEssentialsToWeek,
    createEssential,
    deleteEssential,
  };
}
