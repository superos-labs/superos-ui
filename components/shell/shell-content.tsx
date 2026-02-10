/**
 * =============================================================================
 * File: shell-content.tsx
 * =============================================================================
 *
 * Core shell composition root for SuperOS.
 *
 * Orchestrates the entire authenticated application UI by:
 * - Wiring domain props into shell-level orchestration hooks
 * - Selecting appropriate layout (desktop vs mobile)
 * - Rendering top-level toolbars, layouts, modals, toasts, and overlays
 *
 * This component is intentionally large.
 * It acts as a UI composition and interaction orchestrator, not a business
 * logic owner.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Invoke useShellWiring to derive shell orchestration state.
 * - Choose and render the correct toolbar variant.
 * - Choose and render desktop or mobile layout.
 * - Host global modals (keyboard shortcuts, life area modals).
 * - Host global overlays (backlog overlay, drag ghost, toasts).
 * - Bridge layout changes to external consumers (onLayoutChange).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or persisting domain data.
 * - Implementing goal, task, block, or blueprint business rules.
 * - Owning focus session lifecycle.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - All domain mutations flow through props.
 * - Visual and ephemeral UI state is local.
 * - Side effects are centralized inside hooks.
 * - Desktop-first with mobile overlays and fallbacks.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ShellContentComponent
 * - ShellContentComponentProps
 * - ShellContentProps (re-export)
 */

"use client";

import * as React from "react";
import { Shell } from "@/components/ui/shell";
import { KeyboardShortcuts } from "@/components/ui";
import { UndoToast, SimpleToast } from "@/components/ui";
import { DragGhost } from "@/components/drag";
import type { InspirationCategory } from "@/components/backlog";
import {
  LifeAreaCreatorModal,
  LifeAreaManagerModal,
} from "@/components/settings";
import type { ShellContentProps } from "./shell-types";
import { useShellWiring } from "./use-shell-wiring";
import { ShellDesktopLayout } from "./shell-desktop-layout";
import { ShellMobileLayout } from "./shell-mobile-layout";
import {
  ShellMobileToolbar,
  ShellDesktopToolbar,
  BlueprintEditToolbar,
  OnboardingBlueprintToolbar,
} from "./shell-toolbars";

// Re-export for consumers
export type { ShellContentProps };

// =============================================================================
// Component Props
// =============================================================================

export interface ShellContentComponentProps extends ShellContentProps {
  /** Categories for goal inspiration gallery */
  inspirationCategories?: InspirationCategory[];
  /** Callback when UI layout changes (for persistence) */
  onLayoutChange?: (layout: {
    showSidebar: boolean;
    showRightSidebar: boolean;
  }) => void;
}

// =============================================================================
// Component
// =============================================================================

