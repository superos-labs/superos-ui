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
import type { DayBoundariesDisplay } from "@/lib/preferences";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { BacklogItem, BacklogMode, NewGoalData } from "./backlog-types";
import { BacklogSection } from "./backlog-section";
import { EditEssentialsView } from "./edit-essentials-view";
import { EssentialsSummary } from "./essentials-summary";
import { BacklogGoalList } from "./backlog-goal-list";

export interface BacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of essential items to display (filtered by enabled state) */
  essentials: BacklogItem[];
  /** Array of goal items to display */
  goals: BacklogItem[];
  showTasks?: boolean;
  onAddEssential?: () => void;
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

  // Edit essentials mode props
  /** Current display mode */
  mode?: BacklogMode;
  /** All available essentials (for edit mode) */
  allEssentials?: BacklogItem[];
  /** Set of enabled essential IDs (for edit mode, uses draft during editing) */
  enabledEssentialIds?: Set<string>;
  /** Toggle essential enabled state */
  onToggleEssentialEnabled?: (id: string) => void;
  /** Enter edit mode */
  onEditEssentials?: () => void;
  /** Save and exit edit mode */
  onSaveEssentials?: () => void;
  /** Cancel and exit edit mode */
  onCancelEditEssentials?: () => void;
  /** Day start time in minutes from midnight (for edit essentials view) */
  dayStartMinutes?: number;
  /** Day end time in minutes from midnight (for edit essentials view) */
  dayEndMinutes?: number;
  /** Callback when day boundaries change (for edit essentials view) */
  onDayBoundariesChange?: (startMinutes: number, endMinutes: number) => void;
  /** Whether day boundaries are enabled */
  dayBoundariesEnabled?: boolean;
  /** Callback when day boundaries enabled state changes */
  onDayBoundariesEnabledChange?: (enabled: boolean) => void;
  /** How to display out-of-bounds hours */
  dayBoundariesDisplay?: DayBoundariesDisplay;
  /** Callback when day boundaries display mode changes */
  onDayBoundariesDisplayChange?: (display: DayBoundariesDisplay) => void;
  /** Essential templates (for schedule editing and summary display) */
  essentialTemplates?: EssentialTemplate[];
  /** Callback when an essential's schedule is saved */
  onSaveEssentialSchedule?: (
    essentialId: string,
    slots: EssentialSlot[],
  ) => void;

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
  essentials,
  goals,
  showTasks = true,
  onAddEssential,
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
  // Edit essentials props
  mode = "view",
  allEssentials,
  enabledEssentialIds,
  onToggleEssentialEnabled,
  onEditEssentials,
  onSaveEssentials,
  onCancelEditEssentials,
  dayStartMinutes,
  dayEndMinutes,
  onDayBoundariesChange,
  dayBoundariesEnabled,
  onDayBoundariesEnabledChange,
  dayBoundariesDisplay,
  onDayBoundariesDisplayChange,
  essentialTemplates,
  onSaveEssentialSchedule,
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
  const isEditingEssentials = mode === "edit-essentials";
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
        {isEditingEssentials &&
        allEssentials &&
        enabledEssentialIds &&
        onToggleEssentialEnabled &&
        onSaveEssentials &&
        onCancelEditEssentials ? (
          <EditEssentialsView
            allEssentials={allEssentials}
            enabledIds={enabledEssentialIds}
            onToggle={onToggleEssentialEnabled}
            onSave={onSaveEssentials}
            onCancel={onCancelEditEssentials}
            dayStartMinutes={dayStartMinutes}
            dayEndMinutes={dayEndMinutes}
            onDayBoundariesChange={onDayBoundariesChange}
            dayBoundariesEnabled={dayBoundariesEnabled}
            onDayBoundariesEnabledChange={onDayBoundariesEnabledChange}
            dayBoundariesDisplay={dayBoundariesDisplay}
            onDayBoundariesDisplayChange={onDayBoundariesDisplayChange}
            templates={essentialTemplates}
            onSaveEssentialSchedule={onSaveEssentialSchedule}
          />
        ) : (
          <EssentialsSummary
            essentials={essentials}
            templates={essentialTemplates ?? []}
            onEdit={onEditEssentials ?? (() => {})}
          />
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
