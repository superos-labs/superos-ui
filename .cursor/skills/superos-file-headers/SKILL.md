---
name: superos-file-headers
description: Structured file header convention for all .ts/.tsx files in the SuperOS UI codebase. Use when creating new TypeScript files, modifying existing files that have headers, or when the user asks about file documentation conventions.
---

# Structured File Headers

Every `.ts` and `.tsx` file in this codebase uses a structured header block optimized for LLM scanning. Always include headers when creating new files and update them when modifying files.

## Header Template

```typescript
/**
 * =============================================================================
 * File: filename.ts
 * =============================================================================
 *
 * Brief one-line description of the file's purpose.
 *
 * Optional expanded description providing additional context.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - What this file does (bullet points)
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES (optional, include when boundaries matter)
 * -----------------------------------------------------------------------------
 * - What this file explicitly does NOT do
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES (optional, include for non-obvious decisions)
 * -----------------------------------------------------------------------------
 * - Architectural context or rationale
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - List of exported symbols
 */
```

## Rules

1. **Always include** RESPONSIBILITIES and EXPORTS sections.
2. **Optionally include** NON-RESPONSIBILITIES and DESIGN NOTES when they clarify boundaries or non-obvious decisions.
3. **Update headers** when modifying a file's responsibilities, exports, or design rationale.
4. **Keep descriptions accurate** — stale headers are worse than no headers.
5. **Use section comments** within files (e.g., `// === Types ===`) to separate logical groups.
