# Backlog Goals Components

**Purpose:** UI components for managing Goals and Tasks in the backlog, including creation, editing, display, and onboarding flows.

## Core Components

### Main Section
- **`goal-section.tsx`** — Section component for rendering a list of Goals inside the backlog
  - Provides section header (title + optional description)
  - List of GoalItemRow entries
  - Optional actions for creating goals and browsing inspiration
  - Special behavior when used inside onboarding
  - Coordinates layout and high-level flow but does not own domain state
  - Renders goals and passes through task-related callbacks
  - Highlights selected goal
  - Surfaces creation and inspiration entry points
  - Adapts copy and controls for onboarding mode
  - Inline task creation hidden during onboarding
  - Continue button appears only after at least one goal exists

### Goal Row Components
- **`goal-item-row.tsx`** — Row component for rendering a Goal and its associated Tasks inside the backlog
  - Supports displaying goal metadata (icon, label, current milestone)
  - Optional navigation to goal detail
  - Optional drag-and-drop of the goal
  - Inline rendering and editing of tasks
  - Acts as composition layer coordinating multiple child primitives
  - Renders goal row and optional task list
  - Manages which task row is expanded
  - Bridges task and subtask actions to parent callbacks
  - Integrates with drag system when enabled
  - When milestones enabled, only tasks for current milestone are shown
  - Tasks can be visually prioritized by weekly focus (This Week)
  - Chevron navigation isolated from drag interactions

- **`added-goal-row.tsx`** — Row component for displaying and editing an already-added Goal
  - Used in backlog and onboarding goal lists
  - Renders either compact, clickable summary row or InlineGoalEditor when editing
  - Owns no persistence logic; bridges user actions to parent handlers
  - Displays goal label, icon, color, life area, and optional deadline
  - Toggles between display and inline edit modes
  - Forwards save, cancel, and delete events
  - Clicking row enters edit mode
  - Deadline formatting defensive against invalid dates

- **`goal-suggestion-row.tsx`** — Row component for displaying and adding an onboarding goal suggestion
  - Used inside onboarding flows to quickly seed initial goals
  - Can render collapsed, hoverable suggestion row or InlineGoalEditor when editing
  - Displays suggestion label and icon
  - Toggles into inline edit mode
  - Bridges save and cancel actions to parent
  - Hover reveals add affordance
  - Icon color transitions indicate interactivity

### Task Components
- **`task-row.tsx`** — Task row component for displaying and interacting with a single task within a goal
  - Supports completion toggle, inline label editing, drag and drop to calendar
  - Optional scheduled time or deadline pills
  - Expandable detail area with description and subtasks
  - Renders compact, interactive representation of a task
  - Manages local UI state (hover, inline editing, expansion)
  - Bridges task-level interactions upward via callbacks
  - Expanded state controlled externally; component mirrors it
  - Dragging disabled for completed tasks
  - Keyboard shortcuts: Enter (confirm edit), Escape (cancel/collapse), Delete/Backspace (delete task)

### Creation & Editing Components
- **`inline-goal-editor.tsx`** — Inline editor for creating and editing Goals
  - Used by onboarding flows, inspiration pickers, and backlog goal rows
  - Supports editing core goal metadata: label, icon, color, life area, optional target date
  - Manages only form state; delegates persistence upward
  - Renders editable goal fields
  - Provides icon, color, life area, and date pickers
  - Handles confirm, cancel, and optional delete actions
  - Auto-focuses and selects label input on mount
  - Uses constrained color palette for visual consistency

- **`inline-creators.tsx`** — Inline creation primitives for Tasks and Goals inside the backlog
  - InlineTaskCreator: fast, keyboard-driven task entry
  - InlineGoalCreator: lightweight goal creation with icon, color, and life area
  - Manage only ephemeral form state; delegate persistence upward via callbacks
  - Collect minimal input required to create tasks and goals
  - Support rapid entry via keyboard shortcuts
  - Provide compact, inline UI suitable for dense lists
  - Task creator keeps focus after save to enable rapid entry
  - Goal creator auto-focuses name input on mount

