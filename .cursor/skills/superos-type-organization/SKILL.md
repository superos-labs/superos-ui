---
name: superos-type-organization
description: Type organization patterns for the SuperOS UI codebase. Use when creating new types, deciding where types should live, or consolidating type definitions.
---

# Type Organization

## Where Types Live

| Type Category | Location | Example |
|---------------|----------|---------|
| **Shared domain types** | `lib/types.ts` | `LifeArea`, `GoalIconOption`, `BlockType` |
| **Feature-scoped domain types** | `lib/<feature>/types.ts` | `lib/unified-schedule/types.ts` for `TaskScheduleInfo`, `GoalStats`, `NewGoalData` |
| **Component prop types** | Co-located in the component file | `CalendarProps` in `calendar.tsx` |
| **Feature-internal shared types** | `components/<feature>/types.ts` or nearest shared file | `goal-types.ts` in `components/backlog/goals/` |

## Rules

1. **One canonical location per type.** Never define the same type in multiple files.

2. **Domain types belong in `lib/`.** If a type represents a data model concept (not a UI concern), it goes in `lib/` — either `lib/types.ts` for broadly shared types or `lib/<feature>/types.ts` for feature-scoped types.

3. **Components import domain types from `lib/`, not from other components.**

```typescript
// ✅ Good
import type { NewGoalData } from "@/lib/unified-schedule";

// ❌ Bad — pulling domain types from another component
import type { NewGoalData } from "@/components/backlog/goals/goal-types";
```

4. **Consolidate before fragmenting.** When a new type could live in an existing `types.ts` in the same domain, add it there rather than creating a new file.

5. **Update headers and READMEs** when adding types to a file. See `superos-file-headers` and `superos-readme-cascade` skills.

## Consolidation Example

When goal-related types were spread across `lib/goals/types.ts` and `lib/unified-schedule/types.ts`, they were merged into `lib/unified-schedule/types.ts` because goals are part of the unified schedule domain.

Pattern: if two type files share the same domain, merge into the more canonical location.
