/**
 * =============================================================================
 * File: block-sidebar.tsx
 * =============================================================================
 *
 * Primary sidebar surface for viewing and editing a single calendar block.
 *
 * This component is responsible for composing all block-related sidebar
 * sections and orchestrating their interaction:
 *
 * - Header (title, source, close/delete, mark complete)
 * - Date & time editing
 * - Focus mode (timer, start/pause/resume/stop)
 * - Goal task assignment and inline task management
 * - Block notes and block-scoped subtasks
 * - External calendar sync appearance overrides
 *
 * It is a UI composition layer only.
 * It does NOT own scheduling, persistence, or domain state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN PRINCIPLES
 * -----------------------------------------------------------------------------
 * - BlockSidebar is a pure presentational orchestrator.
 * - All mutations flow outward via callbacks.
 * - Sub-sections are small, focused components in ./sidebar.
 * - Behavior varies by blockType (goal | task | essential | external).
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Inspector panel for a single time block."
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiCloseLine,
  RiCheckboxCircleFill,
  RiDeleteBinLine,
} from "@remixicon/react";
import type { ScheduleTask } from "@/lib/unified-schedule";
import type { AppearanceOverride } from "@/lib/calendar-sync";
import type { BlockSyncState, BlockSyncSettings } from "@/lib/unified-schedule";
import {
  FocusTimer,
  StartFocusButton,
  FocusSidebarContent,
} from "@/components/focus";
import { ProviderBadge } from "@/components/integrations";

// Sub-module imports
import type { BlockSubtask, GoalSelectorOption } from "./block-types";
import {
  type BlockSidebarData,
  type BlockGoalTask,
} from "./sidebar/sidebar-utils";
import { BlockGoalTaskRow } from "./sidebar/goal-task-row";
import {
  BlockSidebarSection,
  InlineBlockTaskCreator,
  AvailableTasksList,
  GoalSelector,
} from "./sidebar/sidebar-sections";
import { ExternalCalendarSyncSection } from "./sidebar/external-sync-section";
import {
  PropertyRow,
  DatePropertyRow,
  TimePropertyRow,
  FocusTimePropertyRow,
  NotesSubtasksSection,
} from "./sidebar/content-sections";

// =============================================================================
// BlockSidebar Props
// =============================================================================

interface BlockSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Block data to display */
  block: BlockSidebarData;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when block is deleted (removed from calendar) */
  onDelete?: () => void;
  /** Callback when block is marked complete */
  onMarkComplete?: () => void;
  /** Callback when block is marked incomplete */
  onMarkIncomplete?: () => void;
  /** Callback when title is updated */
  onTitleChange?: (title: string) => void;
  /** Callback when date is updated */
  onDateChange?: (date: string) => void;
  /** Callback when start time is updated */
  onStartTimeChange?: (startTime: string) => void;
  /** Callback when end time is updated */
  onEndTimeChange?: (endTime: string) => void;
  /** Callback when notes are updated */
  onNotesChange?: (notes: string) => void;

  // Subtask callbacks (ephemeral, block-scoped)
  /** Callback to add a new subtask with the given label */
  onAddSubtask?: (label: string) => void;
  /** Callback when a subtask is toggled */
  onToggleSubtask?: (subtaskId: string) => void;
  /** Callback when subtask text is updated */
  onUpdateSubtask?: (subtaskId: string, text: string) => void;
  /** Callback to delete a subtask */
  onDeleteSubtask?: (subtaskId: string) => void;

  // Goal task callbacks (only for goal blocks)
  /** Callback when a goal task is toggled */
  onToggleGoalTask?: (taskId: string) => void;
  /** Callback to create a new task and assign it to this block */
  onCreateTask?: (label: string) => void;
  /** Available tasks from the goal that can be assigned (should be filtered to unscheduled, incomplete tasks) */
  availableGoalTasks?: BlockGoalTask[];
  /** Callback to assign an existing goal task to this block */
  onAssignTask?: (taskId: string) => void;
  /** Callback to unassign a goal task from this block */
  onUnassignTask?: (taskId: string) => void;

  // Goal task context callbacks (for viewing/editing task details within goal blocks)
  /** Callback to update a goal task's properties (label, description) */
  onUpdateGoalTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  /** Callback to add a subtask to a goal task */
  onAddGoalTaskSubtask?: (taskId: string, label: string) => void;
  /** Callback to toggle a goal task's subtask completion */
  onToggleGoalTaskSubtask?: (taskId: string, subtaskId: string) => void;
  /** Callback to update a goal task's subtask label */
  onUpdateGoalTaskSubtask?: (
    taskId: string,
    subtaskId: string,
    label: string,
  ) => void;
  /** Callback to delete a goal task's subtask */
  onDeleteGoalTaskSubtask?: (taskId: string, subtaskId: string) => void;

  // Goal selection (for newly created blocks without a goal)
  /** Available goals for selection (shown when block has no goal assigned) */
  availableGoals?: GoalSelectorOption[];
  /** Callback when user selects a goal for this block (one-time) */
  onGoalSelect?: (goalId: string) => void;

  // Focus mode props
  /** Whether this block is currently being focused on */
  isFocused?: boolean;
  /** Whether the focus timer is running (not paused) */
  focusIsRunning?: boolean;
  /** Elapsed focus time in milliseconds */
  focusElapsedMs?: number;
  /** Called when user clicks Start Focus button */
  onStartFocus?: () => void;
  /** Called when user clicks Pause button */
  onPauseFocus?: () => void;
  /** Called when user clicks Resume button */
  onResumeFocus?: () => void;
  /** Called when user clicks Stop button to end focus */
  onEndFocus?: () => void;
  /** Whether another block is currently being focused on (disables Start Focus button) */
  focusDisabled?: boolean;

  // Focus time tracking (accumulated time from focus sessions)
  /** Total accumulated focus time for this block (in minutes) */
  totalFocusedMinutes?: number;
  /** Callback when focus time is manually edited */
  onFocusedMinutesChange?: (minutes: number) => void;

  // External calendar sync (only for goal/task blocks when sync is enabled)
  /** Computed sync state for this block */
  syncState?: BlockSyncState;
  /** Current block-level sync settings */
  blockSyncSettings?: BlockSyncSettings;
  /** Callback to update block sync appearance override */
  onSyncAppearanceChange?: (appearance: AppearanceOverride) => void;
  /** Callback to update block sync custom label */
  onSyncCustomLabelChange?: (label: string) => void;
}

