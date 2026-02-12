/**
 * =============================================================================
 * File: goal-item-row.tsx
 * =============================================================================
 *
 * Row component for rendering a Goal and its associated Tasks inside the backlog.
 *
 * Supports:
 * - Displaying goal metadata (icon, label, active milestones summary).
 * - Click-to-expand/collapse to reveal tasks grouped by active milestone.
 * - Optional navigation to goal detail (chevron button).
 * - Optional drag-and-drop of the goal.
 * - Inline rendering and editing of tasks.
 *
 * This component acts as a composition layer that coordinates multiple child
 * primitives but does not own domain state.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render goal row with expand/collapse toggle.
 * - When expanded with milestones: render active milestone sub-headers + tasks.
 * - When expanded without milestones: render tasks flat.
 * - Manage which task row is expanded (accordion).
 * - Bridge task and subtask actions to parent callbacks.
 * - Integrate with drag system when enabled.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting goals or tasks.
 * - Fetching schedule or deadline data.
 * - Enforcing business rules.
 * - Managing per-goal expand/collapse state (owned by parent via props).
 *
 * -----------------------------------------------------------------------------
 * KEY DEPENDENCIES
 * -----------------------------------------------------------------------------
 * - TaskRow
 * - InlineTaskCreator
 * - MilestoneSubHeader
 * - useDraggable / drag context
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - When milestones are enabled, only tasks under active milestones are shown.
 * - Tasks under inactive milestones are hidden to keep the panel focused.
 * - Tasks can be visually prioritized by weekly focus (This Week).
 * - Chevron navigation is isolated from expand/collapse and drag interactions.
 * - Row body click toggles expand/collapse; chevron navigates to goal-detail.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalItemRow
 * - GoalItemRowProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiArrowRightSLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import type { DragItem } from "@/lib/drag-types";
import type {
  Milestone,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  ScheduleTask,
} from "@/lib/unified-schedule";
import type { GoalItem } from "./goal-types";
import { TaskRow } from "./task-row";
import { InlineTaskCreator } from "./inline-creators";
import { MilestoneSubHeader } from "./milestone-sub-header";

export interface GoalItemRowProps {
  item: GoalItem;
  /** Whether this goal is currently selected (for highlighting) */
  isSelected?: boolean;
  /** Global master switch — when false, no tasks/milestones shown for any goal */
  showTasks?: boolean;
  /** Whether this goal is expanded (controlled by parent) */
  isExpanded?: boolean;
  /** Callback to toggle this goal's expand/collapse state */
  onToggleExpand?: (goalId: string) => void;
  /** Callback when the item row is clicked (for entering goal-detail mode) */
  onItemClick?: (itemId: string) => void;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Callback to add a new task to this goal */
  onAddTask?: (goalId: string, label: string, milestoneId?: string) => void;
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
  /** Whether to hide the inline task creator (e.g., during onboarding) */
  hideTaskCreator?: boolean;
  className?: string;
}

