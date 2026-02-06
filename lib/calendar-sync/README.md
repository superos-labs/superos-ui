# Calendar Sync Library

**Purpose:** System for managing calendar provider integrations, importing external calendar events, and exporting SuperOS blocks to external calendars with configurable sync settings and appearance overrides.

## Core Components

### Calendar Sync Hook
- **`use-calendar-sync.ts`** — Client-side hook for managing calendar provider integrations and imported external events
  - Powers integrations UI and demo/prototype behavior
  - Simulated provider connections, calendar selection, import/export settings, and local external event state
  - Manages CalendarIntegrationState per provider
  - Simulates provider connect/disconnect flows
  - Manages import settings (provider-level and calendar-level)
  - Manages export settings and participation configuration
  - Maintains and filters ExternalEvent local state
  - Exposes helpers for querying integration state
  - Uses mock data sources for demo and prototyping
  - State stored in Maps for O(1) provider access
  - Filtering of external events derived via useMemo

### Integrations Sidebar Hook
- **`use-integrations-sidebar.ts`** — Client-side hook for managing integrations sidebar UI state
  - Tracks open/close state
  - Manages navigation between list and provider views
  - Provides navigation helpers (open, close, navigateToProvider, navigateToList)

### Sync Resolution
- **`sync-resolver.ts`** — Core logic for resolving whether calendar blocks should be exported to external calendars and how they should appear
  - Encapsulates full precedence hierarchy across global integration settings, provider state, sync scope, block type participation, goal-level filters, and appearance overrides
  - Exposes helpers for computing cross-provider sync state for UI display
  - Determines if a week is considered "planned"
  - Checks whether a block falls within active sync scope
  - Determines participation of block types and goals in sync
  - Resolves final appearance for a block (block > goal > global precedence)
  - Resolves per-provider sync decision for a single block
  - Aggregates sync destinations across providers for UI
  - Defines default sync settings for goals and blocks
  - Resolution is deterministic and order-independent
  - External blocks never participate in export
  - Adapters are pure and synchronous

### Event Utilities
- **`event-utils.ts`** — Adapter utilities for transforming external calendar events into internal CalendarEvent and AllDayEvent formats
  - Separates timed external events (rendered on calendar grid) from all-day external events (rendered in deadline tray)
  - Converts ExternalEvent[] into CalendarEvent[] for timed rendering
  - Resolves dayIndex for events within given week
  - Extracts and groups all-day external events by date
  - Converts all-day external events into AllDayEvent format
  - Filters timed events to active week
  - Uses fallback slate color while honoring custom external colors
  - Adapters are pure and synchronous

### Provider Configuration
- **`provider-config.ts`** — Static configuration for supported calendar providers
  - Defines display metadata for each provider (name, description, icon, brand color)
  - Provides consistent provider ordering
  - Supports Google Calendar, Apple Calendar, and Outlook
  - Each provider has IntegrationConfig with display properties

### Types
- **`types.ts`** — Shared type definitions for calendar integrations, external events, and import/export configuration
  - Centralizes all domain-level types used by calendar sync state, resolution, adapters, and UI
  - Defines supported providers and integration status types
  - Defines export visibility, sync scope, and participation models
  - Defines runtime integration state shape
  - Defines provider calendar and external event shapes
  - Defines hook option/return contracts for calendar sync and sidebar
  - Types intentionally explicit to reduce cross-module coupling
  - Mirrors real integration concepts while remaining provider-agnostic

### Mock Data
- **`mock-data.ts`** — Mock data used by calendar sync demo and prototype flows
  - Provides sample provider calendars (Google, Apple, Outlook)
  - Provides sample external events per provider and calendar
  - Provides initial disconnected integration states with sensible defaults
  - Intended strictly for prototyping, demos, and local development
  - Defines mock ProviderCalendar lists per provider
  - Defines mock ExternalEvent records returned when calendars are enabled
  - Defines initial CalendarIntegrationState objects for demo bootstrapping
  - Data is deterministic and human-readable for easy inspection
  - Mirrors real data shapes to exercise adapters and UI

### Public API
- **`index.ts`** — Public entry point for the Calendar Sync module
  - Re-exports calendar sync types, hooks, utilities, and configuration
  - Provides single import surface for calendar integration features

## Key Features

- **Provider Support:** Google Calendar, Apple Calendar, Outlook
- **Bidirectional Sync:** Import external events and export SuperOS blocks
- **Import Configuration:** Per-provider and per-calendar import toggles
- **Export Configuration:** Configurable export settings with participation controls
- **Appearance Overrides:** Block-level and goal-level appearance customization
- **Sync Scope:** Distinguish between scheduled blocks and blueprint blocks
- **Participation Control:** Control which block types and goals participate in sync
- **All-Day Events:** Separate handling for all-day external events in deadline tray
- **Precedence Hierarchy:** Clear precedence for sync decisions (block > goal > global)

## Design Principles

- **Provider-Agnostic:** Core logic remains provider-agnostic
- **Deterministic:** Resolution is deterministic and order-independent
- **Pure Functions:** Adapters and resolvers are pure and synchronous
- **Precedence Hierarchy:** Clear precedence for appearance and sync decisions
- **Mock Data:** Uses mock data for prototyping and demos
- **Type Safety:** Explicit types reduce cross-module coupling
- **Separation:** Import/export logic separated from UI rendering

## Usage Patterns

1. **Initialize Sync:** Use `useCalendarSync` hook to manage integration state
2. **Connect Provider:** Simulate provider connection via hook methods
3. **Configure Import:** Enable/disable import per provider and calendar
4. **Configure Export:** Set export settings, participation, and appearance
5. **Resolve Sync:** Use sync resolver to determine if blocks should be exported
6. **Transform Events:** Use event utils to convert external events to internal formats
7. **Display State:** Use sync resolver to compute sync state for UI display

## Integration Points

- **Unified Schedule:** Integrates with unified schedule domain for block data
- **Calendar Components:** External events rendered in calendar and deadline tray
- **Integrations UI:** Provides data and state for integrations sidebar components
- **Block Sidebar:** Sync settings configured in block sidebar
- **Goal Settings:** Goal-level sync settings and filters

**Total Files:** 8 (2 React hooks, 1 resolver, 1 event utils, 1 provider config, 1 types file, 1 mock data, 1 public API)
