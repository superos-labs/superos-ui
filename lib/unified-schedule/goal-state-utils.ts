/**
 * Pure utility functions for immutable nested state updates.
 *
 * These utilities handle the repetitive pattern of updating deeply nested
 * entities (goals → tasks → subtasks/milestones) in an immutable way.
 *
 * All functions are pure and side-effect free, making them easy to test
 * and compose together for complex updates.
 */

import type { ScheduleGoal, ScheduleTask, Subtask, Milestone } from "./types";

// ============================================================================
// Goal-Level Utilities
// ============================================================================

/**
 * Update a goal by ID within a goals array.
 * Returns the original array if no goal matches.
 */
export function updateGoalById(
  goals: ScheduleGoal[],
  goalId: string,
  updater: (goal: ScheduleGoal) => ScheduleGoal,
): ScheduleGoal[] {
  return goals.map((goal) => (goal.id === goalId ? updater(goal) : goal));
}

/**
 * Find a goal by ID.
 */
export function findGoalById(
  goals: ScheduleGoal[],
  goalId: string,
): ScheduleGoal | undefined {
  return goals.find((goal) => goal.id === goalId);
}

// ============================================================================
// Task-Level Utilities
// ============================================================================

/**
 * Update a task within a goal's tasks array.
 */
export function updateTaskById(
  goal: ScheduleGoal,
  taskId: string,
  updater: (task: ScheduleTask) => ScheduleTask,
): ScheduleGoal {
  return {
    ...goal,
    tasks: goal.tasks?.map((task) =>
      task.id === taskId ? updater(task) : task,
    ),
  };
}

/**
 * Add a task to a goal's tasks array.
 */
export function addTaskToGoal(
  goal: ScheduleGoal,
  task: ScheduleTask,
): ScheduleGoal {
  return {
    ...goal,
    tasks: [...(goal.tasks ?? []), task],
  };
}

/**
 * Remove a task from a goal's tasks array.
 */
export function removeTaskFromGoal(
  goal: ScheduleGoal,
  taskId: string,
): ScheduleGoal {
  return {
    ...goal,
    tasks: goal.tasks?.filter((task) => task.id !== taskId),
  };
}

/**
 * Find a task within a goal.
 */
export function findTaskInGoal(
  goal: ScheduleGoal,
  taskId: string,
): ScheduleTask | undefined {
  return goal.tasks?.find((task) => task.id === taskId);
}

// ============================================================================
// Subtask-Level Utilities
// ============================================================================

/**
 * Update a subtask within a task's subtasks array.
 */
export function updateSubtaskById(
  task: ScheduleTask,
  subtaskId: string,
  updater: (subtask: Subtask) => Subtask,
): ScheduleTask {
  return {
    ...task,
    subtasks: task.subtasks?.map((subtask) =>
      subtask.id === subtaskId ? updater(subtask) : subtask,
    ),
  };
}

/**
 * Add a subtask to a task's subtasks array.
 */
export function addSubtaskToTask(
  task: ScheduleTask,
  subtask: Subtask,
): ScheduleTask {
  return {
    ...task,
    subtasks: [...(task.subtasks ?? []), subtask],
  };
}

/**
 * Remove a subtask from a task's subtasks array.
 */
export function removeSubtaskFromTask(
  task: ScheduleTask,
  subtaskId: string,
): ScheduleTask {
  return {
    ...task,
    subtasks: task.subtasks?.filter((subtask) => subtask.id !== subtaskId),
  };
}

// ============================================================================
// Milestone-Level Utilities
// ============================================================================

/**
 * Update a milestone within a goal's milestones array.
 */
export function updateMilestoneById(
  goal: ScheduleGoal,
  milestoneId: string,
  updater: (milestone: Milestone) => Milestone,
): ScheduleGoal {
  return {
    ...goal,
    milestones: goal.milestones?.map((milestone) =>
      milestone.id === milestoneId ? updater(milestone) : milestone,
    ),
  };
}

/**
 * Add a milestone to a goal's milestones array.
 */
export function addMilestoneToGoal(
  goal: ScheduleGoal,
  milestone: Milestone,
): ScheduleGoal {
  return {
    ...goal,
    milestones: [...(goal.milestones ?? []), milestone],
  };
}

/**
 * Remove a milestone from a goal's milestones array.
 */
export function removeMilestoneFromGoal(
  goal: ScheduleGoal,
  milestoneId: string,
): ScheduleGoal {
  return {
    ...goal,
    milestones: goal.milestones?.filter(
      (milestone) => milestone.id !== milestoneId,
    ),
  };
}

// ============================================================================
// Composed Utilities (Multi-Level Updates)
// ============================================================================

/**
 * Update a task within a goals array.
 * Finds the goal by ID, then updates the task within it.
 */
export function updateTaskInGoals(
  goals: ScheduleGoal[],
  goalId: string,
  taskId: string,
  updater: (task: ScheduleTask) => ScheduleTask,
): ScheduleGoal[] {
  return updateGoalById(goals, goalId, (goal) =>
    updateTaskById(goal, taskId, updater),
  );
}

/**
 * Update a subtask within a goals array.
 * Finds the goal by ID, then the task, then updates the subtask.
 */
export function updateSubtaskInGoals(
  goals: ScheduleGoal[],
  goalId: string,
  taskId: string,
  subtaskId: string,
  updater: (subtask: Subtask) => Subtask,
): ScheduleGoal[] {
  return updateGoalById(goals, goalId, (goal) =>
    updateTaskById(goal, taskId, (task) =>
      updateSubtaskById(task, subtaskId, updater),
    ),
  );
}

/**
 * Update a milestone within a goals array.
 * Finds the goal by ID, then updates the milestone within it.
 */
export function updateMilestoneInGoals(
  goals: ScheduleGoal[],
  goalId: string,
  milestoneId: string,
  updater: (milestone: Milestone) => Milestone,
): ScheduleGoal[] {
  return updateGoalById(goals, goalId, (goal) =>
    updateMilestoneById(goal, milestoneId, updater),
  );
}

/**
 * Find a task across all goals.
 * Returns both the goal and task if found.
 */
export function findTaskAcrossGoals(
  goals: ScheduleGoal[],
  taskId: string,
): { goal: ScheduleGoal; task: ScheduleTask } | null {
  for (const goal of goals) {
    const task = findTaskInGoal(goal, taskId);
    if (task) {
      return { goal, task };
    }
  }
  return null;
}
