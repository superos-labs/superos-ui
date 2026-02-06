/**
 * =============================================================================
 * File: focus/index.ts
 * =============================================================================
 *
 * Public export surface for focus mode UI components.
 *
 * Centralizes all focus-related primitives so other parts of the app
 * can import from a single module boundary.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export focus timer, indicator, and sidebar content components.
 * - Re-export associated prop types.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing focus behavior.
 * - Managing focus state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Keeps focus mode as a cohesive feature slice.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - FocusTimer
 * - FocusTimerProps
 * - StartFocusButton
 * - StartFocusButtonProps
 * - FocusIndicator
 * - FocusIndicatorProps
 * - FocusSidebarContent
 * - FocusSidebarContentProps
 */

export { FocusTimer, StartFocusButton } from "./focus-timer";
export type { FocusTimerProps, StartFocusButtonProps } from "./focus-timer";

export { FocusIndicator } from "./focus-indicator";
export type { FocusIndicatorProps } from "./focus-indicator";

export { FocusSidebarContent } from "./focus-sidebar-content";
export type { FocusSidebarContentProps } from "./focus-sidebar-content";
