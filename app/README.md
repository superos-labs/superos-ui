# App Directory

**Purpose:** Next.js App Router directory containing the root layout, main application entry point, global styles, and development/preview routes.

## Core Files

### Root Layout
- **`layout.tsx`** — Root application layout
  - Defines global document structure
  - Loads and registers core fonts (Geist, Geist Mono, Public Sans)
  - Imports global styles
  - Configures base metadata for the app
  - Imports global CSS
  - Registers Google fonts and exposes them as CSS variables
  - Defines default document metadata
  - Wraps all routes with root HTML and BODY structure
  - Fonts exposed as CSS variables to integrate with token system in `globals.css`
  - Keeps layout intentionally minimal to avoid coupling global concerns with view-level composition

### Main Application Page
- **`page.tsx`** — Main application entry page for the SuperOS prototype shell
  - Composes global interaction providers and boots the shell using selected fixture data set
  - Supports switching from empty state to complete state to simulate onboarding completion
  - Wraps app with Preferences, Undo, and Drag providers
  - Selects and loads fixture data set
  - Initializes shell state via `useShellState`
  - Renders shell content component
  - Allows skipping onboarding by switching to "complete" data set
  - Uses in-memory fixture data only (non-persistent prototype)
  - Changing `dataSetId` forces full shell re-initialization
  - Keeps orchestration here; behavioral logic lives in hooks and shell modules

### Global Styles
- **`globals.css`** — Global styles and design tokens for SuperOS UI
  - Defines application-wide theme using CSS variables and Tailwind v4 directives
  - Includes color system, radii, typography mappings, and light/dark mode tokens
  - Establishes global utility classes used across the app
  - Imports and initializes Tailwind, animations, and shadcn base styles
  - Declares design tokens (colors, radii, fonts) as CSS variables
  - Maps tokens into Tailwind theme via `@theme inline`
  - Defines light and dark mode variable sets
  - Applies base element styles and global utilities
  - Color system uses OKLCH for perceptual consistency
  - Dark mode is class-based via `.dark`
  - Token naming mirrors shadcn conventions for interoperability
  - Keeps file focused on primitives, not component styling

## Static Assets

- **`favicon.ico`** — Application favicon
- **`avatar-portrait.jpeg`** — Avatar image asset

## Key Features

- **Global Providers:** Preferences, Undo, and Drag providers wrap entire application
- **Fixture Data:** In-memory fixture data sets for prototyping and development
- **Font System:** Multiple font families (Geist, Geist Mono, Public Sans) exposed as CSS variables
- **Design Tokens:** Comprehensive design token system using CSS variables and Tailwind v4
- **Dark Mode:** Class-based dark mode support via `.dark` class
- **Onboarding Simulation:** Ability to switch between empty and complete states

## Design Principles

- **Minimal Layout:** Root layout keeps global concerns separate from view-level composition
- **Provider Composition:** Global providers composed at root level
- **Fixture-Based:** Uses fixture data for prototyping (non-persistent)
- **Token System:** Design tokens defined as CSS variables and mapped to Tailwind
- **OKLCH Colors:** Color system uses OKLCH for perceptual consistency
- **Suspense Support:** Async components supported via Suspense boundaries

## Architecture

```
app/
├── layout.tsx              # Root layout with fonts and metadata
├── page.tsx                # Main application entry (shell composition)
├── globals.css             # Global styles and design tokens
├── favicon.ico             # Application favicon
└── avatar-portrait.jpeg    # Avatar asset
```

## Integration Points

- **Shell System:** Main page composes ShellContentComponent with shell state
- **Preferences:** PreferencesProvider manages user preferences
- **Undo System:** UndoProvider enables undo functionality
- **Drag System:** DragProvider enables drag-and-drop
- **Fixture Data:** Uses fixture data sets for development and prototyping

**Total Files:** 3 core files + 2 static assets
