# Unified Schedule System

**Purpose:** Unified schedule system for managing goals, tasks, calendar events, and essentials in a React application.

## Core Architecture

### Entry Point
- **`index.ts`** — Public API that re-exports hooks, utilities, and types

### Type System
- **`types.ts`** — Canonical type definitions for calendar events, goals, tasks, subtasks, milestones, essentials, sync configurations, hook interfaces, goal creation data, inspiration gallery types, and `DateGranularity` for lazy dates

### State Utilities
- **`goal-state-utils.ts`** — Pure immutable helper functions for nested goal/task/subtask/milestone updates (no React dependencies)

### Time Range Utilities
- **`time-range-utils.ts`** — Pure helper functions for resolving, formatting, and querying granular (lazy) dates used on goal target dates. Includes month/quarter resolution, display formatting, and overlap checking for future horizon views

## React Hooks (Composable)

### Orchestration
- **`use-unified-schedule.ts`** — Main facade hook that composes all sub-hooks together

### State Management
- **`use-goal-state.ts`** — Manages goal/task/subtask/milestone CRUD operations and weekly focus
- **`use-event-state.ts`** — Manages calendar event CRUD, hover state, drag/resize/duplicate/paste handlers
- **`use-essential-visibility.ts`** — Tracks which essentials are enabled/visible

### Scheduling Logic
- **`use-scheduling.ts`** — Translates scheduling intents into calendar events; handles drag-drop, task-to-goal conversions, deadline management

### Derived Data
- **`use-schedule-stats.ts`** — Computes statistics (planned/completed time, deadlines, task scheduling info, quarter aggregations)

### Derived Context
- **`use-next-block.ts`** — Derives the currently active or next upcoming goal/task block from today's events. Re-evaluates every 60 seconds. Returns `NextBlockInfo` with block, goal, status, remaining time, scope type, and daily completion counts

### Behaviors
- **`use-essential-auto-complete.ts`** — Auto-completes essential blocks after their end time passes
- **`use-week-navigation.ts`** — Keyboard shortcuts for week navigation (ArrowLeft/Right, T for today)

## Design Principles

- **Separation of concerns:** Pure utilities vs. React hooks
- **Immutability:** All state updates return new references
- **Composability:** Hooks can be used independently or via the orchestration hook
- **No persistence:** Callers own saving/loading
- **UI-agnostic:** Domain logic separated from rendering

**Total Files:** 13 (1 entry point, 1 types file, 2 utility modules, 9 React hooks)
