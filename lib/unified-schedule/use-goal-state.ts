/**
 * =============================================================================
 * File: use-goal-state.ts
 * =============================================================================
 *
 * React hook for managing backlog goal, task, subtask, milestone, and
 * initiative state.
 *
 * Owns in-memory goal hierarchy and exposes high-level CRUD operations and
 * behaviors (completion toggles, initiative management, weekly focus, etc.).
 * Built on top of pure immutable helpers from goal-state-utils.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Store and update ScheduleGoal[] state.
 * - Provide CRUD for goals, tasks, subtasks, milestones, and initiatives.
 * - Handle initiative auto-creation ("General" initiative) for ungrouped tasks.
 * - Expose weekly focus batch updates.
 * - Provide cross-goal task lookup.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - No persistence or side effects; caller owns saving.
 * - All updates are immutable and functional.
 * - Encapsulates domain behavior, not UI concerns.
 * - Initiatives provide structural grouping; milestones are purely temporal.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useGoalState
 * - UseGoalStateOptions
 * - UseGoalStateReturn
 */

"use client";

import * as React from "react";
import type {
  Subtask,
  Milestone,
  Initiative,
  ScheduleTask,
  ScheduleGoal,
  DateGranularity,
} from "./types";
import {
  updateGoalById,
  addTaskToGoal,
  removeTaskFromGoal,
  findTaskInGoal,
  addSubtaskToTask,
  removeSubtaskFromTask,
  addMilestoneToGoal,
  updateMilestoneById,
  removeMilestoneFromGoal,
  addInitiativeToGoal,
  removeInitiativeFromGoal,
  updateTaskInGoals,
  updateSubtaskInGoals,
  updateMilestoneInGoals,
  updateInitiativeInGoals,
  findTaskAcrossGoals,
  setWeeklyFocusOnTasks,
  ensureGeneralInitiative,
} from "./goal-state-utils";

// ============================================================================
// Types
// ============================================================================

export interface UseGoalStateOptions {
  initialGoals: ScheduleGoal[];
}

