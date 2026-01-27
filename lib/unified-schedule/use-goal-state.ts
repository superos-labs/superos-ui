"use client";

import * as React from "react";
import type { Subtask, Milestone, ScheduleTask, ScheduleGoal } from "./types";

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
  updateGoal: (goalId: string, updates: Partial<ScheduleGoal>) => void;
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

  const addGoal = React.useCallback((goal: ScheduleGoal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const updateGoal = React.useCallback(
    (goalId: string, updates: Partial<ScheduleGoal>) => {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      );
    },
    []
  );

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

  // -------------------------------------------------------------------------
  // Milestone CRUD
  // -------------------------------------------------------------------------

  const addMilestone = React.useCallback((goalId: string, label: string): string => {
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      label,
      completed: false,
    };
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, milestones: [...(g.milestones ?? []), newMilestone] }
          : g
      )
    );
    return newMilestone.id;
  }, []);

  const updateMilestone = React.useCallback(
    (goalId: string, milestoneId: string, label: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: g.milestones?.map((m) =>
                  m.id === milestoneId ? { ...m, label } : m
                ),
              }
            : g
        )
      );
    },
    []
  );

  const toggleMilestoneComplete = React.useCallback(
    (goalId: string, milestoneId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: g.milestones?.map((m) =>
                  m.id === milestoneId ? { ...m, completed: !m.completed } : m
                ),
              }
            : g
        )
      );
    },
    []
  );

  const deleteMilestone = React.useCallback(
    (goalId: string, milestoneId: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, milestones: g.milestones?.filter((m) => m.id !== milestoneId) }
            : g
        )
      );
    },
    []
  );

  const toggleMilestonesEnabled = React.useCallback(
    (goalId: string) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          // If milestonesEnabled is undefined, treat it as enabled (true) if milestones exist
          const currentlyEnabled = g.milestonesEnabled ?? (g.milestones && g.milestones.length > 0);
          return { ...g, milestonesEnabled: !currentlyEnabled };
        })
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
