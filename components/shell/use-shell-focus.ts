/**
 * =============================================================================
 * File: use-shell-focus.ts
 * =============================================================================
 *
 * Shell hook that adapts focus-session state to shell UI needs.
 *
 * Determines when to show focus indicators and provides helpers for
 * starting focus and navigating to the focused block.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Determine if the selected sidebar block is currently focused.
 * - Determine whether toolbar focus indicator should be shown.
 * - Start focus on the currently selected event.
 * - Navigate to the focused block.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Owning focus session state.
 * - Managing timers.
 * - Persisting focus data.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Focus indicator is hidden when the focused block is already selected.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useShellFocus
 * - UseShellFocusOptions
 * - UseShellFocusReturn
 * - FocusSessionState
 */

"use client";

import * as React from "react";
import type { CalendarEvent } from "@/components/calendar";
import type { GoalColor } from "@/lib/colors";

// =============================================================================
// Types
// =============================================================================

export interface FocusSessionState {
  blockId: string;
  blockTitle: string;
  blockColor: GoalColor;
}

export interface UseShellFocusOptions {
  /** Current focus session from useFocusSession */
  focusSession: FocusSessionState | null;
  /** Currently selected event ID (to determine if focused block is selected) */
  selectedEventId: string | null;
  /** Selected event (for starting focus) */
  selectedEvent: CalendarEvent | null;
  /** Start focus callback from useFocusSession */
  startFocus: (blockId: string, title: string, color: GoalColor) => void;
  /** Callback to navigate to focused block */
  onNavigateToBlock: (blockId: string) => void;
}

export interface UseShellFocusReturn {
  /** Whether the currently selected sidebar block is the focused block */
  isSidebarBlockFocused: boolean;
  /** Whether to show the focus indicator in the toolbar */
  showFocusIndicator: boolean;
  /** Handler to start focus on the selected event */
  handleStartFocus: () => void;
  /** Handler to navigate to the focused block */
  handleNavigateToFocusedBlock: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useShellFocus({
  focusSession,
  selectedEventId,
  selectedEvent,
  startFocus,
  onNavigateToBlock,
}: UseShellFocusOptions): UseShellFocusReturn {
  // Computed values
  const isSidebarBlockFocused = focusSession?.blockId === selectedEventId;
  const showFocusIndicator =
    focusSession !== null && selectedEventId !== focusSession?.blockId;

  // Handlers
  const handleStartFocus = React.useCallback(() => {
    if (!selectedEvent) return;
    startFocus(selectedEvent.id, selectedEvent.title, selectedEvent.color);
  }, [selectedEvent, startFocus]);

  const handleNavigateToFocusedBlock = React.useCallback(() => {
    if (focusSession) {
      onNavigateToBlock(focusSession.blockId);
    }
  }, [focusSession, onNavigateToBlock]);

  return {
    isSidebarBlockFocused,
    showFocusIndicator,
    handleStartFocus,
    handleNavigateToFocusedBlock,
  };
}
