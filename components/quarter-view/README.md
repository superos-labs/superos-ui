# Quarter View

Read-only, orientation-focused planning surface showing how goals and milestones are paced across the current quarter.

## Purpose

Displays three month columns (like day columns in the week view). Each column shows a time-distribution section (stacked bar + ranked list with a Goals / Life Areas toggle) followed by milestones due that month. Completed milestones visually recede; upcoming milestones remain descriptive. No editing, scheduling, or task-level detail.

## Files

| File | Purpose |
|------|---------|
| `quarter-view.tsx` | Main component — computes per-month per-goal stats from events, renders 3-column layout |
| `quarter-month-column.tsx` | Single month column with distribution bar/list + milestone list |
| `index.ts` | Barrel export |

**Total Files: 3**

## Column Structure

Each month column contains:
1. **Month header** — label + total completed/planned hours, highlighted if current month
2. **Distribution section** — stacked color bar + ranked list showing completed hours and percentage per goal (or per life area via toggle)
3. **Milestone list** — milestones due that month with date pills, completed ones visually recede

## Key Decisions

- **Three-column layout** mirrors the week view's day-column pattern at month granularity.
- **Distribution matches DistributionSection** from the planning budget sidebar — same Goals / Life Areas toggle, stacked bar, and ranked list pattern.
- **Uses `allEvents` (unfiltered)** — not the week-scoped `filteredEvents` — so all months show accurate data.
- **Current quarter only** (v1) — no past/future navigation.
- **Desktop only** — entry point hidden on mobile.
- **Undated milestones omitted** — milestones without deadlines have no position.
- **Milestones sorted by deadline** (earliest first) within each column.
- **Data computation inlined** via `useMemo` (per prototyping principles).

## Integration

Rendered in the center panel of `ShellDesktopLayout` when `isQuarterView` is true. Toggled via a toolbar button. Clicking a goal or milestone navigates to the existing Goal Detail view.