// =============================================================================
// BlockSidebar Component
// =============================================================================

function BlockSidebar({
  block,
  onClose,
  onDelete,
  onMarkComplete,
  onMarkIncomplete,
  onTitleChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onNotesChange,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleGoalTask,
  onCreateTask,
  availableGoalTasks,
  onAssignTask,
  onUnassignTask,
  // Goal task context callbacks
  onUpdateGoalTask,
  onAddGoalTaskSubtask,
  onToggleGoalTaskSubtask,
  onUpdateGoalTaskSubtask,
  onDeleteGoalTaskSubtask,
  // Goal selection
  availableGoals,
  onGoalSelect,
  // Focus mode
  isFocused,
  focusIsRunning,
  focusElapsedMs,
  onStartFocus,
  onPauseFocus,
  onResumeFocus,
  onEndFocus,
  focusDisabled,
  // Focus time tracking
  totalFocusedMinutes,
  onFocusedMinutesChange,
  // External calendar sync
  syncState,
  blockSyncSettings,
  onSyncAppearanceChange,
  onSyncCustomLabelChange,
  className,
  ...props
}: BlockSidebarProps) {
  const isGoalBlock = block.blockType === "goal";
  const isTaskBlock = block.blockType === "task";
  const isEssentialBlock = block.blockType === "essential";
  const isExternalBlock = block.blockType === "external";

  // Get the source info (goal or essential)
  const sourceInfo = block.goal ?? block.essential;

  // Goal task expansion state (accordion - one at a time)
  const [expandedGoalTaskId, setExpandedGoalTaskId] = React.useState<
    string | null
  >(null);

  const handleGoalTaskExpand = React.useCallback((taskId: string) => {
    setExpandedGoalTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  // Render focus mode layout when this block is being focused
  if (isFocused) {
    return (
      <div
        className={cn(
          "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
          className,
        )}
        {...props}
      >
        <FocusSidebarContent
          block={block}
          elapsedMs={focusElapsedMs ?? 0}
          isRunning={focusIsRunning ?? false}
          onPause={onPauseFocus}
          onResume={onResumeFocus}
          onEnd={onEndFocus}
          onClose={onClose}
          onNotesChange={onNotesChange}
          onToggleGoalTask={onToggleGoalTask}
          onCreateTask={onCreateTask}
          onUnassignTask={onUnassignTask}
          // Goal task context callbacks
          onUpdateGoalTask={onUpdateGoalTask}
          onAddGoalTaskSubtask={onAddGoalTaskSubtask}
          onToggleGoalTaskSubtask={onToggleGoalTaskSubtask}
          onUpdateGoalTaskSubtask={onUpdateGoalTaskSubtask}
          onDeleteGoalTaskSubtask={onDeleteGoalTaskSubtask}
          // Subtask callbacks
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      </div>
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
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-3">
        {/* Header actions row */}
        {(onClose ||
          onDelete ||
          (block.status === "completed" && onMarkIncomplete)) && (
          <div className="flex justify-end gap-1">
            {/* Mark incomplete button - only when completed (not for essentials, allowed for external) */}
            {!isEssentialBlock &&
              block.status === "completed" &&
              onMarkIncomplete && (
                <button
                  onClick={onMarkIncomplete}
                  aria-label="Mark incomplete"
                  title="Mark incomplete"
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RiCheckboxCircleFill className="size-4" />
                </button>
              )}
            {/* Delete button */}
            {onDelete && (
              <button
                onClick={onDelete}
                aria-label="Delete block"
                title="Delete block"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <RiDeleteBinLine className="size-4" />
              </button>
            )}
            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* Title row */}
        {onTitleChange ? (
          <input
            type="text"
            value={block.title}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className={cn(
              "w-full bg-transparent text-lg font-semibold text-foreground leading-tight",
              "outline-none placeholder:text-muted-foreground/60",
              "focus:outline-none",
            )}
            placeholder="Block title..."
          />
        ) : (
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            {block.title}
          </h2>
        )}

        {/* Properties – Notion/Linear 2-column layout */}
        <div className="flex flex-col gap-0.5 pt-1">
          {/* Goal */}
          <PropertyRow label="Goal">
            {isExternalBlock && block.sourceProvider ? (
              <div className="flex items-center gap-2 px-2 py-1">
                <ProviderBadge provider={block.sourceProvider} size="md" />
                <span className="text-sm text-foreground">
                  {block.sourceCalendarName ?? "External Calendar"}
                </span>
              </div>
            ) : sourceInfo ? (
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="flex size-4 shrink-0 items-center justify-center rounded bg-muted/60">
                  <sourceInfo.icon
                    className={cn("size-2.5", sourceInfo.color)}
                  />
                </div>
                <span className={cn("text-sm", sourceInfo.color)}>
                  {sourceInfo.label}
                </span>
              </div>
            ) : isGoalBlock &&
              availableGoals &&
              availableGoals.length > 0 &&
              onGoalSelect ? (
              <GoalSelector goals={availableGoals} onSelect={onGoalSelect} />
            ) : (
              <span className="px-2 py-1 text-sm text-muted-foreground/60">
                None
              </span>
            )}
          </PropertyRow>

          {/* Date */}
          <DatePropertyRow block={block} onDateChange={onDateChange} />

          {/* Time */}
          <TimePropertyRow
            block={block}
            onStartTimeChange={onStartTimeChange}
            onEndTimeChange={onEndTimeChange}
          />

          {/* Focus time (non-essential blocks only) */}
          {!isEssentialBlock && totalFocusedMinutes !== undefined && (
            <FocusTimePropertyRow
              focusedMinutes={totalFocusedMinutes}
              onFocusedMinutesChange={onFocusedMinutesChange}
            />
          )}
        </div>

        {/* Action buttons row – Complete & Start Focus side by side */}
        {!isEssentialBlock && (
          <>
            {isFocused ? (
              <FocusTimer
                elapsedMs={focusElapsedMs ?? 0}
                isRunning={focusIsRunning ?? false}
                color={block.color}
                onPause={onPauseFocus}
                onResume={onResumeFocus}
                onStop={onEndFocus}
              />
            ) : block.status !== "completed" ? (
              <div className="flex gap-2">
                {onMarkComplete && (
                  <button
                    onClick={onMarkComplete}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                  >
                    <RiCheckLine className="size-4" />
                    <span>Complete</span>
                  </button>
                )}
                {onStartFocus && (
                  <StartFocusButton
                    onClick={onStartFocus}
                    disabled={focusDisabled}
                    className="flex-1 w-auto"
                  />
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-border/60" />

      {/* Content – notes then tasks, no section titles */}
      <div className="flex flex-col gap-5 px-5 pb-5 pt-4">
        {/* Notes / description */}
        <NotesSubtasksSection
          block={block}
          isTaskBlock={isTaskBlock}
          onNotesChange={onNotesChange}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />

        {/* Goal Tasks (only for goal blocks with assigned goal) */}
        {isGoalBlock && block.goal && (
          <div className="flex flex-col">
            {block.goalTasks.length > 0 &&
              block.goalTasks.map((task) => (
                <BlockGoalTaskRow
                  key={task.id}
                  task={task}
                  isExpanded={expandedGoalTaskId === task.id}
                  onExpand={handleGoalTaskExpand}
                  onToggle={onToggleGoalTask}
                  onUnassign={onUnassignTask}
                  onUpdateTask={
                    onUpdateGoalTask
                      ? (updates) => onUpdateGoalTask(task.id, updates)
                      : undefined
                  }
                  onAddSubtask={
                    onAddGoalTaskSubtask
                      ? (label) => onAddGoalTaskSubtask(task.id, label)
                      : undefined
                  }
                  onToggleSubtask={
                    onToggleGoalTaskSubtask
                      ? (subtaskId) =>
                          onToggleGoalTaskSubtask(task.id, subtaskId)
                      : undefined
                  }
                  onUpdateSubtask={
                    onUpdateGoalTaskSubtask
                      ? (subtaskId, label) =>
                          onUpdateGoalTaskSubtask(task.id, subtaskId, label)
                      : undefined
                  }
                  onDeleteSubtask={
                    onDeleteGoalTaskSubtask
                      ? (subtaskId) =>
                          onDeleteGoalTaskSubtask(task.id, subtaskId)
                      : undefined
                  }
                />
              ))}

            {onCreateTask && <InlineBlockTaskCreator onSave={onCreateTask} />}

            {availableGoalTasks &&
              availableGoalTasks.length > 0 &&
              onAssignTask && (
                <AvailableTasksList
                  tasks={availableGoalTasks}
                  onAssign={onAssignTask}
                />
              )}
          </div>
        )}

        {/* External Calendar Sync Section */}
        {(isGoalBlock || isTaskBlock) &&
          !isExternalBlock &&
          syncState &&
          syncState.isSynced &&
          syncState.destinations.length > 0 && (
            <ExternalCalendarSyncSection
              syncState={syncState}
              blockSyncSettings={blockSyncSettings}
              onSyncAppearanceChange={onSyncAppearanceChange}
              onSyncCustomLabelChange={onSyncCustomLabelChange}
              goalName={block.goal?.label}
              blockTitle={block.title}
            />
          )}
      </div>
    </div>
  );
}

// =============================================================================
// Exports (backward-compatible public API)
// =============================================================================

export { BlockSidebar, BlockGoalTaskRow, BlockSidebarSection };
export type {
  BlockSidebarProps,
  BlockSidebarData,
  BlockGoalTask,
  BlockSubtask,
  GoalSelectorOption,
};

// Re-export types from sub-modules and block-types for backward compatibility
export type { BlockSidebarSource } from "./block-types";
export type { BlockType } from "@/lib/types";
