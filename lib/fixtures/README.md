# Fixtures Library

**Purpose:** Static fixture data and seed data for prototyping, demos, onboarding flows, and development workflows. Provides realistic sample data, inspiration catalogs, and default configurations.

## Core Fixtures

### Goal Inspiration Data
- **`goal-inspiration-data.ts`** — Seed data for the Goal Inspiration Gallery
  - Defines curated goal ideas grouped by life area
  - Helps users quickly discover goals that benefit from time allocation and weekly recurrence
  - Used during onboarding and in backlog when browsing or adding new goals
  - Defines inspiration categories mapped to life areas
  - Provides goal templates with id, label, and icon
  - Goals phrased as simple, action-oriented labels
  - List intentionally inspirational, not prescriptive

### Onboarding Goals
- **`onboarding-goals.ts`** — Curated goal suggestions for the onboarding experience
  - Focused subset of goals representing common use cases
  - Selected for broad appeal and representing different life areas
  - Colors hardcoded to match LIFE_AREAS from lib/life-areas.ts
  - Provides OnboardingGoalSuggestion type with id, label, icon, color, and lifeAreaId
  - Used in onboarding flows to seed initial goals

### Shell Data
See [`shell-data/README.md`](./shell-data/README.md) for detailed documentation.

**Purpose:** Complete fixture data sets for shell experience, including goals, essentials, calendar events, and icon catalogs.

**Key Exports:**
- SHELL_GOALS, COMPLETE_GOALS, EMPTY_GOALS
- SHELL_CALENDAR_EVENTS, COMPLETE_CALENDAR_EVENTS, EMPTY_CALENDAR_EVENTS
- ALL_ESSENTIALS, DEFAULT_ENABLED_ESSENTIAL_IDS, COMPLETE_ENABLED_ESSENTIAL_IDS
- GOAL_ICONS
- DATA_SETS (sample, complete, empty)

## Key Features

- **Inspiration Catalog:** Curated goal ideas grouped by life area
- **Onboarding Seeds:** Goal suggestions for new user onboarding
- **Shell Fixtures:** Complete data sets for shell experience
- **Multiple Presets:** Sample, complete, and empty data sets
- **Realistic Data:** Sample data mirrors believable user scenarios
- **Runtime Generation:** Events generated relative to current week
- **Icon Catalog:** Curated icon options for goal creation

## Design Principles

- **Prototyping Focus:** Designed for demos, previews, and development
- **Inspirational:** Goal suggestions inspire rather than prescribe
- **Life Area Alignment:** Goals and inspiration organized by life areas
- **Curated Options:** Intentionally curated to reduce choice overload
- **Realistic Patterns:** Data patterns mirror believable user behavior
- **Empty States:** Provides empty data sets for initialization

## Usage Patterns

1. **Goal Inspiration:** Use INSPIRATION_CATEGORIES in Goal Inspiration Gallery
2. **Onboarding:** Use ONBOARDING_GOAL_SUGGESTIONS in onboarding flows
3. **Shell Experience:** Use shell-data fixtures for rich demo experience
4. **Development:** Switch between data sets for testing different states
5. **Icon Selection:** Use GOAL_ICONS catalog in goal creation UI

## Integration Points

- **Onboarding:** Goal suggestions and inspiration used in onboarding flows
- **Backlog:** Inspiration gallery uses inspiration categories
- **Shell:** Shell fixtures used for main application initialization
- **Goal Creation:** Icon catalog and suggestions used in goal creation UI
- **Life Areas:** Fixtures align with life area system

**Total Files:** 2 root-level files + 1 subdirectory (shell-data with 5 files)
