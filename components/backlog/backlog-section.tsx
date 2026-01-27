"use client";

import * as React from "react";
import { cn, formatHours } from "@/lib/utils";
import {
  RiAddLine,
  RiPencilLine,
  RiSparklingLine,
} from "@remixicon/react";
import type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo, ScheduleTask } from "@/lib/unified-schedule";
import type { BacklogItem } from "./backlog-types";
import { BacklogItemRow } from "./backlog-item-row";

export interface BacklogSectionProps {
  title: string;
  description?: string;
  items: BacklogItem[];
  showHours?: boolean;
  showTasks?: boolean;
  onAddItem?: () => void;
  /** Callback when an item row is clicked (for entering goal-detail mode) */
  onItemClick?: (itemId: string) => void;
  onToggleTask?: (itemId: string, taskId: string) => void;
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
  /** Function to get computed stats for a goal/commitment */
  getItemStats?: (itemId: string) => GoalStats;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Whether drag is enabled */
  draggable?: boolean;
  /** Type of drag item to create ("goal" for goals, "commitment" for commitments) */
  dragType?: "goal" | "commitment";
  /** Callback to enter edit mode (only for commitments section) */
  onEdit?: () => void;
  /** Callback to create a new goal and immediately select it (for goals section) */
  onCreateAndSelectGoal?: () => void;
  /** Callback to browse inspiration gallery (for goals section) */
  onBrowseInspiration?: () => void;
  /** Whether the inspiration gallery is currently active */
  isInspirationActive?: boolean;
  className?: string;
}

export function BacklogSection({
  title,
  description,
  items,
  showHours = true,
  showTasks = true,
  onAddItem,
  onItemClick,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
  getItemStats,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  dragType = "goal",
  onEdit,
  onCreateAndSelectGoal,
  onBrowseInspiration,
  isInspirationActive,
  className,
}: BacklogSectionProps) {
  // Calculate totals from stats if available, otherwise use legacy props
  const totals = React.useMemo(() => {
    if (getItemStats) {
      return items.reduce(
        (acc, item) => {
          const stats = getItemStats(item.id);
          return {
            planned: acc.planned + stats.plannedHours,
            completed: acc.completed + stats.completedHours,
          };
        },
        { planned: 0, completed: 0 }
      );
    }
    return {
      planned: items.reduce((sum, item) => sum + (item.plannedHours || 0), 0),
      completed: items.reduce((sum, item) => sum + (item.completedHours || 0), 0),
    };
  }, [items, getItemStats]);

  return (
    <div className={cn("flex flex-col px-3", className)}>
      <div className="group/section flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showHours && totals.planned > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              <span className="tabular-nums text-foreground">
                {formatHours(totals.completed)}h
              </span>
              <span className="text-muted-foreground/50">/</span>
              <span className="tabular-nums text-muted-foreground">
                {formatHours(totals.planned)}h
              </span>
            </div>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex h-6 w-0 items-center justify-center overflow-hidden rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground group-hover/section:w-6"
              title="Edit commitments"
            >
              <RiPencilLine className="size-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <BacklogItemRow
            key={item.id}
            item={item}
            stats={getItemStats?.(item.id)}
            showHours={showHours}
            showTasks={showTasks}
            onItemClick={onItemClick}
            onToggleTask={onToggleTask}
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
            dragType={dragType}
          />
        ))}

        {/* New goal button - for goals section */}
        {onCreateAndSelectGoal && (
          <button
            onClick={onCreateAndSelectGoal}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted/60"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <RiAddLine className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">New goal</span>
          </button>
        )}

        {/* Browse inspiration button - for goals section */}
        {onBrowseInspiration && (
          <button
            onClick={onBrowseInspiration}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
              isInspirationActive ? "bg-muted" : "hover:bg-muted/60",
            )}
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                isInspirationActive ? "bg-muted" : "bg-muted/60",
              )}
            >
              <RiSparklingLine className="size-4 text-muted-foreground" />
            </div>
            <span
              className={cn(
                "text-sm",
                isInspirationActive ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              Browse inspiration
            </span>
          </button>
        )}
      </div>

      {onAddItem && (
        <button
          onClick={onAddItem}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <RiAddLine className="size-4" />
          </div>
          <span>Add item</span>
        </button>
      )}
    </div>
  );
}
