"use client";

/**
 * ShellContent - The core shell component for orchestrating the full application UI.
 *
 * This is a thin orchestrator that:
 * 1. Accepts all business data and handlers via props
 * 2. Wires together all sub-hooks via useShellWiring
 * 3. Delegates rendering to layout-specific components
 * 4. Manages local UI state (modals, keyboard shortcuts)
 *
 * Responsive behavior:
 * - Mobile/Tablet Portrait: Day view, bottom sheet, full-screen overlay (ShellMobileLayout)
 * - Tablet Landscape: Week view, bottom sheet, full-screen overlay (ShellMobileLayout)
 * - Desktop: Week view, inline sidebars (ShellDesktopLayout)
 */

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
    goalHandlers,
    showIntegrationsSidebar,
    handleIntegrationsToggle,
    handleZoomIn,
    handleZoomOut,
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
    setShowRightSidebar,
    isPlanning,
    isBlueprintEditMode,
    isOnboardingBlueprint,
    isOnboarding,
    isOnboardingGoalsCentered,
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
  const handleOpenLifeAreaCreator = React.useCallback(
    (goalId?: string) => {
      if (goalId) setLifeAreaCreatorForGoalId(goalId);
      setShowLifeAreaCreator(true);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <Shell>
        {/* Dev skip button - top-right during onboarding goals step */}
        {isOnboardingGoalsCentered &&
          process.env.NODE_ENV === "development" &&
          shellProps.onSkipOnboarding && (
            <button
              onClick={shellProps.onSkipOnboarding}
              className="absolute right-6 top-6 z-50 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              Skip onboarding (Dev)
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
