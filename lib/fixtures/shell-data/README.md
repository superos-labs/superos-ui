# Shell Fixture Data

**Purpose:** Static fixture data sets for prototyping, demos, onboarding previews, and development workflows. Provides realistic sample data for goals, essentials, calendar events, and supporting catalogs.

## Core Fixtures

### Goals
- **`goals.ts`** — Fixture goal definitions for shell/sample and complete data sets
  - Provides realistic example goals, including milestones and tasks
  - Populates demos, onboarding previews, and shell experience
  - Includes rich goal set with milestones spanning Q1 2026 for skipping onboarding
  - Defines sample goals with milestones, tasks, and subtasks
  - Defines rich goals with milestones and date ranges for dev flows
  - Exposes empty goals array for initialization and resets
  - Sample goals mirror common life areas (career, health, creativity, growth)
  - IDs are stable and referenced by fixture calendar events

### Essentials
- **`essentials.ts`** — Static fixture data for "Essentials" — recurring, non-goal activities
  - Recurring activities users may choose to track (e.g., eating, commuting, exercise)
  - Seeds onboarding, blueprint creation, and preference defaults
  - Sleep intentionally excluded and handled via day-boundary preferences
  - Defines full catalog of available essentials
  - Provides default enabled essential ID sets for different modes
  - Exposes empty essentials dataset for initialization and resets
  - All essentials are optional; none are enabled by default
  - Each essential includes stable id, label, icon, and color token

### Calendar Events
- **`events.ts`** — Fixture calendar events for shell/sample and complete data sets
  - Events generated relative to current week so demos always appear populated
  - Realistic, navigable schedules for demos and previews
  - Used by shell experience, onboarding previews, and dev shortcuts (e.g., skipping onboarding)
  - Generates sample calendar events for shell experience
  - Generates rich "complete" event set spanning Q1 2026 for quarter view demo
  - Exposes empty events array for initialization and resets
  - Dates derived from current week at runtime
  - All events represent goal blocks (not tasks) for clarity in demos
  - Patterns mirror believable weekly routines (morning deep work, workouts, evening creative sessions)

### Goal Icons
- **`goal-icons.ts`** — Curated icon catalog for goal creation and editing
  - Provides broad but intentional set of icon options grouped by common life areas
  - Helps users quickly visually identify goals
  - Groups icons by work, creative, health, learning, social, finance, etc.
  - Defines list of selectable goal icon options
  - Pairs each icon with human-readable label
  - Icons sourced from Remix Icon for consistency
  - List intentionally curated (not exhaustive) to reduce choice overload
  - Labels are short and UI-friendly

### Public API
- **`index.ts`** — Shell fixture data barrel
  - Centralizes and re-exports all shell fixture data (goals, essentials, events, icons, life areas)
  - Single module for importing fixture data
  - Defines named data set presets (sample, empty, complete)
  - Used by shell experience, onboarding previews, and dev shortcuts
  - Re-exports domain-specific shell fixture modules
  - Re-exports commonly used types for convenience
  - Defines strongly-typed fixture data sets
  - "sample" = rich demo data with tasks and milestones
  - "complete" = rich goals with milestones + events spanning Q1 2026 for skip-onboarding
  - "empty" = blank state for fresh users

## Data Sets

### Sample Data Set
- **SHELL_GOALS:** Rich demo goals with tasks and milestones
- **SHELL_CALENDAR_EVENTS:** Sample calendar events for demos
- **DEFAULT_ENABLED_ESSENTIAL_IDS:** Default essentials for sample mode

### Complete Data Set
- **COMPLETE_GOALS:** Rich goals with milestones spanning Q1 2026
- **COMPLETE_CALENDAR_EVENTS:** Events spanning Jan-Feb 2026 for quarter view demo
- **COMPLETE_ENABLED_ESSENTIAL_IDS:** Complete essentials configuration

### Empty Data Set
- **EMPTY_GOALS:** Empty array for fresh users
- **EMPTY_CALENDAR_EVENTS:** Empty array for initialization
- **EMPTY_ESSENTIALS:** Empty essentials for resets

## Key Features

- **Realistic Data:** Sample data mirrors believable user scenarios
- **Runtime Generation:** Events generated relative to current week
- **Multiple Presets:** Sample, complete, and empty data sets
- **Stable IDs:** Goal IDs referenced by fixture events for consistency
- **Life Area Coverage:** Goals cover common life areas
- **Icon Catalog:** Curated icon options grouped by category
- **Optional Essentials:** All essentials optional; none enabled by default

## Design Principles

- **Prototyping Focus:** Designed for demos, previews, and development
- **Realistic Patterns:** Data patterns mirror believable user behavior
- **Runtime Flexibility:** Events generated relative to current week
- **Stable References:** IDs remain stable across fixture sets
- **Curated Options:** Icon catalog intentionally curated to reduce choice overload
- **Empty States:** Provides empty data sets for initialization and resets
- **Life Area Alignment:** Goals align with common life area categories

## Usage Patterns

1. **Shell Experience:** Use sample data set for rich demo experience
2. **Onboarding Preview:** Use sample data to show what app looks like populated
3. **Skip Onboarding:** Use complete data set to skip onboarding with pre-filled data
4. **Fresh Start:** Use empty data set for new users
5. **Development:** Switch between data sets for testing different states
6. **Icon Selection:** Use GOAL_ICONS catalog in goal creation UI

## Integration Points

- **Shell:** Main application uses fixture data sets for initialization
- **Onboarding:** Onboarding flows use sample data for previews
- **Goal Creation:** Icon catalog used in goal creation/editing UI
- **Calendar:** Fixture events rendered in calendar views
- **Backlog:** Fixture goals displayed in backlog components
- **Essentials:** Fixture essentials used in essentials configuration

**Total Files:** 5 (4 fixture data files, 1 public API)
