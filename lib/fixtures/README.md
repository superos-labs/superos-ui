# Fixtures Library

**Purpose:** Static fixture data and seed data for prototyping, demos, onboarding flows, and development workflows. Provides realistic sample data, inspiration catalogs, and default configurations.

## Core Fixtures

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

- **Onboarding Seeds:** Goal suggestions for new user onboarding
- **Shell Fixtures:** Complete data sets for shell experience
- **Multiple Presets:** Sample, complete, and empty data sets
- **Realistic Data:** Sample data mirrors believable user scenarios
- **Runtime Generation:** Events generated relative to current week
- **Icon Catalog:** Curated icon options for goal creation

## Design Principles

- **Prototyping Focus:** Designed for demos, previews, and development
- **Inspirational:** Goal suggestions inspire rather than prescribe
- **Life Area Alignment:** Goals organized by life areas
- **Curated Options:** Intentionally curated to reduce choice overload
- **Realistic Patterns:** Data patterns mirror believable user behavior
- **Empty States:** Provides empty data sets for initialization

## Usage Patterns

1. **Onboarding:** Use ONBOARDING_GOAL_SUGGESTIONS in onboarding flows
2. **Shell Experience:** Use shell-data fixtures for rich demo experience
3. **Development:** Switch between data sets for testing different states
4. **Icon Selection:** Use GOAL_ICONS catalog in goal creation UI

## Integration Points

- **Onboarding:** Goal suggestions used in onboarding flows
- **Shell:** Shell fixtures used for main application initialization
- **Goal Creation:** Icon catalog and suggestions used in goal creation UI
- **Life Areas:** Fixtures align with life area system

**Total Files:** 1 root-level file + 1 subdirectory (shell-data with 5 files)
