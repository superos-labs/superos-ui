"use client";

import * as React from "react";
import type { Subtask, Milestone, ScheduleTask, ScheduleGoal } from "./types";
import {
  updateGoalById,
  updateTaskById,
  addTaskToGoal,
  removeTaskFromGoal,
  findTaskInGoal,
  addSubtaskToTask,
  updateSubtaskById,
  removeSubtaskFromTask,
  addMilestoneToGoal,
  updateMilestoneById,
  removeMilestoneFromGoal,
  updateTaskInGoals,
  updateSubtaskInGoals,
  updateMilestoneInGoals,
  findTaskAcrossGoals,
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
  addTask: (goalId: string, label: string) => string;
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
  toggleMilestoneComplete: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  /** Toggle whether milestones are enabled for a goal */
  toggleMilestonesEnabled: (goalId: string) => void;
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

  const addTask = React.useCallback((goalId: string, label: string): string => {
    const newTask: ScheduleTask = {
      id: crypto.randomUUID(),
      label,
      completed: false,
    };

    setGoals((prev) =>
      updateGoalById(prev, goalId, (goal) => addTaskToGoal(goal, newTask)),
    );

    return newTask.id;
  }, []);

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

  const toggleMilestoneComplete = React.useCallback(
    (goalId: string, milestoneId: string) => {
      setGoals((prev) =>
        updateMilestoneInGoals(prev, goalId, milestoneId, (milestone) => ({
          ...milestone,
          completed: !milestone.completed,
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
        return { ...goal, milestonesEnabled: !currentlyEnabled };
      }),
    );
  }, []);

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
    toggleMilestoneComplete,
    deleteMilestone,
    toggleMilestonesEnabled,
  };
}
