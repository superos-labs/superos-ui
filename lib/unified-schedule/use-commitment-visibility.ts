"use client";

import * as React from "react";
import type { ScheduleCommitment } from "./types";

// ============================================================================
// Types
// ============================================================================

export interface UseCommitmentVisibilityOptions {
  allCommitments: ScheduleCommitment[];
  initialEnabledCommitmentIds?: string[];
}

export interface UseCommitmentVisibilityReturn {
  /** All available commitments */
  allCommitments: ScheduleCommitment[];
  /** Filtered commitments (only enabled ones) */
  commitments: ScheduleCommitment[];
  /** Current set of enabled commitment IDs */
  enabledCommitmentIds: Set<string>;
  /** Draft enabled IDs during editing (null when not editing) */
  draftEnabledCommitmentIds: Set<string> | null;
  /** Set of mandatory commitment IDs (cannot be disabled) */
  mandatoryCommitmentIds: Set<string>;
  /** Toggle a commitment's enabled state (works on draft when editing) */
  toggleCommitmentEnabled: (id: string) => void;
  /** Start editing commitments (creates draft from current state) */
  startEditingCommitments: () => void;
  /** Save draft to actual enabled state */
  saveCommitmentChanges: () => void;
  /** Discard draft changes */
  cancelCommitmentChanges: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCommitmentVisibility({
  allCommitments: allCommitmentsInput,
  initialEnabledCommitmentIds,
}: UseCommitmentVisibilityOptions): UseCommitmentVisibilityReturn {
  const [allCommitments] = React.useState<ScheduleCommitment[]>(allCommitmentsInput);

  // Compute mandatory IDs from allCommitments
  const mandatoryCommitmentIds = React.useMemo(
    () => new Set(allCommitments.filter((c) => c.mandatory).map((c) => c.id)),
    [allCommitments]
  );

  // Enabled commitment IDs (committed state)
  // Always ensure mandatory commitments are included
  const [enabledCommitmentIds, setEnabledCommitmentIds] = React.useState<Set<string>>(
    () => {
      const mandatoryIds = allCommitments.filter((c) => c.mandatory).map((c) => c.id);
      const initialIds = initialEnabledCommitmentIds ?? allCommitments.map((c) => c.id);
      // Combine initial with mandatory to ensure mandatory are always included
      return new Set([...mandatoryIds, ...initialIds]);
    }
  );

  // Draft state for editing (null when not editing)
  const [draftEnabledCommitmentIds, setDraftEnabledCommitmentIds] = React.useState<Set<string> | null>(null);

  // Start editing: create draft from current state
  const startEditingCommitments = React.useCallback(() => {
    setDraftEnabledCommitmentIds(new Set(enabledCommitmentIds));
  }, [enabledCommitmentIds]);

  // Toggle commitment enabled state (works on draft if editing, otherwise on committed state)
  const toggleCommitmentEnabled = React.useCallback(
    (id: string) => {
      // Cannot toggle mandatory commitments
      if (mandatoryCommitmentIds.has(id)) return;

      if (draftEnabledCommitmentIds !== null) {
        // Editing mode: update draft
        setDraftEnabledCommitmentIds((prev) => {
          if (!prev) return prev;
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        // Not editing: update committed state directly
        setEnabledCommitmentIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [mandatoryCommitmentIds, draftEnabledCommitmentIds]
  );

  // Save draft to committed state
  const saveCommitmentChanges = React.useCallback(() => {
    if (draftEnabledCommitmentIds !== null) {
      setEnabledCommitmentIds(draftEnabledCommitmentIds);
      setDraftEnabledCommitmentIds(null);
    }
  }, [draftEnabledCommitmentIds]);

  // Discard draft changes
  const cancelCommitmentChanges = React.useCallback(() => {
    setDraftEnabledCommitmentIds(null);
  }, []);

  // Filtered commitments: only enabled ones
  const commitments = React.useMemo(
    () => allCommitments.filter((c) => enabledCommitmentIds.has(c.id)),
    [allCommitments, enabledCommitmentIds]
  );

  return {
    allCommitments,
    commitments,
    enabledCommitmentIds,
    draftEnabledCommitmentIds,
    mandatoryCommitmentIds,
    toggleCommitmentEnabled,
    startEditingCommitments,
    saveCommitmentChanges,
    cancelCommitmentChanges,
  };
}
