"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import {
  BlockSidebar,
  type BlockSidebarData,
  type BlockGoalTask,
  type BlockSubtask,
  type BlockSidebarGoal,
  type BlockType,
} from "./block-sidebar";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
} from "@/components/knobs";
import { RiRocketLine } from "@remixicon/react";

const SAMPLE_GOAL: BlockSidebarGoal = {
  id: "goal-1",
  label: "Launch MVP",
  icon: RiRocketLine,
  color: "text-indigo-500",
};

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
  { value: "commitment", label: "Commitment Block" },
];

const SAMPLE_COMMITMENT: BlockSidebarGoal = {
  id: "commitment-1",
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

  // Goal task handlers
  const handleToggleGoalTask = useCallback((taskId: string) => {
    setGoalTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const handleAssignTask = useCallback((taskId: string) => {
    const taskToAssign = availableTasks.find((t) => t.id === taskId);
    if (taskToAssign) {
      setAvailableTasks((prev) => prev.filter((t) => t.id !== taskId));
      setGoalTasks((prev) => [...prev, taskToAssign]);
    }
  }, [availableTasks]);

  const handleUnassignTask = useCallback((taskId: string) => {
    const taskToUnassign = goalTasks.find((t) => t.id === taskId);
    if (taskToUnassign) {
      setGoalTasks((prev) => prev.filter((t) => t.id !== taskId));
      setAvailableTasks((prev) => [...prev, taskToUnassign]);
    }
  }, [goalTasks]);

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

  const block: BlockSidebarData = {
    ...SAMPLE_BLOCK,
    title,
    blockType,
    date,
    startTime,
    endTime,
    goalTasks: blockType === "goal" ? goalTasks : [],
    subtasks: blockType === "task" ? subtasks : [],
    notes,
    goal: blockType === "goal" || blockType === "task" ? SAMPLE_GOAL : undefined,
    commitment: blockType === "commitment" ? SAMPLE_COMMITMENT : undefined,
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
      />
      <KnobsToggle />
      <KnobsPanel>
        <KnobSelect
          label="Block Type"
          value={blockType}
          options={BLOCK_TYPE_OPTIONS}
          onChange={setBlockType}
        />
      </KnobsPanel>
    </KnobsProvider>
  );
}
