# UI Component Library

**Purpose:** Collection of reusable UI primitives and composed components built on top of Radix UI, Base UI, and other headless libraries, styled with SuperOS design tokens.

## Form Components

### Input Primitives
- **`input.tsx`** — Core text input primitive
  - Styled wrapper around native HTML input element
  - Consistent sizing, focus rings, and invalid/disabled states
  - Used directly in forms and as base control inside InputGroup
  - Default height is h-7
  - Uses data-slot="input" for styling hooks

- **`textarea.tsx`** — Multi-line text input primitive
  - Styled textarea with consistent sizing and focus states
  - Auto-resizing with field-sizing-content
  - Min height of 16 (min-h-16)

- **`time-input.tsx`** — Primitive time editing components
  - TimeInput: Flexible text input for single time value
  - TimeRangeRow: Paired start/end time inputs with optional delete action
  - All times represented as minutes from midnight
  - Accepts human-friendly formats (e.g., "9:30 AM", "14:00")
  - Formats minutes into display strings and parses user input back to minutes
  - Invalid input on blur reverts to last valid value

### Input Grouping
- **`input-group.tsx`** — Composed input grouping primitives
  - Wrapper around Input and Textarea enabling leading/trailing addons
  - Supports inline buttons and block-level addons
  - Maintains consistent focus, border, and validation styling
  - Used by Combobox, search fields, and rich form inputs
  - Addons can be aligned inline-start, inline-end, block-start, or block-end
  - Clicking an addon focuses the associated input when possible

### Form Layout
- **`field.tsx`** — Composed form field layout primitives
  - Consistent structure for labeling, describing, grouping, and displaying validation
  - Designed to wrap inputs, checkboxes, radios, and custom controls
  - Supports vertical, horizontal, and responsive field orientations
  - Renders labels, titles, descriptions, separators, and error messages
  - Normalizes spacing and alignment across different input types
  - FieldError can render single or multiple messages

- **`label.tsx`** — Form label primitive built on top of Radix Label
  - Consistent typography, spacing, and disabled-state styling
  - Accessible label element
  - Works in conjunction with Field and Input primitives
  - Uses data-slot="label" for styling hooks

### Selection Components
- **`select.tsx`** — Composed Select (dropdown) primitive built on top of Radix Select
  - Styled single-select dropdown with consistent trigger, content, items, and scroll controls
  - Supports small and default trigger sizes
  - Renders scroll buttons for long option lists
  - Content rendered in a Portal
  - Selected item shows check indicator

- **`combobox.tsx`** — Composed Combobox (select/autocomplete) primitive built on top of Base UI
  - Flexible combobox supporting single selection, filtering, and optional multi-select via chips
  - Integrates with InputGroup and Button for consistent form styling
  - Supports optional clear button and trigger button
  - Supports multi-select chips with removable items
  - Content rendered in Portal and positioned via Positioner
  - Chips mode uses separate anchor to size the popup

- **`date-picker.tsx`** — Lightweight date picker built on top of Radix Popover and react-day-picker
  - Allows selecting or clearing a single calendar date
  - Returns value as ISO date string (yyyy-MM-dd)
  - Designed for compact inline usage (e.g., deadlines, due dates)
  - Controlled via `value` (ISO string) and `onChange`
  - Respects user week-start preference when available
  - Clear action available when value exists and popover is open

## Dialog & Overlay Components

- **`alert-dialog.tsx`** — Composed Alert Dialog primitive built on top of Radix AlertDialog
  - Styled, slot-based confirmation dialog with consistent layout, animation, and button integration
  - Wraps Radix primitives and adapts them to SuperOS design tokens
  - Provides layout primitives (Header, Footer, Media)
  - Bridges Radix Action/Cancel with shared Button component
  - Content supports size variants ("default" | "sm")
  - Uses data-slot attributes for slot-based styling

- **`bottom-sheet.tsx`** — Mobile-friendly bottom sheet dialog
  - Slides up from bottom of screen
  - Used for lightweight, focused detail views and quick actions
  - Handles open/close lifecycle and escape-key dismissal
  - Locks body scroll while open
  - Provides optional header, close button, and drag handle
  - Supports drag-down-to-dismiss interaction
  - Max height constrained to 85vh
  - Returns null when `open` is false

- **`full-screen-overlay.tsx`** — Full-screen mobile overlay
  - Takes over entire viewport
  - Used for high-focus surfaces (mobile backlog, editors, deep navigation)
  - Locks body scroll while open
  - Handles escape-key dismissal
  - Provides fixed header with title and close/back control
  - Renders scrollable content area
  - Slides in from the right
  - Supports "back" or "close" close styles

## Menu Components

- **`dropdown-menu.tsx`** — Composed Dropdown Menu primitive built on top of Radix DropdownMenu
  - Styled menu for action lists triggered by button or icon
  - Supports groups, checkboxes, radio items, separators, and nested submenus
  - Supports destructive variants, inset items, and keyboard focus states
  - Content width tied to trigger width when possible
  - Submenus render chevron indicator automatically

