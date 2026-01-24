import { ComponentType } from "react"

export interface ComponentEntry {
  slug: string
  name: string
  component: ComponentType
  layout?: "center" | "bottom" | "full"
}

// Lazy load components to keep the registry lightweight
export const registry: ComponentEntry[] = [
  {
    slug: "calendar",
    name: "Calendar",
    layout: "full",
    get component() {
      return require("@/components/calendar-example").CalendarExample
    },
  },
  {
    slug: "block",
    name: "Block",
    get component() {
      return require("@/components/block-example").BlockExample
    },
  },
  {
    slug: "floating-toolbar",
    name: "Floating Toolbar",
    layout: "bottom",
    get component() {
      return require("@/components/floating-toolbar-example").FloatingToolbarExample
    },
  },
  {
    slug: "shell",
    name: "Shell",
    layout: "full",
    get component() {
      return require("@/components/shell-example").ShellExample
    },
  },
  {
    slug: "backlog",
    name: "Backlog",
    get component() {
      return require("@/components/backlog-example").BacklogExample
    },
  },
  {
    slug: "weekly-analytics",
    name: "Weekly Analytics",
    get component() {
      return require("@/components/weekly-analytics-example").WeeklyAnalyticsExample
    },
  },
  {
    slug: "block-sidebar",
    name: "Block Sidebar",
    get component() {
      return require("@/components/block-sidebar-example").BlockSidebarExample
    },
  },
  {
    slug: "goals-directory",
    name: "Goals Directory",
    get component() {
      return require("@/components/goals-directory-example").GoalsDirectoryExample
    },
  },
]

export function getComponent(slug: string): ComponentEntry | undefined {
  return registry.find((entry) => entry.slug === slug)
}
