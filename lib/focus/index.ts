/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public API for Focus Mode.
 *
 * Re-exports hooks and types required to manage focus sessions, segments,
 * and focus-related notifications.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Expose focus session state and control hook.
 * - Expose focus notification hook.
 * - Re-export all related public types.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useFocusSession
 * - useFocusNotifications
 * - ActiveFocusSession
 * - CompletedFocusSession
 * - FocusSegment
 * - UseFocusSessionOptions
 * - UseFocusSessionReturn
 * - UseFocusNotificationsOptions
 * - UseFocusNotificationsReturn
 */

export { useFocusSession } from "./use-focus-session";
export type {
  ActiveFocusSession,
  CompletedFocusSession,
  FocusSegment,
  UseFocusSessionOptions,
  UseFocusSessionReturn,
} from "./types";

export { useFocusNotifications } from "./use-focus-notifications";
export type {
  UseFocusNotificationsOptions,
  UseFocusNotificationsReturn,
} from "./use-focus-notifications";
