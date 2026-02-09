# Adapters Library

**Purpose:** Adapter utilities for transforming domain data structures into UI-specific formats, bridging between unified schedule domain models and component-specific data shapes.

## Core Adapters

### Sidebar Adapter
- **`sidebar-adapter.ts`** — Adapter utilities for converting unified calendar events into BlockSidebarData shape
  - Enriches raw CalendarEvent data with goal, task, essential, and subtask metadata
  - Enables sidebar to display and manage block details
  - Defines sidebar-facing goal and essential data shapes
  - Converts CalendarEvent into BlockSidebarData
  - Resolves source goal, task, and essential from provided collections
  - Derives start/end dates and times, including overnight blocks
  - Builds assigned goal tasks, available goal tasks, and task subtasks
  - Filters available tasks by excluding tasks assigned to other blocks of the same goal (via optional `allEvents` parameter)
  - Resolves icon color classes for display
  - Uses planned startMinutes + durationMinutes for same-day blocks
  - Overnight blocks derive end day and minutes via calendar helpers
  - Keeps adapter pure and synchronous
  - Provides time formatting utilities (formatMinutesToTime, parseTimeToMinutes)

### Analytics Adapter
- **`analytics-adapter.ts`** — Adapter utilities for transforming domain analytics data into WeeklyAnalyticsItem format
  - Bridges generic sources (goals, life areas, etc.) with visual and structural requirements of weekly analytics component
  - Defines lightweight analytics source and stats interfaces
  - Converts source items + stats lookup into WeeklyAnalyticsItem objects
  - Resolves icon color classes from domain color tokens
  - Supports optional use of focused hours as progress metric
  - Keeps conversion logic centralized to avoid UI-specific shaping elsewhere
  - Defaults to completedHours for progress, with opt-in focusedHours path

### Planning Budget Adapter
- **`planning-budget-adapter.ts`** — Adapter functions for shaping schedule goals and essentials into Planning Budget data structures
  - Converts schedule goals to PlanningBudgetGoal format
  - Converts schedule essentials to PlanningBudgetEssential format
  - Builds combined planning budget data from schedule state
  - Used by weekly analytics for planning budget visualization
  - Takes goals/essentials and stats functions as input
  - Produces planning budget data structures for UI consumption

### Public API
- **`index.ts`** — Barrel file that re-exports all adapter utilities and related types
  - Provides single import surface for adapter functions
  - Re-exports adapter-related types for convenience
  - Groups exports by adapter type (sidebar, analytics, planning budget)

## Key Features

- **Data Transformation:** Converts domain models to UI-specific formats
- **Enrichment:** Adds metadata and resolved references to raw data
- **Time Handling:** Handles time formatting and overnight block calculations
- **Stats Integration:** Integrates with stats computation for analytics
- **Pure Functions:** All adapters are pure and synchronous
- **Type Safety:** Strongly-typed interfaces for adapter inputs and outputs
- **Centralized Logic:** Keeps UI-specific data shaping in one place

## Design Principles

- **Separation of Concerns:** Adapters bridge domain and UI layers without mixing concerns
- **Pure Functions:** All adapters are side-effect free and synchronous
- **Type Safety:** Strongly-typed interfaces ensure correct data shapes
- **Centralization:** UI-specific data shaping kept in adapters, not scattered in components
- **Flexibility:** Supports multiple progress metrics (completed vs focused hours)
- **Reusability:** Adapters can be used across different UI contexts

## Usage Patterns

1. **Sidebar Data:** Use `eventToBlockSidebarData` to convert CalendarEvent to BlockSidebarData
2. **Analytics Items:** Use `toAnalyticsItems` to convert goals/stats to WeeklyAnalyticsItem format
3. **Planning Budget:** Use planning budget adapters to build budget data from schedule state
4. **Time Formatting:** Use `formatMinutesToTime` and `parseTimeToMinutes` for time conversions

## Integration Points

- **Unified Schedule:** Adapters consume unified schedule domain types
- **Block Sidebar:** Sidebar adapter produces data for block sidebar components
- **Weekly Analytics:** Analytics and planning budget adapters feed analytics components
- **Color System:** Adapters resolve icon color classes from domain color tokens
- **Calendar Utils:** Sidebar adapter uses calendar helpers for overnight block calculations

**Total Files:** 4 (3 adapter files, 1 public API)
