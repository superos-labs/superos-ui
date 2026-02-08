---
name: superos-prototyping-principles
description: Guiding principles for optimizing the SuperOS UI codebase for rapid prototyping over library export. Use when making architectural decisions, adding new features, or evaluating whether a pattern helps or hinders iteration speed.
---

# Prototyping Principles

This codebase is an **application prototype**, not a component library. Every decision should favor iteration speed over export readiness.

## Core Principles

### 1. Inline Over Abstract

Prefer inlining small utilities into their consumer rather than creating new files.

```
❌ 3 lines of logic → new file → new barrel export → new import
✅ 3 lines of logic → inline where used
```

Threshold: if the logic is used in exactly one place and is under ~30 lines, inline it.

### 2. Co-locate Over Fragment

Types, helpers, and constants that serve a single feature belong in that feature's folder — not in a shared `lib/` subfolder.

### 3. Flat Over Deep

Minimize nesting and indirection. Fewer files, fewer abstraction layers, fewer hops to understand behavior.

### 4. One Source of Truth for Types

Domain types live in `lib/` (e.g., `lib/unified-schedule/types.ts`). Components import from there — they don't duplicate or re-export.

### 5. No Library Ceremony

Do not introduce:
- Root-level barrel files (`components/index.ts`)
- Backward-compatibility re-export layers
- `ARCHITECTURE.md` contributor guides
- Example files or playground infrastructure
- Component registries for preview routing
- `package.json` `exports` field entries

### 6. README + Headers Are for LLMs

Structured file headers and folder-level READMEs serve LLM scanning. Keep them accurate but concise. See the `superos-file-headers` and `superos-readme-cascade` skills for conventions.

## Decision Checklist

When adding something new, ask:

- [ ] Does this reduce the number of files I need to touch per change?
- [ ] Does this keep the import graph shallow?
- [ ] Would a library consumer need this? If yes and only yes, skip it.
