"use client";

/**
 * useShellLayout - UI visibility and panel state management for the Shell.
 *
 * This hook manages the visibility of various panels (calendar, sidebar, etc.),
 * mode state (backlog mode, planning mode), selection state, and sidebar content.
 * Also manages the onboarding flow for first-time users.
 */

import * as React from "react";
import type { CalendarEvent } from "@/components/calendar";
import type { BacklogMode } from "@/components/backlog";
import type { UseBlockSidebarHandlersReturn } from "@/components/block";

// =============================================================================
// Types
// =============================================================================

/** Onboarding step for first-time user experience */
export type OnboardingStep = "goals" | "essentials" | null;

export interface UseShellLayoutOptions {
  /** Callback when an event is created (to auto-select it) */
  onEventCreated?: (event: CalendarEvent) => void;
  /** Initial goals count - used to determine if onboarding should start */
  initialGoalsCount?: number;
}

export interface UseShellLayoutReturn {
  // Visibility toggles
  showPlanWeek: boolean;
  setShowPlanWeek: React.Dispatch<React.SetStateAction<boolean>>;
  showCalendar: boolean;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showRightSidebar: boolean;
  setShowRightSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showTasks: boolean;
  setShowTasks: React.Dispatch<React.SetStateAction<boolean>>;
  showInspirationGallery: boolean;
  setShowInspirationGallery: React.Dispatch<React.SetStateAction<boolean>>;

  // Mode state
  backlogMode: BacklogMode;
  setBacklogMode: React.Dispatch<React.SetStateAction<BacklogMode>>;

  // Planning mode
  isPlanningMode: boolean;
  setIsPlanningMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Onboarding state
  onboardingStep: OnboardingStep;
  isOnboarding: boolean;
  onContinueFromGoals: () => void;
  onCompleteOnboarding: () => void;

  // Plan week prompt (shown after onboarding completes)
  showPlanWeekPrompt: boolean;
  onDismissPlanWeekPrompt: () => void;
  onStartPlanningFromPrompt: () => void;

  // Selection state
  selectedEventId: string | null;
  setSelectedEventId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedGoalId: string | null;
  setSelectedGoalId: React.Dispatch<React.SetStateAction<string | null>>;

  // Goal notes (local state for demo)
  goalNotes: Record<string, string>;
  setGoalNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  // Right sidebar content management
  renderedContent: "block" | "analytics" | null;
  frozenSidebarData: UseBlockSidebarHandlersReturn["sidebarData"];
  isRightSidebarOpen: boolean;
  updateFrozenSidebarData: (
    data: UseBlockSidebarHandlersReturn["sidebarData"],
  ) => void;

  // Computed values
  isPlanning: boolean;
  isGoalDetailMode: boolean;

  // Handlers
  handleEventClick: (event: CalendarEvent) => void;
  handleCloseSidebar: () => void;
  handleSelectGoal: (goalId: string) => void;
  handleCloseGoalDetail: () => void;
  handleBrowseInspiration: () => void;
  handleCloseInspiration: () => void;
  handlePlanWeekClick: () => void;
  handleGoalNotesChange: (notes: string) => void;
  handleAnalyticsToggle: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useShellLayout(
  options: UseShellLayoutOptions = {},
): UseShellLayoutReturn {
  const { initialGoalsCount = 0 } = options;

  // -------------------------------------------------------------------------
  // UI Visibility State
  // -------------------------------------------------------------------------
  const [showPlanWeek, setShowPlanWeek] = React.useState(true);
  const [showCalendar, setShowCalendar] = React.useState(true);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [showRightSidebar, setShowRightSidebar] = React.useState(false);
  const [showTasks, setShowTasks] = React.useState(true);
  const [showInspirationGallery, setShowInspirationGallery] =
    React.useState(false);

  // -------------------------------------------------------------------------
  // Onboarding State
  // -------------------------------------------------------------------------
  // Start onboarding if user has no goals (first-time experience)
  const [onboardingStep, setOnboardingStep] = React.useState<OnboardingStep>(
    () => (initialGoalsCount === 0 ? "goals" : null),
  );

  const isOnboarding = onboardingStep !== null;

  // Plan week prompt - shown after onboarding completes
  const [showPlanWeekPrompt, setShowPlanWeekPrompt] = React.useState(false);

  // -------------------------------------------------------------------------
  // Mode State
  // -------------------------------------------------------------------------
  const [backlogMode, setBacklogMode] = React.useState<BacklogMode>("view");
  const [isPlanningMode, setIsPlanningMode] = React.useState(false);

  // -------------------------------------------------------------------------
  // Selection State
  // -------------------------------------------------------------------------
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null,
  );
  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(
    null,
  );

  // -------------------------------------------------------------------------
  // Onboarding Handlers (defined after state they depend on)
  // -------------------------------------------------------------------------
  // Handler to advance from goals step to essentials step
  const onContinueFromGoals = React.useCallback(() => {
    setOnboardingStep("essentials");
    // Close inspiration gallery if open
    setShowInspirationGallery(false);
    // Close goal detail view if open
    setSelectedGoalId(null);
    setBacklogMode("view");
  }, []);

  // Handler to complete onboarding (called when essentials Done/Skip is clicked)
  const onCompleteOnboarding = React.useCallback(() => {
    setOnboardingStep(null);
    // Show plan week prompt after onboarding completes
    setShowPlanWeekPrompt(true);
  }, []);

