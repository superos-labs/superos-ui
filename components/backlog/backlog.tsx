"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo, ScheduleTask } from "@/lib/unified-schedule";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { BacklogItem, BacklogMode, NewGoalData } from "./backlog-types";
import { BacklogSection } from "./backlog-section";
import { EditCommitmentsView } from "./edit-commitments-view";
import { BacklogGoalList } from "./backlog-goal-list";

export interface BacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of commitment items to display (filtered by enabled state) */
  commitments: BacklogItem[];
  /** Array of goal items to display */
  goals: BacklogItem[];
  showTasks?: boolean;
  showCommitments?: boolean;
  onAddCommitment?: () => void;
  onAddGoal?: () => void;
  onToggleGoalTask?: (goalId: string, taskId: string) => void;
  /** Callback to add a new task to a goal */
  onAddTask?: (goalId: string, label: string) => void;
  /** Callback to update a task's properties */
  onUpdateTask?: (goalId: string, taskId: string, updates: Partial<ScheduleTask>) => void;
  /** Callback to add a subtask to a task */
  onAddSubtask?: (goalId: string, taskId: string, label: string) => void;
  /** Callback to toggle a subtask's completion */
  onToggleSubtask?: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Callback to update a subtask's label */
  onUpdateSubtask?: (goalId: string, taskId: string, subtaskId: string, label: string) => void;
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
  
  // Edit commitments mode props
  /** Current display mode */
  mode?: BacklogMode;
  /** All available commitments (for edit mode) */
  allCommitments?: BacklogItem[];
  /** Set of enabled commitment IDs (for edit mode, uses draft during editing) */
  enabledCommitmentIds?: Set<string>;
  /** Set of mandatory commitment IDs (cannot be disabled) */
  mandatoryCommitmentIds?: Set<string>;
  /** Toggle commitment enabled state */
  onToggleCommitmentEnabled?: (id: string) => void;
  /** Enter edit mode */
  onEditCommitments?: () => void;
  /** Save and exit edit mode */
  onSaveCommitments?: () => void;
  /** Cancel and exit edit mode */
  onCancelEditCommitments?: () => void;
  
  // Goal creation props (for goal-detail mode's BacklogGoalList)
  /** Callback for creating a new goal */
  onCreateGoal?: (goal: NewGoalData) => void;
  /** Life areas for goal creation */
  lifeAreas?: LifeArea[];
  /** Available icons for goal creation */
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
  commitments,
  goals,
  showTasks = true,
  showCommitments = true,
  onAddCommitment,
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
  // Edit commitments props
  mode = "view",
  allCommitments,
  enabledCommitmentIds,
  mandatoryCommitmentIds,
  onToggleCommitmentEnabled,
  onEditCommitments,
  onSaveCommitments,
  onCancelEditCommitments,
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
  const isEditingCommitments = mode === "edit-commitments";
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
        "flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Content */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
        {showCommitments && (
          isEditingCommitments && allCommitments && enabledCommitmentIds && mandatoryCommitmentIds && onToggleCommitmentEnabled && onSaveCommitments && onCancelEditCommitments ? (
            <EditCommitmentsView
              allCommitments={allCommitments}
              enabledIds={enabledCommitmentIds}
              mandatoryIds={mandatoryCommitmentIds}
              onToggle={onToggleCommitmentEnabled}
              onSave={onSaveCommitments}
              onCancel={onCancelEditCommitments}
            />
          ) : (
            <BacklogSection
              title="Commitments"
              description="Time for essentials"
              items={commitments}
              onAddItem={onAddCommitment}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              draggable={draggable}
              dragType="commitment"
              onEdit={onEditCommitments}
              className="py-2"
            />
          )
        )}

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
