# Component Architecture

This document defines the structure and guidelines for building scalable, maintainable components in this library.

## High-Level Structure

```
├── components/             # UI components (the library)
│   ├── index.ts            # Root public API for the library
│   ├── ui/                 # Primitive UI components (atoms)
│   ├── calendar/           # Feature folder
│   ├── backlog/            # Feature folder
│   ├── block/              # Feature folder
│   ├── shell/              # Shell feature folder
│   ├── drag/               # Drag-and-drop system
│   ├── weekly-analytics/   # Feature folder
│   └── _playground/        # Internal demo utilities (not exported)
│
├── lib/                    # Shared utilities and orchestration
│   ├── unified-schedule/   # App-level state orchestration
│   ├── adapters/           # Data conversion utilities
│   ├── colors.ts           # Color palette and helpers
│   ├── types.ts            # Cross-cutting types
│   ├── drag-types.ts       # Drag system types
│   └── utils.ts            # General utilities
│
└── hooks/                  # Re-exports for backward compatibility
    └── index.ts            # Re-exports from lib/unified-schedule
```

## Key Modules

### `lib/unified-schedule/` — App-Level Orchestration

The unified schedule system provides a complete state management solution for apps that need to coordinate goals, essentials, calendar events, and deadlines.

```tsx
import { useUnifiedSchedule } from "@/lib/unified-schedule";
import type { ScheduleGoal, GoalStats } from "@/lib/unified-schedule";

const { goals, events, calendarHandlers, getGoalStats } = useUnifiedSchedule({
  initialGoals,
  allEssentials,
  initialEvents,
});
```

**Exports:**

- `useUnifiedSchedule` — Main orchestration hook
- Types: `ScheduleGoal`, `ScheduleTask`, `ScheduleEssential`, `GoalStats`, etc.

### `lib/adapters/` — Data Conversion

Adapters convert between component-specific data formats:

```tsx
import { eventToBlockSidebarData, toAnalyticsItems } from "@/lib/adapters";

// Convert CalendarEvent → BlockSidebarData
const { block, availableGoalTasks } = eventToBlockSidebarData(
  event,
  goals,
  essentials,
  weekDates,
);

// Convert goals/essentials → WeeklyAnalyticsItem[]
const analyticsItems = toAnalyticsItems(goals, getGoalStats);
```

### `components/_playground/` — Internal Demo Utilities

Contains utilities for the component playground that are **not part of the public API**:

- `knobs.tsx` — KnobsProvider, KnobBoolean, KnobSelect for interactive demos

These are used by example components but never exported from the library.

## Directory Structure (Detailed)

```
components/
├── index.ts                # Root public API
├── _playground/            # Internal demo utilities (not exported)
│   └── knobs.tsx
├── ui/                     # Primitive UI components (atoms)
│   ├── index.ts            # UI primitives barrel
│   ├── button.tsx
│   ├── input.tsx
│   └── shell.tsx
├── calendar/               # Feature folder
│   ├── index.ts            # Public API
│   ├── calendar.tsx        # Core component
│   ├── calendar-example.tsx
│   └── use-calendar-interactions.ts
├── backlog/                # Feature folder
│   ├── index.ts
│   ├── backlog.tsx
│   └── backlog-example.tsx
├── block/                  # Feature folder
│   ├── index.ts
│   ├── block.tsx
│   └── block-sidebar.tsx
├── weekly-analytics/       # Feature folder
│   ├── index.ts
│   ├── weekly-analytics.tsx
│   └── weekly-analytics-example.tsx
└── shell/                  # Shell feature folder
    ├── index.ts
    ├── shell-content.tsx
    └── use-shell-state.ts
```

## Library Layers

The codebase is organized into distinct layers:

| Layer                  | Location                  | Purpose                                         |
| ---------------------- | ------------------------- | ----------------------------------------------- |
| **UI Primitives**      | `components/ui/`          | Low-level building blocks (Button, Input, Card) |
| **Feature Components** | `components/{feature}/`   | Business-focused components (Calendar, Backlog) |
| **Drag System**        | `components/drag/`        | Cross-cutting drag-and-drop infrastructure      |
| **Orchestration**      | `lib/unified-schedule/`   | App-level state management                      |
| **Adapters**           | `lib/adapters/`           | Data conversion between component formats       |
| **Shared Utilities**   | `lib/`                    | Colors, types, helpers                          |
| **Playground**         | `components/_playground/` | Demo-only utilities (not exported)              |

### What Goes Where

