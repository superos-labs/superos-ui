/**
 * =============================================================================
 * File: colors.ts
 * =============================================================================
 *
 * Centralized color system for Goals, Tasks, and Blocks.
 *
 * Defines the canonical set of supported semantic colors and provides helpers
 * for mapping each color to:
 * - Hex values (for charts, canvas, and non-Tailwind contexts)
 * - Tailwind text color classes
 * - Tailwind background color classes (solid and soft)
 *
 * Acts as a single source of truth for color usage across the app.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Declare the allowed goal color tokens.
 * - Map color tokens to hex values.
 * - Provide Tailwind class helpers for common UI scenarios.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Color keys align with Tailwind palette names.
 * - Keep palette changes centralized here to avoid visual drift.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GOAL_COLORS
 * - GoalColor
 * - GOAL_COLOR_HEX
 * - getHexColor
 * - getIconColorClass
 * - getIconBgClass
 * - getIconBgSoftClass
 */

export const GOAL_COLORS = [
  "slate",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export type GoalColor = (typeof GOAL_COLORS)[number];

/**
 * Hex color values for each goal color.
 * Used for charts and non-Tailwind contexts (e.g., Recharts).
 */
export const GOAL_COLOR_HEX: Record<GoalColor, string> = {
  slate: "#64748b",
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
};

/**
 * Get hex color value for a goal color.
 * Useful for charts and canvas rendering.
 */
export function getHexColor(color: GoalColor): string {
  return GOAL_COLOR_HEX[color];
}

/**
 * Get Tailwind text color class for icon display.
 * Used in Backlog for goal/task icons.
 */
export function getIconColorClass(color: GoalColor): string {
  const colorMap: Record<GoalColor, string> = {
    slate: "text-slate-500",
    red: "text-red-500",
    orange: "text-orange-500",
    amber: "text-amber-500",
    yellow: "text-yellow-500",
    lime: "text-lime-500",
    green: "text-green-500",
    emerald: "text-emerald-500",
    teal: "text-teal-500",
    cyan: "text-cyan-500",
    sky: "text-sky-500",
    blue: "text-blue-500",
    indigo: "text-indigo-500",
    violet: "text-violet-500",
    purple: "text-purple-500",
    fuchsia: "text-fuchsia-500",
    pink: "text-pink-500",
    rose: "text-rose-500",
  };
  return colorMap[color];
}

/**
 * Get Tailwind background color class for color swatches.
 * Used in color pickers and visual indicators.
 */
export function getIconBgClass(color: GoalColor): string {
  const colorMap: Record<GoalColor, string> = {
    slate: "bg-slate-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    lime: "bg-lime-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    sky: "bg-sky-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    purple: "bg-purple-500",
    fuchsia: "bg-fuchsia-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
  };
  return colorMap[color];
}

/**
 * Get Tailwind soft/muted background color class.
 * Used for subtle colored containers like inspiration cards.
 */
export function getIconBgSoftClass(color: GoalColor): string {
  const colorMap: Record<GoalColor, string> = {
    slate: "bg-slate-500/10",
    red: "bg-red-500/10",
    orange: "bg-orange-500/10",
    amber: "bg-amber-500/10",
    yellow: "bg-yellow-500/10",
    lime: "bg-lime-500/10",
    green: "bg-green-500/10",
    emerald: "bg-emerald-500/10",
    teal: "bg-teal-500/10",
    cyan: "bg-cyan-500/10",
    sky: "bg-sky-500/10",
    blue: "bg-blue-500/10",
    indigo: "bg-indigo-500/10",
    violet: "bg-violet-500/10",
    purple: "bg-purple-500/10",
    fuchsia: "bg-fuchsia-500/10",
    pink: "bg-pink-500/10",
    rose: "bg-rose-500/10",
  };
  return colorMap[color];
}
