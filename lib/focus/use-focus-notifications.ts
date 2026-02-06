/**
 * =============================================================================
 * File: use-focus-notifications.ts
 * =============================================================================
 *
 * Client-side hook for Focus Mode browser notifications.
 *
 * Sends a notification when the currently focused block reaches its scheduled
 * end time, based on the associated calendar event.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Request and track browser notification permission.
 * - Determine the end timestamp of the focused calendar block.
 * - Schedule and fire a notification when the block ends.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - No notification is sent if the block is already in the past.
 * - Only one notification is sent per focus session.
 * - Gracefully no-ops if the Notification API is unsupported.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useFocusNotifications
 * - UseFocusNotificationsOptions
 * - UseFocusNotificationsReturn
 */

"use client";

import * as React from "react";
import type { CalendarEvent } from "@/lib/unified-schedule";
import type { ActiveFocusSession } from "./types";

// =============================================================================
// Types
// =============================================================================

export interface UseFocusNotificationsOptions {
  /** Active focus session (null if no active session) */
  session: ActiveFocusSession | null;
  /** All calendar events (to find the focused block's end time) */
  events: CalendarEvent[];
  /** Whether notifications are enabled */
  enabled: boolean;
  /** Callback when notification fires (e.g., to play a sound) */
  onNotify?: () => void;
}

export interface UseFocusNotificationsReturn {
  /** Request notification permission from the browser */
  requestPermission: () => Promise<NotificationPermission>;
  /** Current notification permission status */
  permission: NotificationPermission | "default";
  /** Whether a notification has been sent for the current session */
  hasNotified: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get the end timestamp (ms since epoch) for a calendar event.
 */
function getEventEndTimestamp(event: CalendarEvent): number {
  const [year, month, day] = event.date.split("-").map(Number);
  const startOfDay = new Date(year, month - 1, day).getTime();

  const endMinutes = event.startMinutes + event.durationMinutes;

  // If the event ends past midnight (overnight), add 24 hours
  if (endMinutes >= 1440) {
    return startOfDay + (endMinutes - 1440) * 60 * 1000 + 24 * 60 * 60 * 1000;
  }

  return startOfDay + endMinutes * 60 * 1000;
}

/**
 * Check if browser notifications are supported.
 */
function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to manage focus session notifications.
 * Sends a browser notification when the focused block's end time is reached.
 *
 * @example
 * ```tsx
 * const { requestPermission, permission } = useFocusNotifications({
 *   session: focusSession,
 *   events,
 *   enabled: true,
 *   onNotify: () => playSound(),
 * });
 *
 * // Request permission on first focus start
 * if (permission === "default") {
 *   requestPermission();
 * }
 * ```
 */
export function useFocusNotifications({
  session,
  events,
  enabled,
  onNotify,
}: UseFocusNotificationsOptions): UseFocusNotificationsReturn {
  const [permission, setPermission] = React.useState<
    NotificationPermission | "default"
  >(isNotificationSupported() ? Notification.permission : "default");
  const [hasNotified, setHasNotified] = React.useState(false);

  // Stable reference to onNotify
  const onNotifyRef = React.useRef(onNotify);
  React.useEffect(() => {
    onNotifyRef.current = onNotify;
  }, [onNotify]);

  // Reset hasNotified when session changes (new block being focused)
  React.useEffect(() => {
    setHasNotified(false);
  }, [session?.blockId]);

  // Request permission
  const requestPermission =
    React.useCallback(async (): Promise<NotificationPermission> => {
      if (!isNotificationSupported()) {
        return "denied";
      }

      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }, []);

  // Find the focused block and schedule notification
  React.useEffect(() => {
    if (!enabled || !session || hasNotified || permission !== "granted") {
      return;
    }

    // Find the event being focused on
    const focusedEvent = events.find((e) => e.id === session.blockId);
    if (!focusedEvent) {
      return;
    }

    // Calculate when to send notification
    const endTimestamp = getEventEndTimestamp(focusedEvent);
    const now = Date.now();
    const delay = endTimestamp - now;

    // If already past, don't notify (block was in the past when focus started)
    if (delay <= 0) {
      return;
    }

    // Schedule the notification
    const timeoutId = setTimeout(() => {
      // Double-check we should still notify
      if (!isNotificationSupported() || Notification.permission !== "granted") {
        return;
      }

      // Show notification
      const notification = new Notification("Focus session complete", {
        body: `Block time for "${session.blockTitle}" has ended`,
        icon: "/favicon.ico",
        tag: `focus-end-${session.blockId}`,
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Trigger sound callback
      onNotifyRef.current?.();

      setHasNotified(true);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [enabled, session, events, hasNotified, permission]);

  return {
    requestPermission,
    permission,
    hasNotified,
  };
}
