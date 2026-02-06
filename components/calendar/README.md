# Calendar Component System

**Purpose:** Complete calendar view system for rendering and interacting with time-based blocks, events, and deadlines in day and week views.

## Core Components

### Main Calendar Router
- **`calendar.tsx`** — Calendar view router and composition root
  - Selects between DayView and WeekView based on requested view
  - Resolves active date and week range
  - Passes through all props to the active view
  - Contains no calendar logic itself

### View Components
- **`week-view.tsx`** — Week-level calendar layout and orchestration
  - Renders day headers, deadline/all-day tray, hour gutter, seven day time columns
  - Handles zoom/density-based grid sizing, scroll-to-current-time, segment generation, overlap layout
  - Maps events → day segments → overlap layout
- **`day-view.tsx`** — Single-day calendar view
  - Renders one day column with hour labels, event blocks, drag-to-create, resize, drag-and-drop
  - Computes grid sizing, derives per-day event segments and overlap layout
  - Scrolls to current time when appropriate

### Column & Block Rendering
- **`time-column.tsx`** — Shared day column renderer for both DayView and WeekView
  - Renders hour grid cells, event segments, drag-to-create previews, external drag previews
  - Primary interaction surface for time-based placement
  - Coordinates drag-to-create behavior and integrates external drag-and-drop
- **`time-column-block.tsx`** — Renders a single calendar block segment inside a TimeColumn
  - Handles absolute positioning, overlap-based horizontal layout
  - Supports dragging, duplicating, resizing, context menu actions
  - Compact vs full block layout based on height
  - Lowest-level interactive unit of the calendar block rendering pipeline

### Supporting Components
- **`calendar-day-header.tsx`** — Interactive day header for calendar views
  - Displays day label and date, participates in drag-and-drop for task deadlines
  - Highlights "today" and drag-over states
  - Acts as drop target for tasks to set deadlines
- **`current-time-line.tsx`** — Visual indicator for the current time within the calendar grid
  - Renders horizontal line and dot positioned at current minute
  - Updates automatically once per minute
  - Constrained to today's column in week view
- **`deadline-tray.tsx`** — Week-level deadline and all-day event tray rendered above the time grid
  - Displays deadline tasks, goal-level deadlines, milestone deadlines, external all-day events
  - Supports completion toggling, unassigning, hover signaling, dragging into time grid
- **`calendar-context-menu.tsx`** — Context menu primitives for calendar interactions
  - BlockContextMenu for existing calendar blocks
  - EmptySpaceContextMenu for empty grid regions
  - Exposes copy, duplicate, paste, create, delete, toggle-complete actions
- **`keyboard-toast.tsx`** — Lightweight toast for keyboard shortcut feedback
  - Displays transient message near bottom center of screen
  - Acknowledges successful keyboard-driven actions

## Interaction Hooks

### Unified Controller
- **`use-calendar-interactions.ts`** — Unified interaction controller for the calendar
  - Bundles event state, clipboard integration, keyboard shortcuts, and all interaction handlers
  - Owns in-memory CalendarEvent state
  - Implements handlers for resize, drag, duplicate, create, delete, paste, status changes
  - Provides hover state for keyboard-driven actions

### Specialized Hooks
- **`use-calendar-clipboard.ts`** — In-memory clipboard for calendar events
  - Enables copy and paste of CalendarEvent objects within the calendar
  - Stores copied event, produces new event instance on paste
  - Normalizes status when pasting
- **`use-calendar-keyboard.ts`** — Keyboard shortcut handler for calendar interactions
  - Listens globally for key presses when hovering within calendar grid, blocks, or day headers
  - Gates shortcuts based on hover context
  - Emits lightweight toast feedback
- **`use-deadline-keyboard.ts`** — Keyboard shortcut handler for deadline pills in the calendar deadline tray
  - Enables quick actions on hovered deadlines
  - Invokes toggle-complete and unassign callbacks
- **`use-external-drag.ts`** — External drag-and-drop controller for calendar time columns
  - Supports dragging items from outside the calendar into day columns
  - Provides live preview, gap-fitting, and block hit-detection
  - Applies adaptive drop algorithm or overlap placement
- **`use-scroll-to-current-time.ts`** — Auto-scroll controller for positioning the calendar around "now"
  - Scrolls time grid so current time is visible and slightly above center
  - Computes current minutes and converts to pixel offset using zoom-derived grid height

## Utilities & Types

### Constants & Configuration
- **`calendar-constants.ts`** — Centralized constants, simple types, and lightweight helpers
  - Day/hour labels and time snapping configuration
  - Layout constants for block spacing, nesting, and overlap handling
  - Modern zoom-based sizing utilities (legacy density-based sizing deprecated)
  - Status and style conversion helpers

### Core Utilities
- **`calendar-utils.ts`** — Core utility functions for calendar behavior and layout
  - Date and week helpers
  - Formatting utilities for hours, dates, and times
  - Overlap layout calculation for concurrent events
  - Adaptive drop positioning logic for drag-and-drop
  - Shared animation presets for block transitions

### Segments & Overnight Handling
- **`calendar-segments.ts`** — Helpers and types for splitting calendar events into per-day renderable segments
  - Handles overnight events by producing separate "start" and "end" segments
  - Detects overnight events, clamps event durations to safe bounds
  - Computes event end day and end minutes
  - Defines segment and overlap layout types

### Types & Props
- **`calendar-types.ts`** — Shared type definitions and prop contracts for the calendar system
  - Centralizes cross-cutting interfaces used by Calendar, DayView, WeekView, TimeColumn
  - Defines event interaction callback interfaces
  - Defines external drag-and-drop integration contracts
  - Defines public props for major calendar components
- **`calendar-props.ts`** — (Referenced in index.ts; likely contains prop type definitions)

### Public API
- **`index.ts`** — Public API surface for the Calendar component family
  - Re-exports all primary components, sub-components, hooks, types, constants, and utilities
  - Single import entry point for consumers

## Examples & Development

- **`calendar-example.tsx`** — Interactive playground and demo harness for the Calendar component
  - Renders fully wired calendar instance with sample data
  - Exposes runtime controls (knobs) for experimenting with view mode, density, visibility flags, block styling
  - Intended for internal development and visual testing only

## Design Principles

- **Separation of concerns:** Visual components stay dumb; interaction mechanics live in hooks
- **Composability:** Shared TimeColumn used by both DayView and WeekView for consistency
- **Zoom-based sizing:** Preferred over density-based sizing (legacy support maintained)
- **Overnight support:** Events can span day boundaries with proper segment handling
- **Adaptive drop:** Default drag behavior fits blocks into gaps; Shift bypasses for overlap
- **Keyboard-first:** Extensive keyboard shortcut support with hover context gating
- **Pure utilities:** All helpers are pure and framework-agnostic

## Key Features

- **Day and Week Views:** Switchable calendar views with consistent rendering
- **Drag & Drop:** Move, duplicate, resize blocks; drag-to-create from empty grid
- **External Integration:** Drag items from backlog/lists into calendar
- **Overlap Layout:** Automatic column-based layout for concurrent events
- **Deadline Tray:** Week-level display of deadlines and all-day events
- **Current Time Indicator:** Visual line showing current time position
- **Keyboard Shortcuts:** Comprehensive keyboard-driven interactions
- **Context Menus:** Right-click actions for blocks and empty space
- **Clipboard:** In-memory copy/paste for calendar events

**Total Files:** 22 (7 core components, 6 interaction hooks, 5 utilities/types, 2 examples, 2 public API files)
