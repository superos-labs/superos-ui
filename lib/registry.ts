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
      }))
    ),
  },
  {
    slug: "shell",
    name: "Shell",
    layout: "full",
    component: lazy(() =>
      import("@/components/shell-example").then((m) => ({
        default: m.ShellExample,
      }))
    ),
  },
  {
    slug: "backlog",
    name: "Backlog",
    component: lazy(() =>
      import("@/components/backlog/backlog-example").then((m) => ({
        default: m.BacklogExample,
      }))
    ),
  },
  {
    slug: "weekly-analytics",
    name: "Weekly Analytics",
    component: lazy(() =>
      import("@/components/weekly-analytics-example").then((m) => ({
        default: m.WeeklyAnalyticsExample,
      }))
    ),
  },
  {
    slug: "block-sidebar",
    name: "Block Sidebar",
    component: lazy(() =>
      import("@/components/block/block-sidebar-example").then((m) => ({
        default: m.BlockSidebarExample,
      }))
    ),
  },
];

export function getComponent(slug: string): ComponentEntry | undefined {
  return registry.find((entry) => entry.slug === slug);
}
