# Focus Mode Components

**Purpose:** UI components for focus mode functionality, providing timer controls, status indicators, and a distraction-minimized sidebar environment for focused work sessions.

## Core Components

### Focus Timer
- **`focus-timer.tsx`** — Focus timer primitives used inside block sidebars and focus surfaces
  - Provides compact elapsed-time display with colored running indicator
  - Pause, resume, and stop controls for active focus session
  - Standalone button to initiate focus on a block
  - Purely presentational; delegates all behavior upward
  - Renders elapsed time in readable HH:MM:SS format
  - Visually reflects running vs paused state
  - Exposes pause, resume, stop, and start interactions
  - Uses block color system for indicator consistency
  - Compact layout suitable for sidebars and inline panels
  - Icons communicate state to reduce textual noise

### Focus Indicator
- **`focus-indicator.tsx`** — Compact focus status indicator shown in application shell toolbar
  - Displays currently focused block, its color, elapsed focus time
  - Pause/resume control when user is viewing a different block
  - Acts as lightweight gateway back to active focus context
  - Renders focused block title, color dot, and elapsed time
  - Visually indicates running vs paused focus state
  - Exposes pause and resume controls
  - Notifies parent when indicator is clicked (navigate to focused block)
  - Optimized for small footprint inside shell toolbar
  - Title truncated to avoid layout shifts
  - Uses block color system for visual consistency
  - Animated dot pulses only while running

### Focus Sidebar Content
- **`focus-sidebar-content.tsx`** — Primary sidebar content shown during active focus session
  - Provides dedicated, distraction-minimized environment
  - View and control focus timer
  - See focused block's title and color context
  - Capture notes (description-style, no section title, "Add description..." placeholder)
  - Progress tasks or subtasks related to focused block
  - Adapts content based on block type (goal block vs task block)
  - Renders hero timer, title, and focus controls (pause, resume, end)
  - Notes and tasks flow inline without section headers, description first
  - Empty-state messages removed; only creators shown when lists are empty
  - For goal blocks: lists assigned goal tasks, toggles/unassigns/expands tasks, edits task details, manages subtasks, creates new tasks inline
  - For task blocks: lists and manages subtasks, creates new subtasks inline
  - Spacing matches BlockSidebar: px-5 paddings, mx-5 divider, border/60
  - Desktop-first vertical layout
  - Animated color dot reflects running state
  - Uses shared AutoResizeTextarea from sidebar-utils (no local copy)
  - Inline creators favor keyboard-first flows
  - Goal task expansion behaves like single-open accordion

### Public API
- **`index.ts`** — Public export surface for focus mode UI components
  - Centralizes all focus-related primitives
  - Single module boundary for focus imports
  - Re-exports focus timer, indicator, and sidebar content components
  - Re-exports associated prop types
  - Keeps focus mode as cohesive feature slice

## Key Features

- **Timer Display:** Elapsed time shown in HH:MM:SS format with visual running indicator
- **Timer Controls:** Pause, resume, stop, and start actions
- **Status Indicator:** Compact toolbar indicator showing active focus session
- **Focus Sidebar:** Dedicated sidebar environment for focused work
- **Notes Capture:** Auto-resizing textarea for capturing notes during focus
- **Task Management:** Manage tasks and subtasks within focus context
- **Block Type Adaptation:** Different UI for goal blocks vs task blocks
- **Visual Consistency:** Uses block color system throughout
- **Keyboard-First:** Inline creators favor keyboard-driven flows
- **Distraction-Minimized:** Clean, focused interface design

## Design Principles

- **Presentational:** Components are purely presentational and delegate behavior upward
- **State Delegation:** Components do not own focus timer state or lifecycle
- **Visual Consistency:** Uses block color system for indicators and styling
- **Compact Layout:** Optimized for sidebars and toolbar integration
- **Keyboard-First:** Inline creators and controls favor keyboard interactions
- **Progressive Disclosure:** Goal task expansion uses accordion pattern
- **Distraction-Free:** Clean, minimal interface during focus sessions
- **State Communication:** Visual indicators clearly communicate running vs paused state

## Usage Patterns

1. **Starting Focus:** Use StartFocusButton to initiate focus on a block
2. **Active Focus:** FocusSidebarContent provides main focus interface
3. **Toolbar Indicator:** FocusIndicator shows status in shell toolbar
4. **Timer Control:** FocusTimer provides pause/resume/stop controls
5. **Task Progress:** Manage tasks and subtasks within focus sidebar
6. **Notes Capture:** Capture notes related to focused work
7. **Navigation:** Click indicator to navigate back to focused block

## Integration Points

- **Block System:** Uses block colors and block types for visual consistency
- **Shell:** FocusIndicator integrated into shell toolbar
- **Sidebar:** FocusSidebarContent used in shell right panel
- **Block Sidebar:** FocusTimer used in block sidebar components
- **Time Utils:** Uses time formatting utilities for elapsed time display
- **Task Management:** Integrates with task and subtask management systems

**Total Files:** 4 (3 component files, 1 public API)
