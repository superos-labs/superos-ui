/**
 * =============================================================================
 * File: shell-right-panel.tsx
 * =============================================================================
 *
 * Right sidebar content renderer for the desktop shell layout.
 *
 * Conditionally renders one of:
 * - Integrations sidebar
 * - Block details sidebar
 * - Analytics (weekly analytics or planning budget)
 *
 * Acts as a thin composition layer between shell wiring state and the
 * concrete sidebar feature components.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Select which right-panel experience to render based on layout state.
 * - Pass domain data and handlers to the chosen sidebar.
 * - Bridge focus session controls into block sidebar.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or persisting data.
 * - Implementing block, analytics, or integration business logic.
 * - Managing shell orchestration state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Width is fixed to match desktop layout expectations.
 * - Panel contents scroll independently from main layout.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ShellRightPanel
 * - ShellRightPanelProps
 */

"use client";

/**
 * ShellRightPanel - Right sidebar content for the desktop layout.
 *
 * Renders one of: IntegrationsSidebar, BlockSidebar, or Analytics
 * (WeeklyAnalytics or PlanningBudget depending on mode).
 */

import { formatWeekRange } from "@/components/calendar";
import { WeeklyAnalytics, PlanningBudget } from "@/components/weekly-analytics";
import { BlockSidebar } from "@/components/block";
import { IntegrationsSidebar } from "@/components/integrations";
import { UpcomingDeadlinesCard } from "@/components/weekly-planning";
import type { ShellContentProps } from "./shell-types";
import type { ShellWiring } from "./use-shell-wiring";

// =============================================================================
// Props
// =============================================================================

export interface ShellRightPanelProps {
  shellProps: ShellContentProps;
  wiring: ShellWiring;
}

// =============================================================================
// Component
// =============================================================================

export function ShellRightPanel({ shellProps, wiring }: ShellRightPanelProps) {
  const {
    goals,
    events,
    weekDates,
    quarterDeadlines,
    focusSession,
    focusIsRunning,
    focusElapsedMs,
    onPauseFocus,
    onResumeFocus,
    onEndFocus,
    onUpdateEvent,
    progressMetric,
    onProgressMetricChange,
    dayStartMinutes,
    dayEndMinutes,
    dayBoundariesEnabled,
    lifeAreas,
    calendarIntegrations,
    integrationsSidebar,
    onConnectProvider,
    onDisconnectProvider,
    onToggleImportEnabled,
    onToggleCalendarImport,
    onToggleMeetingsOnly,
    onToggleCalendarExport,
    onToggleExportEnabled,
    onSetExportParticipation,
    onSetExportGoalFilter,
    onSetExportDefaultAppearance,
    onSetExportCustomLabel,
  } = shellProps;

  const {
    layout,
    sidebarDataToRender,
    sidebarHandlers,
    availableGoals,
    syncState,
    blockSyncSettings,
    selectedEvent,
    focus,
    analyticsGoals,
    planningBudgetData,
  } = wiring;

  const {
    renderedContent,
    isPlanning,
    isOnboardingBlueprint,
    handleCloseSidebar,
  } = layout;

  if (renderedContent === "integrations") {
    return (
      <IntegrationsSidebar
        integrationStates={calendarIntegrations}
        currentView={integrationsSidebar.currentView}
        availableGoals={goals}
        onClose={integrationsSidebar.close}
        onNavigateToProvider={integrationsSidebar.navigateToProvider}
        onNavigateToList={integrationsSidebar.navigateToList}
        onConnectProvider={onConnectProvider}
        onDisconnectProvider={onDisconnectProvider}
        onToggleImportEnabled={onToggleImportEnabled}
        onToggleCalendarImport={onToggleCalendarImport}
        onToggleMeetingsOnly={onToggleMeetingsOnly}
        onToggleCalendarExport={onToggleCalendarExport}
        onToggleExportEnabled={onToggleExportEnabled}
        onSetExportParticipation={onSetExportParticipation}
        onSetExportGoalFilter={onSetExportGoalFilter}
        onSetExportDefaultAppearance={onSetExportDefaultAppearance}
        onSetExportCustomLabel={onSetExportCustomLabel}
        className="h-full w-[380px] max-w-none overflow-y-auto"
      />
    );
  }

  if (renderedContent === "block" && sidebarDataToRender) {
    return (
      <BlockSidebar
        block={sidebarDataToRender.block}
        availableGoalTasks={sidebarDataToRender.availableGoalTasks}
        availableGoals={availableGoals}
        onClose={handleCloseSidebar}
        {...sidebarHandlers}
        isFocused={focus.isSidebarBlockFocused}
        focusIsRunning={focusIsRunning}
        focusElapsedMs={focusElapsedMs}
        onStartFocus={focus.handleStartFocus}
        onPauseFocus={onPauseFocus}
        onResumeFocus={onResumeFocus}
        onEndFocus={onEndFocus}
        focusDisabled={focusSession !== null && !focus.isSidebarBlockFocused}
        totalFocusedMinutes={
          selectedEvent?.blockType !== "essential"
            ? (selectedEvent?.focusedMinutes ?? 0)
            : undefined
        }
        onFocusedMinutesChange={
          selectedEvent?.blockType !== "essential" && selectedEvent
            ? (minutes) =>
                onUpdateEvent(selectedEvent.id, { focusedMinutes: minutes })
            : undefined
        }
        syncState={syncState}
        blockSyncSettings={blockSyncSettings}
        // AI Briefing context
        selectedEvent={selectedEvent ?? undefined}
        weekEvents={events}
        weekDates={weekDates}
        sourceGoal={
          selectedEvent?.sourceGoalId
            ? goals.find((g) => g.id === selectedEvent.sourceGoalId)
            : undefined
        }
        className="h-full w-[380px] max-w-none overflow-y-auto"
      />
    );
  }

  if (renderedContent === "analytics") {
    if (isPlanning || isOnboardingBlueprint) {
      return (
        <div className="flex h-full w-[380px] max-w-none flex-col gap-4 overflow-y-auto">
          <PlanningBudget
            goals={planningBudgetData.goals}
            essentials={planningBudgetData.essentials}
            wakeUpMinutes={dayStartMinutes}
            windDownMinutes={dayEndMinutes}
            isSleepConfigured={dayBoundariesEnabled}
            weekLabel={
              isOnboardingBlueprint
                ? "Your typical week"
                : formatWeekRange(weekDates)
            }
            lifeAreas={lifeAreas}
          />
          {isPlanning &&
            !isOnboardingBlueprint &&
            quarterDeadlines.length > 0 && (
              <UpcomingDeadlinesCard
                deadlines={quarterDeadlines}
                weekStartDate={weekDates[0]}
              />
            )}
        </div>
      );
    }

    return (
      <WeeklyAnalytics
        goals={analyticsGoals}
        weekLabel={formatWeekRange(weekDates)}
        progressMetric={progressMetric}
        onProgressMetricChange={onProgressMetricChange}
        className="h-full w-[380px] max-w-none overflow-y-auto"
      />
    );
  }

  return null;
}
