/**
 * Centralized color palette for goals and blocks.
 * Single source of truth used by: Backlog, Calendar, Block, BlockSidebar
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
