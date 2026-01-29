"use client";

/**
 * useShellFocus - Focus mode coordination (computed values and handlers).
 *
 * This hook provides computed values and handlers for focus mode integration,
 * determining when to show focus indicators and handling focus navigation.
 */

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
