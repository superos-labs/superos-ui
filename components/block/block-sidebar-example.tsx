/**
 * =============================================================================
 * File: block-sidebar-example.tsx
 * =============================================================================
 *
 * Interactive playground example for the BlockSidebar component.
 *
 * This file wires the BlockSidebar into the Knobs playground to allow:
 * - Switching between block types (goal / task / essential)
 * - Toggling whether a block has an assigned goal
 * - Editing title, date, time, notes
 * - Managing goal tasks, available tasks, and subtasks
 *
 * It uses local React state only and does NOT represent production data flow.
 *
 * -----------------------------------------------------------------------------
 * PURPOSE
 * -----------------------------------------------------------------------------
 * - Serve as a visual and behavioral sandbox for block sidebar development.
 * - Enable rapid iteration on sidebar UX without touching app state.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persistence
 * - Domain validation
 * - Real scheduling logic
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Storybook-style playground for BlockSidebar."
 */

"use client";

import { useCallback, useState } from "react";
import {
  BlockSidebar,
  type BlockSidebarData,
  type BlockGoalTask,
  type BlockSubtask,
  type BlockSidebarSource,
  type BlockType,
  type GoalSelectorOption,
} from "./block-sidebar";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
  KnobBoolean,
} from "@/components/_playground/knobs";
import { RiRocketLine, RiHeartLine, RiBriefcaseLine } from "@remixicon/react";

const SAMPLE_GOAL: BlockSidebarSource = {
  id: "goal-1",
  label: "Launch MVP",
  icon: RiRocketLine,
  color: "text-indigo-500",
};

// Available goals for the goal selector (when block has no goal assigned)
const AVAILABLE_GOALS: GoalSelectorOption[] = [
  {
    id: "goal-1",
    label: "Launch MVP",
    icon: RiRocketLine,
    color: "text-indigo-500",
  },
  {
    id: "goal-2",
    label: "Improve Health",
    icon: RiHeartLine,
    color: "text-rose-500",
  },
  {
    id: "goal-3",
    label: "Career Growth",
    icon: RiBriefcaseLine,
    color: "text-amber-500",
  },
];

// Goal tasks that are assigned to this block
const SAMPLE_GOAL_TASKS: BlockGoalTask[] = [
  { id: "task-1", label: "Review project requirements", completed: true },
  { id: "task-2", label: "Update design mockups", completed: true },
  { id: "task-3", label: "Write unit tests", completed: false },
  { id: "task-4", label: "Document API changes", completed: false },
];

// Available tasks from the goal that haven't been assigned yet
const AVAILABLE_GOAL_TASKS: BlockGoalTask[] = [
  { id: "task-5", label: "Set up CI/CD pipeline", completed: false },
  { id: "task-6", label: "Write integration tests", completed: false },
];

// Ephemeral subtasks for this block session
const SAMPLE_SUBTASKS: BlockSubtask[] = [
  { id: "sub-1", text: "Quick sync with design", done: false },
  { id: "sub-2", text: "Review PR comments", done: true },
];

const SAMPLE_BLOCK: BlockSidebarData = {
  id: "block-1",
  title: "Deep Work: Product Development",
  blockType: "goal",
  date: "2026-01-20",
  startTime: "09:00",
  endTime: "11:30",
  notes:
    "Focus on the core feature implementation. Review the latest feedback from the design team and incorporate changes. Prepare for the afternoon sync meeting.",
  subtasks: SAMPLE_SUBTASKS,
  goalTasks: SAMPLE_GOAL_TASKS,
  color: "indigo",
  goal: SAMPLE_GOAL,
};

const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string }[] = [
  { value: "goal", label: "Goal Block" },
  { value: "task", label: "Task Block" },
  { value: "essential", label: "Essential Block" },
];

const SAMPLE_ESSENTIAL: BlockSidebarSource = {
  id: "essential-1",
  label: "Exercise",
  icon: RiRocketLine, // In real use, this would be a different icon
  color: "text-green-500",
};