export function GoalItemRow({
  item,
  isSelected = false,
  showTasks = true,
  isExpanded = false,
  onToggleExpand,
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
  hideTaskCreator = false,
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

  // ---------------------------------------------------------------------------
  // Milestone computations
  // ---------------------------------------------------------------------------
  const milestonesEnabled =
    item.milestonesEnabled ?? (item.milestones && item.milestones.length > 0);
  const totalMilestones = item.milestones?.length ?? 0;
  const hasMilestones = milestonesEnabled && totalMilestones > 0;

  // Active milestones: active (defaults to true) and not completed
  const activeMilestones = React.useMemo(() => {
    if (!hasMilestones || !item.milestones) return [];
    return item.milestones.filter(
      (m) => (m.active ?? true) && !m.completed,
    );
  }, [hasMilestones, item.milestones]);

  // Sort active milestones by deadline (earliest first, no deadline at end)
  const sortedActiveMilestones = React.useMemo(() => {
    return [...activeMilestones].sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      return 0;
    });
  }, [activeMilestones]);

  // First active milestone for the add-task default assignment
  const firstActiveMilestone = sortedActiveMilestones[0] as
    | Milestone
    | undefined;

  // Subtitle for collapsed state
  const subtitle = React.useMemo(() => {
    if (!hasMilestones) return null;
    const count = activeMilestones.length;
    if (count === 0) return null;
    if (count === 1) return activeMilestones[0].label;
    return `${count} active milestones`;
  }, [hasMilestones, activeMilestones]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // Handle row body click to toggle expand/collapse
  const handleRowClick = React.useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand(item.id);
    }
  }, [onToggleExpand, item.id]);

  // Handle chevron click to navigate to goal detail
  const handleChevronClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent row click from triggering
      onItemClick?.(item.id);
    },
    [onItemClick, item.id],
  );

  // Only show chevron for clickable items
  const showChevron = onItemClick;

  // Whether to show the task/milestone area
  const showContent = showTasks && isExpanded;

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderTaskRow = React.useCallback(
    (task: ScheduleTask) => (
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
            ? (subtaskId) => onToggleSubtask(item.id, task.id, subtaskId)
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
            ? (subtaskId) => onDeleteSubtask(item.id, task.id, subtaskId)
            : undefined
        }
        onDeleteTask={
          onDeleteTask ? () => onDeleteTask(item.id, task.id) : undefined
        }
      />
    ),
    [
      item,
      getTaskSchedule,
      getTaskDeadline,
      onToggleTask,
      draggable,
      expandedTaskId,
      onUpdateTask,
      onAddSubtask,
      onToggleSubtask,
      onUpdateSubtask,
      onDeleteSubtask,
      onDeleteTask,
    ],
  );

  /**
   * Partition tasks into "This Week" first, then "Other", preserving order.
   */
  const partitionByWeek = React.useCallback(
    (tasks: ScheduleTask[]) => {
      if (!currentWeekStart) return tasks;
      const thisWeek = tasks.filter(
        (t) => t.weeklyFocusWeek === currentWeekStart,
      );
      const other = tasks.filter(
        (t) => t.weeklyFocusWeek !== currentWeekStart,
      );
      return [...thisWeek, ...other];
    },
    [currentWeekStart],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Goal row header */}
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
          onToggleExpand && "cursor-pointer",
          isSelected ? "bg-muted" : "hover:bg-muted/60",
          isDragging && "opacity-50",
        )}
        onClick={handleRowClick}
        {...(canDrag ? draggableProps : {})}
      >
        {/* Expand/collapse indicator */}
        {onToggleExpand && (
          <div className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/40">
            {isExpanded ? (
              <RiArrowDownSLine className="size-4" />
            ) : (
              <RiArrowRightSLine className="size-4" />
            )}
          </div>
        )}

        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <IconComponent
            className={cn("size-4", getIconColorClass(item.color))}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {item.label}
          </span>
          {subtitle && (
            <span className="truncate text-xs text-muted-foreground/60">
              {subtitle}
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

      {/* Expanded content: tasks grouped by active milestones (or flat) */}
      {showContent && (
        <div className="flex flex-col gap-0.5">
          {(() => {
            const allTasks = item.tasks ?? [];

            // ---------------------------------------------------------------
            // Milestones enabled: show tasks grouped by active milestones
            // ---------------------------------------------------------------
            if (hasMilestones && sortedActiveMilestones.length > 0) {
              return (
                <>
                  {sortedActiveMilestones.map((milestone) => {
                    const milestoneTasks = partitionByWeek(
                      allTasks.filter((t) => t.milestoneId === milestone.id),
                    );
                    return (
                      <React.Fragment key={milestone.id}>
                        <MilestoneSubHeader
                          label={milestone.label}
                          deadline={milestone.deadline}
                          deadlineGranularity={milestone.deadlineGranularity}
                        />
                        {milestoneTasks.map(renderTaskRow)}
                        {onAddTask && !hideTaskCreator && (
                          <InlineTaskCreator
                            goalId={item.id}
                            milestoneId={milestone.id}
                            onSave={onAddTask}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </>
              );
            }

            // ---------------------------------------------------------------
            // No milestones (or none active): flat task list
            // ---------------------------------------------------------------
            const tasks = partitionByWeek(allTasks);
            return (
              <>
                {tasks.map(renderTaskRow)}
                {onAddTask && !hideTaskCreator && (
                  <InlineTaskCreator
                    goalId={item.id}
                    milestoneId={
                      milestonesEnabled ? firstActiveMilestone?.id : undefined
                    }
                    onSave={onAddTask}
                  />
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
