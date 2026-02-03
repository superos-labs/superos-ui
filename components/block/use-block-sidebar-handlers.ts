"use client";

import * as React from "react";
import type { CalendarEvent } from "@/components/calendar";
import type {
  ScheduleGoal,
  ScheduleEssential,
  UseUnifiedScheduleReturn,
  BlockSyncState,
  BlockSyncSettings,
} from "@/lib/unified-schedule";
import type {
  CalendarIntegrationState,
  AppearanceOverride,
} from "@/lib/calendar-sync";
import { getBlockSyncState } from "@/lib/calendar-sync";
import { eventToBlockSidebarData, parseTimeToMinutes } from "@/lib/adapters";
import type { EventToSidebarResult } from "@/lib/adapters";
import { getIconColorClass } from "@/lib/colors";

// ============================================================================
// Types
// ============================================================================

export interface UseBlockSidebarHandlersOptions {
  /** Currently selected event (or null) */
  selectedEvent: CalendarEvent | null;
  /** Goals from unified schedule */
  goals: ScheduleGoal[];
  /** Essentials from unified schedule */
  essentials: ScheduleEssential[];
  /** Week dates for the current view */
  weekDates: Date[];
  /** Unified schedule methods */
  schedule: Pick<
    UseUnifiedScheduleReturn,
    | "updateEvent"
    | "updateTask"
    | "toggleTaskComplete"
    | "addTask"
    | "addSubtask"
    | "toggleSubtaskComplete"
    | "updateSubtask"
    | "deleteSubtask"
    | "assignTaskToBlock"
    | "unassignTaskFromBlock"
    | "calendarHandlers"
    | "updateBlockSyncSettings"
  >;
  /** Calendar integration state for computing sync status (optional) */
  calendarIntegration?: CalendarIntegrationState;
  /** Callback when toast message should be shown */
  onToast?: (message: string) => void;
  /** Callback to end any active focus session (called when marking block complete) */
  onEndFocus?: () => void;
  /** Callback to close the sidebar (called after deleting block) */
  onClose?: () => void;
}

