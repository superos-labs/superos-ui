# Weekly Planning System

**Purpose:** Client-side hooks and types for managing the two-step weekly planning flow: prioritizing important tasks and scheduling them onto the calendar.

## Core Components

### Planning Flow Hook
- **`use-planning-flow.ts`** — Client-side hook that manages the state machine for the Weekly Planning flow
  - Orchestrates two-step experience: prioritize tasks → schedule tasks onto calendar blocks
  - Tracks current planning step
  - Resets flow when planning mode becomes active
  - Manages weekly focus task IDs (session-only)
  - Exposes navigation and action handlers
  - Does not persist any data
  - Assumes calendar already contains blueprint blocks
  - Confirm is only valid in the "schedule" step

### Weekly Plan Hook
- **`use-weekly-plan.ts`** — Client-side hook for managing WeeklyPlan records in memory
  - Stores and retrieves weekly planning completion metadata keyed by week start date
  - Holds weekly plans in an in-memory map
  - Provides get, save, and existence checks
  - Lightweight, session-only store that can later be replaced or augmented with persistence
  - No persistence across page refreshes
  - plannedAt is set at save time

### Types
- **`types.ts`** — Shared types for the Weekly Planning domain
  - Defines data model and hook contracts for two-step weekly planning flow
  - Describes persisted weekly plan records
  - Defines planning flow step semantics
  - Specifies input/output types for weekly planning hooks
  - Weekly focus state is session-only and not persisted
  - APIs are intentionally minimal to allow future expansion

### Public API
- **`index.ts`** — Public entry point for the Weekly Planning domain
  - Re-exports primary hooks and shared types
  - Defines public API surface for weekly planning
  - Centralizes exports for hooks and domain types

## Planning Flow Steps

### Step 1: Prioritize
- Users select important tasks per goal
- Tasks marked as focus are tracked (session-only)
- Focus tasks are surfaced first in the schedule view

### Step 2: Schedule
- Users schedule prioritized tasks onto calendar blocks
- Only focus tasks are shown to reduce clutter
- Calendar already contains blueprint blocks
- Confirm action completes the planning flow

## Key Features

- **Two-Step Flow:** Prioritize → Schedule workflow
- **State Machine:** Manages planning flow state transitions
- **Session-Only Focus:** Weekly focus task IDs tracked during planning session
- **Week Tracking:** Records when planning was completed for each week
- **In-Memory Storage:** Lightweight store for weekly plan metadata
- **Step Navigation:** Forward/backward navigation through planning steps
- **Cancel Support:** Ability to exit planning flow at any step

## Design Principles

- **Session-Only State:** Focus tasks and flow state are not persisted
- **Minimal Persistence:** Only planning completion metadata is stored
- **Blueprint Integration:** Assumes calendar already contains blueprint blocks
- **Future-Proof:** APIs intentionally minimal to allow expansion
- **State Machine:** Clear state transitions for planning flow
- **Week-Based:** Planning tracked per week using week start date

## Usage Pattern

1. **Initialize Flow:** Use `usePlanningFlow` hook with `isActive` flag
2. **Track Focus:** Add/remove tasks from weekly focus set during prioritize step
3. **Navigate Steps:** Use `goToStep` or `nextStep`/`previousStep` handlers
4. **Confirm Planning:** Call `onConfirm` when scheduling is complete
5. **Save Plan:** Use `useWeeklyPlan` to record planning completion for the week
6. **Check Status:** Query `hasPlannedWeek` to see if a week has been planned

## Integration Points

- **Shell:** Planning mode activation and deactivation
- **Calendar:** Scheduling focus tasks onto calendar blocks
- **Blueprint:** Calendar contains blueprint blocks before planning
- **Goals:** Selecting focus tasks per goal
- **Weekly Planning Components:** UI components consume these hooks

**Total Files:** 4 (2 React hooks, 1 types file, 1 public API)
