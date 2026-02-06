# Responsive Utilities Library

**Purpose:** Client-side hooks and utilities for responsive breakpoint detection, device category identification, and orientation tracking to enable adaptive UI behavior across different screen sizes and device types.

## Core Components

### Breakpoint Hook
- **`use-breakpoint.ts`** — Client-side hooks for responsive breakpoint detection
  - Determines current breakpoint, device category, and orientation using window.matchMedia
  - Exposes derived boolean helpers
  - Computes breakpoint from viewport width and orientation
  - Tracks breakpoint changes on resize/orientation change
  - Exposes convenience hooks for common checks
  - Returns SSR-safe defaults (desktop) before hydration
  - Treats mobile and tablet as touch-first devices

### Types & Constants
- **`types.ts`** — Type definitions and constants for responsive breakpoints
  - Defines named breakpoints, numeric thresholds, and helper types
  - Used by responsive hooks and components
  - Defines breakpoint name union
  - Defines pixel thresholds for breakpoints
  - Defines device category and orientation helper types
  - Defines responsive override props pattern

### Public API
- **`index.ts`** — Public API for responsive utilities
  - Re-exports responsive types, breakpoint constants, and hooks
  - Used to detect device size, category, orientation, and interaction capabilities
  - Exposes responsive-related types and constants
  - Exposes breakpoint and device-detection hooks

## Breakpoint System

### Breakpoint Types
- **Breakpoint** — Named breakpoints for responsive behavior
  - `"mobile"`: Small screens (< 640px)
  - `"tablet-portrait"`: Tablet portrait (640px - 1024px, portrait)
  - `"tablet-landscape"`: Tablet landscape (640px - 1024px, landscape)
  - `"desktop"`: Desktop screens (> 1024px)

### Breakpoint Thresholds
- **BREAKPOINTS** — Numeric breakpoint thresholds in pixels
  - `sm`: 640px (mobile max-width)
  - `lg`: 1024px (tablet max-width)

### Device Categories
- **DeviceCategory** — Device category classification
  - `"mobile"`: Mobile devices
  - `"tablet"`: Tablet devices
  - `"desktop"`: Desktop devices

### Orientation
- **Orientation** — Device orientation
  - `"portrait"`: Portrait orientation
  - `"landscape"`: Landscape orientation

## Hooks

### Main Hook
- **useBreakpoint** — Main hook for breakpoint detection
  - Returns current breakpoint, device category, orientation, and viewport dimensions
  - Updates on window resize and orientation change
  - SSR-safe with desktop default before hydration

### Convenience Hooks
- **useIsMobile** — Returns true if current breakpoint is mobile
- **useIsTablet** — Returns true if current breakpoint is tablet (portrait or landscape)
- **useIsDesktop** — Returns true if current breakpoint is desktop
- **useIsTouchDevice** — Returns true if device is touch-capable (mobile or tablet)

## Key Features

- **Breakpoint Detection:** Detects current breakpoint based on viewport width and orientation
- **Device Category:** Classifies device as mobile, tablet, or desktop
- **Orientation Tracking:** Tracks device orientation (portrait/landscape)
- **Responsive Updates:** Automatically updates on window resize and orientation change
- **SSR-Safe:** Returns safe defaults before hydration
- **Touch Detection:** Identifies touch-capable devices
- **Convenience Helpers:** Boolean helpers for common device checks

## Design Principles

- **Media Query Based:** Uses window.matchMedia for accurate breakpoint detection
- **Orientation Aware:** Considers both width and orientation for breakpoint determination
- **SSR Compatible:** Returns safe defaults for server-side rendering
- **Touch-First:** Treats mobile and tablet as touch-first devices
- **Reactive:** Automatically updates when viewport changes
- **Type Safe:** Strongly-typed breakpoint and device category types

## Usage Patterns

1. **Breakpoint Detection:** Use `useBreakpoint` to get current breakpoint and device info
2. **Device Checks:** Use convenience hooks (`useIsMobile`, `useIsTablet`, `useIsDesktop`) for conditional rendering
3. **Touch Detection:** Use `useIsTouchDevice` to adapt UI for touch interactions
4. **Responsive Overrides:** Use ResponsiveOverrides type for component props that vary by breakpoint
5. **Conditional Rendering:** Use breakpoint values to conditionally render different UI variants

## Integration Points

- **Shell Layouts:** Shell uses breakpoint detection to choose desktop vs mobile layouts
- **Calendar:** Calendar adapts layout based on breakpoint
- **Backlog:** Backlog components adapt for mobile vs desktop
- **Sidebars:** Sidebars show/hide based on breakpoint
- **Toolbars:** Toolbars adapt controls based on device category

**Total Files:** 3 (1 React hook, 1 types file, 1 public API)