export interface UseGoalStateReturn {
  goals: ScheduleGoal[];
  setGoals: React.Dispatch<React.SetStateAction<ScheduleGoal[]>>;
  addGoal: (goal: ScheduleGoal) => void;
  deleteGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<ScheduleGoal>) => void;
  toggleTaskComplete: (goalId: string, taskId: string) => boolean | undefined;
  addTask: (goalId: string, label: string, initiativeId?: string) => string;
  updateTask: (
    goalId: string,
    taskId: string,
    updates: Partial<ScheduleTask>,
  ) => void;
  deleteTask: (goalId: string, taskId: string) => string | undefined;
  addSubtask: (goalId: string, taskId: string, label: string) => void;
  updateSubtask: (
    goalId: string,
    taskId: string,
    subtaskId: string,
    label: string,
  ) => void;
  toggleSubtaskComplete: (
    goalId: string,
    taskId: string,
    subtaskId: string,
  ) => void;
  deleteSubtask: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Find a task by ID across all goals */
  findTask: (
    taskId: string,
  ) => { goal: ScheduleGoal; task: ScheduleTask } | null;
  // Initiative CRUD
  addInitiative: (goalId: string, label: string) => string;
  updateInitiative: (
    goalId: string,
    initiativeId: string,
    updates: Partial<Initiative>,
  ) => void;
  deleteInitiative: (goalId: string, initiativeId: string) => void;
  // Visibility toggles
  toggleMilestonesEnabled: (goalId: string) => void;
  toggleInitiativesEnabled: (goalId: string) => void;
  // Milestone CRUD
  addMilestone: (goalId: string, label: string) => string;
  updateMilestone: (goalId: string, milestoneId: string, label: string) => void;
  updateMilestoneDeadline: (
    goalId: string,
    milestoneId: string,
    deadline: string | undefined,
    deadlineGranularity: DateGranularity | undefined,
  ) => void;
  toggleMilestoneComplete: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  /** Set weekly focus on multiple tasks at once (persists weeklyFocusWeek) */
  setWeeklyFocus: (taskIds: Set<string>, weekStartDate: string) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useGoalState({
  initialGoals,
}: UseGoalStateOptions): UseGoalStateReturn {
  const [goals, setGoals] = React.useState<ScheduleGoal[]>(initialGoals);

  // -------------------------------------------------------------------------
  // Goal CRUD
  // -------------------------------------------------------------------------

  const addGoal = React.useCallback((goal: ScheduleGoal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const deleteGoal = React.useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  const updateGoal = React.useCallback(
    (goalId: string, updates: Partial<ScheduleGoal>) => {
      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) => ({ ...goal, ...updates })),
      );
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Task CRUD
  // -------------------------------------------------------------------------

  const toggleTaskComplete = React.useCallback(
    (goalId: string, taskId: string): boolean | undefined => {
      let newCompletedState: boolean | undefined;

      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = findTaskInGoal(goal!, taskId);
        if (!goal || !task) return currentGoals;

        newCompletedState = !task.completed;

        return updateTaskInGoals(currentGoals, goalId, taskId, (t) => ({
          ...t,
          completed: newCompletedState,
        }));
      });

      return newCompletedState;
    },
    [],
  );

  const addTask = React.useCallback(
    (goalId: string, label: string, initiativeId?: string): string => {
      const newTaskId = crypto.randomUUID();

      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) => {
          // If an initiative is specified, use it directly
          let finalInitiativeId = initiativeId;

          // If no initiative specified and goal has initiatives, assign to General
          if (!finalInitiativeId && goal.initiatives && goal.initiatives.length > 0) {
            const { goal: updatedGoal, generalInitiativeId } =
              ensureGeneralInitiative(goal, crypto.randomUUID.bind(crypto));
            goal = updatedGoal;
            finalInitiativeId = generalInitiativeId;
          }

          const newTask: ScheduleTask = {
            id: newTaskId,
            label,
            completed: false,
            initiativeId: finalInitiativeId,
          };

          return addTaskToGoal(goal, newTask);
        }),
      );

      return newTaskId;
    },
    [],
  );

  const updateTask = React.useCallback(
    (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => {
      setGoals((prev) =>
        updateTaskInGoals(prev, goalId, taskId, (task) => ({
          ...task,
          ...updates,
        })),
      );
    },
    [],
  );

  const deleteTask = React.useCallback(
    (goalId: string, taskId: string): string | undefined => {
      let scheduledBlockId: string | undefined;

      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = findTaskInGoal(goal!, taskId);
        scheduledBlockId = task?.scheduledBlockId;

        return updateGoalById(currentGoals, goalId, (g) =>
          removeTaskFromGoal(g, taskId),
        );
      });

      return scheduledBlockId;
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Subtask CRUD
  // -------------------------------------------------------------------------

  const addSubtask = React.useCallback(
    (goalId: string, taskId: string, label: string) => {
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        label,
        completed: false,
      };

      setGoals((prev) =>
        updateTaskInGoals(prev, goalId, taskId, (task) =>
          addSubtaskToTask(task, newSubtask),
        ),
      );
    },
    [],
  );

  const updateSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string, label: string) => {
      setGoals((prev) =>
        updateSubtaskInGoals(prev, goalId, taskId, subtaskId, (subtask) => ({
          ...subtask,
          label,
        })),
      );
    },
    [],
  );

  const toggleSubtaskComplete = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        updateSubtaskInGoals(prev, goalId, taskId, subtaskId, (subtask) => ({
          ...subtask,
          completed: !subtask.completed,
        })),
      );
    },
    [],
  );

  const deleteSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        updateTaskInGoals(prev, goalId, taskId, (task) =>
          removeSubtaskFromTask(task, subtaskId),
        ),
      );
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Visibility toggles
  // -------------------------------------------------------------------------

  const toggleMilestonesEnabled = React.useCallback(
    (goalId: string) => {
      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) => ({
          ...goal,
          milestonesEnabled: goal.milestonesEnabled === false ? true : false,
        })),
      );
    },
    [],
  );

  const toggleInitiativesEnabled = React.useCallback(
    (goalId: string) => {
      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) => ({
          ...goal,
          initiativesEnabled: goal.initiativesEnabled === false ? true : false,
        })),
      );
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Initiative CRUD
  // -------------------------------------------------------------------------

  const addInitiative = React.useCallback(
    (goalId: string, label: string): string => {
      const newInitiative: Initiative = {
        id: crypto.randomUUID(),
        label,
      };

      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) =>
          addInitiativeToGoal(goal, newInitiative),
        ),
      );

      return newInitiative.id;
    },
    [],
  );

  const updateInitiative = React.useCallback(
    (goalId: string, initiativeId: string, updates: Partial<Initiative>) => {
      setGoals((prev) =>
        updateInitiativeInGoals(prev, goalId, initiativeId, (initiative) => ({
          ...initiative,
          ...updates,
        })),
      );
    },
    [],
  );

  const deleteInitiative = React.useCallback(
    (goalId: string, initiativeId: string) => {
      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) =>
          removeInitiativeFromGoal(goal, initiativeId),
        ),
      );
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Milestone CRUD
  // -------------------------------------------------------------------------

  const addMilestone = React.useCallback(
    (goalId: string, label: string): string => {
      const newMilestone: Milestone = {
        id: crypto.randomUUID(),
        label,
        completed: false,
      };

      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) =>
          addMilestoneToGoal(goal, newMilestone),
        ),
      );

      return newMilestone.id;
    },
    [],
  );

  const updateMilestone = React.useCallback(
    (goalId: string, milestoneId: string, label: string) => {
      setGoals((prev) =>
        updateMilestoneInGoals(prev, goalId, milestoneId, (milestone) => ({
          ...milestone,
          label,
        })),
      );
    },
    [],
  );

  const updateMilestoneDeadline = React.useCallback(
    (
      goalId: string,
      milestoneId: string,
      deadline: string | undefined,
      deadlineGranularity: DateGranularity | undefined,
    ) => {
      setGoals((prev) =>
        updateMilestoneInGoals(prev, goalId, milestoneId, (milestone) => ({
          ...milestone,
          deadline,
          deadlineGranularity,
        })),
      );
    },
    [],
  );

  const toggleMilestoneComplete = React.useCallback(
    (goalId: string, milestoneId: string) => {
      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) => {
          const milestone = goal.milestones?.find((m) => m.id === milestoneId);
          if (!milestone) return goal;

          // Pure temporal marker — toggle completion with no task side effects
          return updateMilestoneById(goal, milestoneId, (m) => ({
            ...m,
            completed: !m.completed,
          }));
        }),
      );
    },
    [],
  );

  const deleteMilestone = React.useCallback(
    (goalId: string, milestoneId: string) => {
      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) =>
          removeMilestoneFromGoal(goal, milestoneId),
        ),
      );
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Weekly Focus
  // -------------------------------------------------------------------------

  const setWeeklyFocus = React.useCallback(
    (taskIds: Set<string>, weekStartDate: string) => {
      setGoals((prev) => setWeeklyFocusOnTasks(prev, taskIds, weekStartDate));
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Utility Functions
  // -------------------------------------------------------------------------

  const findTask = React.useCallback(
    (taskId: string): { goal: ScheduleGoal; task: ScheduleTask } | null => {
      return findTaskAcrossGoals(goals, taskId);
    },
    [goals],
  );

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    goals,
    setGoals,
    addGoal,
    deleteGoal,
    updateGoal,
    toggleTaskComplete,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
    findTask,
    // Visibility toggles
    toggleMilestonesEnabled,
    toggleInitiativesEnabled,
    // Initiative CRUD
    addInitiative,
    updateInitiative,
    deleteInitiative,
    // Milestone CRUD
    addMilestone,
    updateMilestone,
    updateMilestoneDeadline,
    toggleMilestoneComplete,
    deleteMilestone,
    // Weekly focus
    setWeeklyFocus,
  };
}
