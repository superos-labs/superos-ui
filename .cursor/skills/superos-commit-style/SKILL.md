---
name: superos-commit-style
description: Commit message format and git workflow for the SuperOS UI codebase. Use when committing changes or when the user asks to commit and push.
---

# Commit Style

## Message Format

```
<type>: <summary>

<body explaining what was implemented and why>
```

### Types

| Type | Usage |
|------|-------|
| `refactor` | Restructuring without functional changes |
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation-only changes |
| `chore` | Build, tooling, or maintenance |

### Summary Line

- Imperative mood ("remove library export infrastructure" not "removed" or "removes")
- Lowercase start
- No period at the end
- Max ~72 characters

### Body

- Always include a body for non-trivial changes
- Explain **what was done** and **why**
- List specific files or modules affected for multi-file changes
- Use bullet points for readability

## Example

```
refactor: remove library export infrastructure

Strip export-oriented patterns to optimize for rapid prototyping:
- Delete root barrel files (components/index.ts, hooks/index.ts)
- Remove ARCHITECTURE.md contributor guide
- Delete example files and component registry
- Remove dynamic preview routes ([slug], sample-components)

No functional changes — all prototype shell behavior preserved.
```

## Workflow

1. Stage all relevant changes
2. Write commit message with body via HEREDOC
3. Push to origin after commit
4. Verify with `git status` after push
