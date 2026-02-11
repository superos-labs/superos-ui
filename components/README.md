# Components Directory

**Purpose:** Complete UI component library for SuperOS, organized by feature domain and containing all React components, hooks, utilities, and shared types used throughout the application.

## Feature Domains

### Core Product Components

#### Calendar System
See [`calendar/README.md`](./calendar/README.md) for detailed documentation.

**Purpose:** Complete calendar view system for rendering and interacting with time-based blocks, events, and deadlines in day and week views.

**Key Components:**
- Calendar (main router)
- WeekView, DayView
- TimeColumn, TimeColumnBlock
- DeadlineTray
- CalendarDayHeader, CurrentTimeLine

**Features:** Drag & drop, overlap layout, keyboard shortcuts, clipboard, external drag support

#### Block System
See [`block/README.md`](./block/README.md) for detailed documentation.

**Purpose:** Visual calendar block components and interaction system for rendering and manipulating time blocks in the calendar grid.

**Key Components:**
- Block (visual primitive)
- BlockSidebar (editing surface)
- DraggableBlockWrapper, ResizableBlockWrapper
- Interaction hooks (drag, resize, grid creation)

**Features:** Drag & drop, resize, context menus, sidebar editing

#### Backlog System
See [`backlog/README.md`](./backlog/README.md) for detailed documentation.

**Purpose:** Complete backlog system for managing Goals, Tasks, and Essentials — the primary planning and organization interface.

**Key Components:**
- Backlog (composition root)
- Goals subsystem (GoalSection, TaskRow, inline editors)
- Essentials subsystem (EssentialsSection, schedule editing)

**Features:** Goal/task management, essential scheduling, onboarding flow, drag & drop

#### Shell System
See [`shell/README.md`](./shell/README.md) for detailed documentation.

**Purpose:** Core shell composition root that orchestrates the entire authenticated application UI.

**Key Components:**
- ShellContentComponent (main composition root)
- ShellDesktopLayout, ShellMobileLayout
- Shell toolbars (desktop, mobile, blueprint)
- Orchestration hooks (state, wiring, layout)

**Features:** Multi-panel layouts, responsive design, onboarding, blueprint editing, planning mode

### Specialized Feature Components

#### Quarter View
See [`quarter-view/README.md`](./quarter-view/README.md) for detailed documentation.

**Purpose:** Read-only, orientation-focused planning surface showing goal and milestone pacing across the current quarter.

**Key Components:**
- QuarterView (main composition root — 3-column layout)
- QuarterMonthColumn (single month with distribution + milestones)

**Features:** Per-month time distribution (Goals / Life Areas toggle), stacked color bar, milestone list with date pills, completed/upcoming visual states

#### Stats View
See [`stats-view/README.md`](./stats-view/README.md) for detailed documentation.

**Purpose:** Full-screen analytics dashboard for visualizing completed vs planned time distribution across configurable time horizons.

**Key Components:**
- StatsView (main dashboard with tabs and ranked list)
- StatsPieChart (Recharts donut visualization)

**Features:** Time horizon tabs (All time / This week / This month), distribution mode tabs (Goals / Life Areas), pie chart visualization, progress tracking with distribution bar

#### Focus Mode
See [`focus/README.md`](./focus/README.md) for detailed documentation.

**Purpose:** UI components for focus mode functionality, providing timer controls and distraction-minimized sidebar environment.

**Key Components:**
- FocusTimer
- FocusIndicator
- FocusSidebarContent

#### Goal Detail
See [`goal-detail/README.md`](./goal-detail/README.md) for detailed documentation.

**Purpose:** Comprehensive goal detail view for viewing and editing a single goal.

**Key Components:**
- GoalDetail (main view)
- GoalDetailHeader, GoalDetailTasks, GoalDetailMilestones
- GoalDetailStats

#### Weekly Planning
See [`weekly-planning/README.md`](./weekly-planning/README.md) for detailed documentation.

**Purpose:** Components for weekly planning flow, blueprint creation, and deadline awareness.

**Key Components:**
- PlanningPanel (two-step flow)
- BlueprintBacklog
- UpcomingDeadlinesCard

#### Weekly Analytics
See [`weekly-analytics/README.md`](./weekly-analytics/README.md) for detailed documentation.

**Purpose:** Analytics and visualization components for tracking weekly progress and planning budgets.

**Key Components:**
- WeeklyAnalytics
- PlanningBudget
- PlanningBudgetDistribution

#### Integrations
See [`integrations/README.md`](./integrations/README.md) for detailed documentation.

**Purpose:** UI components for managing calendar integrations and SuperOS companion apps.

**Key Components:**
- IntegrationsSidebar
- IntegrationList, IntegrationCard
- ProviderSettingsView (calendar integration)

#### Settings
See [`settings/README.md`](./settings/README.md) for detailed documentation.

**Purpose:** Reusable UI components for settings and configuration.

**Key Components:**
- ColorPicker, IconPicker
- LifeAreaManagerModal
- LifeAreaRow, LifeAreaInlineCreator

### Cross-Cutting Systems

#### Drag and Drop
See [`drag/README.md`](./drag/README.md) for detailed documentation.

**Purpose:** Global drag-and-drop context and hooks providing generic, domain-agnostic drag-and-drop system.

**Key Components:**
- DragProvider (global context)
- DragGhost
- useDraggable, useDropZone

#### UI Primitives
See [`ui/README.md`](./ui/README.md) for detailed documentation.

**Purpose:** Collection of reusable UI primitives and composed components built on Radix UI and other headless libraries.

**Key Components:**
- Form components (Input, Select, Combobox, DatePicker)
- Dialog components (AlertDialog, BottomSheet, FullScreenOverlay)
- Menu components (DropdownMenu, ContextMenu)
- Layout components (Card, Shell, Separator)
- Button, Badge, and specialized components

## Architecture Principles

- **Domain Organization:** Components organized by feature domain (Calendar, Backlog, Block, etc.)
- **Feature Barrels:** Each feature folder has an `index.ts` for convenient imports
- **Composition:** Large features composed from smaller, focused components
- **Presentational:** Components manage UI state but delegate persistence via callbacks
- **Reusability:** Shared UI primitives in `ui/` directory
- **Documentation:** Each major domain has its own README

## Directory Structure

```
components/
├── calendar/                    # Calendar system
├── block/                      # Block components
├── backlog/                    # Backlog system
│   ├── goals/                  # Goals subsystem
│   └── essentials/             # Essentials subsystem
├── shell/                      # Shell orchestration
├── quarter-view/               # Quarterly planning surface
├── stats-view/                 # Stats analytics dashboard
├── focus/                      # Focus mode
├── goal-detail/                # Goal detail view
├── weekly-planning/            # Weekly planning flow
├── weekly-analytics/           # Analytics & visualization
├── integrations/               # Calendar integrations
├── settings/                   # Settings components
├── drag/                       # Drag & drop system
└── ui/                         # UI primitives library
```

## Usage Guidelines

- **Import from Feature Folders:** Use `@/components/calendar`, `@/components/block`, etc. for feature components
- **Domain Boundaries:** Each domain is self-contained with its own types and utilities
- **Composition:** Build complex features by composing smaller components
- **Documentation:** Refer to domain-specific READMEs for detailed information

**Total Subdirectories:** 14 major feature domains + UI primitives
