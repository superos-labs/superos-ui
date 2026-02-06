# Backlog Essentials Components

**Purpose:** UI components for configuring and managing "Essentials" — non-negotiable life activities (e.g., eating, commuting, exercising) that can be templated and scheduled in the backlog.

## Core Components

### Main Section
- **`essentials-section.tsx`** — Primary container for rendering and managing the backlog "Essentials" area
  - Supports two major modes: CTA mode (guided setup) and Configured mode (standard list with expandable rows)
  - Supports collapsing into compact icon strip
  - Decides whether to show CTA or configured view
  - Orchestrates animated transitions between modes
  - Renders Sleep (special case) and other essentials
  - Manages which essential row is expanded
  - Bridges user actions to parent callbacks
  - CTA entered only when no essentials and no sleep config exist
  - Sleep always rendered first and is non-deletable
  - Height animated separately from content to avoid layout jank

### Call-to-Action Flow
- **`essentials-cta.tsx`** — Call-to-action surface for defining backlog "Essentials" during onboarding or setup flows
  - Orchestrates entire essentials configuration experience
  - Handles sleep configuration (special case)
  - Displays already-added essentials
  - Inline editing of suggested essentials
  - Creation of custom essentials
  - Coordinates UI state and delegates persistence upward via callbacks
  - Renders header, list, and footer actions
  - Manages which row is expanded or being edited
  - Sorts and filters essentials and suggestions
  - Progress defined as sleep configured or at least one essential added
  - Only one suggestion or essential can be edited at a time
  - Sleep row visually emphasized until configured

### Row Components
- **`essential-row.tsx`** — Row-level UI components for configuring backlog "Essentials" schedules
  - Provides two interactive rows: EssentialRow (generic essential) and SleepRow (special-case sleep visualization)
  - EssentialRow: generic essential activity with selectable days and one or more time ranges
  - SleepRow: special-case essential for sleep visualization using wake-up and wind-down times
  - Purely presentational + interaction-oriented
  - Own transient UI state for editing
  - Do NOT persist data; delegate all saving via callbacks
  - Render collapsed and expanded row states
  - Display current schedule summary when collapsed
  - Provide inline editors for days and time ranges
  - Auto-save EssentialRow changes when collapsing
  - Allow optional deletion of an essential
  - Desktop-first, compact rows optimized for dense backlog lists
  - Expansion uses CSS grid row animation instead of conditional mounting

### Creation Components
- **`inline-essential-creator.tsx`** — Inline form for creating a new backlog Essential with default schedule
  - Designed to be embedded inside Essentials lists and CTA flows
  - Provides lightweight controls for naming, choosing icon/color, selecting days, and defining initial time range
  - Owns only temporary input state; delegates persistence upward via callbacks
  - Collects essential display metadata (label, icon, color)
  - Collects initial schedule (days, start time, duration)
  - Handles basic keyboard shortcuts (Enter = save, Escape = cancel)
  - Auto-focuses name input on mount
  - Emits single EssentialSlot as starting schedule
  - Meant for quick, low-friction creation

- **`suggestion-editor.tsx`** — Inline editor for configuring suggested Essentials before adding them
  - Provides two surfaces: SuggestionEditor (expanded editor) and PlaceholderRow (collapsed row)
  - SuggestionEditor: expanded editor allowing day selection and one or more time ranges
  - PlaceholderRow: collapsed row that invites user to start editing
  - Used primarily inside Essentials CTA flow
  - Allows customization of SuggestedEssential's schedule
  - Converts editor state into EssentialSlot objects
  - Handles add and cancel actions
  - Defaults seeded from SuggestedEssential
  - Supports up to three time ranges
  - Animated mount/unmount via framer-motion

### Data & Types
- **`suggested-essentials.ts`** — Curated default set of suggested backlog Essentials
  - Used to seed Essentials CTA and inline suggestion editors
  - Provides sensible starting points for common routine activities
  - Each suggestion includes display metadata and default schedule that can be customized
  - Defines SuggestedEssential type
  - Provides small, opinionated list of defaults
  - Defaults favor common daily and weekly routines
  - Kept intentionally small and conservative

- **`essential-types.ts`** — Shared type definitions for backlog "Essentials"
  - Defines lightweight UI-facing types used by backlog components
  - Re-exports core scheduling types from domain layer for convenience
  - Defines EssentialItem display shape for backlog UI
  - Defines data shape for creating new essentials
  - Re-exports essential scheduling domain types
  - EssentialItem intentionally does not embed schedule data (scheduling provided separately via EssentialTemplate)
  - Keeps UI types thin and composable

### Public API
- **`index.ts`** — Public export surface for backlog Essentials components and types
  - Single entry point for importing Essentials-related UI primitives, orchestration components, and shared types
  - Re-exports core Essentials components, associated prop types, and shared Essentials domain/UI types

## Key Features

- **Two Modes:** CTA mode for guided setup, Configured mode for standard management
- **Sleep Special Case:** Dedicated SleepRow with wake-up and wind-down time visualization
- **Suggested Essentials:** Curated defaults for common routines (meals, commute, etc.)
- **Inline Editing:** Expandable rows with inline schedule editors
- **Quick Creation:** Low-friction inline creator for custom essentials
- **Day Selection:** Flexible day-of-week selection for each essential
- **Multiple Time Ranges:** Support for multiple time slots per essential
- **Animated Transitions:** Smooth transitions between modes and states
- **Compact Mode:** Collapsible into icon strip for space efficiency

## Design Principles

- **Presentational:** Components own transient UI state but delegate persistence via callbacks
- **Desktop-First:** Compact rows optimized for dense backlog lists
- **Progressive Disclosure:** Collapsed summary view expands to full editor
- **Low Friction:** Quick creation and editing with sensible defaults
- **Visual Hierarchy:** Sleep emphasized until configured
- **Single Edit Focus:** Only one suggestion or essential edited at a time
- **Animation:** CSS grid row animation and framer-motion for smooth transitions

## Usage Pattern

1. **Initial Setup:** EssentialsSection shows CTA mode when no essentials exist
2. **Configure Sleep:** Sleep row emphasized and must be configured first
3. **Add Suggestions:** Users can customize and add suggested essentials
4. **Create Custom:** Users can create fully custom essentials via inline creator
5. **Manage Schedule:** Expand rows to edit days and time ranges
6. **Standard Mode:** Once configured, section switches to standard list view

## Integration Points

- **lib/essentials:** Uses useActivitySchedule hook for schedule state management
- **Time Input:** Uses TimeInput component for minute-based time editing
- **Backlog:** Part of larger backlog component system
- **Blueprint:** Essentials can be included in blueprint templates

**Total Files:** 8 (6 component files, 1 types file, 1 data file, 1 public API)
