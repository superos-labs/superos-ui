# Settings Components

**Purpose:** Reusable UI components for settings and configuration, including color and icon pickers, and Life Area management interfaces.

## Core Components

### Picker Components
- **`color-picker.tsx`** — Reusable color picker grid for selecting a Goal color
  - Renders compact grid of color swatch buttons
  - Reports selected value to parent via callback
  - Used across goal and life-area creation/editing surfaces
  - Renders fixed subset of allowed Goal colors
  - Displays current selection state
  - Emits selected color via callback
  - Uses getIconBgClass for consistent color styling
  - Visual selection indicated via ring styling
  - Intentionally small and dense for inline forms and modals

- **`icon-picker.tsx`** — Reusable icon picker grid for selecting a Goal or Life Area icon
  - Renders grid of icon buttons from provided icon set
  - Reports selected index to parent
  - Used across goal and life-area creation/editing surfaces
  - Renders subset of available icon options
  - Displays current selection state
  - Emits selected icon index via callback
  - Selection is index-based to keep component stateless
  - maxIcons allows lightweight truncation for dense UIs
  - Visual selection uses foreground/background inversion

### Life Area Management

#### Modal Components
- **`life-area-creator-modal.tsx`** — Modal for creating a new custom Life Area
  - Provides lightweight form for entering label, selecting icon and color
  - Previews resulting Life Area before creation
  - Shares icon and color pickers with goal creation surfaces
  - Renders modal shell and backdrop
  - Manages local form state (label, icon index, color)
  - Validates against duplicate Life Area labels
  - Emits create event with normalized data
  - Auto-focuses label input when opened
  - Resets form state on open
  - Index-based icon selection to remain stateless
  - Preview updates live as user edits

- **`life-area-manager-modal.tsx`** — Modal for managing Life Areas
  - Lists both system and custom Life Areas
  - Provides creation, editing, and deletion capabilities
  - Uses LifeAreaRow for displaying individual life areas
  - Uses LifeAreaInlineCreator for quick creation
  - Manages collection of life areas

#### Inline Components
- **`life-area-inline-creator.tsx`** — Inline creator for adding a new Life Area
  - Compact form used inside Life Area manager modal
  - Quickly creates Life Area without opening separate dialog
  - Renders inline inputs for label, icon, and color
  - Manages local creation form state
  - Validates against duplicate Life Area labels
  - Emits create event with normalized data
  - Auto-focuses label input on mount
  - Toggles icon and color pickers inline
  - Enter submits, Escape cancels
  - Optimized for fast, keyboard-driven creation

- **`life-area-row.tsx`** — Editable row for displaying and managing a single Life Area
  - Used inside Life Area manager modal
  - Lists both system and custom Life Areas
  - Inline editing and deletion for custom entries
  - Renders Life Area icon, color, and label
  - Supports inline edit mode for label, icon, and color
  - Emits update and remove events
  - Gates editing and deletion to custom Life Areas
  - Confirms deletion when Life Area is currently in use
  - Edit mode is fully inline (no separate modal)
  - Icon and color pickers reuse shared picker components
  - Enter saves, Escape cancels
  - Action buttons appear on hover for visual quietness

### Public API
- **`index.ts`** — Barrel file for Life Area settings components
  - Centralizes exports for modal-based Life Area creation and management surfaces
  - Used in settings and onboarding flows
  - Re-exports Life Area modal components and associated public prop types
  - Keeps import paths short and stable for consumers

## Key Features

- **Color Selection:** Grid-based color picker with visual selection indicators
- **Icon Selection:** Grid-based icon picker with index-based selection
- **Life Area Creation:** Modal and inline creation options
- **Life Area Management:** List, edit, and delete custom Life Areas
- **Duplicate Prevention:** Validates against duplicate Life Area labels
- **Inline Editing:** Quick inline editing without separate modals
- **Keyboard-First:** Enter to save, Escape to cancel
- **Visual Feedback:** Live preview updates and selection indicators
- **System vs Custom:** Distinguishes between system and custom Life Areas

## Design Principles

- **Reusability:** Color and icon pickers shared across goal and life-area surfaces
- **Stateless Pickers:** Index-based selection keeps pickers stateless
- **Inline Editing:** Prefer inline editing over separate modals when possible
- **Keyboard-First:** Optimized for keyboard-driven workflows
- **Visual Consistency:** Uses shared color and icon styling utilities
- **Compact Layout:** Small, dense layouts suitable for forms and modals
- **Progressive Disclosure:** Inline creators toggle pickers as needed
- **Validation:** Client-side validation for duplicate prevention

## Usage Patterns

1. **Color Selection:** Use ColorPicker in goal/life-area creation forms
2. **Icon Selection:** Use IconPicker in goal/life-area creation forms
3. **Create Life Area:** Use LifeAreaCreatorModal for standalone creation or LifeAreaInlineCreator for quick creation
4. **Manage Life Areas:** Use LifeAreaManagerModal to list, edit, and delete Life Areas
5. **Edit Life Area:** Click LifeAreaRow to enter inline edit mode
6. **Delete Life Area:** Delete button appears on hover; confirms if in use

## Integration Points

- **Goal Creation:** Color and icon pickers used in goal creation/editing
- **Life Areas:** Life Area management integrated into settings flows
- **Onboarding:** Life Area creation used during onboarding
- **Color System:** Uses GoalColor types and color utilities
- **Icon System:** Uses IconComponent and GoalIconOption types

**Total Files:** 7 (5 component files, 1 inline creator, 1 public API)
