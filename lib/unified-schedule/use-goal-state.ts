/**
 * =============================================================================
 * File: use-goal-state.ts
 * =============================================================================
 *
 * React hook for managing backlog goal, task, subtask, and milestone state.
 *
 * Owns in-memory goal hierarchy and exposes high-level CRUD operations and
 * behaviors (completion toggles, milestone enablement, weekly focus, etc.).
 * Built on top of pure immutable helpers from goal-state-utils.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Store and update ScheduleGoal[] state.
 * - Provide CRUD for goals, tasks, subtasks, and milestones.
 * - Handle milestone enable/disable semantics and task reassignment.
 * - Expose weekly focus batch updates.
 * - Provide cross-goal task lookup.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - No persistence or side effects; caller owns saving.
 * - All updates are immutable and functional.
 * - Encapsulates domain behavior, not UI concerns.
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
  updateTaskInGoals,
  updateSubtaskInGoals,
  updateMilestoneInGoals,
  findTaskAcrossGoals,
  setWeeklyFocusOnTasks,
  getCurrentMilestone,
  assignAllTasksToMilestone,
  clearTaskMilestoneAssignments,
  completeTasksInMilestone,
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
  addTask: (goalId: string, label: string, milestoneId?: string) => string;
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
  /** Toggle whether a milestone is actively being worked on */
  toggleMilestoneActive: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  /** Toggle whether milestones are enabled for a goal */
  toggleMilestonesEnabled: (goalId: string) => void;
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
    (goalId: string, label: string, milestoneId?: string): string => {
      const newTaskId = crypto.randomUUID();

      setGoals((prev) =>
        updateGoalById(prev, goalId, (goal) => {
          // If milestones are enabled, auto-assign to current milestone if none specified
          let finalMilestoneId = milestoneId;
          const milestonesEnabled =
            goal.milestonesEnabled ??
            (goal.milestones && goal.milestones.length > 0);

          if (milestonesEnabled && !finalMilestoneId) {
            const currentMilestone = getCurrentMilestone(goal);
            finalMilestoneId = currentMilestone?.id;
          }

          const newTask: ScheduleTask = {
            id: newTaskId,
            label,
            completed: false,
            milestoneId: finalMilestoneId,
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
  // Milestone CRUD
  // -------------------------------------------------------------------------

  const addMilestone = React.useCallback(
    (goalId: string, label: string): string => {
      const newMilestone: Milestone = {
        id: crypto.randomUUID(),
        label,
        completed: false,
        active: true,
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

          const newCompletedState = !milestone.completed;

          // Update the milestone (deactivate when completing)
          let updatedGoal = updateMilestoneById(goal, milestoneId, (m) => ({
            ...m,
            completed: newCompletedState,
            ...(newCompletedState ? { active: false } : {}),
          }));

          // If marking as complete, also complete all tasks in this milestone
          if (newCompletedState) {
            updatedGoal = completeTasksInMilestone(updatedGoal, milestoneId);
          }

          return updatedGoal;
        }),
      );
    },
    [],
  );

  const toggleMilestoneActive = React.useCallback(
    (goalId: string, milestoneId: string) => {
      setGoals((prev) =>
        updateMilestoneInGoals(prev, goalId, milestoneId, (milestone) => ({
          ...milestone,
          active: !(milestone.active ?? true),
        })),
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

  const toggleMilestonesEnabled = React.useCallback((goalId: string) => {
    setGoals((prev) =>
      updateGoalById(prev, goalId, (goal) => {
        // If milestonesEnabled is undefined, treat it as enabled (true) if milestones exist
        const currentlyEnabled =
          goal.milestonesEnabled ??
          (goal.milestones && goal.milestones.length > 0);

        if (!currentlyEnabled) {
          // Enabling milestones: create "Phase 1" if no milestones exist, assign all tasks
          const hasExistingMilestones =
            goal.milestones && goal.milestones.length > 0;

          if (hasExistingMilestones) {
            // Use first milestone to assign tasks
            const firstMilestoneId = goal.milestones![0].id;
            const updatedGoal = assignAllTasksToMilestone(
              goal,
              firstMilestoneId,
            );
            return { ...updatedGoal, milestonesEnabled: true };
          } else {
            // Create "Phase 1" milestone and assign all tasks to it
            const phase1Id = crypto.randomUUID();
            const newMilestone: Milestone = {
              id: phase1Id,
              label: "Phase 1",
              completed: false,
              active: true,
            };
            let updatedGoal: ScheduleGoal = {
              ...goal,
              milestones: [newMilestone],
              milestonesEnabled: true,
            };
            updatedGoal = assignAllTasksToMilestone(updatedGoal, phase1Id);
            return updatedGoal;
          }
        } else {
          // Disabling milestones: clear task milestone assignments
          const updatedGoal = clearTaskMilestoneAssignments(goal);
          return { ...updatedGoal, milestonesEnabled: false };
        }
      }),
    );
  }, []);

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
    // Milestone CRUD
    addMilestone,
    updateMilestone,
    updateMilestoneDeadline,
    toggleMilestoneComplete,
    toggleMilestoneActive,
    deleteMilestone,
    toggleMilestonesEnabled,
    // Weekly focus
    setWeeklyFocus,
  };
}
