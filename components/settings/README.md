# Settings Components

**Purpose:** Reusable UI components for settings and configuration, including color and icon pickers, and Life Area management interfaces.

## Core Components

### Picker Components
- **`color-picker.tsx`** — Reusable color picker grid for selecting a Goal color
  - Renders compact grid of color swatch buttons
  - Reports selected value to parent via callback
  - Used across goal and life-area creation/editing surfaces
  - Uses getIconBgClass for consistent color styling
  - Visual selection indicated via ring styling
  - Intentionally small and dense for inline forms and modals

- **`icon-picker.tsx`** — Reusable icon picker grid for selecting a Goal or Life Area icon
  - Renders grid of icon buttons from provided icon set
  - Reports selected index to parent
  - Used across goal and life-area creation/editing surfaces
  - Selection is index-based to keep component stateless
  - maxIcons allows lightweight truncation for dense UIs
  - Visual selection uses foreground/background inversion

### Life Area Management

#### Modal
- **`life-area-manager-modal.tsx`** — Modal for managing Life Areas (add, edit, remove)
  - Flat list of default and custom Life Areas (no section headers)
  - Inline CRUD via LifeAreaRow and LifeAreaInlineCreator
  - framer-motion layout animations for add/remove
  - Distinguishes defaults with a "Built-in" micro-badge
  - Creator form lives inside the scroll area
  - Supports `initialShowCreator` prop for opening with creator pre-expanded
  - Supports `onLifeAreaCreated` callback for goal-linking flows

#### Inline Components
- **`life-area-inline-creator.tsx`** — Expanded inline creator for adding a new Life Area
  - Card-style form with icon button + name input, color palette, and action buttons
  - Validates against duplicate Life Area labels
  - Auto-focuses label input on mount
  - Icon picker toggles inline with height animation
  - Color palette always visible as a horizontal row
  - Enter submits, Escape cancels

- **`life-area-row.tsx`** — Editable row for displaying and managing a single Life Area
  - Color-tinted icon pill, label, and "Built-in" badge for defaults
  - Always-visible muted edit/delete action icons for custom areas
  - Inline edit mode as expanded card form (icon + input + color palette)
  - Inline delete confirmation strip (no second modal)
  - framer-motion AnimatePresence for view/edit/confirm transitions
  - Enter saves, Escape cancels

### Public API
- **`index.ts`** — Barrel file for Life Area settings components
  - Re-exports LifeAreaManagerModal and LifeAreaManagerModalProps
  - Keeps import paths short and stable for consumers

## Key Features

- **Color Selection:** Grid-based color picker with visual selection indicators
- **Icon Selection:** Grid-based icon picker with index-based selection
- **Life Area Management:** Add, edit, and delete custom Life Areas in one modal
- **Duplicate Prevention:** Validates against duplicate Life Area labels
- **Inline Editing:** Edit mode transforms rows into card-style forms
- **Inline Delete Confirmation:** Red-tinted strip replaces the row (no second modal)
- **Keyboard-First:** Enter to save, Escape to cancel
- **Always-Visible Actions:** Muted edit/delete icons visible at all times for custom areas
- **Animated Transitions:** framer-motion layout animations for list changes and mode switches

## Design Principles

- **Reusability:** Color and icon pickers shared across goal and life-area surfaces
- **Stateless Pickers:** Index-based selection keeps pickers stateless
- **Inline Editing:** Prefer inline editing over separate modals
- **Keyboard-First:** Optimized for keyboard-driven workflows
- **Visual Consistency:** Uses shared color and icon styling utilities
- **Compact Layout:** Small, dense layouts suitable for forms and modals
- **Progressive Disclosure:** Inline creators toggle pickers as needed
- **Validation:** Client-side validation for duplicate prevention

## Usage Patterns

1. **Color Selection:** Use ColorPicker in goal/life-area creation forms
2. **Icon Selection:** Use IconPicker in goal/life-area creation forms
3. **Manage Life Areas:** Use LifeAreaManagerModal to list, add, edit, and delete Life Areas
4. **Create from Goal Detail:** Open LifeAreaManagerModal with `initialShowCreator=true` and `onLifeAreaCreated` to link new area to a goal
5. **Edit Life Area:** Click edit icon on a custom row to enter inline edit mode
6. **Delete Life Area:** Click delete icon; inline confirmation if in use

## Integration Points

- **Goal Creation:** Color and icon pickers used in goal creation/editing
- **Goal Detail:** "Add new..." opens LifeAreaManagerModal with creator pre-expanded
- **Shell Toolbars:** "Edit life areas" menu item opens LifeAreaManagerModal
- **Color System:** Uses GoalColor types and color utilities
- **Icon System:** Uses IconComponent and GoalIconOption types

**Total Files:** 6 (4 component files, 1 inline creator, 1 public API)
