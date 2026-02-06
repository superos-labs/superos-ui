# Blueprint System

**Purpose:** Template-based weekly planning system that allows users to define their typical week structure and automatically generate calendar events for future weeks.

## Core Components

### React Hook
- **`use-blueprint.ts`** — Client-side hook for managing the user's blueprint (typical week template)
  - Stores blueprint in memory
  - Provides create, update, and clear actions
  - Exposes existence flag
  - In-memory only — state resets on page refresh
  - Provides CRUD operations for the blueprint

### Utilities
- **`blueprint-utils.ts`** — Utilities for converting between Blueprint templates and CalendarEvent data
  - Supports importing blueprints into weekly schedules
  - Derives blueprints from existing calendar events
  - Computes aggregate blueprint metrics
  - Generates future weeks from a blueprint
  - Detects when essential blocks are out of sync with templates
  - Converts Blueprint <-> CalendarEvent
  - Builds multi-week calendar events from a blueprint
  - Provides helpers for querying blueprint blocks by goal or essential
  - Computes total planned hours for a blueprint
  - Detects mismatches between blueprint essentials and essential templates
  - Adapters are pure and synchronous
  - Uses ISO date strings (YYYY-MM-DD) for comparisons
  - Duplicate prevention handled via deterministic event keys

### Types
- **`types.ts`** — Type definitions for the Blueprint system
  - Defines Blueprint and BlueprintBlock shapes
  - Defines hook return contract for useBlueprint
  - BlueprintBlock uses day-of-week (relative) instead of absolute dates
  - Supports goal, task, and essential block types

### Public API
- **`index.ts`** — Public entry point for the Blueprint system
  - Re-exports blueprint hook, utilities, and types
  - Provides single import surface for blueprint features

## Key Features

### Blueprint Structure
- **Day-of-Week Based:** Uses relative day-of-week (0-6) instead of absolute dates
- **Block Types:** Supports goal blocks, task blocks, and essential blocks
- **Time-Based:** Start time and duration in minutes from midnight
- **Color Theming:** Each block has an associated color
- **Source Tracking:** Blocks reference source goal IDs or essential IDs

### Conversion & Generation
- **Blueprint → Events:** Converts blueprint template into calendar events for specific weeks
- **Events → Blueprint:** Derives blueprint template from existing calendar events
- **Multi-Week Generation:** Generates calendar events for multiple future weeks
- **Week Offset Support:** Generates events for weeks with specified offsets

### Analysis & Validation
- **Total Hours:** Computes aggregate planned hours for a blueprint
- **Block Queries:** Find blocks by goal ID or essential ID
- **Sync Detection:** Detects when blueprint essentials need updates
- **Duplicate Prevention:** Uses deterministic event keys to prevent duplicates

## Design Principles

- **Template-Based:** Blueprints are reusable templates, not one-time schedules
- **Relative Time:** Uses day-of-week instead of absolute dates for flexibility
- **Pure Functions:** Adapters are pure and synchronous
- **In-Memory:** Blueprint state is stored in memory (no persistence in this layer)
- **ISO Dates:** Uses ISO date strings for reliable date comparisons
- **Deterministic:** Event keys ensure consistent duplicate prevention

## Usage Pattern

1. **Create Blueprint:** Use `useBlueprint` hook to create a blueprint from calendar events
2. **Store Template:** Blueprint stores relative day-of-week and time information
3. **Generate Weeks:** Use `generateBlueprintEventsForWeeks` to create events for future weeks
4. **Import to Calendar:** Convert blueprint blocks into calendar events for specific dates
5. **Sync Detection:** Check if blueprint essentials need updates with `blueprintEssentialsNeedUpdate`

## Integration Points

- **Weekly Planning:** Blueprints can be created from planned weeks
- **Calendar Events:** Two-way conversion between blueprints and calendar events
- **Essentials:** Tracks essential blocks and detects sync mismatches
- **Goals:** Associates blocks with source goals for context

**Total Files:** 4 (1 React hook, 1 utilities file, 1 types file, 1 public API)
