# Weekly Analytics Component System

**Purpose:** Analytics and visualization components for tracking weekly progress, time allocation, and planning budgets to help users understand their time usage and execution quality.

## Core Components

### Weekly Analytics
- **`weekly-analytics.tsx`** — Weekly progress analytics card for goals
  - Shows how much of planned goal time has been completed
  - Displays aggregate and per-goal progress with ranked rows and lightweight progress bars
  - Supports viewing by individual goals or aggregated by life areas
  - Designed to support fast reflection on weekly execution quality
  - Defines WeeklyAnalytics data types
  - Computes progress percentages from planned vs completed hours
  - Renders title bar with icon and close button for dismissing the analytics panel
  - Renders optional summary header with unified progress and distribution
  - Renders ranked list of goals or life areas with per-item progress
  - Supports toggling between "Goals" and "Life Areas" distribution modes
  - Aggregates goal data by life area when in life-areas mode
  - Coordinates hover state between distribution bar and rows
  - Items with no planned hours are visually muted and listed last
  - Distribution bar segments represent contribution to total completed time, scaled against total planned hours
  - Over-100% progress is clamped
  - Goals/Life Areas toggle positioned above list for visual association
  - Title bar icon (RiPieChartLine) matches the analytics toggle in toolbar
  - Title bar and close button match IntegrationsSidebar pattern

### Planning Budget
- **`planning-budget.tsx`** — Weekly Planning Budget card
  - Presents high-level breakdown of user's 168 weekly hours into: Sleep, Essentials, Scheduled goal time, Unallocated time
  - Helps users understand how much time they truly have for goals and whether current plan fits within budget
  - Defines core PlanningBudget data types (goals, essentials)
  - Calculates sleep hours from wake/wind-down times
  - Computes available hours, scheduled hours, and remaining budget
  - Renders waterfall-style breakdown of weekly time
  - Shows remaining goal time and over-budget state
  - Delegates detailed breakdown to DistributionSection
  - Uses fixed 168h weekly baseline
  - Over-budget states are visually emphasized
  - Distribution can be viewed by Goals or Life Areas

### Distribution Visualization
- **`planning-budget-distribution.tsx`** — Visualizes how scheduled weekly hours are distributed across Goals or Life Areas
  - Combines stacked distribution bar with ranked list of items showing absolute hours and percentage of total scheduled time
  - Used within Planning Budget experience to help users assess whether time allocation reflects priorities
  - Aggregates scheduled goal hours into goal-level and life-area-level buckets
  - Renders stacked horizontal bar representing proportional distribution
  - Renders sortable list of items with hours and percentages
  - Provides toggle between "Goals" and "Life Areas" views
  - Coordinates hover state between bar segments and list rows
  - Zero-hour items filtered out to reduce visual noise
  - Items sorted by descending hours for quick scanning
  - Uses goal/life-area color as primary visual encoding
  - If no scheduled hours exist, section renders nothing

### Example/Playground Components
- **`weekly-analytics-example.tsx`** — Playground example for the WeeklyAnalytics component
  - Provides sample goal analytics data and minimal set of knobs to toggle high-level presentation states
  - Intended for internal development, visual QA, and design iteration
  - Defines representative WeeklyAnalyticsItem sample data
  - Manages local state for demo-only toggles
  - Renders WeeklyAnalytics inside knobs playground
  - Uses Remix Icons to mirror real app icon usage

- **`planning-budget-example.tsx`** — Playground example for the PlanningBudget component
  - Provides representative sample goals, essentials, and sleep configuration
  - Interactive knobs to simulate different weekly planning scenarios
  - Intended for internal development, design iteration, and visual QA
  - Defines sample PlanningBudgetGoal and PlanningBudgetEssential data
  - Manages local state for simulated scheduled hours and sleep settings
  - Renders PlanningBudget with controllable inputs
  - Exposes knobs for real-time parameter tweaking
  - Knobs grouped by concern (sleep, then goals)

### Public API
- **`index.ts`** — Public API for the Weekly Analytics component
  - Re-exports WeeklyAnalytics components and types
  - Re-exports PlanningBudget components and types
  - Single entry point for analytics imports

## Key Features

- **Progress Tracking:** Shows planned vs completed hours with progress percentages
- **Goals/Life Areas Toggle:** Switch between viewing by individual goals or aggregated by life area
- **Life Area Aggregation:** Automatically groups goals by life area for higher-level view
- **Time Budget:** Breaks down 168 weekly hours into sleep, essentials, goals, and unallocated time
- **Distribution Visualization:** Stacked bar chart showing time distribution across goals or life areas
- **Ranked Lists:** Goals sorted by hours for quick scanning
- **Hover Coordination:** Interactive hover states between distribution bars and list rows
- **Over-Budget Detection:** Visual emphasis when scheduled time exceeds available budget
- **Closeable Panel:** Title bar with icon and close button to dismiss analytics panel
- **Visual Encoding:** Uses goal/life-area colors for visual consistency

## Design Principles

- **Visual Clarity:** Clear visual encoding using colors and progress bars
- **Quick Scanning:** Ranked lists and sorted items for fast comprehension
- **Interactive Feedback:** Hover states coordinate between visualizations
- **Progressive Disclosure:** Optional summary header with detailed breakdown below
- **Visual Hierarchy:** Muted items with no planned hours listed last
- **Budget Awareness:** Clear indication of over-budget states
- **Fixed Baseline:** Uses 168-hour weekly baseline for consistency
- **Filtered Display:** Zero-hour items filtered to reduce visual noise

## Usage Patterns

1. **Weekly Progress:** WeeklyAnalytics shows how well goals were executed during the week
2. **Planning Budget:** PlanningBudget helps users understand time constraints before planning
3. **Distribution Analysis:** DistributionSection shows where scheduled time is allocated
4. **Goal vs Life Area:** Toggle between viewing by individual goals or life area groupings
5. **Budget Awareness:** Visual feedback when scheduled time exceeds available budget

## Integration Points

- **Unified Schedule:** Uses goal stats and schedule data from unified schedule domain
- **Planning Flow:** PlanningBudget integrated into weekly planning flow
- **Shell:** Analytics components used in shell right panel
- **Color System:** Uses goal and life area colors for visual encoding
- **Time Utils:** Uses time formatting utilities for hour display

**Total Files:** 6 (3 main component files, 2 example files, 1 public API)
