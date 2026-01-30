"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiSparklingLine } from "@remixicon/react";
import type {
  TaskScheduleInfo,
  TaskDeadlineInfo,
  ScheduleTask,
} from "@/lib/unified-schedule";
import type { GoalItem } from "./goal-types";
import { GoalItemRow } from "./goal-item-row";

export interface GoalSectionProps {
  title: string;
  description?: string;
  items: GoalItem[];
  /** Currently selected goal ID (for highlighting) */
  selectedGoalId?: string | null;
  showTasks?: boolean;
  onAddItem?: () => void;
  /** Callback when an item row is clicked (for entering goal-detail mode) */
  onItemClick?: (itemId: string) => void;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Callback to add a new task to a goal */
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
  /** Whether drag is enabled */
  draggable?: boolean;
  /** Callback to create a new goal and immediately select it */
  onCreateAndSelectGoal?: () => void;
  /** Callback to browse inspiration gallery */
  onBrowseInspiration?: () => void;
  /** Whether the inspiration gallery is currently active */
  isInspirationActive?: boolean;
  /** Whether we're in the goals onboarding step */
  isOnboardingGoalsStep?: boolean;
  /** Callback when user clicks Continue during onboarding */
  onOnboardingContinue?: () => void;
  /** Current week start date for sectioning tasks by "This Week" (ISO string) */
  currentWeekStart?: string;
  className?: string;
}

export function GoalSection({
  title,
  description,
  items,
  selectedGoalId,
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
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  onCreateAndSelectGoal,
  onBrowseInspiration,
  isInspirationActive,
  isOnboardingGoalsStep = false,
  onOnboardingContinue,
  currentWeekStart,
  className,
}: GoalSectionProps) {
  // Show Continue button only during onboarding goals step when at least 1 goal exists
  const showOnboardingContinue =
    isOnboardingGoalsStep && items.length > 0 && onOnboardingContinue;

  // Use different copy during onboarding goals step
  const displayTitle = isOnboardingGoalsStep ? "Set your goals" : title;
  const displayDescription = isOnboardingGoalsStep
    ? "Create a goal to start planning time around what matters. You can start small and change it anytime."
    : description;

  return (
    <div className={cn("flex flex-col px-3", className)}>
      <div
        className={cn(
          "group/section flex items-center justify-between px-3",
          isOnboardingGoalsStep ? "py-4" : "py-2",
        )}
      >
        <div className="flex flex-col gap-1">
          <h3
            className={cn(
              "font-semibold text-foreground",
              isOnboardingGoalsStep ? "text-base" : "text-sm",
            )}
          >
            {displayTitle}
          </h3>
          {displayDescription && (
            <p
              className={cn(
                "text-muted-foreground",
                isOnboardingGoalsStep ? "text-sm" : "text-xs",
              )}
            >
              {displayDescription}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <GoalItemRow
            key={item.id}
            item={item}
            isSelected={selectedGoalId === item.id}
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
            currentWeekStart={currentWeekStart}
            hideTaskCreator={isOnboardingGoalsStep}
          />
        ))}

        {/* New goal button */}
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

        {/* Browse inspiration button */}
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
                isInspirationActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
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

      {/* Onboarding Continue button */}
      {showOnboardingContinue && (
        <div className="px-3 pt-3">
          <button
            onClick={onOnboardingContinue}
            className="w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-all duration-200 hover:bg-foreground/90"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
