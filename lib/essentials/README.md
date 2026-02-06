# Essentials System

**Purpose:** System for configuring and managing "Essentials" — non-negotiable life activities (e.g., eating, commuting, exercising) that can be templated and imported into schedules or blueprints.

## Core Components

### Configuration Hook
- **`use-essential-config.ts`** — Client-side hook for managing a user's Essential configuration
  - Handles enabling/disabling essentials and editing their recurring schedule templates (slots)
  - Provides sensible defaults when an essential is first enabled
  - Stores enabled essential IDs and their templates
  - Enables essentials with default slot presets
  - Disables essentials and removes associated templates
  - Adds, updates, removes, and replaces slots within a template
  - Exposes helpers to query enabled state and templates
  - Slot IDs are generated locally
  - State updates are immutable and scoped per essential

### Activity Schedule Hook
- **`use-activity-schedule.ts`** — Client-side hook for managing editable schedule state for an essential's recurring activity
  - Transforms between persisted EssentialSlot[] format and editing-friendly model
  - Editing model composed of shared set of selected days and one or more time ranges (start + duration)
  - Initializes editing state from EssentialSlot[]
  - Manages selected days and time ranges independently
  - Adds, updates, and removes time ranges
  - Converts editing state back to EssentialSlot[] for saving
  - Resets editing state from a new slot array
  - Deduplicates time ranges by startMinutes + durationMinutes
  - Provides sensible defaults when no slots exist

### Import Utilities
- **`import-essentials.ts`** — Utility helpers for importing essential templates into calendar events
  - Converts EssentialTemplate slots into CalendarEvent objects
  - Detects whether essentials already exist for a week
  - Determines if a week requires essential import
  - Generates unique event IDs for imported essentials
  - Creates calendar events for specified week based on templates

### Types
- **`types.ts`** — Type definitions and defaults for configuring Essentials and their recurring weekly time slots
  - Defines core types for essential slots, templates, and configuration
  - Provides default slot presets for common essentials
  - Defines import option types for converting essentials to calendar events
  - Defines hook option/return contracts for managing essential configuration
  - Slots are expressed in minutes-from-midnight for consistency
  - Templates can contain multiple slots per essential

### Public API
- **`index.ts`** — Public entry point for the Essentials system
  - Re-exports essentials types, hooks, and utilities
  - Provides single import surface for essentials features

## Key Concepts

### Essential Slots
- **Time-Based:** Expressed in minutes-from-midnight for consistency
- **Day Selection:** Each slot specifies which days of the week it occurs
- **Duration:** Each slot has a start time and duration
- **Multiple Slots:** An essential can have multiple slots per week

### Essential Templates
- **Configuration:** Collection of slots for a specific essential
- **Per Essential:** Each essential has its own template
- **Default Presets:** Common essentials come with sensible default slots
- **Editable:** Users can customize slots for their needs

### Essential Config
- **Enabled State:** Tracks which essentials are enabled
- **Templates Map:** Stores slot templates keyed by essential ID
- **Immutable Updates:** All state updates return new references
- **Session Storage:** Configuration stored in memory (can be persisted elsewhere)

## Key Features

- **Template Management:** Create and edit recurring schedule templates for essentials
- **Default Presets:** Sensible defaults for common essentials (meals, sleep, commute, etc.)
- **Multi-Slot Support:** Essentials can have multiple time slots per week
- **Day Selection:** Flexible day-of-week selection for each slot
- **Calendar Import:** Convert templates into calendar events for specific weeks
- **Week Detection:** Detect if a week already has essential events or needs import
- **Editing Model:** User-friendly editing interface with day selection and time ranges
- **Enable/Disable:** Toggle essentials on/off with automatic template management

## Design Principles

- **Template-Based:** Essentials are configured once and reused across weeks
- **Time Consistency:** All times expressed in minutes-from-midnight
- **Immutable State:** All updates return new references
- **Editing-Friendly:** Transforms between storage format and editing model
- **Default-First:** Sensible defaults reduce setup friction
- **Session Storage:** Configuration stored in memory (persistence handled elsewhere)
- **Deduplication:** Prevents duplicate time ranges in templates

## Usage Pattern

1. **Configure Essentials:** Use `useEssentialConfig` to enable essentials and set up templates
2. **Edit Schedules:** Use `useActivitySchedule` to edit slot schedules for an essential
3. **Import to Calendar:** Use `importEssentialsToEvents` to convert templates to calendar events
4. **Check Status:** Use `hasEssentialEventsForWeek` or `weekNeedsEssentialImport` to detect import needs
5. **Manage State:** Enable/disable essentials and update templates as needed

## Integration Points

- **Blueprint System:** Essentials can be included in blueprint templates
- **Weekly Planning:** Essentials imported during weekly planning flow
- **Calendar:** Essential templates converted to calendar events
- **Shell:** Essential configuration managed through shell handlers

**Total Files:** 5 (2 React hooks, 1 utilities file, 1 types file, 1 public API)
