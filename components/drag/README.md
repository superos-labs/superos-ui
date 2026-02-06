# Drag and Drop System

**Purpose:** Global drag-and-drop context and hooks for SuperOS, providing a generic, domain-agnostic drag-and-drop system that tracks drag mechanics and coordinates between drag sources and drop targets.

## Core Components

### Drag Context
- **`drag-context.tsx`** — Global drag-and-drop context for SuperOS
  - Centralizes pointer-driven drag state
  - Exposes imperative API for initiating, tracking, previewing, and cancelling drag interactions
  - Intentionally generic and domain-agnostic (does not understand calendars, blocks, or tasks)
  - Only tracks mechanics of drag session and currently active DragItem
  - Stores currently dragged item and pointer position
  - Enforces movement threshold before activating a drag
  - Tracks preview drop position provided by drop zones
  - Tracks overlap mode (Shift key) during drag
  - Exposes startDrag, endDrag, cancelDrag, and setPreviewPosition APIs
  - Uses "pending drag" phase before threshold is exceeded
  - Listens to global pointer and keyboard events while mounted
  - Shift key enables overlap placement instead of gap-filling

### Drag Ghost Component
- **`drag-ghost.tsx`** — Cursor-following visual preview for active drag operations
  - Renders lightweight Block-based "ghost" that tracks pointer position
  - Shown while item is being dragged and no snapped preview is active
  - Hidden when pointer enters valid drop zone (target renders its own preview)
  - Subscribes to drag state from DragContext
  - Positions floating preview at current pointer coordinates
  - Derives title, color, and default duration from DragItem
  - Uses pointer-events-none to avoid intercepting input
  - Slightly offset from cursor for visual clarity
  - High z-index to ensure visibility above UI chrome

### Draggable Hook
- **`use-draggable.ts`** — Hook for making an element act as a drag source
  - Binds pointer-down behavior to global DragContext
  - Exposes ergonomic props that can be spread onto any interactive element
  - Intentionally thin; does not manage drag state itself
  - Only delegates initiation to DragProvider when available
  - Registers pointer down to start a drag
  - Respects disabled state
  - Exposes cursor and interaction styles
  - Indicates whether this item is currently being dragged
  - Uses optional drag context to allow graceful usage outside provider
  - Touch-action disabled to prevent native scrolling during drag
  - Compares item identity to determine active dragging state

### Drop Zone Hook
- **`use-drop-zone.ts`** — Hook for registering a time-based drop target
  - Translates pointer movement into snapped time positions
  - Reports preview placement back to global DragContext
  - Designed primarily for calendar day columns, but generic to any vertical time grid
  - Attaches pointer handlers for drag-over, leave, and drop
  - Converts Y pointer position into start minutes
  - Snaps minutes to configurable interval
  - Publishes preview positions to DragContext
  - Invokes onDrop with resolved item and start time
  - Uses optional drag context for graceful usage
  - Clamps minutes to valid 24h range
  - Clears preview when pointer leaves the zone

### Public API
- **`index.ts`** — Public entry point for the SuperOS drag-and-drop system
  - Aggregates and re-exports drag context, hooks, components, and types
  - Provides stable, ergonomic API boundary for consumers
  - Prefer importing from this file instead of deep paths

## Key Features

- **Global Context:** Centralized drag state accessible throughout the app
- **Movement Threshold:** Prevents accidental drags with configurable threshold
- **Preview System:** Cursor-following ghost and drop zone previews
- **Overlap Mode:** Shift key enables overlap placement instead of gap-filling
- **Time-Based Drops:** Snapped time positions for calendar grids
- **Optional Usage:** Hooks work gracefully outside provider context
- **Generic Design:** Domain-agnostic; works with any DragItem type
- **Pointer Events:** Global pointer and keyboard event handling

## Design Principles

- **Separation of Concerns:** Context handles mechanics, hooks handle element binding
- **Domain-Agnostic:** Does not understand specific domain concepts (calendars, tasks, etc.)
- **Threshold-Based:** Movement threshold prevents accidental drags
- **Preview Coordination:** Ghost and drop zones coordinate preview display
- **Optional Context:** Hooks degrade gracefully when provider not present
- **Imperative API:** Context exposes imperative methods for drag control
- **Generic Types:** Works with any DragItem type from drag-types

## Usage Pattern

1. **Setup Provider:** Wrap application with `DragProvider`
2. **Make Draggable:** Use `useDraggable` hook on source elements
3. **Create Drop Zone:** Use `useDropZone` hook on target elements
4. **Render Ghost:** Include `DragGhost` component for cursor preview
5. **Handle Drops:** Implement onDrop handlers in drop zones
6. **Track State:** Use `useDragContext` to access drag state

## Integration Points

- **Calendar:** Drop zones for time-based scheduling
- **Backlog:** Draggable items from goal/task lists
- **Block System:** Drag ghost uses Block component for preview
- **Drag Types:** Uses DragItem and DropPosition types from lib/drag-types

**Total Files:** 5 (1 context provider, 1 visual component, 2 hooks, 1 public API)
