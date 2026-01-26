"use client";

import * as React from "react";
import { cn, formatHours } from "@/lib/utils";
import {
  RiMoreLine,
  RiShiningLine,
  RiFlagLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import type { DragItem } from "@/lib/drag-types";
import type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo, ScheduleTask } from "@/lib/unified-schedule";
import type { BacklogItem, GoalDisplayMode } from "./backlog-types";
import { TaskRow } from "./task-row";
import { InlineTaskCreator } from "./inline-creators";

export interface BacklogItemRowProps {
  item: BacklogItem;
  /** Computed stats from calendar (optional, uses item.plannedHours/completedHours as fallback) */
  stats?: GoalStats;
  showHours?: boolean;
  showTasks?: boolean;
  /** For goals with milestones, which should be the primary title */
  goalDisplayMode?: GoalDisplayMode;
  /** Callback when the item row is clicked (for entering goal-detail mode) */
  onItemClick?: (itemId: string) => void;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Callback to add a new task to this goal */
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
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Whether drag is enabled (requires DragProvider) */
  draggable?: boolean;
  /** Type of drag item to create ("goal" for goals, "commitment" for commitments) */
  dragType?: "goal" | "commitment";
  className?: string;
}

export function BacklogItemRow({
  item,
  stats,
  showHours = true,
  showTasks = true,
  goalDisplayMode = "goal",
  onItemClick,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  dragType = "goal",
  className,
}: BacklogItemRowProps) {
  const IconComponent = item.icon;

  // Expansion state - accordion style (one task at a time)
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(null);

  // Use computed stats if provided, otherwise fall back to legacy props
  const plannedHours = stats?.plannedHours ?? item.plannedHours ?? 0;
  const completedHours = stats?.completedHours ?? item.completedHours ?? 0;
  const hasHoursData = stats ? (plannedHours > 0 || completedHours > 0) : item.plannedHours !== undefined;

  // Drag context is optional - only use if within DragProvider
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext;
  
  // Create the appropriate drag item based on dragType
  const dragItem: DragItem = dragType === "commitment"
    ? {
        type: "commitment",
        commitmentId: item.id,
        commitmentLabel: item.label,
        commitmentColor: item.color,
      }
    : {
        type: "goal",
        goalId: item.id,
        goalLabel: item.label,
        goalColor: item.color,
      };
  
  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  // Determine what to show as primary vs secondary based on display mode
  const hasMilestone = !!item.milestone;
  const showMilestoneAsPrimary =
    goalDisplayMode === "milestone" && hasMilestone;
  const primaryText = showMilestoneAsPrimary ? item.milestone : item.label;
  const secondaryText = showMilestoneAsPrimary ? item.label : item.milestone;

  // Handle row click
  const handleRowClick = React.useCallback(() => {
    onItemClick?.(item.id);
  }, [onItemClick, item.id]);

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
          "hover:bg-muted/60",
          isDragging && "opacity-50",
          onItemClick && "cursor-pointer",
        )}
        onClick={handleRowClick}
        {...(canDrag ? draggableProps : {})}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <IconComponent className={cn("size-4", getIconColorClass(item.color))} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {primaryText}
          </span>
          {secondaryText && (
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              {showMilestoneAsPrimary ? (
                <RiFlagLine className="size-3 shrink-0" />
              ) : (
                <RiShiningLine className="size-3 shrink-0" />
              )}
              <span className="truncate">{secondaryText}</span>
            </span>
          )}
        </div>

        {showHours && hasHoursData && (
          <div className="flex shrink-0 items-center gap-1.5 text-xs">
            <span className="tabular-nums text-foreground">
              {formatHours(completedHours)}h
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span className="tabular-nums text-muted-foreground">
              {formatHours(plannedHours)}h
            </span>
          </div>
        )}

        <button className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg bg-background text-muted-foreground opacity-0 shadow-sm ring-1 ring-border/50 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
          <RiMoreLine className="size-4" />
        </button>
      </div>

      {showTasks && (
        <div className="flex flex-col gap-0.5">
          {item.tasks?.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              parentGoal={item}
              scheduleInfo={getTaskSchedule?.(task.id)}
              deadlineInfo={getTaskDeadline?.(task.id)}
              onToggle={(taskId) => onToggleTask?.(item.id, taskId)}
              draggable={draggable}
              isExpanded={expandedTaskId === task.id}
              onExpand={(taskId) => setExpandedTaskId(prev => prev === taskId ? null : taskId)}
              onUpdateTask={onUpdateTask ? (updates) => onUpdateTask(item.id, task.id, updates) : undefined}
              onAddSubtask={onAddSubtask ? (label) => onAddSubtask(item.id, task.id, label) : undefined}
              onToggleSubtask={onToggleSubtask ? (subtaskId) => onToggleSubtask(item.id, task.id, subtaskId) : undefined}
              onUpdateSubtask={onUpdateSubtask ? (subtaskId, label) => onUpdateSubtask(item.id, task.id, subtaskId, label) : undefined}
              onDeleteSubtask={onDeleteSubtask ? (subtaskId) => onDeleteSubtask(item.id, task.id, subtaskId) : undefined}
              onDeleteTask={onDeleteTask ? () => onDeleteTask(item.id, task.id) : undefined}
            />
          ))}
          {onAddTask && (
            <InlineTaskCreator
              goalId={item.id}
              onSave={onAddTask}
            />
          )}
        </div>
      )}
    </div>
  );
}