| You need...                          | Put it in...                         |
| ------------------------------------ | ------------------------------------ |
| A reusable UI component              | `components/ui/` or a feature folder |
| Cross-component types                | `lib/types.ts`                       |
| App-level state orchestration        | `lib/unified-schedule/`              |
| Format conversion between components | `lib/adapters/`                      |
| Demo/playground utilities            | `components/_playground/`            |
| Shared fixtures/sample data          | `lib/fixtures/`                      |

## Component Types

### 1. Core Components (`component.tsx`)

The reusable, stateless (or minimally stateful) UI building blocks.

**Responsibilities:**

- Define visual presentation and the public props API
- Accept all data and callbacks via props
- Export granular, composable sub-components when appropriate
- Export TypeScript types for consumers
- Contain zero demo/sample data

**Example:**

```tsx
// backlog.tsx
interface BacklogProps {
  essentials: BacklogItem[];
  goals: BacklogItem[];
  showTasks?: boolean;
  onToggleTask?: (goalId: string, taskId: string) => void;
}

function Backlog({
  essentials,
  goals,
  showTasks = true,
  onToggleTask,
}: BacklogProps) {
  // Pure rendering logic only
}

export { Backlog, BacklogSection, BacklogItemRow };
export type { BacklogProps, BacklogItem, BacklogTask };
```

**Rules:**

- No `useState` for demo purposes — state should be lifted to consumers
- No embedded sample data or default arrays
- Props that accept data should be required, not optional with defaults
- Boolean display flags (e.g., `showTasks`) can have sensible defaults

### 2. Example Components (`component-example.tsx`)

Interactive demonstration wrappers for the component playground.

**Responsibilities:**

- Wire up local state to drive the component
- Provide realistic sample data
- Expose knobs/controls for interactive exploration
- Serve as living documentation for integration patterns
- Register with the component registry

**Example:**

```tsx
// backlog-example.tsx
const SAMPLE_COMMITMENTS: BacklogItem[] = [
  { id: "sleep", label: "Sleep", icon: RiMoonLine, ... },
]

export function BacklogExample() {
  const [showTasks, setShowTasks] = useState(true)
  const [goals, setGoals] = useState(INITIAL_GOALS)

  const handleToggleTask = useCallback((goalId, taskId) => {
    setGoals(prev => /* update logic */)
  }, [])

  return (
    <KnobsProvider>
      <Backlog
        essentials={SAMPLE_ESSENTIALS}
        goals={goals}
        showTasks={showTasks}
        onToggleTask={handleToggleTask}
      />
      <KnobsPanel>
        <KnobBoolean label="Show Tasks" value={showTasks} onChange={setShowTasks} />
      </KnobsPanel>
    </KnobsProvider>
  )
}
```

**Rules:**

- All sample data lives here, not in the core component
- State management for demo interactions lives here
- Always wrap with `KnobsProvider` for consistent control UI
- Export a single named function matching the pattern `ComponentNameExample`

### 3. UI Primitives (`ui/component.tsx`)

Low-level, highly reusable building blocks (atoms).

**Examples:** Button, Input, Label, Card, Badge

**Rules:**

- Minimal props surface
- Composable with other primitives
- No business logic
- Typically don't need example files (documented via Storybook or inline)

## Feature Folders

When a component grows to include multiple related files (sub-components, hooks, utilities), group them into a **feature folder**.

### When to Create a Feature Folder

| Scenario                                                   | Approach                                           |
| ---------------------------------------------------------- | -------------------------------------------------- |
| Single component + example                                 | Keep flat (`calendar.tsx`, `calendar-example.tsx`) |
| 3+ related files (component, sub-components, hooks, utils) | Feature folder                                     |
| Hooks used by multiple unrelated components                | `hooks/` folder at root                            |
| Shared utilities                                           | `lib/` folder                                      |

### Feature Folder Structure

```
components/
└── block/
    ├── index.ts                    # Public API (required)
    ├── block.tsx                   # Core component
    ├── block-sidebar.tsx           # Related sub-component
    ├── block-sidebar-example.tsx   # Sub-component demo
    ├── resizable-block-wrapper.tsx # Composition layer
    └── use-block-resize.ts         # Feature-specific hook
```

### The `index.ts` File

Every feature folder **must** have an `index.ts` that defines the public API:

