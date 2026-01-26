"use client";

import * as React from "react";
import type { Subtask, ScheduleTask, ScheduleGoal } from "./types";

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
  toggleTaskComplete: (goalId: string, taskId: string) => boolean | undefined;
  addTask: (goalId: string, label: string) => string;
  updateTask: (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => void;
  deleteTask: (goalId: string, taskId: string) => string | undefined;
  addSubtask: (goalId: string, taskId: string, label: string) => void;
  updateSubtask: (goalId: string, taskId: string, subtaskId: string, label: string) => void;
  toggleSubtaskComplete: (goalId: string, taskId: string, subtaskId: string) => void;
  deleteSubtask: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Find a task by ID across all goals */
  findTask: (taskId: string) => { goal: ScheduleGoal; task: ScheduleTask } | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useGoalState({
  initialGoals,
}: UseGoalStateOptions): UseGoalStateReturn {
  const [goals, setGoals] = React.useState<ScheduleGoal[]>(initialGoals);

  const addGoal = React.useCallback((goal: ScheduleGoal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const toggleTaskComplete = React.useCallback(
    (goalId: string, taskId: string): boolean | undefined => {
      let newCompletedState: boolean | undefined;

      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);
        if (!task) return currentGoals;

        newCompletedState = !task.completed;

        return currentGoals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId ? { ...t, completed: newCompletedState } : t
                ),
              }
            : g
        );
      });

      return newCompletedState;
    },
    []
  );

  const addTask = React.useCallback((goalId: string, label: string): string => {
    const newTask: ScheduleTask = {
      id: crypto.randomUUID(),
      label,
      completed: false,
    };
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, tasks: [...(g.tasks ?? []), newTask] } : g
      )
    );
    return newTask.id;
  }, []);

  const updateTask = React.useCallback(
    (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => {
      setGoals((currentGoals) =>
        currentGoals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const deleteTask = React.useCallback(
    (goalId: string, taskId: string): string | undefined => {
      let scheduledBlockId: string | undefined;

      setGoals((currentGoals) => {
        const goal = currentGoals.find((g) => g.id === goalId);
        const task = goal?.tasks?.find((t) => t.id === taskId);
        scheduledBlockId = task?.scheduledBlockId;

        return currentGoals.map((g) =>
          g.id === goalId
            ? { ...g, tasks: g.tasks?.filter((t) => t.id !== taskId) }
            : g
        );
      });

      return scheduledBlockId;
    },
    []
  );

  const addSubtask = React.useCallback(
    (goalId: string, taskId: string, label: string) => {
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        label,
        completed: false,
      };
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? { ...t, subtasks: [...(t.subtasks ?? []), newSubtask] }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const updateSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string, label: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        subtasks: t.subtasks?.map((s) =>
                          s.id === subtaskId ? { ...s, label } : s
                        ),
                      }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const toggleSubtaskComplete = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        subtasks: t.subtasks?.map((s) =>
                          s.id === subtaskId
                            ? { ...s, completed: !s.completed }
                            : s
                        ),
                      }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const deleteSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks?.map((t) =>
                  t.id === taskId
                    ? { ...t, subtasks: t.subtasks?.filter((s) => s.id !== subtaskId) }
                    : t
                ),
              }
            : g
        )
      );
    },
    []
  );

  const findTask = React.useCallback(
    (taskId: string): { goal: ScheduleGoal; task: ScheduleTask } | null => {
      for (const goal of goals) {
        const task = goal.tasks?.find((t) => t.id === taskId);
        if (task) return { goal, task };
      }
      return null;
    },
    [goals]
  );

  return {
    goals,
    setGoals,
    addGoal,
    toggleTaskComplete,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
    findTask,
  };
}
