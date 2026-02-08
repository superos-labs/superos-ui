# Lib Directory

**Purpose:** Core library code containing domain logic, utilities, shared types, and cross-cutting concerns that power the SuperOS application.

## Root-Level Utilities

### Core Utilities
- **`utils.ts`** — Small, shared utility helpers
  - Class name composition helper (clsx + tailwind-merge)
  - Hour formatting helpers for analytics and UI display
  - Merges conditional Tailwind class names safely
  - Formats numeric hour values for human-readable display
  - Keeps file minimal and generic
  - Prefers colocating domain-specific utilities near their features

### Time Utilities
- **`time-utils.ts`** — Shared time formatting and parsing utilities
  - Centralizes common helpers for converting between minutes, strings, and human-readable representations
  - Used across calendar, backlog, essentials, and focus timer surfaces
  - Provides day label constants
  - Formats minutes into 12-hour time strings
  - Parses user-entered time strings into minutes
  - Formats day sets and time ranges for display
  - Formats elapsed milliseconds for timers
  - Generates concise schedule summaries for essentials
  - Favors tolerant parsing for user input
  - Output strings optimized for compact UI display

### Color System
- **`colors.ts`** — Centralized color system for Goals, Tasks, and Blocks
  - Defines canonical set of supported semantic colors
  - Provides helpers for mapping colors to hex values, Tailwind text color classes, and Tailwind background color classes
  - Acts as single source of truth for color usage across the app
  - Declares allowed goal color tokens
  - Maps color tokens to hex values
  - Provides Tailwind class helpers for common UI scenarios
  - Color keys align with Tailwind palette names
  - Keeps palette changes centralized to avoid visual drift

### Drag Types
- **`drag-types.ts`** — Shared drag-and-drop type definitions and helpers for calendar interactions
  - Describes shape of items that can be dragged from backlog, deadline trays, and external calendars
  - Describes how and where they can be dropped
  - Defines DragItem and DropPosition data contracts
  - Enumerates supported drop target types
  - Provides helpers for default duration, title, and color resolution
  - DragItem is intentionally permissive; only relevant fields populated per item type
  - External all-day events carry provider metadata and use custom hex colors

### Life Areas
- **`life-areas.ts`** — Canonical definition of Life Areas used to categorize Goals
  - Provides full list of supported life areas with display metadata (label, icon, color)
  - Provides lightweight helpers for lookup and typing
  - Acts as single source of truth for goal categorization across the app
  - Declares set of available life areas
  - Associates each life area with icon and color metadata
  - Provides fast lookup by ID
  - Exposes strongly typed LifeAreaId union
  - IDs are stable and should not be renamed lightly
  - Colors reference shared GoalColor palette

### Shared Types
- **`types.ts`** — Shared cross-cutting type definitions
  - Provides small, foundational types reused across multiple domains
  - Used by calendar blocks, goals, life areas, and UI components
  - Acts as single source of truth for lightweight, app-wide contracts
  - Defines block-related enums/unions
  - Defines standard icon component typing
  - Defines goal and life-area related interfaces
  - Keeps file focused on broadly shared primitives
  - Avoids feature-specific or domain-heavy types

## Feature Domain Libraries

### Unified Schedule
See [`unified-schedule/README.md`](./unified-schedule/README.md) for detailed documentation.

**Purpose:** Unified schedule system for managing goals, tasks, calendar events, and essentials.

**Key Components:** Orchestration hooks, state management hooks, scheduling logic, derived stats, behaviors

### Calendar Sync
See [`calendar-sync/README.md`](./calendar-sync/README.md) for detailed documentation.

**Purpose:** System for managing calendar provider integrations and bidirectional sync.

**Key Components:** Calendar sync hook, sync resolver, event utilities, provider configuration

### Blueprint
See [`blueprint/README.md`](./blueprint/README.md) for detailed documentation.

**Purpose:** Template-based weekly planning system for defining typical week structure.

