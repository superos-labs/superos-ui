# Implementation Proposal: Demo Mode with "Load Sample Data" Option

## Summary

Change the demo to start with an empty state (no sample data), and add a dropdown menu item that allows skipping onboarding and loading sample data for a smoother demo experience.

## Current Behavior

1. **Page loads** with `dataSetId = "sample"`, which includes:
   - 4 sample goals with tasks and milestones
   - All essentials available
   - Pre-scheduled calendar events
   
2. **Onboarding detection** in `useShellLayout` checks if `initialGoalsCount === 0` to start onboarding

3. **"Clear sample data"** menu item exists to reset to empty state

## Proposed Changes

### 1. `app/page.tsx` - Start with empty data

```diff
- const [dataSetId, setDataSetId] = React.useState<DataSetId>("sample");
+ const [dataSetId, setDataSetId] = React.useState<DataSetId>("empty");
```

Add a new callback for loading sample data:

```typescript
const handleLoadSampleData = React.useCallback(() => {
  setDataSetId("sample");
}, []);
```

Pass both callbacks to `ShellContent`:

```typescript
<ShellContent
  key={dataSetId}
  dataSetId={dataSetId}
  onClearSampleData={handleClearSampleData}
  onLoadSampleData={handleLoadSampleData}
/>
```

### 2. `lib/fixtures/shell-data.ts` - Create "demo" data set

Create a new data set variant that has goals but no tasks (simulating what a user would create during onboarding):

```typescript
export type DataSetId = "sample" | "empty" | "demo";

// Demo goals - simplified without tasks (as if user just created them in onboarding)
export const DEMO_GOALS: ScheduleGoal[] = SHELL_GOALS.map(goal => ({
  ...goal,
  tasks: [],
  milestones: [],
}));

export const DATA_SETS: Record<DataSetId, DataSet> = {
  sample: { ... },
  empty: { ... },
  demo: {
    essentials: ALL_ESSENTIALS,
    goals: DEMO_GOALS,
    events: [], // No events - user would add these during planning
  },
};
```

### 3. `shell-content.tsx` - Add menu item

Add the new prop and menu item in the dropdown:

```typescript
interface ShellContentComponentProps extends ShellContentProps {
  // ...existing props
  onLoadSampleData?: () => void;
}
```

In the desktop toolbar dropdown menu, add after the "Edit blueprint" section:

```tsx
{onLoadSampleData && (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onLoadSampleData}>
      <RiMagicLine className="size-4" />
      Load demo data
    </DropdownMenuItem>
  </>
)}
```

### 4. `use-shell-layout.ts` - Add method to skip onboarding

Add a handler that can be called to skip onboarding programmatically:

```typescript
const skipOnboarding = React.useCallback(() => {
  setOnboardingStep(null);
  setShowPlanWeekPrompt(false); // Don't show prompt since they loaded demo data
}, []);
```

### 5. Integration in `app/page.tsx`

The `onLoadSampleData` callback needs to:
1. Switch to the demo data set
2. Skip onboarding

Since the component re-mounts with `key={dataSetId}`, we need to handle this differently. The simplest approach is to create a "demo" data set that:
- Has goals (without tasks)
- Has essentials configured
- Has no events (empty calendar)
- Starts with `initialGoalsCount > 0` so onboarding doesn't trigger

## Recommended Approach

The cleanest solution is:

1. **Create a "demo" data set** with goals but no tasks/events
2. **Start with "empty" data set** (triggers onboarding)
3. **"Load demo data" menu item** switches to "demo" data set
4. **The re-mount with goals** will cause `initialGoalsCount > 0`, skipping onboarding

This requires minimal changes:

| File | Change |
|------|--------|
| `lib/fixtures/shell-data.ts` | Add "demo" DataSetId and DEMO_GOALS |
| `app/page.tsx` | Default to "empty", add `onLoadSampleData` |
| `components/shell/shell-types.ts` | Add `onLoadSampleData` optional prop |
| `components/shell/shell-content.tsx` | Add menu item |

## Task List

1. [ ] Update `lib/fixtures/shell-data.ts` - add "demo" data set
2. [ ] Update `components/shell/shell-types.ts` - add `onLoadSampleData` prop
3. [ ] Update `components/shell/shell-content.tsx` - add menu item to both mobile and desktop toolbars
4. [ ] Update `app/page.tsx` - change default to "empty", add handler, pass prop
5. [ ] Test the flow

## Questions

1. Should the "Load demo data" option be visible during onboarding, or only after the user has started?
   - **Recommendation**: Show it always (in the settings menu) so users can quickly skip to a populated state

2. Should the demo goals include tasks, or be empty?
   - User specified "without tasks" - so goals only, no tasks

3. Should essentials be pre-configured in the demo data?
   - **Recommendation**: Yes, so the user gets a complete experience

4. Should we show the "Plan week" prompt after loading demo data?
   - **Recommendation**: No, let the user explore freely
