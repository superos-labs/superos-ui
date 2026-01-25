"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiMoreLine,
  RiShiningLine,
  RiFlagLine,
  RiCheckLine,
  RiTimeLine,
} from "@remixicon/react";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import type { DragItem } from "@/lib/drag-types";
import type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo, ScheduleTask } from "@/hooks/use-unified-schedule";

// =============================================================================
// Types
// =============================================================================

/**
 * BacklogTask is a re-export of ScheduleTask for backward compatibility.
 * Use ScheduleTask from @/hooks/use-unified-schedule for new code.
 */
type BacklogTask = ScheduleTask;

/**
 * BacklogItem represents a goal or commitment in the backlog.
 * For goals with tasks, use ScheduleGoal from @/hooks/use-unified-schedule.
 */
interface BacklogItem {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  plannedHours?: number;
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  completedHours?: number;
  /** Current milestone - the next concrete step toward this goal */
  milestone?: string;
  /** Tasks associated with this item */
  tasks?: BacklogTask[];
}

interface BacklogGroup {
  id: string;
  title: string;
  description: string;
  items: BacklogItem[];
}

// Helpers
function formatScheduledTime(schedule: TaskScheduleInfo): string {
  const hours = Math.floor(schedule.startMinutes / 60);
  const minutes = schedule.startMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const timeStr = minutes > 0 
    ? `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
    : `${displayHours} ${period}`;
  
  // Get day name (assuming dayIndex 0 = Monday)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to our Monday=0 format
  
  if (schedule.dayIndex === todayIndex) {
    return timeStr; // Just show time for today
  }
  
  return `${days[schedule.dayIndex]} ${timeStr}`;
}

function formatDeadlineDate(deadline: TaskDeadlineInfo): string {
  const date = new Date(deadline.date + "T00:00:00"); // Parse as local date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const deadlineTime = date.getTime();
  const todayTime = today.getTime();
  const tomorrowTime = tomorrow.getTime();
  
  if (deadlineTime === todayTime) {
    return "Today";
  }
  if (deadlineTime === tomorrowTime) {
    return "Tomorrow";
  }
  
  // Check if within this week (next 7 days)
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  
  if (deadlineTime < weekFromNow.getTime() && deadlineTime > todayTime) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }
  
  // Otherwise show date
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Components
type GoalDisplayMode = "goal" | "milestone";

interface TaskRowProps {
  task: BacklogTask;
  /** Parent goal (needed for drag context and color inheritance) */
  parentGoal: BacklogItem;
  /** Schedule info if this task is on the calendar */
  scheduleInfo?: TaskScheduleInfo | null;
  /** Deadline info if this task has a deadline */
  deadlineInfo?: TaskDeadlineInfo | null;
  onToggle?: (id: string) => void;
  /** Whether drag is enabled (requires DragProvider) */
  draggable?: boolean;
}

function TaskRow({ 
  task, 
  parentGoal, 
  scheduleInfo, 
  deadlineInfo,
  onToggle, 
  draggable = false 
}: TaskRowProps) {
  // Drag context is optional - only use if within DragProvider
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext && !task.completed;
  
  const dragItem: DragItem = {
    type: "task",
    goalId: parentGoal.id,
    goalLabel: parentGoal.label,
    goalColor: parentGoal.color,
    taskId: task.id,
    taskLabel: task.label,
    // Include source deadline if this task has one (for dragging from tray)
    sourceDeadline: task.deadline,
  };
  
  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 transition-all",
        "hover:bg-muted/60",
        isDragging && "opacity-50",
      )}
      {...(canDrag ? draggableProps : {})}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(task.id);
        }}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
          task.completed
            ? "bg-muted text-muted-foreground"
            : "bg-muted/60 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground",
        )}
      >
        {task.completed && <RiCheckLine className="size-3" />}
      </button>
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
      
      {/* Scheduled time pill (mutually exclusive with deadline) */}
      {scheduleInfo && (
        <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
          <RiTimeLine className="size-3" />
          {formatScheduledTime(scheduleInfo)}
        </span>
      )}
      
      {/* Deadline pill (shown when no schedule, but has deadline) */}
      {!scheduleInfo && deadlineInfo && (
        <span 
          className={cn(
            "flex shrink-0 items-center gap-1 text-[10px] tabular-nums",
            deadlineInfo.isOverdue 
              ? "text-amber-600 dark:text-amber-500" 
              : "text-muted-foreground"
          )}
        >
          <RiFlagLine className="size-3" />
          {formatDeadlineDate(deadlineInfo)}
        </span>
      )}
    </div>
  );
}

interface BacklogItemRowProps {
  item: BacklogItem;
  /** Computed stats from calendar (optional, uses item.plannedHours/completedHours as fallback) */
  stats?: GoalStats;
  showHours?: boolean;
  showTasks?: boolean;
  /** For goals with milestones, which should be the primary title */
  goalDisplayMode?: GoalDisplayMode;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Whether drag is enabled (requires DragProvider) */
  draggable?: boolean;
  className?: string;
}

function BacklogItemRow({
  item,
  stats,
  showHours = true,
  showTasks = true,
  goalDisplayMode = "goal",
  onToggleTask,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  className,
}: BacklogItemRowProps) {
  const IconComponent = item.icon;

  // Use computed stats if provided, otherwise fall back to legacy props
  const plannedHours = stats?.plannedHours ?? item.plannedHours ?? 0;
  const completedHours = stats?.completedHours ?? item.completedHours ?? 0;
  const hasHoursData = stats ? (plannedHours > 0 || completedHours > 0) : item.plannedHours !== undefined;

  // Drag context is optional - only use if within DragProvider
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext;
  
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

  // Determine what to show as primary vs secondary based on display mode
  const hasMilestone = !!item.milestone;
  const showMilestoneAsPrimary =
    goalDisplayMode === "milestone" && hasMilestone;
  const primaryText = showMilestoneAsPrimary ? item.milestone : item.label;
  const secondaryText = showMilestoneAsPrimary ? item.label : item.milestone;

  const hasTasks = showTasks && item.tasks && item.tasks.length > 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
          "hover:bg-muted/60",
          isDragging && "opacity-50",
        )}
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
              {completedHours}h
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span className="tabular-nums text-muted-foreground">
              {plannedHours}h
            </span>
          </div>
        )}

        <button className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg bg-background text-muted-foreground opacity-0 shadow-sm ring-1 ring-border/50 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
          <RiMoreLine className="size-4" />
        </button>
      </div>

      {hasTasks && (
        <div className="flex flex-col gap-0.5">
          {item.tasks!.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              parentGoal={item}
              scheduleInfo={getTaskSchedule?.(task.id)}
              deadlineInfo={getTaskDeadline?.(task.id)}
              onToggle={(taskId) => onToggleTask?.(item.id, taskId)}
              draggable={draggable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BacklogSectionProps {
  title: string;
  description?: string;
  items: BacklogItem[];
  showHours?: boolean;
  showTasks?: boolean;
  goalDisplayMode?: GoalDisplayMode;
  onAddItem?: () => void;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Function to get computed stats for a goal */
  getGoalStats?: (goalId: string) => GoalStats;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Whether drag is enabled */
  draggable?: boolean;
  className?: string;
}

function BacklogSection({
  title,
  description,
  items,
  showHours = true,
  showTasks = true,
  goalDisplayMode = "goal",
  onAddItem,
  onToggleTask,
  getGoalStats,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  className,
}: BacklogSectionProps) {
  // Calculate totals from stats if available, otherwise use legacy props
  const totals = React.useMemo(() => {
    if (getGoalStats) {
      return items.reduce(
        (acc, item) => {
          const stats = getGoalStats(item.id);
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
  }, [items, getGoalStats]);

  return (
    <div className={cn("flex flex-col px-3", className)}>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {showHours && totals.planned > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            <span className="tabular-nums text-foreground">
              {totals.completed}h
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span className="tabular-nums text-muted-foreground">
              {totals.planned}h
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <BacklogItemRow
            key={item.id}
            item={item}
            stats={getGoalStats?.(item.id)}
            showHours={showHours}
            showTasks={showTasks}
            goalDisplayMode={goalDisplayMode}
            onToggleTask={onToggleTask}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            draggable={draggable}
          />
        ))}
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

interface BacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of commitment items to display */
  commitments: BacklogItem[];
  /** Array of goal items to display */
  goals: BacklogItem[];
  showHours?: boolean;
  showTasks?: boolean;
  showCommitments?: boolean;
  /** Whether to display goal or milestone as primary title for goals */
  goalDisplayMode?: GoalDisplayMode;
  onAddCommitment?: () => void;
  onAddGoal?: () => void;
  onToggleGoalTask?: (goalId: string, taskId: string) => void;
  /** Function to get computed stats for a goal (enables computed hours display) */
  getGoalStats?: (goalId: string) => GoalStats;
  /** Function to get schedule info for a task (enables time pill display) */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task (enables deadline pill display) */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Enable drag-and-drop (requires DragProvider wrapper) */
  draggable?: boolean;
}

function Backlog({
  commitments,
  goals,
  showHours = true,
  showTasks = true,
  showCommitments = true,
  goalDisplayMode = "goal",
  onAddCommitment,
  onAddGoal,
  onToggleGoalTask,
  getGoalStats,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  className,
  ...props
}: BacklogProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border">
        {showCommitments && (
          <BacklogSection
            title="Commitments"
            description="Time for essentials"
            items={commitments}
            showHours={showHours}
            onAddItem={onAddCommitment}
            getGoalStats={getGoalStats}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            draggable={draggable}
            className="py-2"
          />
        )}

        <BacklogSection
          title="Goals"
          description="Chosen priorities"
          items={goals}
          showHours={showHours}
          showTasks={showTasks}
          goalDisplayMode={goalDisplayMode}
          onAddItem={onAddGoal}
          onToggleTask={onToggleGoalTask}
          getGoalStats={getGoalStats}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
          draggable={draggable}
          className="py-2"
        />
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">168 hours in a week</span>
        </div>
      </div>
    </div>
  );
}

export { Backlog, BacklogSection, BacklogItemRow, TaskRow };
export type {
  BacklogProps,
  BacklogItem,
  BacklogTask,
  BacklogGroup,
  GoalDisplayMode,
};
// Re-export types from use-unified-schedule for convenience
export type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo } from "@/hooks/use-unified-schedule";
