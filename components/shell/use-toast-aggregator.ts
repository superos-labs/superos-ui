/**
 * =============================================================================
 * File: use-toast-aggregator.ts
 * =============================================================================
 *
 * Toast message aggregation hook.
 *
 * Combines multiple ephemeral toast sources (calendar shortcuts, sidebar
 * actions, deadline actions) into a single, prioritized toast channel.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Maintain independent toast states for different feature areas.
 * - Auto-clear transient toast messages after a short delay.
 * - Expose a single toastMessage with defined priority.
 *
 * -----------------------------------------------------------------------------
 * PRIORITY ORDER
 * -----------------------------------------------------------------------------
 * 1. Calendar keyboard toasts
 * 2. Sidebar toasts
 * 3. Deadline toasts
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering toasts.
 * - Styling or animation.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useToastAggregator
 * - UseToastAggregatorReturn
 */

"use client";

import * as React from "react";

// =============================================================================
// Types
// =============================================================================

export interface UseToastAggregatorReturn {
  /** The current toast message to display (first non-null source wins) */
  toastMessage: string | null;
  /** Setter for sidebar toast messages */
  setSidebarToast: React.Dispatch<React.SetStateAction<string | null>>;
  /** Setter for deadline toast messages */
  setDeadlineToast: React.Dispatch<React.SetStateAction<string | null>>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useToastAggregator(
  /** Toast message from calendar keyboard shortcuts */
  calendarToastMessage: string | null,
): UseToastAggregatorReturn {
  const [sidebarToastMessage, setSidebarToastMessage] = React.useState<
    string | null
  >(null);
  const [deadlineToastMessage, setDeadlineToastMessage] = React.useState<
    string | null
  >(null);

  // Auto-clear sidebar toast
  React.useEffect(() => {
    if (sidebarToastMessage) {
      const timer = setTimeout(() => setSidebarToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [sidebarToastMessage]);

  // Auto-clear deadline toast
  React.useEffect(() => {
    if (deadlineToastMessage) {
      const timer = setTimeout(() => setDeadlineToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [deadlineToastMessage]);

  // Priority: calendar > sidebar > deadline
  const toastMessage =
    calendarToastMessage ?? sidebarToastMessage ?? deadlineToastMessage;

  return {
    toastMessage,
    setSidebarToast: setSidebarToastMessage,
    setDeadlineToast: setDeadlineToastMessage,
  };
}
