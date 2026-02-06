# Goals Domain Types

**Purpose:** Goal domain types shared between components and app logic, defining shapes for goal creation and the inspiration gallery.

## Core Files

### Types
- **`types.ts`** — Goal domain types shared between components and app logic
  - Defines shapes for goal creation and inspiration gallery
  - Core scheduling goal structures live in unified schedule domain
  - Defines data needed to create new goals
  - Defines inspiration gallery goal and category types
  - Re-exports common goal-related types for convenience
  - Keeps UI-level goal concerns separate from scheduling primitives

### Public API
- **`index.ts`** — Public types barrel for backlog-related domain
  - Re-exports commonly used backlog and inspiration-related types
  - Single module for importing goal-related types
  - Re-exports backlog and inspiration domain types

## Key Types

### Goal Creation
- **NewGoalData** — Data for creating a new goal
  - Used by goal creation forms and inspiration gallery
  - Includes label, icon, color, life area, and optional target date

### Inspiration Gallery
- **InspirationGoal** — Goal template from inspiration gallery
  - Includes id, label, icon, and associated life area
  - Used in Goal Inspiration Gallery for browsing and adding goals

- **InspirationCategory** — Category grouping for inspiration goals
  - Groups inspiration goals by life area
  - Used to organize inspiration gallery display

### Supporting Types
- **LifeArea** — Life area type (re-exported from lib/types)
- **GoalIconOption** — Goal icon option type (re-exported from lib/types)

## Design Principles

- **Separation of Concerns:** UI-level goal concerns separate from scheduling primitives
- **Type Reuse:** Re-exports common types for convenience
- **Inspiration Support:** Types support inspiration gallery functionality
- **Creation-Focused:** Types focused on goal creation rather than scheduling

## Usage Patterns

1. **Goal Creation:** Use NewGoalData in goal creation forms and editors
2. **Inspiration Gallery:** Use InspirationGoal and InspirationCategory in inspiration gallery
3. **Type Imports:** Import goal-related types from this module for consistency

## Integration Points

- **Unified Schedule:** Core scheduling goal structures in unified schedule domain
- **Backlog Components:** Goal creation types used in backlog goal components
- **Inspiration Gallery:** Inspiration types used in Goal Inspiration Gallery
- **Life Areas:** Re-exports LifeArea type for goal categorization
- **Icon System:** Re-exports GoalIconOption for icon selection

**Total Files:** 2 (1 types file, 1 public API)
