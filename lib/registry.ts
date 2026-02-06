/**
 * =============================================================================
 * File: registry.ts
 * =============================================================================
 *
 * Component registry for lazily loaded example/demo surfaces.
 *
 * Maps a stable slug to a human-readable name and a lazily imported React
 * component, optionally specifying a preferred layout container.
 *
 * Primarily used by internal demo routes and playground-style views.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define the registry of example components.
 * - Lazily load components for code-splitting.
 * - Provide lookup by slug.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Slugs are treated as stable identifiers for routing and selection.
 * - Components are wrapped in React.lazy with explicit named exports.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ComponentEntry
 * - registry
 * - getComponent
 */

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export interface ComponentEntry {
  slug: string;
  name: string;
  component: LazyExoticComponent<ComponentType>;
  layout?: "center" | "bottom" | "full";
}

// Lazy load components for better code splitting
export const registry: ComponentEntry[] = [
  {
    slug: "calendar",
    name: "Calendar",
    layout: "full",
    component: lazy(() =>
      import("@/components/calendar/calendar-example").then((m) => ({
        default: m.CalendarExample,
      })),
    ),
  },
  {
    slug: "backlog",
    name: "Backlog",
    component: lazy(() =>
      import("@/components/backlog/backlog-example").then((m) => ({
        default: m.BacklogExample,
      })),
    ),
  },
  {
    slug: "weekly-analytics",
    name: "Weekly Analytics",
    component: lazy(() =>
      import("@/components/weekly-analytics/weekly-analytics-example").then(
        (m) => ({
          default: m.WeeklyAnalyticsExample,
        }),
      ),
    ),
  },
  {
    slug: "block-sidebar",
    name: "Block Sidebar",
    component: lazy(() =>
      import("@/components/block/block-sidebar-example").then((m) => ({
        default: m.BlockSidebarExample,
      })),
    ),
  },
  {
    slug: "goal-detail",
    name: "Goal Detail",
    component: lazy(() =>
      import("@/components/goal-detail/goal-detail-example").then((m) => ({
        default: m.GoalDetailExample,
      })),
    ),
  },
];

export function getComponent(slug: string): ComponentEntry | undefined {
  return registry.find((entry) => entry.slug === slug);
}
