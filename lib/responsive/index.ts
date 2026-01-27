/**
 * Responsive utilities for breakpoint detection and responsive behavior.
 *
 * @example
 * ```tsx
 * import { useBreakpoint, useIsMobile } from "@/lib/responsive";
 *
 * function MyComponent() {
 *   const { isMobile, isTablet, breakpoint } = useBreakpoint();
 *   // or simply:
 *   const isMobile = useIsMobile();
 * }
 * ```
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