export interface UseBlockSidebarHandlersReturn {
  /** Computed sidebar data for the selected event (includes block and availableGoalTasks) */
  sidebarData: EventToSidebarResult | null;
  /** Available goals for goal selection */
  availableGoals: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;
  /** Computed sync state for the selected block */
  syncState: BlockSyncState | undefined;
  /** Current block sync settings */
  blockSyncSettings: BlockSyncSettings | undefined;
  /** All sidebar handlers to spread onto BlockSidebar */
  handlers: {
    onTitleChange: (title: string) => void;
    onDateChange: (date: string) => void;
    onStartTimeChange: (startTime: string) => void;
    onEndTimeChange: (endTime: string) => void;
    onNotesChange: (notes: string) => void;
    onToggleGoalTask: (taskId: string) => void;
    onAddSubtask: (label: string) => void;
    onToggleSubtask: (subtaskId: string) => void;
    onUpdateSubtask: (subtaskId: string, label: string) => void;
    onDeleteSubtask: (subtaskId: string) => void;
    onAssignTask: (taskId: string) => void;
    onUnassignTask: (taskId: string) => void;
    onCreateTask: (label: string) => void;
    onGoalSelect: (goalId: string) => void;
    onMarkComplete: () => void;
    onMarkIncomplete: () => void;
    onDelete: () => void;
    // Goal task context callbacks (for expanding tasks in goal blocks)
    onUpdateGoalTask: (
      taskId: string,
      updates: Partial<{ label: string; description?: string }>
    ) => void;
    onAddGoalTaskSubtask: (taskId: string, label: string) => void;
    onToggleGoalTaskSubtask: (taskId: string, subtaskId: string) => void;
    onUpdateGoalTaskSubtask: (
      taskId: string,
      subtaskId: string,
      label: string
    ) => void;
    onDeleteGoalTaskSubtask: (taskId: string, subtaskId: string) => void;
    // External calendar sync
    onSyncAppearanceChange: (appearance: AppearanceOverride) => void;
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBlockSidebarHandlers({
  selectedEvent,
  goals,
  essentials,
  weekDates,
  schedule,
  calendarIntegration,
  onToast,
  onEndFocus,
  onClose,
}: UseBlockSidebarHandlersOptions): UseBlockSidebarHandlersReturn {
  const {
    updateEvent,
    updateTask,
    toggleTaskComplete,
    addTask,
    addSubtask,
    toggleSubtaskComplete,
    updateSubtask,
    deleteSubtask,
    assignTaskToBlock,
    unassignTaskFromBlock,
    calendarHandlers,
    updateBlockSyncSettings,
  } = schedule;

  // Compute sidebar data for the selected event
  const sidebarData = React.useMemo(() => {
    if (!selectedEvent) return null;
    return eventToBlockSidebarData(selectedEvent, goals, essentials, weekDates);
  }, [selectedEvent, goals, essentials, weekDates]);

  // Compute sync state for the selected block
  const syncState = React.useMemo<BlockSyncState | undefined>(() => {
    if (!selectedEvent || !calendarIntegration) return undefined;
    // Only compute sync state for goal/task blocks
    if (
      selectedEvent.blockType !== "goal" &&
      selectedEvent.blockType !== "task"
    ) {
      return undefined;
    }
    // Find the associated goal for this block
    const goal = selectedEvent.sourceGoalId
      ? goals.find((g) => g.id === selectedEvent.sourceGoalId)
      : undefined;

    return getBlockSyncState(selectedEvent, goal, calendarIntegration);
  }, [selectedEvent, calendarIntegration, goals]);

  // Get block sync settings from the event
  const blockSyncSettings = selectedEvent?.syncSettings;

  // Available goals for goal selection
  const availableGoals = React.useMemo(
    () =>
      goals.map((g) => ({
        id: g.id,
        label: g.label,
        icon: g.icon,
        color: getIconColorClass(g.color),
      })),
    [goals]
  );

  // -------------------------------------------------------------------------
  // Block Property Handlers
  // -------------------------------------------------------------------------

  const handleTitleChange = React.useCallback(
    (title: string) => {
      if (!selectedEvent) return;
      updateEvent(selectedEvent.id, { title });
      // If task block, also update the task label
      if (selectedEvent.sourceTaskId && selectedEvent.sourceGoalId) {
        updateTask(selectedEvent.sourceGoalId, selectedEvent.sourceTaskId, {
          label: title,
        });
      }
    },
    [selectedEvent, updateEvent, updateTask]
  );

  const handleDateChange = React.useCallback(
    (newDate: string) => {
      if (!selectedEvent) return;
      const newDayIndex = weekDates.findIndex(
        (d) => d.toISOString().split("T")[0] === newDate
      );
      if (newDayIndex >= 0) {
        updateEvent(selectedEvent.id, { date: newDate, dayIndex: newDayIndex });
      }
    },
    [selectedEvent, weekDates, updateEvent]
  );

  const handleStartTimeChange = React.useCallback(
    (startTime: string) => {
      if (!selectedEvent) return;
      const newStartMinutes = parseTimeToMinutes(startTime);
      updateEvent(selectedEvent.id, { startMinutes: newStartMinutes });
    },
    [selectedEvent, updateEvent]
  );

  const handleEndTimeChange = React.useCallback(
    (endTime: string) => {
      if (!selectedEvent) return;
      const newEndMinutes = parseTimeToMinutes(endTime);
      const newDuration = newEndMinutes - selectedEvent.startMinutes;
      if (newDuration > 0) {
        updateEvent(selectedEvent.id, { durationMinutes: newDuration });
      }
    },
    [selectedEvent, updateEvent]
  );

  const handleNotesChange = React.useCallback(
    (notes: string) => {
      if (!selectedEvent) return;
      updateEvent(selectedEvent.id, { notes });
      // Sync notes to task description for task blocks
      if (
        selectedEvent.blockType === "task" &&
        selectedEvent.sourceGoalId &&
        selectedEvent.sourceTaskId
      ) {
        updateTask(selectedEvent.sourceGoalId, selectedEvent.sourceTaskId, {
          description: notes,
        });
      }
    },
    [selectedEvent, updateEvent, updateTask]
  );

  // -------------------------------------------------------------------------
  // Task/Subtask Handlers
  // -------------------------------------------------------------------------

  const handleToggleGoalTask = React.useCallback(
    (taskId: string) => {
      if (!selectedEvent?.sourceGoalId) return;
      toggleTaskComplete(selectedEvent.sourceGoalId, taskId);
    },
    [selectedEvent, toggleTaskComplete]
  );

  const handleAddSubtask = React.useCallback(
    (label: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return;
      addSubtask(selectedEvent.sourceGoalId, selectedEvent.sourceTaskId, label);
    },
    [selectedEvent, addSubtask]
  );

  const handleToggleSubtask = React.useCallback(
    (subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return;
      toggleSubtaskComplete(
        selectedEvent.sourceGoalId,
        selectedEvent.sourceTaskId,
        subtaskId
      );
    },
    [selectedEvent, toggleSubtaskComplete]
  );

  const handleUpdateSubtask = React.useCallback(
    (subtaskId: string, label: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return;
      updateSubtask(
        selectedEvent.sourceGoalId,
        selectedEvent.sourceTaskId,
        subtaskId,
        label
      );
    },
    [selectedEvent, updateSubtask]
  );

  const handleDeleteSubtask = React.useCallback(
    (subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId || !selectedEvent?.sourceTaskId) return;
      deleteSubtask(
        selectedEvent.sourceGoalId,
        selectedEvent.sourceTaskId,
        subtaskId
      );
    },
    [selectedEvent, deleteSubtask]
  );

  // -------------------------------------------------------------------------
  // Task Assignment Handlers (for goal blocks)
  // -------------------------------------------------------------------------

  const handleAssignTask = React.useCallback(
    (taskId: string) => {
      if (!selectedEvent) return;
      assignTaskToBlock(selectedEvent.id, taskId);
    },
    [selectedEvent, assignTaskToBlock]
  );

  const handleUnassignTask = React.useCallback(
    (taskId: string) => {
      if (!selectedEvent) return;
      unassignTaskFromBlock(selectedEvent.id, taskId);
    },
    [selectedEvent, unassignTaskFromBlock]
  );

  const handleCreateTask = React.useCallback(
    (label: string) => {
      if (!selectedEvent?.sourceGoalId) return;
      const newTaskId = addTask(selectedEvent.sourceGoalId, label);
      if (newTaskId) {
        assignTaskToBlock(selectedEvent.id, newTaskId);
      }
    },
    [selectedEvent, addTask, assignTaskToBlock]
  );

  // -------------------------------------------------------------------------
  // Goal Selection (for newly created blocks)
  // -------------------------------------------------------------------------

  const handleGoalSelect = React.useCallback(
    (goalId: string) => {
      if (!selectedEvent) return;
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      updateEvent(selectedEvent.id, {
        sourceGoalId: goalId,
        title: goal.label,
        color: goal.color,
        blockType: "goal",
      });
    },
    [selectedEvent, goals, updateEvent]
  );

  // -------------------------------------------------------------------------
  // Mark Complete/Incomplete
  // -------------------------------------------------------------------------

  const handleMarkComplete = React.useCallback(() => {
    if (!selectedEvent) return;
    // End focus session if this block is being focused
    onEndFocus?.();
    calendarHandlers.onEventStatusChange(selectedEvent.id, "completed");
    onToast?.("Marked complete");
  }, [selectedEvent, calendarHandlers, onToast, onEndFocus]);

  const handleMarkIncomplete = React.useCallback(() => {
    if (!selectedEvent) return;
    calendarHandlers.onEventStatusChange(selectedEvent.id, "planned");
    onToast?.("Marked incomplete");
  }, [selectedEvent, calendarHandlers, onToast]);

  const handleDelete = React.useCallback(() => {
    if (!selectedEvent) return;
    // End focus session if this block is being focused
    onEndFocus?.();
    calendarHandlers.onEventDelete(selectedEvent.id);
    onToast?.("Block deleted");
    // Close the sidebar after deletion
    onClose?.();
  }, [selectedEvent, calendarHandlers, onToast, onEndFocus, onClose]);

  // -------------------------------------------------------------------------
  // Goal Task Context Handlers (for expanding tasks in goal blocks)
  // -------------------------------------------------------------------------

  const handleUpdateGoalTask = React.useCallback(
    (
      taskId: string,
      updates: Partial<{ label: string; description?: string }>
    ) => {
      if (!selectedEvent?.sourceGoalId) return;
      updateTask(selectedEvent.sourceGoalId, taskId, updates);
    },
    [selectedEvent, updateTask]
  );

  const handleAddGoalTaskSubtask = React.useCallback(
    (taskId: string, label: string) => {
      if (!selectedEvent?.sourceGoalId) return;
      addSubtask(selectedEvent.sourceGoalId, taskId, label);
    },
    [selectedEvent, addSubtask]
  );

  const handleToggleGoalTaskSubtask = React.useCallback(
    (taskId: string, subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId) return;
      toggleSubtaskComplete(selectedEvent.sourceGoalId, taskId, subtaskId);
    },
    [selectedEvent, toggleSubtaskComplete]
  );

