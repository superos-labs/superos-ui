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
  // Use the prop directly instead of storing in state
  // This ensures the hook reacts to changes when new essentials are added
  const allEssentials = allEssentialsInput;

  // Enabled essential IDs (committed state)
  // Defaults to empty set - users opt-in to which essentials they want to track
  const [enabledEssentialIds, setEnabledEssentialIds] = React.useState<
    Set<string>
  >(() => new Set(initialEnabledEssentialIds ?? []));

  // Draft state for editing (null when not editing)
  const [draftEnabledEssentialIds, setDraftEnabledEssentialIds] =
    React.useState<Set<string> | null>(null);

  // Start editing: create draft from current state
  const startEditingEssentials = React.useCallback(() => {
    setDraftEnabledEssentialIds(new Set(enabledEssentialIds));
  }, [enabledEssentialIds]);

  // Toggle essential enabled state (works on draft if editing, otherwise on committed state)
  const toggleEssentialEnabled = React.useCallback(
    (id: string) => {
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
    [draftEnabledEssentialIds],
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
    [allEssentials, enabledEssentialIds],
  );

  return {
    allEssentials,
    essentials,
    enabledEssentialIds,
    draftEnabledEssentialIds,
    toggleEssentialEnabled,
    startEditingEssentials,
    saveEssentialChanges,
    cancelEssentialChanges,
  };
}
