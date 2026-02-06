/**
 * =============================================================================
 * File: goal-detail-example.tsx
 * =============================================================================
 *
 * Interactive playground demo for the GoalDetail component.
 *
 * Provides a local, stateful harness that simulates:
 * - Goal selection.
 * - Task creation, deletion, and completion.
 * - Optional milestone workflows.
 * - Title, life area, and notes editing.
 *
 * Used for design iteration, QA, and visual regression during development.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Hold mock goal state for a selected goal.
 * - Wire GoalDetail callbacks to local state mutations.
 * - Expose knobs to switch between fixture goals.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting data.
 * - Fetching real goals.
 * - Enforcing production business rules.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses shell fixtures for realistic sample data.
 * - Milestones can be toggled on/off to exercise both modes.
 * - Intentionally verbose handlers for clarity.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalDetailExample
 */

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
    (label: string, milestoneId?: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== selectedGoalId) return goal;
          // If milestones are enabled and no milestoneId, assign to current milestone
          let finalMilestoneId = milestoneId;
          const milestonesEnabled =
            goal.milestonesEnabled ??
            (goal.milestones && goal.milestones.length > 0);
          if (milestonesEnabled && !finalMilestoneId) {
            finalMilestoneId = goal.milestones?.find((m) => !m.completed)?.id;
          }
          return {
            ...goal,
            tasks: [
              ...(goal.tasks ?? []),
              {
                id: crypto.randomUUID(),
                label,
                completed: false,
                milestoneId: finalMilestoneId,
              },
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
          const milestone = goal.milestones?.find((m) => m.id === milestoneId);
          if (!milestone) return goal;
          const newCompletedState = !milestone.completed;
          return {
            ...goal,
            milestones: goal.milestones?.map((m) =>
              m.id === milestoneId ? { ...m, completed: newCompletedState } : m,
            ),
            // If completing milestone, also complete all its tasks
            tasks: newCompletedState
              ? goal.tasks?.map((t) =>
                  t.milestoneId === milestoneId ? { ...t, completed: true } : t,
                )
              : goal.tasks,
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

  const handleToggleMilestones = React.useCallback(() => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== selectedGoalId) return goal;
        const currentlyEnabled =
          goal.milestonesEnabled ??
          (goal.milestones && goal.milestones.length > 0);

        if (!currentlyEnabled) {
          // Enabling milestones
          const hasExistingMilestones =
            goal.milestones && goal.milestones.length > 0;
          if (hasExistingMilestones) {
            // Assign all tasks to first milestone
            const firstMilestoneId = goal.milestones![0].id;
            return {
              ...goal,
              milestonesEnabled: true,
              tasks: goal.tasks?.map((t) => ({
                ...t,
                milestoneId: firstMilestoneId,
              })),
            };
          } else {
            // Create "Phase 1" and assign all tasks
            const phase1Id = crypto.randomUUID();
            return {
              ...goal,
              milestonesEnabled: true,
              milestones: [
                { id: phase1Id, label: "Phase 1", completed: false },
              ],
              tasks: goal.tasks?.map((t) => ({ ...t, milestoneId: phase1Id })),
            };
          }
        } else {
          // Disabling milestones: clear task milestone assignments
          return {
            ...goal,
            milestonesEnabled: false,
            tasks: goal.tasks?.map((t) => ({ ...t, milestoneId: undefined })),
          };
        }
      }),
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
          onToggleMilestones={handleToggleMilestones}
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
