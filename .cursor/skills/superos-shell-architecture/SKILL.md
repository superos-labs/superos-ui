---
name: superos-shell-architecture
description: Architecture of the Shell component system in SuperOS UI. Use when modifying shell behavior, adding new shell features, or understanding how shell hooks are organized.
---

# Shell Architecture

The Shell is the top-level orchestration component for the entire prototype. All UI features (calendar, backlog, notes, etc.) render inside the Shell.

## Hook Organization

Shell behavior is organized into a layered hook system:

| Hook | Responsibility |
|------|----------------|
| `useShellState` | Core state management (active panel, sidebar, navigation) |
| `useShellWiring` | Cross-feature orchestration, focus management, toast aggregation, mobile nav |
| `useUnifiedSchedule` | Schedule data layer (tasks, events, goals, deadlines) |

### Inlined Hooks

The following hooks were **inlined** into `use-shell-wiring.ts` to reduce file count:

- **Focus management** — panel focus tracking and keyboard shortcuts
- **Toast aggregation** — collecting and deduplicating toast notifications
- **Mobile navigation** — responsive nav state and gesture handling

If any of these grow significantly (>50 lines each), they can be extracted again. Until then, they live in `use-shell-wiring.ts` as clearly commented sections.

## Adding New Shell Features

1. Determine if the feature is **state** (goes in `useShellState`) or **behavior/wiring** (goes in `useShellWiring`).
2. If it's a data concern, it likely belongs in `lib/` (e.g., `lib/unified-schedule`), not in the shell.
3. Keep the shell's `index.ts` barrel aligned — export new hooks or components from there.
4. Update `components/shell/README.md` when adding or removing files.

## File Structure

```
components/shell/
├── index.ts                  # Barrel: public exports
├── shell.tsx                 # Main Shell component
├── use-shell-state.ts        # State hook
├── use-shell-wiring.ts       # Wiring hook (includes focus, toasts, mobile nav)
├── shell-sidebar.tsx         # Sidebar component
├── shell-header.tsx          # Header component
├── shell-content.tsx         # Content area component
└── README.md
```
