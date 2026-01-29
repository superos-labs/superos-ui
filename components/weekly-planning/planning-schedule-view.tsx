"use client";

/**
 * PlanningScheduleView - Backlog-like view for scheduling during weekly planning.
 *
 * Shows essentials and goals with their tasks, allowing drag-to-calendar scheduling.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiTimeLine,
  RiFlagLine,
  RiStarFill,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import type { DragItem } from "@/lib/drag-types";
import type {
  ScheduleGoal,
  ScheduleEssential,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  ScheduleTask,
} from "@/lib/unified-schedule";
import { formatScheduledTime, formatDeadlineDate } from "@/components/backlog";

// =============================================================================
// Types
// =============================================================================

export interface PlanningScheduleViewProps {
  /** Essentials to display */
  essentials: ScheduleEssential[];
  /** Goals to display (with their tasks) */
  goals: ScheduleGoal[];
  /** Task IDs to highlight */
  highlightedTaskIds?: string[];
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Enable drag-and-drop */
  draggable?: boolean;
  className?: string;
}

// =============================================================================
// Essential Row
// =============================================================================

interface EssentialRowProps {
  essential: ScheduleEssential;
  draggable?: boolean;
}

function EssentialRow({ essential, draggable = false }: EssentialRowProps) {
  const IconComponent = essential.icon;
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext;

  const dragItem: DragItem = {
    type: "essential",
    essentialId: essential.id,
    essentialLabel: essential.label,
    essentialColor: essential.color,
  };

  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        "hover:bg-muted/60",
        isDragging && "opacity-50",
        canDrag && "cursor-grab active:cursor-grabbing",
      )}
      {...(canDrag ? draggableProps : {})}
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
        <IconComponent
          className={cn("size-3.5", getIconColorClass(essential.color))}
        />
      </div>
      <span className="truncate text-sm text-foreground">
        {essential.label}
      </span>
    </div>
  );
}

// =============================================================================
// Planning Task Row (with highlight support)
// =============================================================================

interface PlanningTaskRowProps {
  task: ScheduleTask;
  parentGoal: ScheduleGoal;
  isHighlighted?: boolean;
  scheduleInfo?: TaskScheduleInfo | null;
  deadlineInfo?: TaskDeadlineInfo | null;
  draggable?: boolean;
}

function PlanningTaskRow({
  task,
  parentGoal,
  isHighlighted = false,
  scheduleInfo,
  deadlineInfo,
  draggable = false,
}: PlanningTaskRowProps) {
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext && !task.completed;

  const dragItem: DragItem = {
    type: "task",
    goalId: parentGoal.id,
    goalLabel: parentGoal.label,
    goalColor: parentGoal.color,
    taskId: task.id,
    taskLabel: task.label,
    sourceDeadline: task.deadline,
  };

  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-md py-1.5 pl-4 pr-3 transition-all",
        "hover:bg-muted/60",
        isDragging && "opacity-50",
        canDrag && "cursor-grab active:cursor-grabbing",
        isHighlighted &&
          "bg-amber-500/10 hover:bg-amber-500/15 ring-1 ring-inset ring-amber-500/30",
      )}
      {...(canDrag ? draggableProps : {})}
    >
      {/* Highlight indicator */}
      {isHighlighted && (
        <RiStarFill className="size-3 shrink-0 text-amber-500" />
      )}

      {/* Checkbox */}
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded transition-colors",
          task.completed
            ? "bg-muted text-muted-foreground"
            : "bg-muted/60 text-muted-foreground/50",
        )}
      >
        {task.completed && <RiCheckLine className="size-2.5" />}
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 truncate text-xs",
          task.completed
            ? "text-muted-foreground line-through"
            : "text-foreground/80",
        )}
      >
        {task.label}
      </span>

      {/* Scheduled time pill */}
      {scheduleInfo && (
        <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
          <RiTimeLine className="size-3" />
          {formatScheduledTime(scheduleInfo)}
        </span>
      )}

      {/* Deadline pill */}
      {!scheduleInfo && deadlineInfo && (
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 text-[10px] tabular-nums",
            deadlineInfo.isOverdue
              ? "text-amber-600 dark:text-amber-500"
              : "text-muted-foreground",
          )}
        >
          <RiFlagLine className="size-3" />
          {formatDeadlineDate(deadlineInfo)}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// Goal Row (with tasks)
// =============================================================================

interface GoalRowProps {
  goal: ScheduleGoal;
  highlightedTaskIds?: string[];
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  draggable?: boolean;
}

function GoalRow({
  goal,
  highlightedTaskIds = [],
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
}: GoalRowProps) {
  const IconComponent = goal.icon;
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext;

  const dragItem: DragItem = {
    type: "goal",
    goalId: goal.id,
    goalLabel: goal.label,
    goalColor: goal.color,
  };

  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  // Check if any tasks are highlighted
  const hasHighlightedTasks =
    goal.tasks?.some((t) => highlightedTaskIds.includes(t.id)) ?? false;

  return (
    <div className="flex flex-col">
      {/* Goal header */}
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
          "hover:bg-muted/60",
          isDragging && "opacity-50",
          canDrag && "cursor-grab active:cursor-grabbing",
        )}
        {...(canDrag ? draggableProps : {})}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
          <IconComponent
            className={cn("size-3.5", getIconColorClass(goal.color))}
          />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {goal.label}
          </span>
          {hasHighlightedTasks && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-500">
              <RiStarFill className="size-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Tasks */}
      {goal.tasks && goal.tasks.length > 0 && (
        <div className="flex flex-col gap-0.5 pl-2">
          {goal.tasks.map((task) => (
            <PlanningTaskRow
              key={task.id}
              task={task}
              parentGoal={goal}
              isHighlighted={highlightedTaskIds.includes(task.id)}
              scheduleInfo={getTaskSchedule?.(task.id)}
              deadlineInfo={getTaskDeadline?.(task.id)}
              draggable={draggable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Planning Schedule View
// =============================================================================

export function PlanningScheduleView({
  essentials,
  goals,
  highlightedTaskIds = [],
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  className,
}: PlanningScheduleViewProps) {
  return (
    <div className={cn("flex flex-col gap-4 py-3", className)}>
      {/* Essentials section */}
      {essentials.length > 0 && (
        <div className="flex flex-col">
          <div className="px-4 pb-1">
            <h4 className="text-xs font-medium text-muted-foreground">
              Essentials
            </h4>
          </div>
          <div className="flex flex-col gap-0.5 px-2">
            {essentials.map((essential) => (
              <EssentialRow
                key={essential.id}
                essential={essential}
                draggable={draggable}
              />
            ))}
          </div>
        </div>
      )}

      {/* Goals section */}
      {goals.length > 0 && (
        <div className="flex flex-col">
          <div className="px-4 pb-1">
            <h4 className="text-xs font-medium text-muted-foreground">Goals</h4>
          </div>
          <div className="flex flex-col gap-1 px-2">
            {goals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                highlightedTaskIds={highlightedTaskIds}
                getTaskSchedule={getTaskSchedule}
                getTaskDeadline={getTaskDeadline}
                draggable={draggable}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {essentials.length === 0 && goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">No items to schedule.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Add goals and essentials to start planning.
          </p>
        </div>
      )}
    </div>
  );
}
