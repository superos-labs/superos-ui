---
name: superos-readme-cascade
description: README update protocol for the SuperOS UI codebase. Use when making structural changes to files, folders, or exports — always update READMEs from the changed folder up to the root.
---

# README Cascade Protocol

Every feature folder and major directory has a `README.md`. When making structural changes, update READMEs at every level affected.

## When to Update

- Adding or removing files
- Renaming or relocating modules
- Changing a barrel file's exports
- Merging, splitting, or inlining hooks/components
- Changing file counts or directory trees

## Update Path

Start at the modified folder and walk up:

1. **Feature folder README** — e.g., `components/shell/README.md`
2. **Parent folder README** — e.g., `components/README.md` or `lib/README.md`
3. **Root README** — `README.md`

Also update sibling READMEs if they reference the changed module (e.g., `lib/goals/README.md` references `lib/unified-schedule`).

## What to Update

- **File listings and descriptions** — add/remove entries for new/deleted files
- **File counts** — update totals (e.g., "Total Files: 20")
- **Directory trees** — update ASCII tree diagrams
- **Feature descriptions** — reflect new or removed capabilities
- **Integration points** — update cross-references to other modules
- **Status notes** — mark relocated or deprecated modules

## Example: Relocated Module

When code moves from one module to another, update the source README:

```markdown
# Module Name (Relocated)

**Status:** Code files merged into `target-module/types.ts`.

## Where to find things
- **TypeName** — `import type { TypeName } from "@/lib/target-module"`
```