  // Dismiss the plan week prompt without starting planning
  const onDismissPlanWeekPrompt = React.useCallback(() => {
    setShowPlanWeekPrompt(false);
  }, []);

  // Start planning from the prompt (dismisses prompt and enters planning mode)
  const onStartPlanningFromPrompt = React.useCallback(() => {
    setShowPlanWeekPrompt(false);
    setIsPlanningMode(true);
  }, []);

  // -------------------------------------------------------------------------
  // Goal Notes (local state for demo)
  // -------------------------------------------------------------------------
  const [goalNotes, setGoalNotes] = React.useState<Record<string, string>>({});

  // -------------------------------------------------------------------------
  // Right Sidebar Content State
  // -------------------------------------------------------------------------
  const [renderedContent, setRenderedContent] = React.useState<
    "block" | "analytics" | null
  >(null);
  const [frozenSidebarData, setFrozenSidebarData] =
    React.useState<UseBlockSidebarHandlersReturn["sidebarData"]>(null);

  // Compute target content based on selection state
  const targetContent: "block" | "analytics" | null = selectedEventId
    ? "block"
    : showRightSidebar
      ? "analytics"
      : null;

  // Update rendered content when target changes
  React.useEffect(() => {
    if (targetContent !== null) {
      setRenderedContent(targetContent);
    }
  }, [targetContent]);

  const isRightSidebarOpen = targetContent !== null;

  const updateFrozenSidebarData = React.useCallback(
    (data: UseBlockSidebarHandlersReturn["sidebarData"]) => {
      if (data) {
        setFrozenSidebarData(data);
      }
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------
  const isPlanning = isPlanningMode;
  const isGoalDetailMode = backlogMode === "goal-detail";

  // -------------------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------------------
  const handleEventClick = React.useCallback((event: CalendarEvent) => {
    setSelectedEventId(event.id);
  }, []);

  const handleCloseSidebar = React.useCallback(() => {
    setSelectedEventId(null);
  }, []);

  // ESC key to close sidebar
  React.useEffect(() => {
    if (!selectedEventId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEventId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEventId]);

  // -------------------------------------------------------------------------
  // Goal Detail Mode Handlers
  // -------------------------------------------------------------------------
  const handleSelectGoal = React.useCallback((goalId: string) => {
    setSelectedGoalId(goalId);
    setBacklogMode("goal-detail");
    // Close inspiration gallery if open
    setShowInspirationGallery(false);
    // Close any open right sidebar content
    setSelectedEventId(null);
    setShowRightSidebar(false);
  }, []);

  const handleCloseGoalDetail = React.useCallback(() => {
    setSelectedGoalId(null);
    setBacklogMode("view");
  }, []);

  const handleGoalNotesChange = React.useCallback(
    (notes: string) => {
      setGoalNotes((prev) => {
        if (selectedGoalId) {
          return { ...prev, [selectedGoalId]: notes };
        }
        return prev;
      });
    },
    [selectedGoalId],
  );

  // -------------------------------------------------------------------------
  // Inspiration Gallery Handlers
  // -------------------------------------------------------------------------
  const handleBrowseInspiration = React.useCallback(() => {
    setShowInspirationGallery(true);
    // Clear selected goal so nothing appears active in the goal list
    setSelectedGoalId(null);
  }, []);

  const handleCloseInspiration = React.useCallback(() => {
    setShowInspirationGallery(false);
  }, []);

  // -------------------------------------------------------------------------
  // Plan Week Toggle
  // -------------------------------------------------------------------------
  const handlePlanWeekClick = React.useCallback(() => {
    setIsPlanningMode((prev) => !prev);
  }, []);

  // -------------------------------------------------------------------------
  // Analytics Toggle
  // -------------------------------------------------------------------------
  const handleAnalyticsToggle = React.useCallback(() => {
    if (selectedEventId) {
      setSelectedEventId(null);
      setShowRightSidebar(true);
    } else {
      setShowRightSidebar((prev) => !prev);
    }
  }, [selectedEventId]);

  return {
    // Visibility toggles
    showPlanWeek,
    setShowPlanWeek,
    showCalendar,
    setShowCalendar,
    showSidebar,
    setShowSidebar,
    showRightSidebar,
    setShowRightSidebar,
    showTasks,
    setShowTasks,
    showInspirationGallery,
    setShowInspirationGallery,

    // Mode state
    backlogMode,
    setBacklogMode,
    isPlanningMode,
    setIsPlanningMode,

    // Onboarding state
    onboardingStep,
    isOnboarding,
    onContinueFromGoals,
    onCompleteOnboarding,

    // Plan week prompt
    showPlanWeekPrompt,
    onDismissPlanWeekPrompt,
    onStartPlanningFromPrompt,

    // Selection state
    selectedEventId,
    setSelectedEventId,
    selectedGoalId,
    setSelectedGoalId,

    // Goal notes
    goalNotes,
    setGoalNotes,

    // Right sidebar content management
    renderedContent,
    frozenSidebarData,
    isRightSidebarOpen,
    updateFrozenSidebarData,

    // Computed values
    isPlanning,
    isGoalDetailMode,

    // Handlers
    handleEventClick,
    handleCloseSidebar,
    handleSelectGoal,
    handleCloseGoalDetail,
    handleBrowseInspiration,
    handleCloseInspiration,
    handlePlanWeekClick,
    handleGoalNotesChange,
    handleAnalyticsToggle,
  };
}
