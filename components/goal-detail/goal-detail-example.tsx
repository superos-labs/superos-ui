"use client";

import * as React from "react";
import { GoalDetail } from "./goal-detail";
import { SHELL_GOALS, LIFE_AREAS } from "@/lib/fixtures/shell-data";
import type { ScheduleGoal } from "@/lib/unified-schedule";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
} from "@/components/_playground/knobs";

function GoalDetailDemo() {
  const [selectedGoalId, setSelectedGoalId] = React.useState(
    SHELL_GOALS[0]?.id ?? "",
  );
  const [goalNotes, setGoalNotes] = React.useState<Record<string, string>>({});
  const [goals, setGoals] = React.useState<ScheduleGoal[]>(SHELL_GOALS);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);
  const selectedLifeArea = React.useMemo(() => {
    if (!selectedGoal?.lifeAreaId) return undefined;
    return LIFE_AREAS.find((area) => area.id === selectedGoal.lifeAreaId);
  }, [selectedGoal]);

  const handleNotesChange = React.useCallback(
    (notes: string) => {
      setGoalNotes((prev) => ({ ...prev, [selectedGoalId]: notes }));
    },
    [selectedGoalId],
  );

  const handleToggleTask = React.useCallback(
    (taskId: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return {
            ...goal,
            tasks: goal.tasks?.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task,
            ),
          };
        }),
      );
    },
    [selectedGoalId],
  );

  const handleAddTask = React.useCallback(
    (label: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return {
            ...goal,
            tasks: [
              ...(goal.tasks ?? []),
              { id: crypto.randomUUID(), label, completed: false },
            ],
          };
        }),
      );
    },
    [selectedGoalId],
  );

  const handleDeleteTask = React.useCallback(
    (taskId: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return {
            ...goal,
            tasks: goal.tasks?.filter((task) => task.id !== taskId),
          };
        }),
      );
    },
    [selectedGoalId],
  );

  // Milestone handlers
  const handleAddMilestone = React.useCallback(
    (label: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return {
            ...goal,
            milestones: [
              ...(goal.milestones ?? []),
              { id: crypto.randomUUID(), label, completed: false },
            ],
          };
        }),
      );
    },
    [selectedGoalId],
  );

  const handleToggleMilestone = React.useCallback(
    (milestoneId: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return {
            ...goal,
            milestones: goal.milestones?.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m,
            ),
          };
        }),
      );
    },
    [selectedGoalId],
  );

  const handleUpdateMilestone = React.useCallback(
    (milestoneId: string, label: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return {
            ...goal,
            milestones: goal.milestones?.map((m) =>
              m.id === milestoneId ? { ...m, label } : m,
            ),
          };
        }),
      );
    },
    [selectedGoalId],
  );

  const handleDeleteMilestone = React.useCallback(
    (milestoneId: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return {
            ...goal,
            milestones: goal.milestones?.filter((m) => m.id !== milestoneId),
          };
        }),
      );
    },
    [selectedGoalId],
  );

  const handleTitleChange = React.useCallback(
    (title: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return { ...goal, label: title };
        }),
      );
    },
    [selectedGoalId],
  );

  const handleLifeAreaChange = React.useCallback(
    (lifeAreaId: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          return { ...goal, lifeAreaId };
        }),
      );
    },
    [selectedGoalId],
  );

  if (!selectedGoal) {
    return <div className="p-8 text-muted-foreground">No goal selected</div>;
  }

  return (
    <>
      <div className="flex h-full items-center justify-center p-8">
        <GoalDetail
          goal={selectedGoal}
          lifeArea={selectedLifeArea}
          lifeAreas={LIFE_AREAS}
          notes={goalNotes[selectedGoalId] ?? ""}
          onNotesChange={handleNotesChange}
          onTitleChange={handleTitleChange}
          onLifeAreaChange={handleLifeAreaChange}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onAddMilestone={handleAddMilestone}
          onToggleMilestone={handleToggleMilestone}
          onUpdateMilestone={handleUpdateMilestone}
          onDeleteMilestone={handleDeleteMilestone}
          className="h-[600px] w-[480px]"
        />
      </div>
      <KnobsToggle />
      <KnobsPanel>
        <KnobSelect
          label="Goal"
          value={selectedGoalId}
          onChange={setSelectedGoalId}
          options={SHELL_GOALS.map((g) => ({ label: g.label, value: g.id }))}
        />
      </KnobsPanel>
    </>
  );
}

export function GoalDetailExample() {
  return (
    <KnobsProvider>
      <GoalDetailDemo />
    </KnobsProvider>
  );
}
