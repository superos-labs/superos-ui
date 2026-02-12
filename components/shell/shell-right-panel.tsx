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
 * (WeeklyAnalytics, PlanningBudget, or WeeklyReport depending on mode).
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatWeekRange } from "@/components/calendar";
import {
  WeeklyAnalytics,
  PlanningBudget,
  WeeklyReport,
} from "@/components/weekly-analytics";
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

type AnalyticsView = "analytics" | "report";

export function ShellRightPanel({ shellProps, wiring }: ShellRightPanelProps) {
  // Toggle between regular analytics and the weekly report (for design review)
  const [analyticsView, setAnalyticsView] = React.useState<AnalyticsView>("analytics");
  // Toggle between locked/unlocked report state (for design review)
  const [isReportUnlocked, setIsReportUnlocked] = React.useState(false);

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
    handleAnalyticsToggle,
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
      <div className="flex h-full w-[380px] max-w-none flex-col overflow-y-auto">
        {/* View toggle — Analytics ↔ Report */}
        <div className="flex shrink-0 items-center gap-1 border-b border-border/40 bg-background px-3 py-2">
          <div className="flex flex-1 rounded-md bg-muted p-0.5">
            <button
              onClick={() => setAnalyticsView("analytics")}
              className={cn(
                "flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                analyticsView === "analytics"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Analytics
            </button>
            <button
              onClick={() => setAnalyticsView("report")}
              className={cn(
                "flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                analyticsView === "report"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Weekly Report
            </button>
          </div>
        </div>

        {analyticsView === "analytics" ? (
          <WeeklyAnalytics
            goals={analyticsGoals}
            lifeAreas={lifeAreas}
            weekLabel={formatWeekRange(weekDates)}
            onClose={handleAnalyticsToggle}
            className="flex-1 border-0 shadow-none rounded-none"
          />
        ) : (
          <div className="flex flex-1 flex-col">
            <WeeklyReport
              isUnlocked={isReportUnlocked}
              weekLabel={formatWeekRange(weekDates)}
              onClose={handleAnalyticsToggle}
              className="flex-1 border-0 shadow-none rounded-none"
            />
            {/* Design review: locked/unlocked toggle */}
            <div className="shrink-0 border-t border-border/40 px-3 py-2">
              <button
                onClick={() => setIsReportUnlocked((prev) => !prev)}
                className={cn(
                  "w-full rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                  "border border-dashed border-border/60 text-muted-foreground",
                  "hover:bg-muted hover:text-foreground"
                )}
              >
                Design preview: switch to{" "}
                {isReportUnlocked ? "locked" : "unlocked"} state
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
