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
    slug: "component-example",
    name: "Component Example",
    get component() {
      return require("@/components/component-example").ComponentExample
    },
  },
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
]

export function getComponent(slug: string): ComponentEntry | undefined {
  return registry.find((entry) => entry.slug === slug)
}