```tsx
// components/block/index.ts

// Public components
export { Block, BLOCK_COLORS } from "./block";
export { BlockSidebar } from "./block-sidebar";
export { ResizableBlockWrapper } from "./resizable-block-wrapper";

// Public types
export type { BlockProps, BlockColor, BlockStatus } from "./block";
export type { BlockSidebarProps, BlockSidebarData } from "./block-sidebar";

// Hooks (for advanced use cases)
export { useBlockResize } from "./use-block-resize";
export type { UseBlockResizeOptions } from "./use-block-resize";
```

**Rules:**

- Export only what consumers need — internal helpers stay private
- Group exports by category (components, types, hooks)
- Example files are never exported (they register via the playground)

### Import Patterns

**External consumers** import from the folder:

```tsx
import { Block, BlockSidebar, useBlockResize } from "@/components/block";
import type { BlockColor, BlockSidebarData } from "@/components/block";
```

**Internal files** within the folder use relative imports:

```tsx
// In block-sidebar.tsx
import type { BlockColor } from "./block";

// In resizable-block-wrapper.tsx
import { useBlockResize } from "./use-block-resize";
```

### Migrating to a Feature Folder

When a flat component grows, migrate it:

1. Create the folder: `components/my-feature/`
2. Move all related files into the folder
3. Create `index.ts` with public exports
4. Update internal imports to use relative paths (`./`)
5. Update external imports to point to the folder
6. Update `lib/registry.ts` paths for example components
7. Delete the old files at the root level

### Benefits

- **Co-location**: Related code lives together
- **Encapsulation**: Internal implementation details are hidden
- **Discoverability**: `index.ts` shows the public API at a glance
- **Scalability**: Each feature can grow independently

## Separation of Concerns

| Concern           | Core Component      | Example Component |
| ----------------- | ------------------- | ----------------- |
| Visual rendering  | ✅                  | ❌                |
| Props API & types | ✅                  | ❌                |
| State management  | ❌                  | ✅                |
| Sample/mock data  | ❌                  | ✅                |
| Interactive knobs | ❌                  | ✅                |
| Event handlers    | Callbacks via props | Implementation    |

## Interactions Hooks

When a component has many callback props for interactivity (e.g., resize, drag, copy/paste, delete), create an **interactions hook** that bundles all state and handlers together. This reduces boilerplate for consumers while keeping the core component pure.

### Pattern

```tsx
// use-calendar-interactions.ts
export function useCalendarInteractions({
  initialEvents = [],
}: UseCalendarInteractionsOptions): UseCalendarInteractionsReturn {
  const [events, setEvents] = useState(initialEvents);

  // All handlers defined here...
  const handleEventResize = useCallback(...);
  const handleEventDragEnd = useCallback(...);
  // etc.

  return {
    events,
    setEvents,
    handlers: {
      onEventResize: handleEventResize,
      onEventDragEnd: handleEventDragEnd,
      // ... all handlers
    },
  };
}
```

### Usage

Consumers spread the handlers onto the component:

```tsx
const { events, handlers, toastMessage } = useCalendarInteractions({
  initialEvents: SAMPLE_EVENTS,
});

return (
  <>
    <Calendar events={events} {...handlers} />
    <KeyboardToast message={toastMessage} />
  </>
);
```

### Benefits

- **Reduced boilerplate**: One hook call replaces 10+ handler definitions
- **Consistent behavior**: All consumers get the same interaction logic
- **Core component stays pure**: No state management in the component itself
- **Opt-in complexity**: Basic usage only needs data props; full interactivity is one spread away
- **Customization**: Consumers can override individual handlers if needed

### When to Create an Interactions Hook

| Scenario                             | Approach                      |
| ------------------------------------ | ----------------------------- |
| 1-3 callback props                   | Keep handlers in example file |
| 4+ callback props with related state | Create interactions hook      |
| Multiple examples need same behavior | Create interactions hook      |

## Naming Conventions

| Type            | Pattern                  | Example                         |
| --------------- | ------------------------ | ------------------------------- |
| Core component  | `kebab-case.tsx`         | `calendar.tsx`                  |
| Example wrapper | `kebab-case-example.tsx` | `calendar-example.tsx`          |
| UI primitive    | `ui/kebab-case.tsx`      | `ui/button.tsx`                 |
| Types           | PascalCase               | `BacklogProps`, `CalendarEvent` |

## Registry Integration

Components are registered in `lib/registry.ts` for the playground:

```tsx
export const registry: ComponentEntry[] = [
  {
    slug: "backlog",
    name: "Backlog",
    get component() {
      return require("@/components/backlog-example").BacklogExample;
    },
  },
];
```

**Registry fields:**

