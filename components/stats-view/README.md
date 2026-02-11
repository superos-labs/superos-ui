# Stats View Component

**Purpose:** Full-screen analytics dashboard for visualizing completed vs planned time distribution across configurable time horizons (all time, this week, this month).

## Components

### Main View
- **`stats-view.tsx`** — Main StatsView component
  - Replaces the calendar when active (triggered by toolbar toggle)
  - Renders time horizon tabs (All time / This week / This month)
  - Renders distribution mode tabs (Goals / Life Areas)
  - Computes per-goal stats filtered by selected time horizon
  - Aggregates stats by life area when in life-areas mode
  - Displays pie chart, distribution bar, and ranked item list
  - Reuses WeeklyAnalyticsItemRow and DistributionProgressBar for consistency

### Visualization
- **`stats-pie-chart.tsx`** — Recharts donut chart for time distribution
  - Renders proportional breakdown of completed hours by goal or life area
  - Shows center label with total completed / planned hours
  - Supports hover interaction to highlight segments
  - Uses hex colors derived from GoalColor tokens
  - Filters out items with zero completed hours

### Barrel Export
- **`index.ts`** — Public API exports for stats-view

## Features

- **Time Horizons:** All time, This week, This month
- **Distribution Modes:** Goals, Life Areas
- **Visualization:** Donut pie chart with colored segments
- **Progress Tracking:** Distribution bar + ranked list with progress bars
- **Responsive Layout:** Centered, scrollable dashboard
- **Visual Consistency:** Reuses analytics primitives from weekly-analytics

## Integration

- **Shell Layout:** Rendered in shell-desktop-layout.tsx when `isStatsView === true`
- **Toggle:** Controlled by stats toggle button in shell-toolbars.tsx
- **State:** Managed by `isStatsView` state in use-shell-layout.ts
- **Feature Flag:** Gated behind `showStatsViewButton` prototype preference
- **Sidebar Behavior:** Hides left and right sidebars when active, restores on exit

## Data Flow

1. Receives `goals`, `events`, `lifeAreas`, and `weekDates` as props
2. Computes per-goal stats filtered by selected time horizon
3. Aggregates by life area when distribution mode is "life-areas"
4. Builds pie chart data with hex colors from GoalColor tokens
5. Renders visualization and ranked list using shared analytics primitives

## Design Decisions

- Stats computation is inlined via `useMemo` (per prototyping principles)
- Week boundaries come from `weekDates` prop
- Month boundaries computed from current date
- Uses completed hours only (not focused hours)
- Reuses WeeklyAnalyticsItemRow for visual consistency with weekly analytics sidebar

**Total Files:** 3 (main view, pie chart, barrel)
