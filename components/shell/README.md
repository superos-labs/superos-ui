# Shell Component System

**Purpose:** Core shell composition root that orchestrates the entire authenticated application UI, including layouts, toolbars, sidebars, modals, and cross-feature interactions.

## Core Components

### Main Composition Root
- **`shell-content.tsx`** — Core shell composition root for SuperOS
  - Orchestrates entire authenticated application UI
  - Wires domain props into shell-level orchestration hooks
  - Selects appropriate layout (desktop vs mobile)
  - Renders top-level toolbars, layouts, modals, toasts, and overlays
  - Hosts global modals (keyboard shortcuts, life area modals) and overlays (backlog overlay, drag ghost, toasts)

### Layout Components
- **`shell-desktop-layout.tsx`** — Desktop-specific shell layout composition
  - Implements three-panel desktop experience: Left (Backlog/Planning/Blueprint), Center (Calendar/Goal Detail/Gallery), Right (Block details/Analytics/Integrations)
  - Handles special full-screen states (onboarding, centered goal setup)
  - Routes domain data and handlers to child feature components
  - Attaches floating feedback and zoom controls to calendar view
- **`shell-mobile-layout.tsx`** — Mobile-specific shell layout composition
  - Optimized for mobile and small-tablet layouts
  - Uses bottom sheets and full-screen overlays
  - Supports week view for tablet landscape
  - Manages backlog overlay and essentials visibility

### Toolbars
- **`shell-toolbars.tsx`** — Collection of toolbar variants used by the Shell
  - Mobile toolbar (compact navigation and controls)
  - Desktop toolbar (full-featured navigation and actions)
  - Blueprint edit toolbar
  - Onboarding blueprint toolbar
  - Each adapts controls based on active shell mode and screen size
- **`mobile-toolbar.tsx`** — Primary toolbar for mobile and small-tablet shell layouts
  - Provides compact navigation and lightweight controls for day/week planning
  - Opens backlog overlay, navigates between days/weeks, displays current date/week range
  - Surfaces active focus session and minimal settings

### Supporting Components
- **`shell-right-panel.tsx`** — Right sidebar content renderer for desktop shell layout
  - Conditionally renders Integrations sidebar, Block details sidebar, or Analytics
  - Acts as thin composition layer between shell wiring state and sidebar feature components
  - Bridges focus session controls into block sidebar
- **`feedback-button.tsx`** — Floating shell control for calendar zoom and help resources
  - Displays current calendar zoom level with zoom in/out handlers
  - Surfaces links to feedback form, onboarding video, and Slack community
  - Renders as compact cluster in bottom-right of shell

## Core Orchestration Hooks

### State & Wiring
- **`use-shell-state.ts`** — Core shell state composition hook
  - Aggregates and wires together all domain-level hooks (schedule, essentials, focus, blueprint, weekly planning, preferences, calendar integrations)
  - Exposes single stable object matching ShellContentProps
  - Maintains cross-cutting selection state (selected event/goal)
  - Derives week dates and handles week navigation
  - Merges external calendar events with internal events
- **`use-shell-wiring.ts`** — Shell interaction wiring and cross-feature orchestration hook
  - Consumes ShellContentProps and composes higher-level behavior
  - Layers feature-specific hooks (layout, focus, blueprint, planning, undo, keyboard, drag & drop, sidebars, analytics)
  - Bridges domain data to interaction-level hooks
  - Composes keyboard shortcuts, undo system, and toast feedback
  - Provides drag & drop previews and drop handlers
  - Exposes unified wiring surface consumed by layout components
  - Contains inlined helper hooks (useShellFocus, useToastAggregator, useMobileNavigation) to reduce file count
- **`use-shell-layout.ts`** — Central shell layout and mode orchestration hook
  - Owns UI visibility flags, high-level modes (planning, onboarding, blueprint edit)
  - Manages selection state and right-sidebar routing logic
  - Acts as shell's layout state machine
  - Orchestrates onboarding steps and transitions
  - Controls planning mode and blueprint edit mode

## Domain-Specific Handler Hooks

