"use client";

import * as React from "react";
import { BREAKPOINTS, type Breakpoint, type DeviceCategory, type Orientation } from "./types";

// =============================================================================
// Media Query Helpers
// =============================================================================

function getBreakpoint(width: number, isLandscape: boolean): Breakpoint {
  if (width < BREAKPOINTS.sm) {
    return "mobile";
  }
  if (width < BREAKPOINTS.lg) {
    return isLandscape ? "tablet-landscape" : "tablet-portrait";
  }
  return "desktop";
}

function getDeviceCategory(breakpoint: Breakpoint): DeviceCategory {
  if (breakpoint === "mobile") return "mobile";
  if (breakpoint === "tablet-portrait" || breakpoint === "tablet-landscape") return "tablet";
  return "desktop";
}

function getOrientation(breakpoint: Breakpoint): Orientation {
  return breakpoint === "tablet-landscape" ? "landscape" : "portrait";
}

// =============================================================================
// useBreakpoint Hook
// =============================================================================

export interface UseBreakpointReturn {
  /** Current breakpoint name */
  breakpoint: Breakpoint;
  /** Device category (mobile/tablet/desktop) */
  device: DeviceCategory;
  /** Current orientation (portrait/landscape) */
  orientation: Orientation;
  /** True if mobile breakpoint */
  isMobile: boolean;
  /** True if any tablet breakpoint */
  isTablet: boolean;
  /** True if tablet in portrait */
  isTabletPortrait: boolean;
  /** True if tablet in landscape */
  isTabletLandscape: boolean;
  /** True if desktop breakpoint */
  isDesktop: boolean;
  /** True if mobile or tablet (touch-first devices) */
  isTouchDevice: boolean;
}

/**
 * Hook to detect current responsive breakpoint.
 * 
 * Uses window.matchMedia for efficient updates on resize/orientation change.
 * Returns SSR-safe defaults (desktop) on server.
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, breakpoint } = useBreakpoint();
 * 
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 * ```
 */
export function useBreakpoint(): UseBreakpointReturn {
  // SSR-safe initial state (default to desktop)
  const [state, setState] = React.useState<{
    breakpoint: Breakpoint;
    device: DeviceCategory;
    orientation: Orientation;
  }>({
    breakpoint: "desktop",
    device: "desktop",
    orientation: "portrait",
  });

  React.useEffect(() => {
    // Skip if no window (SSR)
    if (typeof window === "undefined") return;

    // Media queries for breakpoints and orientation
    const mobileQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.sm - 1}px)`);
    const tabletQuery = window.matchMedia(
      `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
    );
    const landscapeQuery = window.matchMedia("(orientation: landscape)");

    function updateBreakpoint() {
      const width = window.innerWidth;
      const isLandscape = landscapeQuery.matches;
      const breakpoint = getBreakpoint(width, isLandscape);
      
      setState({
        breakpoint,
        device: getDeviceCategory(breakpoint),
        orientation: getOrientation(breakpoint),
      });
    }

    // Initial update
    updateBreakpoint();

    // Listen to changes
    mobileQuery.addEventListener("change", updateBreakpoint);
    tabletQuery.addEventListener("change", updateBreakpoint);
    landscapeQuery.addEventListener("change", updateBreakpoint);

    return () => {
      mobileQuery.removeEventListener("change", updateBreakpoint);
      tabletQuery.removeEventListener("change", updateBreakpoint);
      landscapeQuery.removeEventListener("change", updateBreakpoint);
    };
  }, []);

  // Derive boolean helpers
  const isMobile = state.breakpoint === "mobile";
  const isTabletPortrait = state.breakpoint === "tablet-portrait";
  const isTabletLandscape = state.breakpoint === "tablet-landscape";
  const isTablet = isTabletPortrait || isTabletLandscape;
  const isDesktop = state.breakpoint === "desktop";
  const isTouchDevice = isMobile || isTablet;

  return {
    breakpoint: state.breakpoint,
    device: state.device,
    orientation: state.orientation,
    isMobile,
    isTablet,
    isTabletPortrait,
    isTabletLandscape,
    isDesktop,
    isTouchDevice,
  };
}

// =============================================================================
// Convenience Hooks
// =============================================================================

/**
 * Simple hook that returns true if on mobile.
 */
export function useIsMobile(): boolean {
  const { isMobile } = useBreakpoint();
  return isMobile;
}

/**
 * Simple hook that returns true if on tablet (any orientation).
 */
export function useIsTablet(): boolean {
  const { isTablet } = useBreakpoint();
  return isTablet;
}

/**
 * Simple hook that returns true if on desktop.
 */
export function useIsDesktop(): boolean {
  const { isDesktop } = useBreakpoint();
  return isDesktop;
}

/**
 * Simple hook that returns true if on touch device (mobile or tablet).
 */
export function useIsTouchDevice(): boolean {
  const { isTouchDevice } = useBreakpoint();
  return isTouchDevice;
}