- `slug`: URL path segment (kebab-case)
- `name`: Display name in UI
- `layout`: `"center"` (default), `"bottom"`, or `"full"`
- `component`: Lazy-loaded example component

## Creating a New Component

1. **Create the core component** (`components/my-feature.tsx`)
   - Define types and interfaces
   - Build the visual component with required props
   - Export component(s) and types

2. **Create the example wrapper** (`components/my-feature-example.tsx`)
   - Import the core component and its types
   - Define sample data
   - Wire up state and knobs
   - Export `MyFeatureExample`

3. **Register in the playground** (`lib/registry.ts`)
   - Add entry with slug, name, and lazy component loader

4. **Test the integration**
   - Visit `/components/my-feature` to verify

## Anti-Patterns to Avoid

❌ **Embedding sample data in core components**

```tsx
// Bad: backlog.tsx
const SAMPLE_DATA = [...]
function Backlog({ items = SAMPLE_DATA }) { ... }
```

❌ **Making data props optional with empty defaults**

```tsx
// Bad
interface Props { items?: Item[] }
function List({ items = [] }) { ... }

// Good
interface Props { items: Item[] }
function List({ items }) { ... }
```

❌ **Mixing state management into core components**

```tsx
// Bad: Core component managing demo state
function Calendar() {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  // ...
}
```

❌ **Duplicating sample data across files**

```tsx
// Bad: Same data in multiple example files
// calendar-example.tsx
const EVENTS = [...]

// backlog-example.tsx
const EVENTS = [...] // duplicated

// Good: Use shared fixtures file (lib/fixtures/) for reused data
```

## Import Conventions

Consistent import patterns improve discoverability and ensure consumers use the public API.

### Root Library Export

For external consumers, import from the root barrel:

```tsx
// ✅ Preferred for library consumers
import { Calendar, Backlog, BlockSidebar, DragProvider } from "@/components";
import type {
  CalendarEvent,
  BacklogItem,
  BlockSidebarData,
} from "@/components";
```

### Feature Folders

Import from the folder path (resolves to `index.ts`):

```tsx
// ✅ Correct - imports from public API
import { Calendar, useCalendarInteractions } from "@/components/calendar";
import { Block, BlockSidebar, useBlockResize } from "@/components/block";
import type { CalendarEvent, BlockColor } from "@/components/calendar";

// ❌ Incorrect - bypasses public API
import { Calendar } from "@/components/calendar/calendar";
import { useCalendarInteractions } from "@/components/calendar/use-calendar-interactions";
```

### UI Primitives

Import from the barrel or directly from files:

```tsx
// From barrel
import { Button, Input, Shell } from "@/components/ui";

// Or directly (both work)
import { Button } from "@/components/ui/button";
import { Shell, ShellToolbar, ShellContent } from "@/components/ui/shell";
```

### Unified Schedule (Orchestration)

```tsx
// Main orchestration hook
import { useUnifiedSchedule } from "@/lib/unified-schedule";
import type {
  ScheduleGoal,
  ScheduleTask,
  GoalStats,
  UseUnifiedScheduleReturn,
} from "@/lib/unified-schedule";

// Or via hooks/ re-export (backward compatible)
import { useUnifiedSchedule } from "@/hooks";
```

### Adapters

```tsx
import {
  eventToBlockSidebarData,
  toAnalyticsItems,
  formatMinutesToTime,
} from "@/lib/adapters";
```

### Shared Types and Utilities

```tsx
// Cross-cutting types
import type { BlockType, BlockStatus, IconComponent } from "@/lib/types";

// Colors and utilities
import { cn } from "@/lib/utils";
import { getIconColorClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";

// Drag system types
import type { DragItem, DropPosition } from "@/lib/drag-types";
```

### Internal Imports (Within Feature Folders)

Files within a feature folder use relative imports:

```tsx
// In calendar/day-view.tsx
import { TimeColumn } from "./time-column";
import { getSegmentsForDay } from "./calendar-types";
import type { CalendarEvent } from "./calendar-types";
```

### Playground Utilities (Internal Only)

```tsx
// ⚠️ Only for example components — never exported publicly
import { KnobsProvider, KnobBoolean } from "@/components/_playground/knobs";
```

## Benefits of This Architecture

1. **Testability** — Core components are pure and easy to unit test
2. **Reusability** — No demo coupling means components work anywhere
3. **Documentation** — Examples serve as living integration guides
4. **Bundle size** — Sample data only loads in the playground, not production
5. **Type safety** — Required props surface integration issues at compile time
