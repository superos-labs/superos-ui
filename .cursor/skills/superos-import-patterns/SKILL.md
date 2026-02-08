---
name: superos-import-patterns
description: Import conventions and barrel file patterns for the SuperOS UI codebase. Use when creating imports, modifying barrel files, or deciding how to expose new exports.
---

# Import Patterns

## Feature Barrels

Each feature folder has an `index.ts` barrel file for convenient imports. These are **not strict public API contracts** — they're organizational conveniences.

```typescript
// Preferred: import from feature barrel
import { Calendar } from "@/components/calendar";
import { useUnifiedSchedule } from "@/lib/unified-schedule";

// Also acceptable: direct file import
import { Calendar } from "@/components/calendar/calendar";
```

## Barrel Rules

1. **Only export what the module owns.** Never re-export types or hooks from other `lib/` folders through a component barrel.

```typescript
// ✅ Good — backlog barrel exports its own components and types
export { Backlog } from "./backlog";
export type { BacklogProps } from "./backlog";

// ❌ Bad — re-exporting lib types through a component barrel
export type { GoalStats } from "@/lib/unified-schedule";
export { useActivitySchedule } from "@/lib/essentials";
```

2. **Consumers import lib types directly from source:**

```typescript
import type { GoalStats } from "@/lib/unified-schedule";
import { useActivitySchedule } from "@/lib/essentials";
```

3. **No root-level barrel.** There is no `components/index.ts`. Import from feature folders directly.

4. **No hooks/ re-export layer.** Import hooks from their source module in `lib/`.

## Path Aliases

All imports use `@/*` which maps to the project root:

```typescript
import { cn } from "@/lib/utils";
import type { BlockType } from "@/lib/types";
```

## Internal vs External Imports

- **Within a feature folder**: use relative imports (`./`, `../`)
- **Across feature folders**: use `@/` absolute imports
