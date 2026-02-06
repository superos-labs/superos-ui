/**
 * =============================================================================
 * File: use-goal-handlers.ts
 * =============================================================================
 *
 * Shell hook that encapsulates goal-level creation, selection, and deletion
 * interactions.
 *
 * Bridges backlog UI intents and onboarding flows to the core goal CRUD
 * handlers provided by the shell.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Create goals from backlog and onboarding.
 * - Create and immediately select new goals.
 * - Delete the currently selected goal.
 * - Navigate to goal detail when clicking goal deadlines.
 * - Adapt goals for onboarding goal cards.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting goals.
 * - Validating goal data.
 * - Managing task or milestone logic.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses crypto.randomUUID for client-side goal IDs.
 * - Backlog mode drives whether goal detail is shown.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useGoalHandlers
 * - UseGoalHandlersOptions
 * - UseGoalHandlersReturn
 */

"use client";

import * as React from "react";
import type { ScheduleGoal } from "@/lib/unified-schedule";
import type {
  BacklogMode,
  NewGoalData,
  InlineGoalEditorData,
  AddedGoal,
} from "@/components/backlog";
import type { LifeArea, GoalIconOption } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface UseGoalHandlersOptions {
  /** Current goals */
  goals: ScheduleGoal[];
  /** Available goal icons */
  goalIcons: GoalIconOption[];
  /** Available life areas */
  lifeAreas: LifeArea[];
  /** Add a goal */
  onAddGoal: (goal: ScheduleGoal) => void;
  /** Delete a goal */
  onDeleteGoal: (goalId: string) => void;
  /** Update a goal */
  onUpdateGoal: (goalId: string, updates: Partial<ScheduleGoal>) => void;
  /** Current backlog mode */
  backlogMode: BacklogMode;
  /** Set backlog mode */
  setBacklogMode: (mode: BacklogMode) => void;
  /** Currently selected goal ID */
  selectedGoalId: string | null;
  /** Set selected goal ID */
  setSelectedGoalId: (id: string | null) => void;
  /** Close the inspiration gallery */
  handleCloseInspiration: () => void;
}

export interface UseGoalHandlersReturn {
  /** Create a goal from the backlog "add goal" form */
  handleCreateGoal: (data: NewGoalData) => void;
  /** Create a new goal and immediately select it in goal detail view */
  handleCreateAndSelectGoal: () => void;
  /** Delete the currently selected goal */
  handleDeleteGoal: () => void;
  /** Open goal detail when clicking a goal deadline in the calendar */
  handleGoalDeadlineClick: (goalId: string) => void;
  /** Add a goal during onboarding */
  handleOnboardingAddGoal: (data: InlineGoalEditorData) => void;
  /** Update a goal during onboarding */
  handleOnboardingUpdateGoal: (
    goalId: string,
    data: InlineGoalEditorData,
  ) => void;
  /** Remove a goal during onboarding */
  handleOnboardingRemoveGoal: (goalId: string) => void;
  /** Goals formatted for the OnboardingGoalsCard */
  onboardingGoals: AddedGoal[];
}

// =============================================================================
// Hook
// =============================================================================

export function useGoalHandlers({
  goals,
  goalIcons,
  lifeAreas,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoal,
  backlogMode,
  setBacklogMode,
  selectedGoalId,
  setSelectedGoalId,
  handleCloseInspiration,
}: UseGoalHandlersOptions): UseGoalHandlersReturn {
  // -------------------------------------------------------------------------
  // Goal Creation
  // -------------------------------------------------------------------------

  const handleCreateGoal = React.useCallback(
    (data: NewGoalData) => {
      const newGoalId = crypto.randomUUID();
      onAddGoal({
        id: newGoalId,
        label: data.label,
        icon: data.icon,
        color: data.color,
        lifeAreaId: data.lifeAreaId,
        tasks: [],
      });
      if (backlogMode === "goal-detail") {
        setSelectedGoalId(newGoalId);
      }
    },
    [onAddGoal, backlogMode, setSelectedGoalId],
  );

  const handleCreateAndSelectGoal = React.useCallback(() => {
    const newGoalId = crypto.randomUUID();
    const defaultIcon = goalIcons[0]?.icon;
    const defaultLifeAreaId = lifeAreas[0]?.id ?? "";

    onAddGoal({
      id: newGoalId,
      label: "New goal",
      icon: defaultIcon,
      color: "violet",
      lifeAreaId: defaultLifeAreaId,
      tasks: [],
    });

    // Close inspiration gallery if open
    handleCloseInspiration();
    setBacklogMode("goal-detail");
    setSelectedGoalId(newGoalId);
  }, [
    onAddGoal,
    goalIcons,
    lifeAreas,
    handleCloseInspiration,
    setBacklogMode,
    setSelectedGoalId,
  ]);

  // -------------------------------------------------------------------------
  // Goal Deletion
  // -------------------------------------------------------------------------

  const handleDeleteGoal = React.useCallback(() => {
    if (!selectedGoalId) return;
    onDeleteGoal(selectedGoalId);
    setSelectedGoalId(null);
    setBacklogMode("view");
  }, [selectedGoalId, onDeleteGoal, setSelectedGoalId, setBacklogMode]);

  // -------------------------------------------------------------------------
  // Goal Deadline Click (from calendar)
  // -------------------------------------------------------------------------

  const handleGoalDeadlineClick = React.useCallback(
    (goalId: string) => {
      setSelectedGoalId(goalId);
      setBacklogMode("goal-detail");
    },
    [setSelectedGoalId, setBacklogMode],
  );

  // -------------------------------------------------------------------------
  // Onboarding Goal Handlers
  // -------------------------------------------------------------------------

  const handleOnboardingAddGoal = React.useCallback(
    (data: InlineGoalEditorData) => {
      const newGoalId = crypto.randomUUID();
      onAddGoal({
        id: newGoalId,
        label: data.label,
        icon: data.icon,
        color: data.color,
        lifeAreaId: data.lifeAreaId,
        deadline: data.deadline,
        tasks: [],
      });
    },
    [onAddGoal],
  );

  const handleOnboardingUpdateGoal = React.useCallback(
    (goalId: string, data: InlineGoalEditorData) => {
      onUpdateGoal(goalId, {
        label: data.label,
        icon: data.icon,
        color: data.color,
        lifeAreaId: data.lifeAreaId,
        deadline: data.deadline,
      });
    },
    [onUpdateGoal],
  );

  const handleOnboardingRemoveGoal = React.useCallback(
    (goalId: string) => {
      onDeleteGoal(goalId);
    },
    [onDeleteGoal],
  );

  // Convert goals to AddedGoal format for OnboardingGoalsCard
  const onboardingGoals: AddedGoal[] = React.useMemo(
    () =>
      goals.map((g) => ({
        id: g.id,
        label: g.label,
        icon: g.icon,
        color: g.color,
        lifeAreaId: g.lifeAreaId ?? "",
        deadline: g.deadline,
      })),
    [goals],
  );

  return {
    handleCreateGoal,
    handleCreateAndSelectGoal,
    handleDeleteGoal,
    handleGoalDeadlineClick,
    handleOnboardingAddGoal,
    handleOnboardingUpdateGoal,
    handleOnboardingRemoveGoal,
    onboardingGoals,
  };
}
