# Block Component System

**Purpose:** Visual calendar block components and interaction system for rendering and manipulating time blocks in the calendar grid.

## Core Components

### Visual Primitive
- **`block.tsx`** — Visual calendar block component
  - Renders a single time block with color theming, duration-based height, compact/regular layouts
  - Supports essential, goal, task, and external blocks
  - Status styling (planned/completed), overnight segment handling, drag & drop visual states
  - Presentation-only; does not own scheduling logic or persistence

### Sidebar System
- **`block-sidebar.tsx`** — Primary sidebar surface for viewing and editing a single calendar block
  - Composes all block-related sidebar sections (header, date/time, focus mode, goal tasks, notes, external sync)
  - Pure presentational orchestrator; all mutations flow outward via callbacks
  - Behavior varies by blockType (goal | task | essential | external)
- **`block-sidebar-example.tsx`** — Interactive playground example for BlockSidebar component
  - Wires BlockSidebar into Knobs playground for rapid iteration
  - Uses local React state only (not production data flow)
- **`use-block-sidebar-handlers.ts`** — Orchestration hook that binds a selected calendar event to BlockSidebar
  - Adapts CalendarEvent into sidebar display data
  - Computes external calendar sync state
  - Maps unified-schedule mutations to sidebar callbacks
  - Centralizes all write-side logic for block sidebar interactions

### Interaction Wrappers
- **`draggable-block-wrapper.tsx`** — Drag interaction wrapper for calendar blocks
  - Adds pointer-based dragging behavior (vertical/horizontal movement)
  - Supports snapping, Option/Alt-drag to duplicate, ghost preview rendering
  - Owns gesture handling and visual drag feedback; emits scheduling decisions via callbacks
- **`resizable-block-wrapper.tsx`** — Wrapper that adds vertical resize behavior to calendar blocks
  - Renders invisible top/bottom resize handles
  - Translates pointer movement into time deltas
  - Emits updated start + duration values via callbacks

## Interaction Hooks

### Drag & Drop
- **`use-block-drag.ts`** — Low-level hook that powers drag-and-drop for calendar blocks
  - Distinguishes click vs drag via movement threshold
  - Converts pointer movement into (dayIndex, startMinutes)
  - Applies snapping, bounds, and fine-grain modifiers (Option/Alt → duplicate, Shift → 1-minute snapping)
  - Exposes visual drag offset and projected preview position

### Resizing
- **`use-block-resize.ts`** — Low-level hook that powers vertical resizing of calendar blocks
  - Handles top-edge and bottom-edge resizing
  - Converts pointer movement into startMinutes and durationMinutes
  - Applies snapping, bounds, and fine-grain modifiers (Shift → 1-minute precision)

### Grid Creation
- **`use-grid-drag-create.ts`** — Interaction hook for creating new blocks by dragging directly on the calendar grid
  - Tracks pointer drag from an empty grid cell
  - Computes start time and duration from drag distance
  - Provides live preview dimensions during drag
  - Emits final creation intent on pointer release
  - Supports overnight blocks (duration may exceed 1440m)

## Shared Utilities & Types

### Types
- **`block-types.ts`** — Centralized type definitions for calendar blocks and block-related UI
  - Block structural concepts (duration, overnight segments)
  - Block sidebar support types
  - Ephemeral block-scoped subtask models
  - Goal selector option shapes
  - Re-exports canonical types from @/lib/types

### Styling
- **`block-colors.ts`** — Centralized color token mapping for calendar blocks
  - BlockColor type (alias of GoalColor)
  - Muted styling for essential blocks
  - Comprehensive map of color → Tailwind class tokens (normal, outlined, completed states)
  - Single source of truth for block color styling

### Public API
- **`index.ts`** — Public API surface for the Block component family
  - Barrel file re-exports all primitives, wrappers, hooks, and sidebar components
  - Defines stable public contract

## Subsystems

### Sidebar Components
See [`sidebar/README.md`](./sidebar/README.md) for detailed documentation of sidebar sub-components.

## Design Principles

- **Separation of concerns:** Visual components stay dumb; interaction mechanics live in hooks
- **Presentational:** Components forward user intent via callbacks; they do not own persistence or domain state
- **Composability:** Wrappers compose behavior without owning layout
- **Deterministic:** Drag/resize semantics are side-effect free; visual behavior is derived from returned state
- **Barrel exports:** Define stable public contract; internal file structure can change without breaking consumers

## Mental Models

- **Block:** "A colored rectangle that represents intentional time"
- **BlockSidebar:** "Inspector panel for a single time block"
- **DraggableBlockWrapper:** "A transparent drag engine around a block"
- **ResizableBlockWrapper:** Visual components stay dumb; interaction mechanics live in hooks
- **useBlockDrag/useBlockResize:** Pointer math lives in hooks, not components
- **useGridDragCreate:** Creation counterpart to drag/resize hooks
- **block-colors:** "A design token dictionary for block visuals"
- **block-types:** "Shared vocabulary for everything that describes a block"

**Total Files:** 12 (4 core components, 3 interaction wrappers, 4 hooks, 3 utilities/types, 1 sidebar subfolder)