**Key Components:** Blueprint hook, conversion utilities, type definitions

### Weekly Planning
See [`weekly-planning/README.md`](./weekly-planning/README.md) for detailed documentation.

**Purpose:** Client-side hooks and types for two-step weekly planning flow.

**Key Components:** Planning flow hook, weekly plan hook, types

### Essentials
See [`essentials/README.md`](./essentials/README.md) for detailed documentation.

**Purpose:** System for configuring and managing recurring life activities.

**Key Components:** Configuration hook, activity schedule hook, import utilities

### Focus
See [`focus/README.md`](./focus/README.md) for detailed documentation.

**Purpose:** Client-side hooks for managing Focus Mode sessions and notifications.

**Key Components:** Focus session hook, focus notifications hook, types

### Undo
See [`undo/README.md`](./undo/README.md) for detailed documentation.

**Purpose:** Client-side undo system using React context and command pattern.

**Key Components:** Undo provider, command history, types

### Preferences
See [`preferences/README.md`](./preferences/README.md) for detailed documentation.

**Purpose:** Client-side context for managing user-configurable settings.

**Key Components:** Preferences provider, preference types, constants

### Responsive
See [`responsive/README.md`](./responsive/README.md) for detailed documentation.

**Purpose:** Client-side hooks for responsive breakpoint detection and device identification.

**Key Components:** Breakpoint hook, device detection, types

### Goals (Relocated)
See [`goals/README.md`](./goals/README.md) for details.

**Status:** Code files merged into `unified-schedule/types.ts`. Directory contains documentation only. Import goal creation and inspiration types from `@/lib/unified-schedule`.

### Adapters
See [`adapters/README.md`](./adapters/README.md) for detailed documentation.

**Purpose:** Adapter utilities for transforming domain data into UI-specific formats.

**Key Components:** Sidebar adapter, analytics adapter, planning budget adapter

### Fixtures
See [`fixtures/README.md`](./fixtures/README.md) for detailed documentation.

**Purpose:** Static fixture data for prototyping, demos, and development workflows.

**Key Components:** Goal inspiration data, onboarding goals, shell data fixtures

## Architecture Principles

- **Domain Organization:** Feature domains organized in subdirectories
- **Single Source of Truth:** Core types and constants centralized
- **Pure Utilities:** Utility functions are pure and side-effect free
- **Type Safety:** Strongly-typed interfaces throughout
- **Separation of Concerns:** Domain logic separated from UI concerns
- **Reusability:** Shared utilities and types used across domains
- **Documentation:** Each major domain has its own README

## Directory Structure

```
lib/
├── utils.ts                    # Core utilities (cn, formatHours)
├── time-utils.ts               # Time formatting and parsing
├── colors.ts                   # Color system and helpers
├── drag-types.ts               # Drag & drop types
├── life-areas.ts               # Life area definitions
├── types.ts                    # Shared cross-cutting types
├── unified-schedule/           # Unified schedule domain (includes goal creation types)
├── calendar-sync/             # Calendar integration system
├── blueprint/                  # Blueprint template system
├── weekly-planning/           # Weekly planning flow
├── essentials/                 # Essentials configuration
├── focus/                      # Focus mode sessions
├── undo/                       # Undo system
├── preferences/                # User preferences
├── responsive/                 # Responsive utilities
├── goals/                      # Goal domain types (relocated, docs only)
├── adapters/                   # Data adapters
└── fixtures/                   # Fixture data
```

## Usage Guidelines

- **Import Utilities:** Use root-level utilities for common operations (cn, time formatting, colors)
- **Domain Logic:** Import from domain subdirectories for feature-specific logic
- **Type Safety:** Use shared types from lib/types.ts for cross-cutting concerns
- **Color System:** Use colors.ts helpers for consistent color usage
- **Time Formatting:** Use time-utils.ts for all time-related formatting

**Total Subdirectories:** 11 feature domains + root-level utilities