export function ShellContentComponent({
  inspirationCategories,
  onLayoutChange,
  ...shellProps
}: ShellContentComponentProps) {
  // ---------------------------------------------------------------------------
  // Hook Wiring (all state orchestration)
  // ---------------------------------------------------------------------------
  const wiring = useShellWiring(shellProps);
  const {
    useMobileLayout,
    shouldShowWeekView,
    layout,
    handleTodayClick,
    mobileNav,
    focus,
    blueprintHandlers,
    showIntegrationsSidebar,
    handleIntegrationsToggle,
    selectedEvent,
    undoContext,
    undoLastCommand,
    showUndoActionToast,
    simpleToastMessage,
  } = wiring;

  const {
    showPlanWeek,
    showSidebar,
    setShowSidebar,
    showRightSidebar,
    isPlanning,
    isBlueprintEditMode,
    isOnboardingBlueprint,
    isOnboarding,
    isOnboardingGoalsCentered,
    isQuarterView,
    handleQuarterViewToggle,
    handlePlanWeekClick,
    handleAnalyticsToggle,
  } = layout;

  // ---------------------------------------------------------------------------
  // Local UI State (modals, overlays, toggles)
  // ---------------------------------------------------------------------------
  const [showBacklogOverlay, setShowBacklogOverlay] = React.useState(false);
  const [isEssentialsHidden, setIsEssentialsHidden] = React.useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] =
    React.useState(false);
  const [showLifeAreaCreator, setShowLifeAreaCreator] = React.useState(false);
  const [showLifeAreaManager, setShowLifeAreaManager] = React.useState(false);
  const [lifeAreaCreatorForGoalId, setLifeAreaCreatorForGoalId] =
    React.useState<string | null>(null);

  // Global ? key to open keyboard shortcuts
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("contenteditable") === "true"
      ) {
        return;
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Life area creator handler (used by desktop layout)
  const handleOpenLifeAreaCreator = React.useCallback((goalId?: string) => {
    if (goalId) setLifeAreaCreatorForGoalId(goalId);
    setShowLifeAreaCreator(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <Shell>
        {/* Skip onboarding button - top-right during onboarding goals step */}
        {isOnboardingGoalsCentered && shellProps.onSkipOnboarding && (
          <button
            onClick={shellProps.onSkipOnboarding}
            className="absolute right-6 top-6 z-50 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            Skip onboarding
          </button>
        )}

        {/* Toolbars */}
        {!isOnboardingGoalsCentered &&
          (useMobileLayout ? (
            <ShellMobileToolbar
              onOpenBacklog={() => setShowBacklogOverlay(true)}
              shouldShowWeekView={shouldShowWeekView}
              onPreviousWeek={shellProps.onPreviousWeek}
              onNextWeek={shellProps.onNextWeek}
              onPreviousDay={mobileNav.handleMobilePreviousDay}
              onNextDay={mobileNav.handleMobileNextDay}
              onToday={handleTodayClick}
              focusSession={shellProps.focusSession}
              focusElapsedMs={shellProps.focusElapsedMs}
              focusIsRunning={shellProps.focusIsRunning}
              onPauseFocus={shellProps.onPauseFocus}
              onResumeFocus={shellProps.onResumeFocus}
              onNavigateToFocusedBlock={focus.handleNavigateToFocusedBlock}
              weekStartsOn={shellProps.weekStartsOn}
              onWeekStartsOnChange={shellProps.onWeekStartsOnChange}
              isEssentialsHidden={isEssentialsHidden}
              onShowEssentials={() => setIsEssentialsHidden(false)}
              onOpenLifeAreaManager={() => setShowLifeAreaManager(true)}
              onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
            />
          ) : isOnboardingBlueprint ? (
            <OnboardingBlueprintToolbar />
          ) : isBlueprintEditMode ? (
            <BlueprintEditToolbar
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              onCancel={blueprintHandlers.handleCancelBlueprintEdit}
              onSave={blueprintHandlers.handleSaveBlueprintEdit}
            />
          ) : (
            <ShellDesktopToolbar
              isOnboarding={isOnboarding}
              isPlanning={isPlanning}
              isBlueprintEditMode={isBlueprintEditMode}
              isOnboardingBlueprint={isOnboardingBlueprint}
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              isEssentialsHidden={isEssentialsHidden}
              onShowEssentials={() => setIsEssentialsHidden(false)}
              isQuarterView={isQuarterView}
              onQuarterViewToggle={handleQuarterViewToggle}
              onPreviousWeek={shellProps.onPreviousWeek}
              onNextWeek={shellProps.onNextWeek}
              onToday={handleTodayClick}
              showFocusIndicator={focus.showFocusIndicator}
              focusSession={shellProps.focusSession}
              focusElapsedMs={shellProps.focusElapsedMs}
              focusIsRunning={shellProps.focusIsRunning}
              onPauseFocus={shellProps.onPauseFocus}
              onResumeFocus={shellProps.onResumeFocus}
              onNavigateToFocusedBlock={focus.handleNavigateToFocusedBlock}
              showPlanWeek={showPlanWeek}
              currentWeekPlan={shellProps.currentWeekPlan}
              onPlanWeek={handlePlanWeekClick}
              showIntegrationsSidebar={showIntegrationsSidebar}
              onToggleIntegrations={handleIntegrationsToggle}
              showRightSidebar={showRightSidebar}
              selectedEvent={selectedEvent}
              onToggleAnalytics={handleAnalyticsToggle}
              weekStartsOn={shellProps.weekStartsOn}
              onWeekStartsOnChange={shellProps.onWeekStartsOnChange}
              hasBlueprint={shellProps.hasBlueprint}
              onEditBlueprint={blueprintHandlers.handleEnterBlueprintEdit}
              onOpenLifeAreaManager={() => setShowLifeAreaManager(true)}
              onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
            />
          ))}

        {/* Main Content Area */}
        {useMobileLayout ? (
          <ShellMobileLayout
            shellProps={shellProps}
            wiring={wiring}
            shouldShowWeekView={shouldShowWeekView}
            showBacklogOverlay={showBacklogOverlay}
            onCloseBacklogOverlay={() => setShowBacklogOverlay(false)}
            isEssentialsHidden={isEssentialsHidden}
            onEssentialsHide={() => setIsEssentialsHidden(true)}
          />
        ) : (
          <ShellDesktopLayout
            shellProps={shellProps}
            wiring={wiring}
            isEssentialsHidden={isEssentialsHidden}
            onEssentialsHide={() => setIsEssentialsHidden(true)}
            onOpenLifeAreaCreator={handleOpenLifeAreaCreator}
            inspirationCategories={inspirationCategories}
          />
        )}
      </Shell>

      {/* Desktop-only: Toast and Drag Ghost */}
      {!useMobileLayout && (
        <React.Fragment key="desktop-extras">
          {showUndoActionToast && undoLastCommand ? (
            <UndoToast
              message={undoLastCommand.description}
              onUndo={() => {
                undoContext?.undo();
              }}
              onDismiss={() => undoContext?.clearLastCommand()}
            />
          ) : (
            <SimpleToast message={simpleToastMessage} />
          )}
          <DragGhost />
        </React.Fragment>
      )}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Life area creator modal */}
      <LifeAreaCreatorModal
        open={showLifeAreaCreator}
        onClose={() => {
          setShowLifeAreaCreator(false);
          setLifeAreaCreatorForGoalId(null);
        }}
        goalIcons={shellProps.goalIcons}
        existingLifeAreas={shellProps.lifeAreas}
        onCreateLifeArea={(data) => {
          const newLifeAreaId = shellProps.onAddLifeArea(data);
          if (newLifeAreaId && lifeAreaCreatorForGoalId) {
            shellProps.onUpdateGoal(lifeAreaCreatorForGoalId, {
              lifeAreaId: newLifeAreaId,
            });
          }
          setLifeAreaCreatorForGoalId(null);
        }}
      />

      {/* Life area manager modal */}
      <LifeAreaManagerModal
        open={showLifeAreaManager}
        onClose={() => setShowLifeAreaManager(false)}
        customLifeAreas={shellProps.customLifeAreas}
        goalIcons={shellProps.goalIcons}
        goals={shellProps.goals}
        onAddLifeArea={shellProps.onAddLifeArea}
        onUpdateLifeArea={shellProps.onUpdateLifeArea}
        onRemoveLifeArea={shellProps.onRemoveLifeArea}
      />
    </>
  );
}
