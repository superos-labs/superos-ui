"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiArrowRightSLine, RiShiningLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import type { DragItem } from "@/lib/drag-types";
import type {
  TaskScheduleInfo,
  TaskDeadlineInfo,
  ScheduleTask,
} from "@/lib/unified-schedule";
import type { GoalItem } from "./goal-types";
import { TaskRow } from "./task-row";
import { InlineTaskCreator } from "./inline-creators";

export interface GoalItemRowProps {
  item: GoalItem;
  /** Whether this goal is currently selected (for highlighting) */
  isSelected?: boolean;
  showTasks?: boolean;
  /** Callback when the item row is clicked (for entering goal-detail mode) */
  onItemClick?: (itemId: string) => void;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Callback to add a new task to this goal */
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
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Whether drag is enabled (requires DragProvider) */
  draggable?: boolean;
  /** Current week start date for sectioning tasks by "This Week" (ISO string) */
  currentWeekStart?: string;
  className?: string;
}

export function GoalItemRow({
  item,
  isSelected = false,
  showTasks = true,
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
  currentWeekStart,
  className,
}: GoalItemRowProps) {
  const IconComponent = item.icon;

  // Expansion state - accordion style (one task at a time)
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(
    null,
  );

  // Drag context is optional - only use if within DragProvider
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext;

  // Create the drag item for goals
  const dragItem: DragItem = {
    type: "goal",
    goalId: item.id,
    goalLabel: item.label,
    goalColor: item.color,
  };

  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  // Compute current milestone (first incomplete) and progress
  // Only show if milestones are enabled (default to true if milestones exist)
  const milestonesEnabled =
    item.milestonesEnabled ?? (item.milestones && item.milestones.length > 0);
  const currentMilestone = milestonesEnabled
    ? item.milestones?.find((m) => !m.completed)
    : undefined;
  const completedMilestones =
    item.milestones?.filter((m) => m.completed).length ?? 0;
  const totalMilestones = item.milestones?.length ?? 0;
  const showMilestones = milestonesEnabled && totalMilestones > 0;

  // Handle chevron click to navigate to goal detail
  const handleChevronClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent drag initiation
      onItemClick?.(item.id);
    },
    [onItemClick, item.id],
  );

  // Only show chevron for clickable items
  const showChevron = onItemClick;

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
          isSelected ? "bg-muted" : "hover:bg-muted/60",
          isDragging && "opacity-50",
        )}
        {...(canDrag ? draggableProps : {})}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <IconComponent
            className={cn("size-4", getIconColorClass(item.color))}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {item.label}
          </span>
          {showMilestones && currentMilestone && (
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <RiShiningLine className="size-3 shrink-0" />
              <span className="truncate">{currentMilestone.label}</span>
              <span className="shrink-0 text-muted-foreground/60">
                ({completedMilestones}/{totalMilestones})
              </span>
            </span>
          )}
        </div>

        {showChevron && (
          <button
            onClick={handleChevronClick}
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg bg-background text-muted-foreground opacity-0 shadow-sm ring-1 ring-border/50 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
            aria-label="Open goal details"
          >
            <RiArrowRightSLine className="size-4" />
          </button>
        )}
      </div>

      {showTasks && (
        <div className="flex flex-col gap-0.5">
          {(() => {
            const tasks = item.tasks ?? [];

            // Partition tasks into "This Week" and "Other"
            const thisWeekTasks = currentWeekStart
              ? tasks.filter((t) => t.weeklyFocusWeek === currentWeekStart)
              : [];
            const otherTasks = currentWeekStart
              ? tasks.filter((t) => t.weeklyFocusWeek !== currentWeekStart)
              : tasks;

            // Render helper for task rows
            const renderTaskRow = (task: ScheduleTask) => (
              <TaskRow
                key={task.id}
                task={task}
                parentGoal={item}
                scheduleInfo={getTaskSchedule?.(task.id)}
                deadlineInfo={getTaskDeadline?.(task.id)}
                onToggle={(taskId) => onToggleTask?.(item.id, taskId)}
                draggable={draggable}
                isExpanded={expandedTaskId === task.id}
                onExpand={(taskId) =>
                  setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
                }
                onUpdateTask={
                  onUpdateTask
                    ? (updates) => onUpdateTask(item.id, task.id, updates)
                    : undefined
                }
                onAddSubtask={
                  onAddSubtask
                    ? (label) => onAddSubtask(item.id, task.id, label)
                    : undefined
                }
                onToggleSubtask={
                  onToggleSubtask
                    ? (subtaskId) =>
                        onToggleSubtask(item.id, task.id, subtaskId)
                    : undefined
                }
                onUpdateSubtask={
                  onUpdateSubtask
                    ? (subtaskId, label) =>
                        onUpdateSubtask(item.id, task.id, subtaskId, label)
                    : undefined
                }
                onDeleteSubtask={
                  onDeleteSubtask
                    ? (subtaskId) =>
                        onDeleteSubtask(item.id, task.id, subtaskId)
                    : undefined
                }
                onDeleteTask={
                  onDeleteTask
                    ? () => onDeleteTask(item.id, task.id)
                    : undefined
                }
              />
            );

            return (
              <>
                {/* This Week section - only show if there are focus tasks */}
                {thisWeekTasks.length > 0 && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        This week
                      </span>
                    </div>
                    {thisWeekTasks.map(renderTaskRow)}
                  </>
                )}

                {/* Other tasks - show header only when there are also "This week" tasks */}
                {thisWeekTasks.length > 0 && otherTasks.length > 0 && (
                  <div className="px-3 py-1.5 pt-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Other tasks
                    </span>
                  </div>
                )}
                {otherTasks.map(renderTaskRow)}
              </>
            );
          })()}
          {onAddTask && (
            <InlineTaskCreator goalId={item.id} onSave={onAddTask} />
          )}
        </div>
      )}
    </div>
  );
}
