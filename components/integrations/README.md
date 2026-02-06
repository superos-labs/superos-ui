# Integrations Component System

**Purpose:** UI components for managing calendar integrations and SuperOS companion apps, including provider discovery, connection, sync configuration, and app promotion.

## Core Components

### Main Sidebar
- **`integrations-sidebar.tsx`** — Sliding sidebar container for managing apps and calendar integrations
  - Provides two primary modes: list view (browse apps and providers) and provider view (configure specific provider settings)
  - Acts as top-level orchestration layer for Integrations area UI
  - Renders header with contextual title and navigation
  - Switches between list and provider views
  - Composes IntegrationList and ProviderSettingsView
  - Bridges provider-scoped callbacks upward
  - Uses simple view state to drive rendering
  - Provides fallback default integration state when none is present

### Integration Discovery
- **`integration-list.tsx`** — Composite list of SuperOS apps and calendar integrations
  - Renders two stacked sections: native/companion apps and calendar integration providers
  - Acts as primary browsing surface for Integrations area
  - Renders ordered list of companion apps (iOS, Android, Chrome Extension)
  - Renders ordered list of calendar providers with connection status
  - Provides fallback default state for providers with no stored state
  - Emits selected provider when a card is clicked
  - Ordering driven by APP_ORDER and PROVIDER_ORDER
  - Uses IntegrationCard and AppCard as building blocks

### Integration Cards
- **`integration-card.tsx`** — Card representation of a single calendar integration provider
  - Displays provider branding, connection status, number of synced calendars, and last sync time
  - Acts as navigational affordance into provider's detailed settings view
  - Renders provider identity (icon, name)
  - Surfaces connection and sync status
  - Displays enabled calendar count and last sync timestamp
  - Triggers navigation on click
  - Connected state indicated with small green dot
  - Uses subtle hover gradient for affordance

### App Promotion
- **`app-card.tsx`** — Card component for promoting and linking to SuperOS companion apps
  - Supports multiple app types (iOS, Android, Chrome Extension) via configuration map
  - Defines icon, label, and install URL for each app type
  - Each card renders app identity, short description, and install CTA
  - Opens external install link in new tab
  - Uses subtle gradient background and hover affordances
  - Chrome icon implemented as inline SVG for brand accuracy

### Provider Badge
- **`provider-badge.tsx`** — Compact visual indicator for a calendar provider
  - Renders provider's icon inside small rounded badge
  - Typically used on external calendar blocks or event surfaces to communicate source provider
  - Renders provider icon with brand color
  - Supports small and medium size variants
  - Uses subtle white background and shadow for legibility

## Calendar Integration Components

### Provider Settings View
- **`calendar/provider-settings-view.tsx`** — Top-level settings view for configuring a single calendar provider integration
  - Acts as composition root for all provider-specific integration UI
  - Handles connection/disconnection state, calendar import configuration, external calendar export configuration
  - Decides which subviews to render based on connection status
  - Shows connect prompt when provider is not connected
  - Shows account info and disconnect action when connected
  - Composes CalendarList and ExportSection with correct state and callbacks
  - Serves as thin orchestration layer for integration UI

### Connection
- **`calendar/connect-prompt.tsx`** — Connection call-to-action for an unconnected calendar provider
  - Displays provider branding, short description, and primary "Connect" button
  - Initiates OAuth/connection flow
  - Renders provider icon, name, and brand styling
  - Communicates value of connecting the provider
  - Triggers connect callback on user action
  - Centered, empty-state style layout
  - Uses provider brand color for subtle visual identity

### Calendar Import
- **`calendar/calendar-list.tsx`** — Calendar import configuration list for a single provider
  - Renders master toggle to enable/disable importing events
  - Renders list of provider calendars with per-calendar import toggles
  - Optional "meetings only" filter toggle
  - Purely presentational; receives state and callbacks from parent
  - Renders provider calendars for import selection
  - Exposes master import enable/disable control
  - Exposes meetings-only filter toggle
  - Hidden when no calendars are available
  - Secondary controls only appear when master import is enabled

- **`calendar/calendar-row.tsx`** — Single selectable calendar row used in integration settings
  - Displays custom checkbox indicating enabled/disabled state, calendar color indicator, and calendar name
  - Can operate in two modes: "import" (toggles event import) or "export" (toggles blueprint block export)
  - Presentational and stateless; all state derived from props
  - Renders calendar metadata (name, color)
  - Derives checked state based on mode
  - Emits toggle intent on user interaction
  - Implemented as button with ARIA checkbox semantics

### Calendar Export
- **`calendar/export-section.tsx`** — Configuration section for exporting SuperOS blocks to an external calendar
  - Provides structured, progressive set of controls
  - Defines whether export is enabled, how exported events are titled, which calendar receives exported blocks
  - Defines what categories of time are shared (essentials, goals, tasks)
  - Optional per-goal inclusion filtering
  - Presentational; all state owned by parent and passed via props
  - Renders export enable/disable control
  - Renders appearance options for exported events
  - Renders single-select target calendar chooser
  - Renders participation and goal filtering controls
  - Secondary controls hidden until export is enabled
  - Advanced options tucked behind accordion
  - Enforces single target calendar selection at UI layer

### Calendar Public API
- **`calendar/index.ts`** — Public export surface for calendar integration UI components
  - Centralizes and re-exports all integration-related views and building blocks
  - Used by provider settings and sync configuration flows
  - Provides single import entry point for calendar integration UI

## Public API

- **`index.ts`** — Public export surface for the Integrations UI domain
  - Re-exports all integration-related building blocks
  - Includes provider discovery, sidebar navigation, integration cards, badges, companion app promotion, and calendar provider settings
  - Serves as single import entry point for integrations UI

## Design Principles

- **Presentational:** Components receive state and emit user intent via callbacks
- **Progressive Disclosure:** Secondary controls hidden until primary actions are enabled
- **Provider-Agnostic:** Works with any calendar provider type
- **Connection States:** Handles connected, disconnected, and connecting states
- **Bidirectional Sync:** Supports both import (external → SuperOS) and export (SuperOS → external)
- **Visual Hierarchy:** Clear distinction between connection status, import settings, and export settings
- **Accessibility:** ARIA semantics for interactive elements

## Key Features

- **Provider Discovery:** Browse and discover available calendar integration providers
- **Connection Management:** Connect/disconnect calendar providers via OAuth
- **Calendar Import:** Select which external calendars to import events from
- **Calendar Export:** Configure which SuperOS blocks to export to external calendars
- **App Promotion:** Promote and link to SuperOS companion apps (iOS, Android, Chrome Extension)
- **Sync Status:** Display connection status, calendar counts, and last sync times
- **Per-Calendar Control:** Enable/disable import/export on a per-calendar basis
- **Appearance Customization:** Configure how exported events appear in external calendars
- **Filtering:** Optional meetings-only filter for imports

**Total Files:** 12 (5 main components, 6 calendar subdirectory components, 2 public API files)