export function BlockSidebarExample() {
  const [blockType, setBlockType] = useState<BlockType>("goal");
  const [goalTasks, setGoalTasks] = useState(SAMPLE_GOAL_TASKS);
  const [availableTasks, setAvailableTasks] = useState(AVAILABLE_GOAL_TASKS);
  const [subtasks, setSubtasks] = useState(SAMPLE_SUBTASKS);
  const [title, setTitle] = useState(SAMPLE_BLOCK.title);
  const [date, setDate] = useState(SAMPLE_BLOCK.date);
  const [startTime, setStartTime] = useState(SAMPLE_BLOCK.startTime);
  const [endTime, setEndTime] = useState(SAMPLE_BLOCK.endTime);
  const [notes, setNotes] = useState(SAMPLE_BLOCK.notes || "");
  // Whether the block has a goal assigned (false simulates a newly created block)
  const [hasGoalAssigned, setHasGoalAssigned] = useState(true);
  const [assignedGoal, setAssignedGoal] = useState<
    BlockSidebarSource | undefined
  >(SAMPLE_GOAL);

  // Goal task handlers
  const handleToggleGoalTask = useCallback((taskId: string) => {
    setGoalTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const handleAssignTask = useCallback(
    (taskId: string) => {
      const taskToAssign = availableTasks.find((t) => t.id === taskId);
      if (taskToAssign) {
        setAvailableTasks((prev) => prev.filter((t) => t.id !== taskId));
        setGoalTasks((prev) => [...prev, taskToAssign]);
      }
    },
    [availableTasks],
  );

  const handleUnassignTask = useCallback(
    (taskId: string) => {
      const taskToUnassign = goalTasks.find((t) => t.id === taskId);
      if (taskToUnassign) {
        setGoalTasks((prev) => prev.filter((t) => t.id !== taskId));
        setAvailableTasks((prev) => [...prev, taskToUnassign]);
      }
    },
    [goalTasks],
  );

  // Create a new task and assign it to this block
  const handleCreateTask = useCallback((label: string) => {
    const newTask: BlockGoalTask = {
      id: `task-${Date.now()}`,
      label,
      completed: false,
    };
    setGoalTasks((prev) => [...prev, newTask]);
  }, []);

  // Subtask handlers
  const handleAddSubtask = useCallback((label: string) => {
    const newSubtask: BlockSubtask = {
      id: `sub-${Date.now()}`,
      text: label,
      done: false,
    };
    setSubtasks((prev) => [...prev, newSubtask]);
  }, []);

  const handleToggleSubtask = useCallback((subtaskId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
    );
  }, []);

  const handleUpdateSubtask = useCallback((subtaskId: string, text: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, text } : s)),
    );
  }, []);

  const handleDeleteSubtask = useCallback((subtaskId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
  }, []);

  const handleClose = useCallback(() => {
    console.log("Close sidebar");
  }, []);

  // Goal selection handler (for newly created blocks)
  const handleGoalSelect = useCallback((goalId: string) => {
    const goal = AVAILABLE_GOALS.find((g) => g.id === goalId);
    if (goal) {
      setAssignedGoal({
        id: goal.id,
        label: goal.label,
        icon: goal.icon,
        color: goal.color,
      });
      setHasGoalAssigned(true);
      setTitle(goal.label);
    }
  }, []);

  const block: BlockSidebarData = {
    ...SAMPLE_BLOCK,
    title,
    blockType,
    date,
    startTime,
    endTime,
    goalTasks: blockType === "goal" && hasGoalAssigned ? goalTasks : [],
    subtasks: blockType === "task" ? subtasks : [],
    notes,
    goal:
      (blockType === "goal" || blockType === "task") && hasGoalAssigned
        ? assignedGoal
        : undefined,
    essential: blockType === "essential" ? SAMPLE_ESSENTIAL : undefined,
  };

  return (
    <KnobsProvider>
      <BlockSidebar
        block={block}
        onClose={handleClose}
        onTitleChange={setTitle}
        onDateChange={setDate}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        onNotesChange={setNotes}
        // Subtask handlers
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
        onUpdateSubtask={handleUpdateSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        // Goal task handlers
        onToggleGoalTask={handleToggleGoalTask}
        onCreateTask={handleCreateTask}
        availableGoalTasks={availableTasks}
        onAssignTask={handleAssignTask}
        onUnassignTask={handleUnassignTask}
        // Goal selection (for newly created blocks)
        availableGoals={AVAILABLE_GOALS}
        onGoalSelect={handleGoalSelect}
      />
      <KnobsToggle />
      <KnobsPanel>
        <KnobSelect
          label="Block Type"
          value={blockType}
          options={BLOCK_TYPE_OPTIONS}
          onChange={setBlockType}
        />
        <KnobBoolean
          label="Has Goal Assigned"
          value={hasGoalAssigned}
          onChange={(v) => {
            setHasGoalAssigned(v);
            if (!v) {
              setAssignedGoal(undefined);
              setTitle("New Block");
            }
          }}
        />
      </KnobsPanel>
    </KnobsProvider>
  );
}
