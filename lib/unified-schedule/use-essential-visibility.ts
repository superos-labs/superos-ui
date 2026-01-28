"use client";

import * as React from "react";
import type { ScheduleEssential } from "./types";

// ============================================================================
// Types
// ============================================================================

export interface UseEssentialVisibilityOptions {
  allEssentials: ScheduleEssential[];
  initialEnabledEssentialIds?: string[];
}

export interface UseEssentialVisibilityReturn {
  /** All available essentials */
  allEssentials: ScheduleEssential[];
  /** Filtered essentials (only enabled ones) */
  essentials: ScheduleEssential[];
  /** Current set of enabled essential IDs */
  enabledEssentialIds: Set<string>;
  /** Draft enabled IDs during editing (null when not editing) */
  draftEnabledEssentialIds: Set<string> | null;
  /** Set of mandatory essential IDs (cannot be disabled) */
  mandatoryEssentialIds: Set<string>;
  /** Toggle an essential's enabled state (works on draft when editing) */
  toggleEssentialEnabled: (id: string) => void;
  /** Start editing essentials (creates draft from current state) */
  startEditingEssentials: () => void;
  /** Save draft to actual enabled state */
  saveEssentialChanges: () => void;
  /** Discard draft changes */
  cancelEssentialChanges: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useEssentialVisibility({
  allEssentials: allEssentialsInput,
  initialEnabledEssentialIds,
}: UseEssentialVisibilityOptions): UseEssentialVisibilityReturn {
  const [allEssentials] = React.useState<ScheduleEssential[]>(allEssentialsInput);

  // Compute mandatory IDs from allEssentials
  const mandatoryEssentialIds = React.useMemo(
    () => new Set(allEssentials.filter((c) => c.mandatory).map((c) => c.id)),
    [allEssentials]
  );

  // Enabled essential IDs (committed state)
  // Always ensure mandatory essentials are included
  const [enabledEssentialIds, setEnabledEssentialIds] = React.useState<Set<string>>(
    () => {
      const mandatoryIds = allEssentials.filter((c) => c.mandatory).map((c) => c.id);
      const initialIds = initialEnabledEssentialIds ?? allEssentials.map((c) => c.id);
      // Combine initial with mandatory to ensure mandatory are always included
      return new Set([...mandatoryIds, ...initialIds]);
    }
  );

  // Draft state for editing (null when not editing)
  const [draftEnabledEssentialIds, setDraftEnabledEssentialIds] = React.useState<Set<string> | null>(null);

  // Start editing: create draft from current state
  const startEditingEssentials = React.useCallback(() => {
    setDraftEnabledEssentialIds(new Set(enabledEssentialIds));
  }, [enabledEssentialIds]);

  // Toggle essential enabled state (works on draft if editing, otherwise on committed state)
  const toggleEssentialEnabled = React.useCallback(
    (id: string) => {
      // Cannot toggle mandatory essentials
      if (mandatoryEssentialIds.has(id)) return;

      if (draftEnabledEssentialIds !== null) {
        // Editing mode: update draft
        setDraftEnabledEssentialIds((prev) => {
          if (!prev) return prev;
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        // Not editing: update committed state directly
        setEnabledEssentialIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [mandatoryEssentialIds, draftEnabledEssentialIds]
  );

  // Save draft to committed state
  const saveEssentialChanges = React.useCallback(() => {
    if (draftEnabledEssentialIds !== null) {
      setEnabledEssentialIds(draftEnabledEssentialIds);
      setDraftEnabledEssentialIds(null);
    }
  }, [draftEnabledEssentialIds]);

  // Discard draft changes
  const cancelEssentialChanges = React.useCallback(() => {
    setDraftEnabledEssentialIds(null);
  }, []);

  // Filtered essentials: only enabled ones
  const essentials = React.useMemo(
    () => allEssentials.filter((c) => enabledEssentialIds.has(c.id)),
    [allEssentials, enabledEssentialIds]
  );

  return {
    allEssentials,
    essentials,
    enabledEssentialIds,
    draftEnabledEssentialIds,
    mandatoryEssentialIds,
    toggleEssentialEnabled,
    startEditingEssentials,
    saveEssentialChanges,
    cancelEssentialChanges,
  };
}