### Goals & Life Areas
- **`use-goal-handlers.ts`** — Shell hook for goal-level creation, selection, and deletion interactions
  - Creates goals from backlog and onboarding
  - Creates and immediately selects new goals
  - Deletes currently selected goal
  - Navigates to goal detail when clicking goal deadlines
  - Adapts goals for onboarding goal cards
- **`use-life-areas.ts`** — Shell hook for managing Life Areas
  - Combines built-in default life areas with user-created custom life areas
  - Provides merged list and simple CRUD helpers
  - Prevents duplicate labels (case-insensitive)

### Essentials & Blueprints
- **`use-essential-handlers.ts`** — Shell hook for Essential configuration and scheduling
  - Bridges between essential templates, enabled/disabled state, and calendar import
  - Initializes essential templates and enabled state
  - Saves slot schedules for essentials
  - Detects when a week is missing essentials and imports enabled essentials
  - Creates and deletes essentials
- **`use-blueprint-handlers.ts`** — Shell hook for blueprint-related interaction logic
  - Coordinates entering/exiting blueprint edit mode
  - Converts between calendar events and blueprint blocks
  - Saves blueprint changes and propagates them to future weeks
  - Manages essentials within blueprint context
  - Handles onboarding blueprint creation

### Planning Integration
- **`use-planning-integration.ts`** — Shell hook bridging weekly planning flow with shell orchestration
  - Coordinates planning flow state machine
  - Handles weekly plan persistence
  - Optional blueprint creation from planned week
  - Essentials import during planning
  - Budget sidebar auto-opening
  - Exposes helpers for duplicating last week from blueprint

## Utility Hooks

### Drag & Drop
- **`use-external-drag-preview.ts`** — Shell hook adapting DragProvider state into calendar-compatible external drag previews
  - Enables dragging items from outside calendar (backlog, lists, etc.)
  - Previews them as blocks over calendar grid
  - Translates drag state into drop positions
  - Invokes shell-level drop handler with normalized data

### Feedback & Undo
- **`use-undoable-handlers.ts`** — Undo-aware action wrapper for shell-level mutations
  - Decorates task and calendar handlers with undo recording logic
  - Captures minimal pre-mutation state required to restore changes
  - Batches related operations into single undo commands
  - Supports undo for task completion, deletion, block operations, and day completion

## Types

- **`shell-types.ts`** — Type definitions for the Shell feature
  - Centralizes all public and internal TypeScript contracts
  - Defines full prop contract for ShellContent
  - Defines options and return types for shell state hooks
  - Defines shell layout state shape
  - Defines integration boundary between domain state and shell-level UI composition

## Public API

- **`index.ts`** — Public API surface for the Shell feature
  - Centralized export hub for shell composition components, layout variants, toolbars, hooks, and types
  - Defines intended integration boundary for consumers
  - Prefers explicit named exports over wildcard exports

## Design Principles

- **Composition over inheritance:** Shell orchestrates rather than owns domain logic
- **Separation of concerns:** State hooks vs wiring hooks vs layout hooks
- **Desktop-first:** Mobile layouts use overlays and fallbacks
- **Event-forwarding:** All domain mutations flow through props
- **Centralized orchestration:** Complex cross-feature glue centralized in wiring hook
- **Visual state is local:** Ephemeral UI state stays in components
- **Side effects in hooks:** All side effects centralized inside hooks

## Key Features

- **Multi-panel layouts:** Desktop three-panel, mobile overlay-based
- **Responsive design:** Adapts between desktop and mobile layouts
- **Onboarding flow:** Guided setup for new users
- **Blueprint editing:** Template-based week planning
- **Planning mode:** Weekly planning flow with budget tracking
- **Focus sessions:** Timer integration with calendar blocks
- **Undo system:** Comprehensive undo support for user actions
- **Keyboard shortcuts:** Extensive keyboard-driven interactions
- **Drag & drop:** External drag support from backlog/lists
- **Toast feedback:** Aggregated toast messages from multiple sources
- **Life areas:** Customizable goal categorization

**Total Files:** 20 (5 core components, 3 orchestration hooks, 4 domain handler hooks, 2 utility hooks, 2 types/API files, 4 supporting components)
