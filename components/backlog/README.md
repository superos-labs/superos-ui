# Backlog Component System

**Purpose:** Complete backlog system for managing Goals, Tasks, and Essentials — the primary planning and organization interface where users define what they want to accomplish and schedule.

## Core Components

### Main Backlog Component
- **`backlog.tsx`** — Backlog composition root for Goals and Essentials
  - Orchestrates rendering and layout of Essentials and Goals sections
  - Onboarding-specific behavior (goals first, then essentials/blueprint)
  - Wires callbacks between higher-level shell state and leaf components
  - Optional drag-and-drop enablement
  - Intentionally a composition + wiring layer
  - Does not fetch data and does not own domain state
  - Composes EssentialsSection and GoalSection
  - Gates visibility based on onboarding step and blueprint edit mode
  - Forwards scheduling, deadline, and mutation callbacks
  - Provides animated mount/unmount for major sections

### Types
- **`backlog-types.ts`** — Shared type definitions for items rendered in the Backlog
  - Provides foundational interfaces used by both Goals and Essentials
  - Lightweight grouping and display mode primitives
  - Defines minimal shape of a backlog item
  - Defines high-level backlog display modes
  - Defines generic grouping structure
  - Base interface shared by goals and essentials (id, label, icon, color)

### Example/Playground
- **`backlog-example.tsx`** — Playground example for the Backlog component
  - Fully interactive, in-memory demo of Essentials, Goals, Tasks, and subtasks
  - Intended for local development, debugging, and UI iteration
  - Defines mock essentials and goals
  - Wires minimal state management for tasks and subtasks
  - Exposes knobs to toggle basic presentation flags
  - Uses crypto.randomUUID for temporary IDs
  - All state lives locally in file

### Public API
- **`index.ts`** — Public entry point for Backlog module
  - Centralizes and re-exports Backlog composition root, Goals and Essentials components, shared backlog types, onboarding helpers, and convenience re-exports from lib domains
  - Defines public surface area of Backlog package
  - Provides stable, ergonomic import surface
  - Hides internal folder structure
  - Groups related exports by domain (Goals, Essentials, Shared, Hooks)

## Subsystems

### Goals Subsystem
See [`goals/README.md`](./goals/README.md) for detailed documentation.

**Key Components:**
- GoalSection — Main section for rendering goal lists
- GoalItemRow — Row component for goals with tasks
- TaskRow — Task display and interaction
- InlineGoalEditor — Goal creation and editing
- OnboardingGoalsCard — Onboarding goal setup
- GoalInspirationGallery — Browse and add inspirational goals

**Features:**
- Goal creation, editing, and deletion
- Task management with inline editing
- Drag-and-drop to calendar
- Milestone support
- Weekly focus prioritization
- Onboarding flow integration

### Essentials Subsystem
See [`essentials/README.md`](./essentials/README.md) for detailed documentation.

**Key Components:**
- EssentialsSection — Main section for essentials management
- EssentialRow / SleepRow — Row components for schedule editing
- EssentialsCTA — Onboarding call-to-action flow
- InlineEssentialCreator — Quick essential creation
- SuggestionEditor — Configure suggested essentials

**Features:**
- Essential schedule configuration
- Sleep special case with wake-up/wind-down times
- Suggested essentials with defaults
- Multiple time ranges per essential
- Day-of-week selection
- Template-based scheduling

## Key Features

- **Dual Management:** Unified interface for Goals and Essentials
- **Onboarding Flow:** Guided setup for new users (goals → essentials → blueprint)
- **Drag & Drop:** Goals and tasks can be dragged to calendar for scheduling
- **Inline Editing:** Quick inline editing for goals, tasks, and essentials
- **Visual Organization:** Clear hierarchy with expandable rows
- **Schedule Integration:** Shows scheduled times and deadlines
- **Progressive Disclosure:** Expandable rows reveal details on demand
- **Animated Transitions:** Smooth transitions between states and modes

## Design Principles

- **Composition Over Ownership:** Main backlog component composes sub-components but doesn't own domain state
- **Presentational:** Components manage UI state but delegate persistence via callbacks
- **Onboarding-Aware:** Components adapt behavior for onboarding vs. standard modes
- **Progressive Disclosure:** Collapsed summary views expand to full editors
- **Keyboard-Driven:** Rapid entry and editing via keyboard shortcuts
- **Visual Hierarchy:** Clear distinction between goals, tasks, essentials, and subtasks
- **Drag Integration:** Seamless drag-and-drop integration with calendar system

## Usage Patterns

1. **Standard Backlog:** Backlog component renders EssentialsSection and GoalSection side by side
2. **Onboarding:** Backlog adapts to show goals first, then essentials, then blueprint creation
3. **Goal Management:** Users create goals, add tasks, and manage subtasks
4. **Essential Configuration:** Users configure recurring essentials with weekly schedules
5. **Scheduling:** Users drag goals/tasks to calendar or set deadlines
6. **Editing:** Click any row to enter inline edit mode

## Integration Points

- **Shell:** Backlog integrated into shell layout and navigation
- **Calendar:** Drag-and-drop from backlog to calendar for scheduling
- **Unified Schedule:** Uses unified schedule domain types and hooks
- **Blueprint:** Essentials and goals feed into blueprint creation
- **Weekly Planning:** Goals and tasks participate in weekly planning flow
- **Drag System:** Uses global drag context for drag-and-drop

## Architecture

```
backlog/
├── backlog.tsx              # Main composition root
├── backlog-types.ts         # Shared type definitions
├── backlog-example.tsx      # Development playground
├── index.ts                 # Public API
├── goals/                   # Goals subsystem
│   ├── goal-section.tsx
│   ├── goal-item-row.tsx
│   ├── task-row.tsx
│   ├── inline-goal-editor.tsx
│   └── ...
└── essentials/             # Essentials subsystem
    ├── essentials-section.tsx
    ├── essential-row.tsx
    ├── essentials-cta.tsx
    └── ...
```

**Total Files:** 4 main files + 2 subsystems (goals: 12 files, essentials: 8 files)
