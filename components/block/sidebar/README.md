# Block Sidebar Components

**Purpose:** UI components for the Block sidebar that allow users to edit and inspect individual calendar blocks.

## Core Components

### Content Sections
- **`content-sections.tsx`** — Sidebar content sections for editing and inspecting a single Block
  - PropertyRow (2-column Notion/Linear-style label → value layout)
  - DatePropertyRow, TimePropertyRow, FocusTimePropertyRow (click-to-edit property rows)
  - Notes/description and Subtasks (for task-type blocks)
  - Purely presentational + event-forwarding (no persistence or domain state)

### External Sync Configuration
- **`external-sync-section.tsx`** — Sidebar section for configuring how a Block appears when synced to external calendars (Google, Outlook, etc.)
  - Block-level override of display appearance (busy/blocked, goal title/block title, custom label)
  - Per-destination preview and inline editing
  - Does not perform actual sync or persistence

### Goal Task Display
- **`goal-task-row.tsx`** — Expandable row for displaying a goal-assigned task inside the Block sidebar
  - Toggle completion, inline title editing, expand/collapse for notes/subtasks
  - Unassigning tasks from blocks
  - Optimized for sidebar usage

### Reusable Building Blocks
- **`sidebar-sections.tsx`** — Collection of small, composable sidebar sections and controls
  - Section header wrapper
  - Inline task creation for goal blocks
  - Collapsible list of available goal tasks
  - Goal selector dropdown for unassigned blocks

### AI Briefing
- **`briefing-section.tsx`** — AI-powered briefing section for the block sidebar
  - `BriefingTrigger` — "Generate Briefing" / "Regenerate" button with loading state
  - `BriefingSuggestions` — suggested existing tasks (with "Assign" action) + new task proposals (with "Create" and "Dismiss")
  - Presentational only; briefing hook lives in parent via `useBlockBriefing`

### Utilities & Types
- **`sidebar-utils.tsx`** — Shared types and utility helpers
  - `BlockSidebarData` shape for rendering and editing block details
  - Formatting helpers for date, time, and focus duration
  - Parsing helpers for user-entered focus time
  - Auto-resizing textarea primitive

## Design Principles

- **Presentational:** Components forward user intent via callbacks; they do not own persistence or domain state
- **Composable:** Small, focused sections that can be combined
- **Event-forwarding:** User interactions are handled via callbacks to parent components
- **No side effects:** Components do not fetch or save data directly

## Mental Models

- **Content Sections:** "Notion-style property rows and pluggable sidebar panels for block metadata"
- **External Sync:** "How should this block look in external calendars?"
- **Goal Task Row:** "This block contains this specific task. Let me refine it in place."
- **Sidebar Sections:** "Small focused controls that let me refine what this block represents."
- **Utils:** "A thin utility layer that shapes raw block data into display-ready values."

**Total Files:** 6 (5 component files, 1 utility/types file)