  const handleUpdateGoalTaskSubtask = React.useCallback(
    (taskId: string, subtaskId: string, label: string) => {
      if (!selectedEvent?.sourceGoalId) return;
      updateSubtask(selectedEvent.sourceGoalId, taskId, subtaskId, label);
    },
    [selectedEvent, updateSubtask]
  );

  const handleDeleteGoalTaskSubtask = React.useCallback(
    (taskId: string, subtaskId: string) => {
      if (!selectedEvent?.sourceGoalId) return;
      deleteSubtask(selectedEvent.sourceGoalId, taskId, subtaskId);
    },
    [selectedEvent, deleteSubtask]
  );

  // -------------------------------------------------------------------------
  // External Calendar Sync Handler
  // -------------------------------------------------------------------------

  const handleSyncAppearanceChange = React.useCallback(
    (appearance: AppearanceOverride) => {
      if (!selectedEvent) return;
      updateBlockSyncSettings(selectedEvent.id, {
        appearanceOverride: appearance,
      });
    },
    [selectedEvent, updateBlockSyncSettings]
  );

  // -------------------------------------------------------------------------
  // Return bundled handlers
  // -------------------------------------------------------------------------

  const handlers = React.useMemo(
    () => ({
      onTitleChange: handleTitleChange,
      onDateChange: handleDateChange,
      onStartTimeChange: handleStartTimeChange,
      onEndTimeChange: handleEndTimeChange,
      onNotesChange: handleNotesChange,
      onToggleGoalTask: handleToggleGoalTask,
      onAddSubtask: handleAddSubtask,
      onToggleSubtask: handleToggleSubtask,
      onUpdateSubtask: handleUpdateSubtask,
      onDeleteSubtask: handleDeleteSubtask,
      onAssignTask: handleAssignTask,
      onUnassignTask: handleUnassignTask,
      onCreateTask: handleCreateTask,
      onGoalSelect: handleGoalSelect,
      onMarkComplete: handleMarkComplete,
      onMarkIncomplete: handleMarkIncomplete,
      onDelete: handleDelete,
      onUpdateGoalTask: handleUpdateGoalTask,
      onAddGoalTaskSubtask: handleAddGoalTaskSubtask,
      onToggleGoalTaskSubtask: handleToggleGoalTaskSubtask,
      onUpdateGoalTaskSubtask: handleUpdateGoalTaskSubtask,
      onDeleteGoalTaskSubtask: handleDeleteGoalTaskSubtask,
      onSyncAppearanceChange: handleSyncAppearanceChange,
    }),
    [
      handleTitleChange,
      handleDateChange,
      handleStartTimeChange,
      handleEndTimeChange,
      handleNotesChange,
      handleToggleGoalTask,
      handleAddSubtask,
      handleToggleSubtask,
      handleUpdateSubtask,
      handleDeleteSubtask,
      handleAssignTask,
      handleUnassignTask,
      handleCreateTask,
      handleGoalSelect,
      handleMarkComplete,
      handleMarkIncomplete,
      handleDelete,
      handleUpdateGoalTask,
      handleAddGoalTaskSubtask,
      handleToggleGoalTaskSubtask,
      handleUpdateGoalTaskSubtask,
      handleDeleteGoalTaskSubtask,
      handleSyncAppearanceChange,
    ]
  );

  return {
    sidebarData,
    availableGoals,
    syncState,
    blockSyncSettings,
    handlers,
  };
}
