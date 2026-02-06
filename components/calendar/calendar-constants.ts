import type { BlockType, BlockStatus } from "@/lib/types";
import type { WeekStartDay } from "@/lib/preferences";
import type { CalendarEvent, HoverPosition } from "@/lib/unified-schedule";

// Re-export shared types for convenience
// CalendarEvent and HoverPosition are now sourced from lib/unified-schedule
export type { BlockType, BlockStatus, CalendarEvent, HoverPosition };

// ============================================================================
// Day / hour constants
// ============================================================================

/** Day labels for Monday-start weeks (legacy constant for backward compatibility) */
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Day labels for Sunday-start weeks */
export const DAYS_SUNDAY_START = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Get the day labels array based on which day the week starts on.
 * @param weekStartsOn - Which day the week starts on (0 = Sunday, 1 = Monday)
 * @returns Array of day abbreviations in order
 */
export function getDayLabels(
  weekStartsOn: WeekStartDay = 1,
): readonly string[] {
  return weekStartsOn === 0 ? DAYS_SUNDAY_START : DAYS;
}

// Snap to 15-minute intervals for precise click positioning
export const SNAP_MINUTES = 15;

// ============================================================================
// Overlap layout configuration
// ============================================================================

/** Maximum number of side-by-side columns before events become too narrow */
export const MAX_OVERLAP_COLUMNS = 5;

/** Universal gap between blocks - applies to both overlapping and sequential blocks (in pixels) */
export const BLOCK_GAP_PX = 2;

/** Base horizontal margin for blocks (in pixels) */
export const BLOCK_MARGIN_PX = 4;

/** Indentation per nesting level for contained events (in pixels) */
export const NESTING_INDENT_PX = 8;

// Minimum height in pixels for a block to display full content (title + time subline)
// Below this threshold, blocks use compact layout (centered title only)
// Set to 44px so that 30-min blocks only use full layout at "comfortable" density (48px)
export const COMPACT_LAYOUT_THRESHOLD_PX = 44;

// ============================================================================
// Density configuration
// ============================================================================

/**
 * Calendar density presets that control vertical spacing.
 * - compact: Denser layout, more content visible (56px/hour)
 * - default: Balanced readability (80px/hour) - recommended
 * - comfortable: Spacious layout, best for small blocks (120px/hour)
 *
 * @deprecated Use zoom-based configuration instead (50-150%)
 */
export type CalendarDensity = "compact" | "default" | "comfortable";

/** Grid height in pixels for each density preset (for 24 hours)
 * @deprecated Use getGridHeightFromZoom instead
 */
export const DENSITY_HEIGHTS: Record<CalendarDensity, number> = {
  compact: 1344, // 56px/hour, 14px per 15-min
  default: 1920, // 80px/hour, 20px per 15-min
  comfortable: 2880, // 120px/hour, 30px per 15-min
};

/** Default density for the calendar
 * @deprecated Use DEFAULT_CALENDAR_ZOOM from lib/preferences instead
 */
export const DEFAULT_DENSITY: CalendarDensity = "default";

/**
 * Get the grid height in pixels for a given density.
 * @deprecated Use getGridHeightFromZoom instead
 */
export function getGridHeight(
  density: CalendarDensity = DEFAULT_DENSITY,
): number {
  return DENSITY_HEIGHTS[density];
}

/**
 * Get pixels per minute for a given density.
 * Used for positioning events and drag/resize calculations.
 * @deprecated Use getPixelsPerMinuteFromZoom instead
 */
export function getPixelsPerMinute(
  density: CalendarDensity = DEFAULT_DENSITY,
): number {
  return DENSITY_HEIGHTS[density] / (24 * 60);
}

// Legacy constants for backward compatibility (use getGridHeight/getPixelsPerMinute instead)
export const GRID_HEIGHT_PX = DENSITY_HEIGHTS[DEFAULT_DENSITY];
export const PIXELS_PER_MINUTE = getPixelsPerMinute(DEFAULT_DENSITY);

// ============================================================================
// Zoom-based configuration (replaces density)
// ============================================================================

/** Base pixels per hour at 100% zoom */
const BASE_PIXELS_PER_HOUR = 80;

/**
 * Get the grid height in pixels for a given zoom level.
 * @param zoomPercent - Zoom level as percentage (50-150, default 100)
 * @returns Grid height in pixels for 24 hours
 */
export function getGridHeightFromZoom(zoomPercent: number = 100): number {
  const pixelsPerHour = BASE_PIXELS_PER_HOUR * (zoomPercent / 100);
  return pixelsPerHour * 24;
}

/**
 * Get pixels per minute for a given zoom level.
 * @param zoomPercent - Zoom level as percentage (50-150, default 100)
 * @returns Pixels per minute for positioning calculations
 */
export function getPixelsPerMinuteFromZoom(zoomPercent: number = 100): number {
  return getGridHeightFromZoom(zoomPercent) / (24 * 60);
}

// ============================================================================
// Simple type aliases
// ============================================================================

export type CalendarView = "week" | "day";
export type BlockStyle = "planned" | "completed";

// ============================================================================
// Status-based helpers
// ============================================================================

// Helper to convert BlockStyle to BlockStatus
export function blockStyleToStatus(style: BlockStyle): BlockStatus {
  return style;
}

/**
 * Check if a block can be marked complete/incomplete.
 * All blocks can be marked complete.
 */
export function canMarkComplete(status: BlockStatus | undefined): boolean {
  return true;
}

/**
 * Determine the status for a pasted or duplicated block.
 * Completed blocks become planned when pasted.
 */
export function statusOnPaste(
  sourceStatus: BlockStatus | undefined,
): BlockStatus {
  if (sourceStatus === "completed") return "planned";
  return sourceStatus ?? "planned";
}