- **`context-menu.tsx`** — Composed Context Menu primitive built on top of Radix ContextMenu
  - Styled right-click/long-press menu
  - Supports groups, checkboxes, radio items, separators, labels, and nested submenus
  - Supports destructive variants, inset items, and keyboard focus states
  - Content and sub-content rendered with motion and zoom/fade transitions
  - Submenus show chevron indicator automatically

## Layout Components

- **`card.tsx`** — Composed Card layout primitive
  - Structured container with consistent padding, typography, and slot-based subcomponents
  - Provides layout slots (Header, Content, Footer, etc.)
  - Supports size variants for tighter layouts ("default" | "sm")
  - Header auto-adjusts layout when title, description, and actions are present
  - Uses data-slot attributes for internal composition

- **`shell.tsx`** — Top-level application shell layout primitives
  - Outer structural containers that frame the SuperOS app
  - Provides toolbar area and main content surface
  - Defines overall vertical app layout
  - Shell fills viewport height
  - Content centered and visually elevated via ring and shadow
  - Uses data-slot attributes for styling hooks

- **`separator.tsx`** — Divider/separator primitive built on top of Radix Separator
  - Used to visually separate sections of content horizontally or vertically
  - Applies SuperOS color and sizing tokens
  - Defaults to decorative
  - Uses data-slot="separator" for styling hooks

## Button & Badge Components

- **`button.tsx`** — Core Button primitive used across SuperOS UI
  - Flexible, variant-driven button with consistent sizing, icon handling, focus states, and accessibility
  - Built with class-variance-authority (CVA) and supports slotting via Radix Slot
  - Applies visual variants (default, outline, ghost, destructive, etc.)
  - Applies size variants for text and icon buttons
  - Exposes styling hooks via data attributes
  - Default element is a `button`
  - Uses `asChild` to compose with other primitives
  - Icons automatically size based on button size

- **`badge.tsx`** — Small inline status and metadata label
  - Used to display short pieces of contextual information (states, categories, counts)
  - Multiple visual variants
  - Built with class-variance-authority (CVA) and supports slotting via Radix Slot
  - Default element is a `span`
  - Uses data-slot and data-variant attributes for styling hooks
  - Icon padding adjusts automatically when inline icons are present

## Specialized Components

- **`subtask-row.tsx`** — Subtask row display and editing primitive
  - Used in backlog task lists and block sidebars
  - Renders single subtask with completion toggle, optional inline text editing, and delete affordance
  - Supports compact and default size variants
  - Delete button appears on hover
  - Completed subtasks render with muted color and strikethrough

- **`inline-subtask-creator.tsx`** — Inline creator for adding subtasks
  - Renders as lightweight "Add subtask" button that transforms into text input when activated
  - Shared between backlog task rows and block sidebar contexts
  - Handles Enter to save, Escape to cancel, and blur to commit
  - Supports compact and default size variants
  - Auto-focuses input when entering edit mode
  - Keeps focus after saving to allow rapid entry
  - Renders empty checkbox for visual alignment with SubtaskRow

- **`keyboard-shortcuts.tsx`** — Modal overlay displaying available keyboard shortcuts
  - Provides categorized, platform-aware (Mac vs non-Mac) list of shortcuts
  - Helps users discover and learn power-user interactions
  - Renders modal dialog with backdrop
  - Locks body scroll while open
  - Handles escape-key dismissal
  - Detects platform to display appropriate modifier keys
  - Categories and shortcuts defined locally in file

- **`undo-toast.tsx`** — Lightweight toast notifications for transient action feedback
  - UndoToast: Toast with optional Undo action
  - SimpleToast: Toast without actions (legacy/backward compatibility)
  - Appears as small pill at bottom center of viewport
  - Subtle enter/exit motion using framer-motion
  - Auto-dismisses after configurable delay
  - UndoToast shows "Undo" button with ⌘Z hint when provided
  - Null message hides the toast

## Public API

- **`index.ts`** — Public API for UI primitives
  - Re-exports all UI components and their variants
  - Single import entry point for UI library

## Design Principles

- **Radix UI Foundation:** Most components built on Radix UI primitives for accessibility
- **Design Tokens:** Consistent styling using SuperOS design tokens
- **Slot-Based Styling:** Uses data-slot attributes for flexible composition
- **Variant-Driven:** Uses class-variance-authority (CVA) for variant management
- **Accessibility First:** Built on accessible primitives with proper ARIA semantics
- **Composition:** Components designed to compose together (e.g., Field + Input + Label)
- **Platform Awareness:** Some components adapt to platform (Mac vs non-Mac)
- **Motion:** Subtle animations using framer-motion where appropriate

## Key Features

- **Form Controls:** Complete set of form inputs, selects, and date/time pickers
- **Dialogs & Overlays:** Alert dialogs, bottom sheets, and full-screen overlays
- **Menus:** Dropdown menus and context menus with full feature support
- **Layout Primitives:** Cards, shell layout, and separators
- **Feedback:** Toast notifications with undo support
- **Keyboard Shortcuts:** Modal displaying available shortcuts
- **Specialized:** Subtask management and inline creation components

**Total Files:** 24 (22 component files, 1 public API, 1 index file)
