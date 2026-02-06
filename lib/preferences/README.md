# Preferences Library

**Purpose:** Client-side context and provider for managing user-configurable settings related to calendar behavior, progress measurement, and day-boundary visualization.

## Core Components

### Preferences Context
- **`preferences-context.tsx`** — Client-side context and provider for user preferences
  - Manages user-configurable settings related to calendar behavior, progress measurement, and day-boundary display
  - Exposes setters to update preferences
  - Stores user preference state
  - Provides clamped setters for constrained values (zoom, minutes)
  - Exposes preferences via context and hooks
  - Defaults reflect common planning assumptions (Mon start, 7am–11pm day)
  - No persistence layer here; higher-level code may hydrate/persist

### Types & Constants
- **`types.ts`** — Type definitions and constants for user preferences
  - Defines shape of user-configurable settings related to calendar behavior, progress measurement, and day-boundary visualization
  - Defines preference-related types
  - Defines constants for calendar zoom and day boundaries
  - Zoom expressed as percentage mapped to pixels-per-hour elsewhere
  - Minutes used for day boundaries for easy arithmetic

### Public API
- **`index.ts`** — Public API for user preferences
  - Re-exports preference types, constants, and context/hooks
  - Used to read and update user-level configuration
  - Exposes preference-related types, preference constants, and preferences context provider and hooks

## Preference Types

### Week Start Day
- **WeekStartDay** — Which day the week starts on
  - `0` = Sunday
  - `1` = Monday (default)

### Progress Metric
- **ProgressMetric** — How progress is measured in analytics
  - `"completed"`: Hours from blocks marked complete
  - `"focused"`: Hours of actual focus time tracked

### Calendar Zoom
- **CalendarZoom** — Calendar zoom level as percentage
  - Range: 50-150 (MIN_CALENDAR_ZOOM to MAX_CALENDAR_ZOOM)
  - Default: 100 (DEFAULT_CALENDAR_ZOOM)
  - Step: CALENDAR_ZOOM_STEP
  - Maps to pixels-per-hour elsewhere

### Day Boundaries Display
- **DayBoundariesDisplay** — How day boundaries are displayed
  - Controls visualization of day start/end times

### User Preferences
- **UserPreferences** — Complete user preferences object
  - Includes weekStartDay, progressMetric, calendarZoom, dayBoundariesDisplay
  - May include day start/end minutes

## Constants

- **MIN_CALENDAR_ZOOM:** Minimum zoom level (50)
- **MAX_CALENDAR_ZOOM:** Maximum zoom level (150)
- **DEFAULT_CALENDAR_ZOOM:** Default zoom level (100)
- **CALENDAR_ZOOM_STEP:** Zoom increment step
- **DEFAULT_DAY_START_MINUTES:** Default day start time in minutes (420 = 7am)
- **DEFAULT_DAY_END_MINUTES:** Default day end time in minutes (1380 = 11pm)

## Key Features

- **Week Start Preference:** Configure which day the week starts on (Sunday or Monday)
- **Progress Metric:** Choose between completed hours or focused hours for analytics
- **Calendar Zoom:** Adjustable zoom level with min/max constraints
- **Day Boundaries:** Configurable day start/end times
- **Clamped Setters:** Setters automatically clamp values to valid ranges
- **Context-Based:** Preferences accessible via React context throughout app
- **Optional Usage:** `usePreferencesOptional` allows graceful degradation when provider not present

## Design Principles

- **Sensible Defaults:** Defaults reflect common planning assumptions
- **No Persistence:** This layer doesn't persist; higher-level code handles persistence
- **Clamped Values:** Setters automatically clamp values to valid ranges
- **Context Pattern:** Uses React context for global preference access
- **Type Safety:** Strongly-typed preference values
- **Optional Usage:** Hooks degrade gracefully when provider not present

## Usage Patterns

1. **Setup Provider:** Wrap application with `PreferencesProvider`
2. **Access Preferences:** Use `usePreferences` hook to read preferences
3. **Update Preferences:** Use setters from hook to update preferences
4. **Optional Usage:** Use `usePreferencesOptional` when provider may not be present
5. **Default Values:** Preferences use sensible defaults if not provided

## Integration Points

- **Shell:** PreferencesProvider wraps entire application
- **Calendar:** Calendar uses weekStartDay and calendarZoom preferences
- **Analytics:** Analytics components use progressMetric preference
- **Day Boundaries:** Calendar uses day start/end minutes for day boundary display
- **Date Pickers:** Date pickers respect weekStartDay preference

**Total Files:** 3 (1 context provider, 1 types file, 1 public API)