### Onboarding Components
- **`onboarding-goals-card.tsx`** — Card-based surface for setting initial goals during onboarding
  - Combines custom goal creation, editing/deleting added goals, and adding goals from predefined suggestions
  - Self-contained orchestration component coordinating multiple goal-related primitives
  - Renders onboarding header, content, and footer
  - Tracks which row/editor is currently active
  - Bridges add, update, and delete actions to parent
  - Enables Continue only after at least one goal exists
  - Suggestions filtered once added
  - Custom goal entry placed at top for visibility

- **`goal-inspiration-gallery.tsx`** — Gallery-style surface for browsing and adding inspirational goals
  - Displays goals grouped by life area
  - Allows users to quickly seed backlog with pre-defined ideas aligned with personal priorities
  - Renders categories of inspiration goals
  - Visually indicates which goals have already been added
  - Allows adding goals with single action
  - Bridges selections to parent via NewGoalData
  - Tracks locally added goals to provide immediate feedback
  - Merges local and external added IDs for consistent UI

### Types & Utilities
- **`goal-types.ts`** — Shared type definitions for backlog Goals
  - Defines UI-facing GoalItem shape used by backlog components
  - Re-exports goal creation and inspiration types from lib/unified-schedule
  - Re-exports shared types (LifeArea, GoalIconOption) from lib/types
  - Re-exports task and milestone types used by goals
  - plannedHours and completedHours deprecated in favor of derived stats
  - GoalItem remains thin and composable

- **`goal-utils.ts`** — Formatting helpers for displaying task schedule and deadline information
  - Converts raw schedule/deadline data into short, human-readable strings
  - Suitable for dense list UIs
  - Formats scheduled start times with optional day prefix
  - Formats deadline dates with relative labels (Today, Tomorrow, weekday)
  - Assumes dayIndex 0 = Monday for scheduled tasks
  - Uses local time for deadline comparisons

### Public API
- **`index.ts`** — Public export surface for backlog Goals components, types, and utilities
  - Single entry point for importing goal-related UI primitives, onboarding components, and supporting helpers
  - Re-exports goal section and row components, inline editors and creators, onboarding goal components, and goal-related types and utilities

## Key Features

- **Goal Management:** Create, edit, delete, and display goals with metadata
- **Task Management:** Inline task creation, editing, completion, and drag-and-drop
- **Onboarding Flow:** Guided goal setup with suggestions and custom creation
- **Inspiration Gallery:** Browse and add pre-defined inspirational goals by life area
- **Drag & Drop:** Goals and tasks can be dragged to calendar or other containers
- **Inline Editing:** Quick inline editing for goals and tasks
- **Milestone Support:** Filter tasks by current milestone when enabled
- **Weekly Focus:** Visual prioritization of tasks marked for "This Week"
- **Schedule Display:** Shows scheduled times and deadlines in compact format
- **Subtask Support:** Expandable task rows with subtask management

## Design Principles

- **Composition:** Components coordinate child primitives but don't own domain state
- **Presentational:** Components manage UI state but delegate persistence via callbacks
- **Keyboard-Driven:** Rapid entry and editing via keyboard shortcuts
- **Progressive Disclosure:** Expandable rows reveal details on demand
- **Visual Hierarchy:** Clear distinction between goals, tasks, and subtasks
- **Onboarding-Aware:** Components adapt behavior for onboarding vs. standard modes
- **Drag Integration:** Seamless drag-and-drop integration with calendar system

## Usage Patterns

1. **Standard Backlog:** GoalSection renders GoalItemRow entries with inline task creation
2. **Onboarding:** OnboardingGoalsCard combines suggestions, custom creation, and editing
3. **Inspiration:** GoalInspirationGallery allows browsing and adding inspirational goals
4. **Editing:** Click goal/task row to enter inline edit mode
5. **Task Management:** Expand task rows to see details and manage subtasks
6. **Drag Scheduling:** Drag goals or tasks to calendar to schedule them

## Integration Points

- **Drag System:** Uses useDraggable and DragProvider for drag-and-drop
- **Calendar:** Tasks can be dragged to calendar for scheduling
- **Unified Schedule:** Integrates with unified schedule domain types
- **Life Areas:** Uses life area types for goal categorization
- **Date Formatting:** Uses date-fns for deadline formatting

**Total Files:** 12 (10 component files, 1 types file, 1 utilities file, 1 public API)
