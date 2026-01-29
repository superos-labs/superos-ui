# Library Architecture

This document defines the organization and patterns for the `lib/` directory, which contains shared utilities, state management, and business logic.

## High-Level Structure

```
lib/
├── adapters/           # Data transformation between component formats
├── blueprint/          # Blueprint/template system for scheduling
├── essentials/         # Essential activities configuration
├── fixtures/           # Sample/test data for examples and demos
├── focus/              # Focus session state management
├── preferences/        # User preferences (React Context)
├── responsive/         # Breakpoint detection utilities
├── unified-schedule/   # Main orchestration for schedule state
├── weekly-planning/    # Weekly planning flow and intentions
├── colors.ts           # Color palette constants and utilities
├── drag-types.ts       # Cross-component drag-and-drop types
├── life-areas.ts       # Life area constants
├── registry.ts         # Component registry for the playground
├── time-utils.ts       # Time formatting utilities
├── types.ts            # Cross-cutting type definitions
└── utils.ts            # General utility functions
```

## Library Layers

| Layer               | Location                            | Purpose                                 |
| ------------------- | ----------------------------------- | --------------------------------------- |
| **Orchestration**   | `lib/unified-schedule/`             | App-level state coordination            |
| **Feature Modules** | `lib/{feature}/`                    | Domain-specific logic (focus, planning) |
| **Adapters**        | `lib/adapters/`                     | Data transformation between components  |
| **Context**         | `lib/preferences/`                  | React Context providers                 |
| **Shared Types**    | `lib/types.ts`                      | Cross-cutting type definitions          |
| **Utilities**       | `lib/utils.ts`, `lib/time-utils.ts` | Helper functions                        |
| **Fixtures**        | `lib/fixtures/`                     | Sample data for demos                   |

## When to Create a Feature Folder

| Scenario                          | Approach                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| Single utility function           | Add to `lib/utils.ts` or create `lib/{name}.ts`               |
| Related types + utility functions | Create feature folder with `types.ts` + `{name}-utils.ts`     |
| Hook with types                   | Create feature folder with `types.ts` + `use-{name}.ts`       |
| React Context                     | Create feature folder with `types.ts` + `{name}-context.tsx`  |
| Multiple related hooks            | Create feature folder with `types.ts` + individual hook files |

### Feature Folder Structure

```
lib/{feature}/
├── index.ts              # Public API (required)
├── types.ts              # Type definitions
├── use-{feature}.ts      # Main hook (if applicable)
├── use-{feature}-{x}.ts  # Additional hooks (if needed)
└── {feature}-utils.ts    # Utility functions (if needed)
```

### The `index.ts` File

Every feature folder **must** have an `index.ts` that defines the public API:

```tsx
// lib/focus/index.ts

// Hooks
export { useFocusSession } from "./use-focus-session";
export { useFocusNotifications } from "./use-focus-notifications";

// Types
export type {
  FocusSession,
  FocusState,
  UseFocusSessionOptions,
  UseFocusSessionReturn,
} from "./types";
```

## Hook Patterns

### Naming Convention

- Hook files: `use-{feature}.ts` or `use-{feature}-{action}.ts`
- Hook functions: `use{Feature}` or `use{Feature}{Action}`
- Options type: `Use{Hook}Options`
- Return type: `Use{Hook}Return`

### Standard Hook Structure

```tsx
// use-focus-session.ts
"use client";

import * as React from "react";
import type {
  FocusSession,
  UseFocusSessionOptions,
  UseFocusSessionReturn,
} from "./types";

export function useFocusSession(
  options: UseFocusSessionOptions,
): UseFocusSessionReturn {
  // State
  const [session, setSession] = React.useState<FocusSession | null>(null);

  // Derived values
  const isActive = session !== null;

  // Handlers
  const startSession = React.useCallback(() => {
    // ...
  }, []);

  return {
    session,
    isActive,
    startSession,
  };
}
```

### Composable Hooks

For complex features, compose smaller hooks into a main orchestration hook:

```tsx
// lib/unified-schedule/use-unified-schedule.ts
export function useUnifiedSchedule(options: UseUnifiedScheduleOptions) {
  const goalState = useGoalState(options.initialGoals);
  const eventState = useEventState(options.initialEvents);
  const stats = useScheduleStats(goalState.goals, eventState.events);

  return {
    ...goalState,
    ...eventState,
    stats,
  };
}
```

## Context Patterns

Use React Context for app-wide state that many components need:

```tsx
// lib/preferences/preferences-context.tsx
"use client";

import * as React from "react";
import type { Preferences, PreferencesContextValue } from "./types";

const PreferencesContext = React.createContext<PreferencesContextValue | null>(
  null,
);

export function PreferencesProvider({
  children,
  ...defaults
}: PreferencesProviderProps) {
  const [preferences, setPreferences] = React.useState<Preferences>(defaults);

  const value = React.useMemo(
    () => ({
      preferences,
      setPreferences,
    }),
    [preferences],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

// Required hook (throws if outside provider)
export function usePreferences(): PreferencesContextValue {
  const context = React.useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}

// Optional hook (returns null if outside provider)
export function usePreferencesOptional(): PreferencesContextValue | null {
  return React.useContext(PreferencesContext);
}
```

### When to Use Context vs Hooks

| Use Context When                            | Use Hooks When                            |
| ------------------------------------------- | ----------------------------------------- |
| State needed by many unrelated components   | State needed by a specific component tree |
| Global settings (preferences, theme)        | Feature-specific state (calendar events)  |
| State that should persist across navigation | State scoped to a single view             |

## Adapter Patterns

Adapters convert data between component formats. They are pure functions with no side effects.

```tsx
// lib/adapters/sidebar-adapter.ts

/**
 * Convert a CalendarEvent to BlockSidebarData format.
 */
export function eventToBlockSidebarData(
  event: CalendarEvent,
  goals: ScheduleGoal[],
  essentials: ScheduleEssential[],
): EventToSidebarResult {
  // Pure transformation logic
  return {
    block: { ... },
    availableGoalTasks: [ ... ],
  };
}
```

### When to Create an Adapter

| Scenario                                      | Approach                             |
| --------------------------------------------- | ------------------------------------ |
| Converting between two component data formats | Create adapter function              |
| Simple field mapping                          | Inline transformation                |
| Complex multi-step transformation             | Create adapter with helper functions |

## Type Organization

### Single Source of Truth

Cross-cutting types live in `lib/types.ts`:

```tsx
// lib/types.ts
export type BlockType = "goal" | "task" | "essential";
export type BlockStatus = "planned" | "completed";
export type IconComponent = React.ComponentType<{ className?: string }>;
```

### Feature-Specific Types

Feature-specific types live in `lib/{feature}/types.ts`:

```tsx
// lib/focus/types.ts
export interface FocusSession {
  blockId: string;
  startedAt: Date;
  duration: number;
}

export interface UseFocusSessionOptions {
  onComplete?: () => void;
}

export interface UseFocusSessionReturn {
  session: FocusSession | null;
  startSession: (blockId: string) => void;
  endSession: () => void;
}
```

### Re-Export Patterns

Feature folders can re-export from `lib/types.ts` for convenience:

```tsx
// lib/unified-schedule/types.ts

// Re-export shared types consumers might need
export type { BlockType, BlockStatus } from "@/lib/types";

// Feature-specific types
export interface ScheduleGoal { ... }
```

## Import Conventions

### External Consumers

Import from the feature folder (resolves to `index.ts`):

```tsx
// ✅ Correct - imports from public API
import { useUnifiedSchedule } from "@/lib/unified-schedule";
import type { ScheduleGoal, GoalStats } from "@/lib/unified-schedule";

// ❌ Incorrect - bypasses public API
import { useGoalState } from "@/lib/unified-schedule/use-goal-state";
```

### Internal Files

Within a feature folder, use relative imports:

```tsx
// In lib/unified-schedule/use-unified-schedule.ts
import { useGoalState } from "./use-goal-state";
import type { ScheduleGoal } from "./types";
```

### Shared Utilities

```tsx
import { cn } from "@/lib/utils";
import { formatHoursMinutes } from "@/lib/time-utils";
import { getIconColorClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
```

## Fixtures

Sample data for examples lives in `lib/fixtures/`:

```tsx
// lib/fixtures/shell-data.ts
export const SAMPLE_GOALS: ScheduleGoal[] = [
  { id: "goal-1", title: "Learn TypeScript", ... },
];

export const DATA_SETS = {
  empty: { goals: [], events: [] },
  demo: { goals: SAMPLE_GOALS, events: SAMPLE_EVENTS },
};
```

Fixtures are:

- **Not part of the public API** — only imported by example components
- **Not included in production builds** — tree-shaken when unused
- **Realistic** — represent actual data shapes and edge cases

## Summary

| You need...                   | Put it in...            |
| ----------------------------- | ----------------------- |
| Cross-cutting types           | `lib/types.ts`          |
| App-level state orchestration | `lib/unified-schedule/` |
| Global settings (context)     | `lib/preferences/`      |
| Data transformation           | `lib/adapters/`         |
| Feature-specific hooks        | `lib/{feature}/`        |
| Sample data for demos         | `lib/fixtures/`         |
| Simple utility function       | `lib/utils.ts`          |
| Time formatting               | `lib/time-utils.ts`     |
