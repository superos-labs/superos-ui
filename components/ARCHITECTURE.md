# Component Architecture

This document defines the structure and guidelines for building scalable, maintainable components in this library.

## Directory Structure

```
components/
├── ui/                     # Primitive UI components (atoms)
│   ├── button.tsx
│   ├── input.tsx
│   └── shell.tsx
├── block/                  # Feature folder (when 3+ related files exist)
│   ├── index.ts            # Public API re-exports
│   ├── block.tsx           # Core component
│   ├── block-sidebar.tsx   # Related component
│   ├── resizable-block-wrapper.tsx
│   └── use-block-resize.ts # Feature-specific hook
├── calendar.tsx            # Feature component (molecule/organism)
├── calendar-example.tsx    # Interactive demo wrapper
├── backlog.tsx
├── backlog-example.tsx
└── ARCHITECTURE.md         # This file
```

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
  commitments: BacklogItem[];
  goals: BacklogItem[];
  showHours?: boolean;
  onToggleTask?: (goalId: string, taskId: string) => void;
}

function Backlog({
  commitments,
  goals,
  showHours = true,
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
- Boolean display flags (e.g., `showHours`) can have sensible defaults

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
  const [showHours, setShowHours] = useState(true)
  const [goals, setGoals] = useState(INITIAL_GOALS)

  const handleToggleTask = useCallback((goalId, taskId) => {
    setGoals(prev => /* update logic */)
  }, [])

  return (
    <KnobsProvider>
      <Backlog
        commitments={SAMPLE_COMMITMENTS}
        goals={goals}
        showHours={showHours}
        onToggleTask={handleToggleTask}
      />
      <KnobsPanel>
        <KnobBoolean label="Show Hours" value={showHours} onChange={setShowHours} />
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

| Scenario | Approach |
| --- | --- |
| 1-3 callback props | Keep handlers in example file |
| 4+ callback props with related state | Create interactions hook |
| Multiple examples need same behavior | Create interactions hook |

## Naming Conventions

| Type            | Pattern                  | Example                         |
| --------------- | ------------------------ | ------------------------------- |
| Core component  | `kebab-case.tsx`         | `floating-toolbar.tsx`          |
| Example wrapper | `kebab-case-example.tsx` | `floating-toolbar-example.tsx`  |
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

// shell-example.tsx
const EVENTS = [...] // duplicated

// Consider: shared fixtures file if data is reused extensively
```

## Benefits of This Architecture

1. **Testability** — Core components are pure and easy to unit test
2. **Reusability** — No demo coupling means components work anywhere
3. **Documentation** — Examples serve as living integration guides
4. **Bundle size** — Sample data only loads in the playground, not production
5. **Type safety** — Required props surface integration issues at compile time
