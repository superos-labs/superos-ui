"use client";

import * as React from "react";
import { Backlog, type BacklogItem } from "./index";
import type { ScheduleTask, Subtask } from "@/lib/unified-schedule";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
} from "@/components/_playground/knobs";
import {
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiHome4Line,
  RiSofaLine,
  RiRocketLine,
  RiCodeLine,
  RiMedalLine,
  RiPenNibLine,
} from "@remixicon/react";

const INITIAL_ESSENTIALS: BacklogItem[] = [
  {
    id: "sleep",
    label: "Sleep",
    icon: RiMoonLine,
    color: "indigo",
    plannedHours: 56,
    completedHours: 48,
  },
  {
    id: "eat",
    label: "Eat",
    icon: RiRestaurantLine,
    color: "amber",
    plannedHours: 14,
    completedHours: 12,
  },
  {
    id: "commute",
    label: "Commute",
    icon: RiCarLine,
    color: "slate",
    plannedHours: 10,
    completedHours: 8,
  },
  {
    id: "exercise",
    label: "Exercise",
    icon: RiRunLine,
    color: "green",
    plannedHours: 5,
    completedHours: 3,
  },
  {
    id: "downtime",
    label: "Downtime",
    icon: RiSofaLine,
    color: "cyan",
    plannedHours: 7,
    completedHours: 5,
  },
  {
    id: "chores",
    label: "Chores",
    icon: RiHome4Line,
    color: "orange",
    plannedHours: 4,
    completedHours: 2,
  },
];

const INITIAL_GOALS: BacklogItem[] = [
  {
    id: "superos",
    label: "Get SuperOS to $1M ARR",
    icon: RiRocketLine,
    color: "violet",
    plannedHours: 20,
    completedHours: 12,
    milestones: [
      { id: "superos-m1", label: "Research competitors", completed: true },
      { id: "superos-m2", label: "Write product spec", completed: true },
      { id: "superos-m3", label: "Ship billing integration", completed: false },
      { id: "superos-m4", label: "Launch to beta users", completed: false },
    ],
    tasks: [
      {
        id: "superos-1",
        label: "Set up Stripe webhook handlers",
        completed: true,
      },
      {
        id: "superos-2",
        label: "Build subscription management UI",
        completed: false,
        description:
          "Allow users to view their current plan and upgrade/downgrade.",
        subtasks: [
          {
            id: "superos-2-1",
            label: "Design plan comparison table",
            completed: true,
          },
          {
            id: "superos-2-2",
            label: "Implement plan selector",
            completed: false,
          },
        ],
      },
      { id: "superos-3", label: "Add invoice generation", completed: false },
    ],
  },
  {
    id: "marathon",
    label: "Run a marathon",
    icon: RiMedalLine,
    color: "rose",
    plannedHours: 6,
    completedHours: 4,
    milestones: [
      { id: "marathon-m1", label: "Run 5K without stopping", completed: true },
      {
        id: "marathon-m2",
        label: "Complete 10K under 50min",
        completed: false,
      },
      { id: "marathon-m3", label: "Run half marathon", completed: false },
    ],
    tasks: [
      {
        id: "marathon-1",
        label: "Run 5K three times this week",
        completed: true,
      },
      {
        id: "marathon-2",
        label: "Do interval training on Saturday",
        completed: false,
      },
    ],
  },
  {
    id: "book",
    label: "Write a book",
    icon: RiPenNibLine,
    color: "teal",
    plannedHours: 7,
    completedHours: 5,
    milestones: [
      { id: "book-m1", label: "Complete outline", completed: true },
      { id: "book-m2", label: "Finish chapter 1 draft", completed: true },
      { id: "book-m3", label: "Finish chapter 3 draft", completed: false },
      { id: "book-m4", label: "Complete first draft", completed: false },
    ],
    tasks: [
      { id: "book-1", label: "Outline the main conflict", completed: true },
      { id: "book-2", label: "Write the opening scene", completed: true },
      {
        id: "book-3",
        label: "Develop supporting characters",
        completed: false,
      },
    ],
  },
  {
    id: "spanish",
    label: "Become fluent in Spanish",
    icon: RiCodeLine,
    color: "blue",
    plannedHours: 5,
    completedHours: 5,
    milestones: [
      { id: "spanish-m1", label: "Complete A1 basics", completed: true },
      {
        id: "spanish-m2",
        label: "Complete A2 certification",
        completed: false,
      },
      {
        id: "spanish-m3",
        label: "Achieve conversational fluency",
        completed: false,
      },
    ],
    tasks: [
      { id: "spanish-1", label: "Complete Duolingo lesson", completed: true },
      {
        id: "spanish-2",
        label: "Watch Spanish movie with subtitles",
        completed: false,
      },
      {
        id: "spanish-3",
        label: "Practice conversation with tutor",
        completed: false,
      },
    ],
  },
];

export function BacklogExample() {
  const [showTasks, setShowTasks] = React.useState(true);
  const [goals, setGoals] = React.useState(INITIAL_GOALS);

  const handleToggleGoalTask = React.useCallback(
    (goalId: string, taskId: string) => {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks?.map((task) =>
                  task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task,
                ),
              }
            : goal,
        ),
      );
    },
    [],
  );

  const handleAddTask = React.useCallback((goalId: string, label: string) => {
    const newTask: ScheduleTask = {
      id: crypto.randomUUID(),
      label,
      completed: false,
    };
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, tasks: [...(goal.tasks ?? []), newTask] }
          : goal,
      ),
    );
  }, []);

  const handleUpdateTask = React.useCallback(
    (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks?.map((task) =>
                  task.id === taskId ? { ...task, ...updates } : task,
                ),
              }
            : goal,
        ),
      );
    },
    [],
  );

  const handleAddSubtask = React.useCallback(
    (goalId: string, taskId: string, label: string) => {
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        label,
        completed: false,
      };
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks?.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: [...(task.subtasks ?? []), newSubtask],
                      }
                    : task,
                ),
              }
            : goal,
        ),
      );
    },
    [],
  );

  const handleToggleSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks?.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks?.map((s) =>
                          s.id === subtaskId
                            ? { ...s, completed: !s.completed }
                            : s,
                        ),
                      }
                    : task,
                ),
              }
            : goal,
        ),
      );
    },
    [],
  );

  const handleDeleteSubtask = React.useCallback(
    (goalId: string, taskId: string, subtaskId: string) => {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks?.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks?.filter(
                          (s) => s.id !== subtaskId,
                        ),
                      }
                    : task,
                ),
              }
            : goal,
        ),
      );
    },
    [],
  );

  const handleDeleteTask = React.useCallback(
    (goalId: string, taskId: string) => {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks?.filter((task) => task.id !== taskId),
              }
            : goal,
        ),
      );
    },
    [],
  );

  return (
    <KnobsProvider>
      <Backlog
        essentials={INITIAL_ESSENTIALS}
        goals={goals}
        showTasks={showTasks}
        onToggleGoalTask={handleToggleGoalTask}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onDeleteTask={handleDeleteTask}
      />

      <KnobsToggle />
      <KnobsPanel>
        <KnobBoolean
          label="Show Tasks"
          value={showTasks}
          onChange={setShowTasks}
        />
      </KnobsPanel>
    </KnobsProvider>
  );
}
