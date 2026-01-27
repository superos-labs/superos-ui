/**
 * Responsive breakpoint types and constants.
 *
 * Breakpoints:
 * - mobile: < 640px
 * - tablet-portrait: 640px – 1024px (portrait orientation)
 * - tablet-landscape: 640px – 1024px (landscape orientation)
 * - desktop: > 1024px
 */

// =============================================================================
// Breakpoint Types
// =============================================================================

/**
 * Named breakpoints for responsive behavior.
 */
export type Breakpoint =
  | "mobile"
  | "tablet-portrait"
  | "tablet-landscape"
  | "desktop";

/**
 * Numeric breakpoint thresholds in pixels.
 */
export const BREAKPOINTS = {
  /** Mobile max-width */
  sm: 640,
  /** Tablet max-width */
  lg: 1024,
} as const;

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Device category (ignoring orientation).
 */
export type DeviceCategory = "mobile" | "tablet" | "desktop";

/**
 * Orientation type for tablets.
 */
export type Orientation = "portrait" | "landscape";

// =============================================================================
// Responsive Props Pattern
// =============================================================================

/**
 * Props pattern for components that need responsive behavior.
 * Components can accept these to override auto-detected values.
 */
export interface ResponsiveOverrides {
  /** Force a specific breakpoint (for testing/storybook) */
  forceBreakpoint?: Breakpoint;
}
