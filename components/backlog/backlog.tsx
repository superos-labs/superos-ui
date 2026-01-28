"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  ScheduleTask,
} from "@/lib/unified-schedule";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type {
  BacklogItem,
  BacklogMode,
  NewGoalData,
  NewEssentialData,
} from "./backlog-types";
import { BacklogSection } from "./backlog-section";
import { EssentialsSection } from "./essentials-section";
import { BacklogGoalList } from "./backlog-goal-list";

export interface BacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of essential items to display (should include Sleep) */
  essentials: BacklogItem[];
  /** Array of goal items to display */
  goals: BacklogItem[];
  showTasks?: boolean;
  onAddGoal?: () => void;
  onToggleGoalTask?: (goalId: string, taskId: string) => void;
  /** Callback to add a new task to a goal */
  onAddTask?: (goalId: string, label: string) => void;
  /** Callback to update a task's properties */
  onUpdateTask?: (
    goalId: string,
    taskId: string,
    updates: Partial<ScheduleTask>,
  ) => void;
  /** Callback to add a subtask to a task */
  onAddSubtask?: (goalId: string, taskId: string, label: string) => void;
  /** Callback to toggle a subtask's completion */
  onToggleSubtask?: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Callback to update a subtask's label */
  onUpdateSubtask?: (
    goalId: string,
    taskId: string,
    subtaskId: string,
    label: string,
  ) => void;
  /** Callback to delete a subtask */
  onDeleteSubtask?: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Callback to delete a task */
  onDeleteTask?: (goalId: string, taskId: string) => void;
  /** Function to get computed stats for a goal (used by goal-detail mode) */
  getGoalStats?: (goalId: string) => GoalStats;
  /** Function to get schedule info for a task (enables time pill display) */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task (enables deadline pill display) */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Enable drag-and-drop (requires DragProvider wrapper) */
  draggable?: boolean;

  // Essentials section props
  /** Current display mode */
  mode?: BacklogMode;
  /** Essential templates (for schedule editing and display) */
  essentialTemplates?: EssentialTemplate[];
  /** Callback when an essential's schedule is saved */
  onSaveEssentialSchedule?: (
    essentialId: string,
    slots: EssentialSlot[],
  ) => void;
  /** Callback when a new essential is created */
  onCreateEssential?: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  /** Callback when an essential is deleted */
  onDeleteEssential?: (essentialId: string) => void;
  /** Sleep wake up time in minutes from midnight */
  wakeUpMinutes?: number;
  /** Sleep wind down time in minutes from midnight */
  windDownMinutes?: number;
  /** Callback when sleep times change */
  onSleepTimesChange?: (wakeUp: number, windDown: number) => void;

  // Goal creation props (for goal-detail mode's BacklogGoalList)
  /** Callback for creating a new goal */
  onCreateGoal?: (goal: NewGoalData) => void;
  /** Life areas for goal creation */
  lifeAreas?: LifeArea[];
  /** Available icons for goal/essential creation */
  goalIcons?: GoalIconOption[];
  /** Callback to create a new goal and immediately select it (for main backlog view) */
  onCreateAndSelectGoal?: () => void;

  // Goal detail mode props
  /** Currently selected goal ID (for goal-detail mode) */
  selectedGoalId?: string | null;
  /** Callback when a goal is selected (for goal-detail mode) */
  onSelectGoal?: (goalId: string) => void;
  /** Callback to go back from goal-detail mode */
  onBack?: () => void;
  /** Callback to browse inspiration gallery (for goal-detail mode) */
  onBrowseInspiration?: () => void;
  /** Whether the inspiration gallery is currently active */
  isInspirationActive?: boolean;
}

export function Backlog({
  essentials,
  goals,
  showTasks = true,
  onAddGoal,
  onToggleGoalTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
  getGoalStats,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  // Essentials section props
  mode = "view",
  essentialTemplates,
  onSaveEssentialSchedule,
  onCreateEssential,
  onDeleteEssential,
  wakeUpMinutes = 420, // 7:00 AM default
  windDownMinutes = 1380, // 11:00 PM default
  onSleepTimesChange,
  // Goal creation props
  onCreateGoal,
  lifeAreas,
  goalIcons,
  onCreateAndSelectGoal,
  // Goal detail mode props
  selectedGoalId,
  onSelectGoal,
  onBack,
  onBrowseInspiration,
  isInspirationActive,
  className,
  ...props
}: BacklogProps) {
  const isGoalDetailMode = mode === "goal-detail";

  // Goal detail mode: render simplified goal list
  if (isGoalDetailMode) {
    return (
      <BacklogGoalList
        goals={goals}
        selectedGoalId={selectedGoalId}
        onSelectGoal={onSelectGoal}
        onBack={onBack}
        onCreateAndSelectGoal={onCreateAndSelectGoal}
        onBrowseInspiration={onBrowseInspiration}
        isInspirationActive={isInspirationActive}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Content */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
        <EssentialsSection
          essentials={essentials}
          templates={essentialTemplates ?? []}
          onSaveSchedule={onSaveEssentialSchedule ?? (() => {})}
          onCreateEssential={onCreateEssential ?? (() => {})}
          onDeleteEssential={onDeleteEssential ?? (() => {})}
          wakeUpMinutes={wakeUpMinutes}
          windDownMinutes={windDownMinutes}
          onSleepTimesChange={onSleepTimesChange ?? (() => {})}
          essentialIcons={goalIcons ?? []}
        />

        <BacklogSection
          title="Goals"
          description="Chosen priorities"
          items={goals}
          showTasks={showTasks}
          onAddItem={onAddGoal}
          onItemClick={onSelectGoal}
          onToggleTask={onToggleGoalTask}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onDeleteTask={onDeleteTask}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
          draggable={draggable}
          dragType="goal"
          onCreateAndSelectGoal={onCreateAndSelectGoal}
          onBrowseInspiration={onBrowseInspiration}
          isInspirationActive={isInspirationActive}
          className="py-2"
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">168 hours in a week</span>
        </div>
      </div>
    </div>
  );
}
