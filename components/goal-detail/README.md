# Goal Detail Component System

**Purpose:** Comprehensive goal detail view for viewing and editing a single goal, including core identity, notes, tasks, subtasks, milestones, and goal-level settings.

## Core Components

### Main Goal Detail View
- **`goal-detail.tsx`** — Primary Goal Detail view
  - Provides comprehensive, vertically-scrolled surface for viewing and editing a single goal
  - Includes core identity (icon, color, title, life area, deadline), notes, tasks and subtasks, optional milestone-based structure, and goal-level sync and advanced options
  - Acts as composition root for multiple goal-detail subcomponents
  - Composes header, notes, tasks, and milestone sections
  - Switches between milestone and flat-task modes
  - Wires user interactions to callback props
  - Hosts goal-level actions (back, delete, sync settings, toggle milestones)
  - Manages local UI state for sync settings dialog
  - Scrollable content area with fixed outer shell
  - Milestones enabled when explicitly flagged or present
  - Uses collapsible sections only when milestones are disabled
  - Subcomponents remain mostly presentational

### Header Section
- **`goal-detail-header.tsx`** — Header section for the Goal Detail view
  - Presents and optionally allows editing of goal's core identity: icon, color, title, life area, and target date
  - Designed to work in both read-only and editable modes depending on which callbacks are provided
  - Renders goal icon, title, and metadata pills
  - Provides inline editing for title
  - Provides dropdown pickers for icon, color, and life area
  - Provides granular date picker for target date (Day/Month/Quarter)
  - Surfaces "add life area" affordance when supported
  - Title editing is optimistic and commits on blur or Enter
  - Icon and color edited together via single dropdown
  - Subset of distinct colors used for faster scanning
  - Pills provide compact, glanceable metadata
  - Start and target dates use GranularDatePicker with Day/Month/Quarter tabs

### Tasks Section
- **`goal-detail-tasks.tsx`** — Tasks list section for the Goal Detail view (without milestones)
  - Renders flat list of tasks associated with a goal
  - Supports toggling completion, expanding tasks to reveal subtasks, editing task content, creating and deleting tasks and subtasks
  - Used when milestone mode is disabled for a goal
  - Sorts tasks (incomplete first, completed last)
  - Renders TaskRow instances styled for goal detail context
  - Provides inline task creation
  - Manages local expansion state for tasks (accordion)
  - Reuses generic TaskRow with goal-specific context
  - Keyboard-first inline creator
  - Dense vertical spacing for scannability

### Milestones Section
- **`goal-detail-milestones.tsx`** — Milestones and tasks section for the Goal Detail view
  - Renders vertical list of milestones, each containing associated tasks
  - Sorts milestones by deadline (earliest first; milestones without deadlines appear at end)
  - Supports creating, editing, completing, and deleting milestones
  - Supports creating, editing, completing, and deleting tasks within milestones
  - Supports managing subtasks inside individual tasks
  - Supports period-bound deadlines (day / month / quarter) via GranularDatePicker
  - Designed to express medium-to-large goals as phased progression
  - Groups tasks by milestone
  - Renders milestone headers with completion, label, and optional deadline
  - Renders TaskRow items within each milestone
  - Provides inline creators for milestones and tasks
  - Manages local expansion state for tasks (accordion)
  - First incomplete milestone (in sorted order) treated as "current" phase
  - Milestones default to expanded when incomplete
  - Deadline display uses granularity-aware formatting (e.g., "Mar 2026", "Q2 2026")
  - Inline creators are keyboard-first
  - Compact typography favors dense, scannable lists

### Stats Section
- **`goal-detail-stats.tsx`** — Lightweight progress visualization for a goal
  - Displays completed hours, planned hours, and simple progress bar derived from ratio between them
  - Used inside Goal Detail view to provide quick feedback on momentum
  - Computes progress percentage from provided stats
  - Renders progress bar and formatted hour values
  - Caps progress at 100%
  - Minimal visual treatment to avoid competing with core content

### Example/Playground
- **`goal-detail-example.tsx`** — Interactive playground demo for the GoalDetail component
  - Provides local, stateful harness that simulates goal selection, task creation/deletion/completion, optional milestone workflows, and title/life area/notes editing
  - Used for design iteration, QA, and visual regression during development
  - Holds mock goal state for selected goal
  - Wires GoalDetail callbacks to local state mutations
  - Exposes knobs to switch between fixture goals
  - Uses shell fixtures for realistic sample data
  - Milestones can be toggled on/off to exercise both modes

### Public API
- **`index.ts`** — Public export surface for Goal Detail components
  - Centralizes all goal-detail related UI primitives
  - Single module boundary for goal-detail imports
  - Re-exports GoalDetail composition root, goal-detail subcomponents, and associated prop types
  - Keeps goal-detail as cohesive feature slice

## Key Features

- **Comprehensive Editing:** Edit goal identity, notes, tasks, subtasks, and milestones
- **Dual Modes:** Milestone-based structure or flat task list
- **Inline Editing:** Quick inline editing for title, tasks, and subtasks
- **Progress Visualization:** Shows completed vs planned hours with progress bar
- **Task Management:** Create, edit, complete, delete tasks and subtasks
- **Milestone Support:** Phased progression for medium-to-large goals
- **Sync Settings:** Goal-level calendar sync configuration
- **Keyboard-First:** Inline creators favor keyboard-driven flows
- **Accordion Expansion:** Expandable tasks and collapsible sections
- **Visual Organization:** Clear hierarchy with milestones and tasks

## Design Principles

- **Composition:** Main component composes subcomponents but remains presentational
- **Dual Modes:** Seamlessly switches between milestone and flat-task modes
- **Progressive Disclosure:** Accordion pattern for task expansion
- **Keyboard-First:** Inline creators and editors favor keyboard interactions
- **Visual Hierarchy:** Clear distinction between milestones, tasks, and subtasks
- **Compact Layout:** Dense vertical spacing for scannability
- **Optimistic Updates:** Title editing commits on blur or Enter
- **Minimal Stats:** Progress visualization doesn't compete with core content

## Usage Patterns

1. **View Goal:** GoalDetail renders comprehensive goal view with all sections
2. **Edit Identity:** Click header to edit icon, color, title, life area, and target date
3. **Manage Tasks:** Create, edit, complete, and delete tasks inline
4. **Milestone Mode:** When enabled, tasks organized by milestone phases
5. **Flat Mode:** When milestones disabled, flat task list with sorting
6. **Track Progress:** View stats showing completed vs planned hours
7. **Configure Sync:** Access goal-level sync settings and advanced options

## Integration Points

- **Backlog:** GoalDetail can be accessed from backlog goal rows
- **Task Management:** Uses TaskRow components from backlog/goals
- **Unified Schedule:** Integrates with unified schedule domain types
- **Calendar Sync:** Goal-level sync settings integration
- **Life Areas:** Uses life area types for categorization
- **GranularDatePicker:** Uses granular date picker for target date and milestone deadline selection (Day/Month/Quarter)

**Total Files:** 7 (5 component files, 1 example file, 1 public API)
