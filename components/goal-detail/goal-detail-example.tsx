"use client";

import * as React from "react";
import { GoalDetail } from "./goal-detail";
import { SHELL_GOALS, LIFE_AREAS } from "@/lib/fixtures/shell-data";
import type { ScheduleGoal, GoalStats } from "@/lib/unified-schedule";
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
} from "@/components/_playground/knobs";

// Sample stats for demo
const SAMPLE_STATS: Record<string, GoalStats> = {
  superos: { plannedHours: 24, completedHours: 9.5 },
  marathon: { plannedHours: 6, completedHours: 2 },
  book: { plannedHours: 8, completedHours: 3.5 },
  spanish: { plannedHours: 5, completedHours: 1.5 },
};

function GoalDetailDemo() {
  const [selectedGoalId, setSelectedGoalId] = React.useState(SHELL_GOALS[0]?.id ?? "");
  const [goalNotes, setGoalNotes] = React.useState<Record<string, string>>({});
  const [goals, setGoals] = React.useState<ScheduleGoal[]>(SHELL_GOALS);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);
  const selectedLifeArea = LIFE_AREAS[0]; // Using first life area as demo

  const handleNotesChange = React.useCallback((notes: string) => {
    setGoalNotes((prev) => ({ ...prev, [selectedGoalId]: notes }));
  }, [selectedGoalId]);

  const handleToggleTask = React.useCallback((taskId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== selectedGoalId) return goal;
        return {
          ...goal,
          tasks: goal.tasks?.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        };
      })
    );
  }, [selectedGoalId]);

  const handleAddTask = React.useCallback((label: string) => {
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
      })
    );
  }, [selectedGoalId]);

  const handleDeleteTask = React.useCallback((taskId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== selectedGoalId) return goal;
        return {
          ...goal,
          tasks: goal.tasks?.filter((task) => task.id !== taskId),
        };
      })
    );
  }, [selectedGoalId]);

  if (!selectedGoal) {
    return <div className="p-8 text-muted-foreground">No goal selected</div>;
  }

  return (
    <>
      <div className="flex h-full items-center justify-center p-8">
        <GoalDetail
          goal={selectedGoal}
          lifeArea={selectedLifeArea}
          stats={SAMPLE_STATS[selectedGoalId] ?? { plannedHours: 0, completedHours: 0 }}
          notes={goalNotes[selectedGoalId] ?? ""}
          onNotesChange={handleNotesChange}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onClose={() => console.log("Close clicked")}
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
