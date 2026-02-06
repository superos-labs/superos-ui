# Weekly Planning Component System

**Purpose:** Components for weekly planning flow, blueprint creation, and deadline awareness to help users prioritize tasks and schedule their week.

## Core Planning Components

### Main Planning Panel
- **`planning-panel.tsx`** — Two-step weekly planning panel
  - Guides users through prioritizing focus tasks per goal, then scheduling those tasks into the calendar
  - Main orchestration layer for the weekly planning flow
  - Renders step-specific headers and descriptions
  - Switches between prioritize and schedule views
  - Handles cancellation, step progression, and final confirmation
  - Optionally allows saving the week as a blueprint template

### Planning Views
- **`planning-prioritize-view.tsx`** — Step 1: Task prioritization
  - Allows users to select a small set of focus tasks per goal
  - Tasks marked as focus are surfaced first and can be quickly toggled
  - Supports inline creation of new tasks (auto-marked as focus)
  - Respects milestone context by showing only current-milestone tasks when applicable
  - Focus state is the primary signal in this step
- **`planning-schedule-view.tsx`** — Step 2: Scheduling
  - Displays essentials, goals, and tasks in a lightweight list optimized for drag-and-drop
  - Supports drag-and-drop for goals, essentials, and tasks
  - Shows scheduled time or deadline metadata for tasks
  - Optionally filters tasks to weekly focus set
  - Optionally surfaces "Add essentials to calendar" action
  - Completed tasks are visually muted

## Blueprint Creation Components

### Blueprint Backlog
- **`blueprint-backlog.tsx`** — Blueprint creation backlog used during onboarding and blueprint editing
  - Allows users to define routine essentials (including sleep) and drag goals into a schedule-like view
  - Primary composition layer that wires together essentials creation, goal scheduling, and inline guidance
  - Renders blueprint header and guidance
  - Orchestrates essentials section (including sleep configuration)
  - Renders draggable schedule views for essentials and goals
  - Provides fallback display when essentials creation is unavailable
  - Exposes save action to persist blueprint upstream
  - Sleep is treated as a special essential with inline expansion

### Blueprint Essentials Section
- **`blueprint-essentials-section.tsx`** — Essentials management section used within blueprint creation
  - Lets users configure sleep, review existing essentials, add new essentials (via suggestions or custom creation), and define weekly schedules
  - Designed to reduce setup friction with sensible defaults and inline editing
  - Renders and manages Sleep row with expandable configuration
  - Displays existing essentials with editable schedules
  - Surfaces suggested essentials with one-tap inline setup
  - Provides inline creator for fully custom essentials
  - Orchestrates expansion, editing, and creation states
  - Only one editing surface is active at a time
  - Essentials are sorted by earliest start time for scannability

## Supporting Components

### Prompt Cards
- **`plan-week-prompt-card.tsx`** — Prompt card encouraging users to start weekly planning
  - Presents motivational message with primary call-to-action to begin planning
  - Secondary dismissal option
  - Typically surfaced after blueprint creation or when a new week begins
  - Uses subtle decorative background layers for depth
  - Centered, single-focus layout to minimize cognitive load

### Deadline Components
- **`upcoming-deadlines-card.tsx`** — Compact card showing upcoming goal, milestone, and task deadlines
  - Displays near-term deadlines by default (next 30 days)
  - Option to expand and view all provided deadlines
  - Designed for quick situational awareness without overwhelming users
  - Formats deadline dates into human-friendly labels
  - Icon varies by deadline type (goal, milestone, task)
  - Card hides entirely when there are no deadlines
- **`upcoming-deadlines-section.tsx`** — Inline section variant of upcoming deadlines
  - Lightweight list of goal, milestone, and task deadlines
  - Collapsed to near-term window by default with optional expansion
  - Intended for embedding inside larger views (sidebars, panels) rather than standalone card
  - Mirrors behavior of UpcomingDeadlinesCard in section form factor

### Tutorial Component
- **`inline-video-tutorial.tsx`** — Inline, dismissible video tutorial preview
  - Displays thumbnail with play overlay that opens external video in new tab
  - Short caption and "Maybe later" dismissal affordance
  - Used in onboarding and setup flows for lightweight, optional guidance
  - Uses subtle motion and scale for approachability
  - Frosted-glass style play button for visual prominence
  - Entire thumbnail area is clickable

## Public API

- **`index.ts`** — Public API surface for Weekly Planning components
  - Re-exports all planning components and their prop types
  - Re-exports PlanningStep type from lib/weekly-planning for convenience

## Design Principles

- **Two-step flow:** Prioritize first, then schedule (reduces cognitive load)
- **Focus-first:** Emphasizes selecting focus tasks before scheduling
- **Drag-and-drop:** Optimized for drag-and-drop interactions
- **Progressive disclosure:** Collapsed views with optional expansion
- **Visual hierarchy:** Focus tasks surfaced first, completed tasks muted
- **Inline editing:** Minimal friction for creating and editing essentials
- **Context-aware:** Respects milestone context and filtering options
- **Optional guidance:** Tutorials and prompts are dismissible

## Key Features

- **Weekly Planning Flow:** Two-step process (prioritize → schedule)
- **Blueprint Creation:** Template-based week design with essentials and goals
- **Essentials Management:** Sleep configuration, suggestions, and custom essentials
- **Focus Tasks:** Select and prioritize tasks for the week
- **Deadline Awareness:** Near-term and expanded deadline views
- **Drag-and-Drop:** Schedule goals, essentials, and tasks onto calendar
- **Inline Creation:** Quick task and essential creation during planning
- **Video Tutorials:** Optional guidance for onboarding
- **Save as Blueprint:** Convert planned week into reusable template

**Total Files:** 10 (7 core components, 2 deadline components, 1 tutorial component, 1 public API)
