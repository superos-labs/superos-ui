/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public API for responsive utilities.
 *
 * Re-exports responsive types, breakpoint constants, and hooks used to detect
 * device size, category, orientation, and interaction capabilities.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Expose responsive-related types and constants.
 * - Expose breakpoint and device-detection hooks.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - Breakpoint
 * - DeviceCategory
 * - Orientation
 * - ResponsiveOverrides
 * - BREAKPOINTS
 * - useBreakpoint
 * - useIsMobile
 * - useIsTablet
 * - useIsDesktop
 * - useIsTouchDevice
 * - UseBreakpointReturn
 */

// Types
export type {
  Breakpoint,
  DeviceCategory,
  Orientation,
  ResponsiveOverrides,
} from "./types";

// Constants
export { BREAKPOINTS } from "./types";

// Hooks
export {
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouchDevice,
  type UseBreakpointReturn,
} from "./use-breakpoint";
