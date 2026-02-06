/**
 * =============================================================================
 * File: use-essential-config.ts
 * =============================================================================
 *
 * Client-side hook for managing a user's Essential configuration.
 *
 * Handles enabling/disabling essentials and editing their recurring schedule
 * templates (slots), with sensible defaults when an essential is first enabled.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Store enabled essential IDs and their templates.
 * - Enable essentials with default slot presets.
 * - Disable essentials and remove associated templates.
 * - Add, update, remove, and replace slots within a template.
 * - Expose helpers to query enabled state and templates.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting configuration.
 * - Importing essentials into the calendar.
 * - Rendering UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Slot IDs are generated locally.
 * - State updates are immutable and scoped per essential.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useEssentialConfig
 */

"use client";

import * as React from "react";
import type {
  EssentialSlot,
  EssentialTemplate,
  EssentialConfig,
  UseEssentialConfigOptions,
  UseEssentialConfigReturn,
} from "./types";
import { DEFAULT_ESSENTIAL_SLOTS } from "./types";

// =============================================================================
// Utility Functions
// =============================================================================

function generateSlotId(): string {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useEssentialConfig({
  initialEnabledIds = [],
  initialTemplates = [],
}: UseEssentialConfigOptions = {}): UseEssentialConfigReturn {
  const [config, setConfig] = React.useState<EssentialConfig>(() => ({
    enabledIds: initialEnabledIds,
    templates: initialTemplates,
  }));

  // Check if an essential is enabled
  const isEnabled = React.useCallback(
    (essentialId: string) => config.enabledIds.includes(essentialId),
    [config.enabledIds]
  );

  // Get template for an essential
  const getTemplate = React.useCallback(
    (essentialId: string) =>
      config.templates.find((t) => t.essentialId === essentialId),
    [config.templates]
  );

  // Enable an essential with default slots
  const enableEssential = React.useCallback((essentialId: string) => {
    setConfig((prev) => {
      if (prev.enabledIds.includes(essentialId)) return prev;

      // Get default slots for this essential (or empty array)
      const defaultSlots = DEFAULT_ESSENTIAL_SLOTS[essentialId] ?? [];

      // Create template with default slots (with new IDs)
      const newTemplate: EssentialTemplate = {
        essentialId,
        slots: defaultSlots.map((slot) => ({
          ...slot,
          id: generateSlotId(),
        })),
      };

      return {
        enabledIds: [...prev.enabledIds, essentialId],
        templates: [...prev.templates, newTemplate],
      };
    });
  }, []);

  // Disable an essential
  const disableEssential = React.useCallback((essentialId: string) => {
    setConfig((prev) => ({
      enabledIds: prev.enabledIds.filter((id) => id !== essentialId),
      templates: prev.templates.filter((t) => t.essentialId !== essentialId),
    }));
  }, []);

  // Toggle essential enabled state
  const toggleEssential = React.useCallback(
    (essentialId: string) => {
      if (isEnabled(essentialId)) {
        disableEssential(essentialId);
      } else {
        enableEssential(essentialId);
      }
    },
    [isEnabled, enableEssential, disableEssential]
  );

  // Add a slot to an essential's template
  const addSlot = React.useCallback(
    (essentialId: string, slot: Omit<EssentialSlot, "id">) => {
      setConfig((prev) => {
        const templateIndex = prev.templates.findIndex(
          (t) => t.essentialId === essentialId
        );
        if (templateIndex === -1) return prev;

        const newSlot: EssentialSlot = { ...slot, id: generateSlotId() };
        const updatedTemplates = [...prev.templates];
        updatedTemplates[templateIndex] = {
          ...updatedTemplates[templateIndex],
          slots: [...updatedTemplates[templateIndex].slots, newSlot],
        };

        return { ...prev, templates: updatedTemplates };
      });
    },
    []
  );

  // Update a slot
  const updateSlot = React.useCallback(
    (
      essentialId: string,
      slotId: string,
      updates: Partial<Omit<EssentialSlot, "id">>
    ) => {
      setConfig((prev) => {
        const templateIndex = prev.templates.findIndex(
          (t) => t.essentialId === essentialId
        );
        if (templateIndex === -1) return prev;

        const template = prev.templates[templateIndex];
        const slotIndex = template.slots.findIndex((s) => s.id === slotId);
        if (slotIndex === -1) return prev;

        const updatedSlots = [...template.slots];
        updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], ...updates };

        const updatedTemplates = [...prev.templates];
        updatedTemplates[templateIndex] = { ...template, slots: updatedSlots };

        return { ...prev, templates: updatedTemplates };
      });
    },
    []
  );

  // Remove a slot
  const removeSlot = React.useCallback(
    (essentialId: string, slotId: string) => {
      setConfig((prev) => {
        const templateIndex = prev.templates.findIndex(
          (t) => t.essentialId === essentialId
        );
        if (templateIndex === -1) return prev;

        const template = prev.templates[templateIndex];
        const updatedSlots = template.slots.filter((s) => s.id !== slotId);

        const updatedTemplates = [...prev.templates];
        updatedTemplates[templateIndex] = { ...template, slots: updatedSlots };

        return { ...prev, templates: updatedTemplates };
      });
    },
    []
  );

  // Replace all slots for an essential
  const setSlots = React.useCallback(
    (essentialId: string, slots: EssentialSlot[]) => {
      setConfig((prev) => {
        const templateIndex = prev.templates.findIndex(
          (t) => t.essentialId === essentialId
        );
        if (templateIndex === -1) return prev;

        const updatedTemplates = [...prev.templates];
        updatedTemplates[templateIndex] = {
          ...updatedTemplates[templateIndex],
          slots,
        };

        return { ...prev, templates: updatedTemplates };
      });
    },
    []
  );

  return {
    config,
    enableEssential,
    disableEssential,
    toggleEssential,
    isEnabled,
    getTemplate,
    addSlot,
    updateSlot,
    removeSlot,
    setSlots,
  };
}
