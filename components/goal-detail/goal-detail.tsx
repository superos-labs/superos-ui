"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ScheduleGoal, ScheduleTask, GoalStats, TaskScheduleInfo, TaskDeadlineInfo } from "@/lib/unified-schedule";
import type { LifeArea } from "@/lib/types";
import type { BacklogItem } from "@/components/backlog";
import { GoalDetailHeader } from "./goal-detail-header";
import { GoalDetailMilestones } from "./goal-detail-milestones";
import { GoalDetailTasks } from "./goal-detail-tasks";
import { GoalDetailStats } from "./goal-detail-stats";

// =============================================================================
// Notes Section
// =============================================================================

interface GoalDetailNotesProps {
  notes: string;
  onChange?: (notes: string) => void;
  className?: string;
}

function GoalDetailNotes({
  notes,
  onChange,
  className,
}: GoalDetailNotesProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
    }
  }, [notes]);

  return (
    <div className={cn("flex flex-col gap-2 px-6", className)}>
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Notes
      </h3>
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Add notes about this goal..."
        className={cn(
          "min-h-[80px] w-full resize-none rounded-lg bg-muted/40 px-3 py-2.5 text-sm text-foreground leading-relaxed",
          "placeholder:text-muted-foreground/50",
          "focus:bg-muted/60 focus:outline-none focus:ring-1 focus:ring-border",
          !onChange && "cursor-default",
        )}
        readOnly={!onChange}
      />
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The goal to display */
  goal: ScheduleGoal;
  /** Associated life area (looked up from goal's lifeAreaId) */
  lifeArea?: LifeArea;
  /** Computed stats for the goal */
  stats: GoalStats;
  /** Local notes state (demo only, not persisted) */
  notes?: string;
  /** Callback when notes change */
  onNotesChange?: (notes: string) => void;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  
  // Task callbacks
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (label: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  onDeleteTask?: (taskId: string) => void;
  
  // Subtask callbacks
  onAddSubtask?: (taskId: string, label: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, label: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  
  // Milestone callbacks
  onAddMilestone?: (label: string) => void;
  onToggleMilestone?: (milestoneId: string) => void;
  onUpdateMilestone?: (milestoneId: string, label: string) => void;
  onDeleteMilestone?: (milestoneId: string) => void;
  /** Toggle whether milestones are enabled for this goal */
  onToggleMilestonesEnabled?: () => void;
  
  // Navigation
  onClose?: () => void;
}

export function GoalDetail({
  goal,
  lifeArea,
  stats,
  notes = "",
  onNotesChange,
  getTaskSchedule,
  getTaskDeadline,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onAddMilestone,
  onToggleMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onToggleMilestonesEnabled,
  onClose,
  className,
  ...props
}: GoalDetailProps) {
  // Convert ScheduleGoal to BacklogItem for task row compatibility
  const goalAsBacklogItem: BacklogItem = {
    id: goal.id,
    label: goal.label,
    icon: goal.icon,
    color: goal.color,
    milestones: goal.milestones,
    milestonesEnabled: goal.milestonesEnabled,
    tasks: goal.tasks,
  };

  // Compute whether milestones are enabled (default to true if milestones exist)
  const milestonesEnabled = goal.milestonesEnabled ?? (goal.milestones && goal.milestones.length > 0);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Scrollable content */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Header */}
        <GoalDetailHeader
          icon={goal.icon}
          title={goal.label}
          color={goal.color}
          lifeArea={lifeArea}
          milestonesEnabled={milestonesEnabled}
          onToggleMilestonesEnabled={onToggleMilestonesEnabled}
          onClose={onClose}
        />

        {/* Divider */}
        <div className="mx-6 border-t border-border" />

        {/* Notes */}
        <GoalDetailNotes
          notes={notes}
          onChange={onNotesChange}
          className="py-4"
        />

        {/* Milestones (only if enabled) */}
        {milestonesEnabled && (
          <>
            {/* Divider */}
            <div className="mx-6 border-t border-border" />

            <GoalDetailMilestones
              milestones={goal.milestones ?? []}
              onAdd={onAddMilestone}
              onToggle={onToggleMilestone}
              onUpdate={onUpdateMilestone}
              onDelete={onDeleteMilestone}
              className="py-2"
            />
          </>
        )}

        {/* Divider */}
        <div className="mx-6 border-t border-border" />

        {/* Tasks */}
        <GoalDetailTasks
          tasks={goal.tasks ?? []}
          parentGoal={goalAsBacklogItem}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
          onToggleTask={onToggleTask}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onDeleteTask={onDeleteTask}
          className="py-2"
        />
      </div>

      {/* Footer: Stats */}
      <div className="shrink-0 border-t border-border">
        <GoalDetailStats stats={stats} />
      </div>
    </div>
  );
}
