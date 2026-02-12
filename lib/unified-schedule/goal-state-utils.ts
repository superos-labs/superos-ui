/**
 * =============================================================================
 * File: goal-state-utils.ts
 * =============================================================================
 *
 * Pure immutable update helpers for goal, task, subtask, milestone, and
 * initiative state.
 *
 * Centralizes common nested-update patterns for the unified schedule data model
 * (goals → tasks → subtasks / milestones / initiatives) to avoid repetitive and
 * error-prone spread logic throughout hooks and reducers.
 *
 * All functions:
 * - Are pure and side-effect free.
 * - Return new object/array references.
 * - Preserve original inputs when no matching entity is found.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Update, add, remove, and find goals, tasks, subtasks, milestones, and
 *   initiatives.
 * - Provide composed helpers for multi-level updates (e.g. subtask inside task
 *   inside goal).
 * - Support initiative-task associations and initiative-based operations.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - No knowledge of React, hooks, or persistence layers.
 * - Safe to use inside reducers, Zustand stores, or React state setters.
 * - Prefer composing these utilities rather than introducing new ad-hoc
 *   immutable update logic elsewhere.
 * - Initiatives provide structural grouping for tasks; milestones are
 *   purely temporal checkpoints (no task-container semantics).
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - Goal-level, task-level, subtask-level, milestone-level, and
 *   initiative-level update helpers.
 * - Cross-goal finders and batch update utilities.
 */

import type {
  ScheduleGoal,
  ScheduleTask,
  Subtask,
  Milestone,
  Initiative,
} from "./types";

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
// Initiative-Level Utilities
// ============================================================================

/**
 * Update an initiative within a goal's initiatives array.
 */
export function updateInitiativeById(
  goal: ScheduleGoal,
  initiativeId: string,
  updater: (initiative: Initiative) => Initiative,
): ScheduleGoal {
  return {
    ...goal,
    initiatives: goal.initiatives?.map((initiative) =>
      initiative.id === initiativeId ? updater(initiative) : initiative,
    ),
  };
}

/**
 * Add an initiative to a goal's initiatives array.
 */
export function addInitiativeToGoal(
  goal: ScheduleGoal,
  initiative: Initiative,
): ScheduleGoal {
  return {
    ...goal,
    initiatives: [...(goal.initiatives ?? []), initiative],
  };
}

/**
 * Remove an initiative from a goal's initiatives array.
 * Also clears initiativeId from any tasks referencing the removed initiative.
 */
export function removeInitiativeFromGoal(
  goal: ScheduleGoal,
  initiativeId: string,
): ScheduleGoal {
  return {
    ...goal,
    initiatives: goal.initiatives?.filter((i) => i.id !== initiativeId),
    tasks: goal.tasks?.map((t) =>
      t.initiativeId === initiativeId ? { ...t, initiativeId: undefined } : t,
    ),
  };
}

/**
 * Find an initiative within a goal.
 */
export function findInitiativeInGoal(
  goal: ScheduleGoal,
  initiativeId: string,
): Initiative | undefined {
  return goal.initiatives?.find((i) => i.id === initiativeId);
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
 * Update an initiative within a goals array.
 * Finds the goal by ID, then updates the initiative within it.
 */
export function updateInitiativeInGoals(
  goals: ScheduleGoal[],
  goalId: string,
  initiativeId: string,
  updater: (initiative: Initiative) => Initiative,
): ScheduleGoal[] {
  return updateGoalById(goals, goalId, (goal) =>
    updateInitiativeById(goal, initiativeId, updater),
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

/**
 * Set weekly focus week on multiple tasks at once.
 * Tasks in the set get the weekStartDate, all other tasks have their weeklyFocusWeek cleared.
 */
export function setWeeklyFocusOnTasks(
  goals: ScheduleGoal[],
  taskIds: Set<string>,
  weekStartDate: string,
): ScheduleGoal[] {
  return goals.map((goal) => ({
    ...goal,
    tasks: goal.tasks?.map((task) => ({
      ...task,
      weeklyFocusWeek: taskIds.has(task.id)
        ? weekStartDate
        : task.weeklyFocusWeek,
    })),
  }));
}

// ============================================================================
// Initiative-Task Association Utilities
// ============================================================================

/**
 * Get tasks for a specific initiative.
 */
export function getTasksForInitiative(
  goal: ScheduleGoal,
  initiativeId: string,
): ScheduleTask[] {
  return (goal.tasks ?? []).filter((t) => t.initiativeId === initiativeId);
}

/**
 * Get the "General" (default) initiative for a goal, or undefined if none exists.
 */
export function getGeneralInitiative(
  goal: ScheduleGoal,
): Initiative | undefined {
  return goal.initiatives?.find((i) => i.label === "General");
}

/**
 * Ensure a goal has a "General" initiative, creating one if needed.
 * Returns the updated goal and the General initiative's ID.
 */
export function ensureGeneralInitiative(
  goal: ScheduleGoal,
  generateId: () => string,
): { goal: ScheduleGoal; generalInitiativeId: string } {
  const existing = getGeneralInitiative(goal);
  if (existing) {
    return { goal, generalInitiativeId: existing.id };
  }

  const generalId = generateId();
  const generalInitiative: Initiative = {
    id: generalId,
    label: "General",
  };

  return {
    goal: addInitiativeToGoal(goal, generalInitiative),
    generalInitiativeId: generalId,
  };
}

/**
 * Assign all tasks without an initiative to a specific initiative.
 */
export function assignUngroupedTasksToInitiative(
  goal: ScheduleGoal,
  initiativeId: string,
): ScheduleGoal {
  return {
    ...goal,
    tasks: goal.tasks?.map((t) =>
      !t.initiativeId ? { ...t, initiativeId } : t,
    ),
  };
}
