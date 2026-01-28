"use client";

/**
 * Composable hooks for the Shell example component.
 * These hooks extract focused concerns from ShellDemoContent to improve
 * maintainability and testability.
 *
 * These are internal demo utilities and are NOT part of the public API.
 */

import * as React from "react";
import type { CalendarEvent, ExternalDragPreview } from "@/components/calendar";
import type { BacklogMode } from "@/components/backlog";
import type { UseBlockSidebarHandlersReturn } from "@/components/block";
import type { DragContextValue } from "@/components/drag";
import type { DragItem, DropPosition } from "@/lib/drag-types";
import type { GoalColor } from "@/lib/colors";
import {
  getDefaultDuration,
  getDragItemTitle,
  getDragItemColor,
} from "@/lib/drag-types";

// =============================================================================
// useShellLayout - UI visibility and panel state management
// =============================================================================

export interface UseShellLayoutOptions {
  /** Callback when an event is created (to auto-select it) */
  onEventCreated?: (event: CalendarEvent) => void;
}

export interface UseShellLayoutReturn {
  // Visibility toggles
  showPlanWeek: boolean;
  setShowPlanWeek: React.Dispatch<React.SetStateAction<boolean>>;
  showCalendar: boolean;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showRightSidebar: boolean;
  setShowRightSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showTasks: boolean;
  setShowTasks: React.Dispatch<React.SetStateAction<boolean>>;
  showInspirationGallery: boolean;
  setShowInspirationGallery: React.Dispatch<React.SetStateAction<boolean>>;

  // Mode state
  backlogMode: BacklogMode;
  setBacklogMode: React.Dispatch<React.SetStateAction<BacklogMode>>;

  // Planning mode
  isPlanningMode: boolean;
  setIsPlanningMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Selection state
  selectedEventId: string | null;
  setSelectedEventId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedGoalId: string | null;
  setSelectedGoalId: React.Dispatch<React.SetStateAction<string | null>>;

  // Goal notes (local state for demo)
  goalNotes: Record<string, string>;
  setGoalNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  // Right sidebar content management
  renderedContent: "block" | "analytics" | null;
  frozenSidebarData: UseBlockSidebarHandlersReturn["sidebarData"];
  isRightSidebarOpen: boolean;
  updateFrozenSidebarData: (
    data: UseBlockSidebarHandlersReturn["sidebarData"],
  ) => void;

  // Computed values
  isPlanning: boolean;
  isGoalDetailMode: boolean;

  // Handlers
  handleEventClick: (event: CalendarEvent) => void;
  handleCloseSidebar: () => void;
  handleSelectGoal: (goalId: string) => void;
  handleCloseGoalDetail: () => void;
  handleBrowseInspiration: () => void;
  handleCloseInspiration: () => void;
  handlePlanWeekClick: () => void;
  handleGoalNotesChange: (notes: string) => void;
  handleAnalyticsToggle: () => void;
}

export function useShellLayout(): UseShellLayoutReturn {
  // -------------------------------------------------------------------------
  // UI Visibility State
  // -------------------------------------------------------------------------
  const [showPlanWeek, setShowPlanWeek] = React.useState(true);
  const [showCalendar, setShowCalendar] = React.useState(true);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [showRightSidebar, setShowRightSidebar] = React.useState(false);
  const [showTasks, setShowTasks] = React.useState(true);
  const [showInspirationGallery, setShowInspirationGallery] =
    React.useState(false);

  // -------------------------------------------------------------------------
  // Mode State
  // -------------------------------------------------------------------------
  const [backlogMode, setBacklogMode] = React.useState<BacklogMode>("view");
  const [isPlanningMode, setIsPlanningMode] = React.useState(false);

  // -------------------------------------------------------------------------
  // Selection State
  // -------------------------------------------------------------------------
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null,
  );
  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(
    null,
  );

  // -------------------------------------------------------------------------
  // Goal Notes (local state for demo)
  // -------------------------------------------------------------------------
  const [goalNotes, setGoalNotes] = React.useState<Record<string, string>>({});

  // -------------------------------------------------------------------------
  // Right Sidebar Content State
  // -------------------------------------------------------------------------
  const [renderedContent, setRenderedContent] = React.useState<
    "block" | "analytics" | null
  >(null);
  const [frozenSidebarData, setFrozenSidebarData] =
    React.useState<UseBlockSidebarHandlersReturn["sidebarData"]>(null);

  // Compute target content based on selection state
  const targetContent: "block" | "analytics" | null = selectedEventId
    ? "block"
    : showRightSidebar
      ? "analytics"
      : null;

  // Update rendered content when target changes
  React.useEffect(() => {
    if (targetContent !== null) {
      setRenderedContent(targetContent);
    }
  }, [targetContent]);

  const isRightSidebarOpen = targetContent !== null;

  const updateFrozenSidebarData = React.useCallback(
    (data: UseBlockSidebarHandlersReturn["sidebarData"]) => {
      if (data) {
        setFrozenSidebarData(data);
      }
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------
  const isPlanning = isPlanningMode;
  const isGoalDetailMode = backlogMode === "goal-detail";

  // -------------------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------------------
  const handleEventClick = React.useCallback((event: CalendarEvent) => {
    setSelectedEventId(event.id);
  }, []);

  const handleCloseSidebar = React.useCallback(() => {
    setSelectedEventId(null);
  }, []);

  // ESC key to close sidebar
  React.useEffect(() => {
    if (!selectedEventId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEventId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEventId]);

  // -------------------------------------------------------------------------
  // Goal Detail Mode Handlers
  // -------------------------------------------------------------------------
  const handleSelectGoal = React.useCallback((goalId: string) => {
    setSelectedGoalId(goalId);
    setBacklogMode("goal-detail");
    // Close inspiration gallery if open
    setShowInspirationGallery(false);
    // Close any open right sidebar content
    setSelectedEventId(null);
    setShowRightSidebar(false);
  }, []);

  const handleCloseGoalDetail = React.useCallback(() => {
    setSelectedGoalId(null);
    setBacklogMode("view");
  }, []);

  const handleGoalNotesChange = React.useCallback(
    (notes: string) => {
      setGoalNotes((prev) => {
        if (selectedGoalId) {
          return { ...prev, [selectedGoalId]: notes };
        }
        return prev;
      });
    },
    [selectedGoalId],
  );

  // -------------------------------------------------------------------------
  // Inspiration Gallery Handlers
  // -------------------------------------------------------------------------
  const handleBrowseInspiration = React.useCallback(() => {
    setShowInspirationGallery(true);
    // Clear selected goal so nothing appears active in the goal list
    setSelectedGoalId(null);
  }, []);

  const handleCloseInspiration = React.useCallback(() => {
    setShowInspirationGallery(false);
  }, []);

  // -------------------------------------------------------------------------
  // Plan Week Toggle
  // -------------------------------------------------------------------------
  const handlePlanWeekClick = React.useCallback(() => {
    setIsPlanningMode((prev) => !prev);
  }, []);

  // -------------------------------------------------------------------------
  // Analytics Toggle
  // -------------------------------------------------------------------------
  const handleAnalyticsToggle = React.useCallback(() => {
    if (selectedEventId) {
      setSelectedEventId(null);
      setShowRightSidebar(true);
    } else {
      setShowRightSidebar((prev) => !prev);
    }
  }, [selectedEventId]);

  return {
    // Visibility toggles
    showPlanWeek,
    setShowPlanWeek,
    showCalendar,
    setShowCalendar,
    showSidebar,
    setShowSidebar,
    showRightSidebar,
    setShowRightSidebar,
    showTasks,
    setShowTasks,
    showInspirationGallery,
    setShowInspirationGallery,

    // Mode state
    backlogMode,
    setBacklogMode,
    isPlanningMode,
    setIsPlanningMode,

    // Selection state
    selectedEventId,
    setSelectedEventId,
    selectedGoalId,
    setSelectedGoalId,

    // Goal notes
    goalNotes,
    setGoalNotes,

    // Right sidebar content management
    renderedContent,
    frozenSidebarData,
    isRightSidebarOpen,
    updateFrozenSidebarData,

    // Computed values
    isPlanning,
    isGoalDetailMode,

    // Handlers
    handleEventClick,
    handleCloseSidebar,
    handleSelectGoal,
    handleCloseGoalDetail,
    handleBrowseInspiration,
    handleCloseInspiration,
    handlePlanWeekClick,
    handleGoalNotesChange,
    handleAnalyticsToggle,
  };
}

// =============================================================================
// useShellFocus - Focus mode coordination (computed values and handlers)
// =============================================================================

export interface FocusSessionState {
  blockId: string;
  blockTitle: string;
  blockColor: GoalColor;
}

export interface UseShellFocusOptions {
  /** Current focus session from useFocusSession */
  focusSession: FocusSessionState | null;
  /** Currently selected event ID (to determine if focused block is selected) */
  selectedEventId: string | null;
  /** Selected event (for starting focus) */
  selectedEvent: CalendarEvent | null;
  /** Start focus callback from useFocusSession */
  startFocus: (blockId: string, title: string, color: GoalColor) => void;
  /** Callback to navigate to focused block */
  onNavigateToBlock: (blockId: string) => void;
}

export interface UseShellFocusReturn {
  /** Whether the currently selected sidebar block is the focused block */
  isSidebarBlockFocused: boolean;
  /** Whether to show the focus indicator in the toolbar */
  showFocusIndicator: boolean;
  /** Handler to start focus on the selected event */
  handleStartFocus: () => void;
  /** Handler to navigate to the focused block */
  handleNavigateToFocusedBlock: () => void;
}

export function useShellFocus({
  focusSession,
  selectedEventId,
  selectedEvent,
  startFocus,
  onNavigateToBlock,
}: UseShellFocusOptions): UseShellFocusReturn {
  // Computed values
  const isSidebarBlockFocused = focusSession?.blockId === selectedEventId;
  const showFocusIndicator =
    focusSession !== null && selectedEventId !== focusSession?.blockId;

  // Handlers
  const handleStartFocus = React.useCallback(() => {
    if (!selectedEvent) return;
    startFocus(selectedEvent.id, selectedEvent.title, selectedEvent.color);
  }, [selectedEvent, startFocus]);

  const handleNavigateToFocusedBlock = React.useCallback(() => {
    if (focusSession) {
      onNavigateToBlock(focusSession.blockId);
    }
  }, [focusSession, onNavigateToBlock]);

  return {
    isSidebarBlockFocused,
    showFocusIndicator,
    handleStartFocus,
    handleNavigateToFocusedBlock,
  };
}

// =============================================================================
// useExternalDragPreview - Drag preview generation for calendar
// =============================================================================

export interface UseExternalDragPreviewOptions {
  /** Drag context from DragProvider (optional - may be outside provider) */
  dragContext: DragContextValue | null;
  /** Current week dates for drop handling */
  weekDates: Date[];
  /** Handler to process drops */
  onDrop: (item: DragItem, position: DropPosition, weekDates: Date[]) => void;
}

export interface UseExternalDragPreviewReturn {
  /** Preview data to pass to Calendar's externalDragPreview prop */
  externalDragPreview: ExternalDragPreview | null;
  /** Handler for drops on the calendar time grid */
  handleExternalDrop: (dayIndex: number, startMinutes: number) => void;
  /** Handler for drops on day headers (deadlines) */
  handleDeadlineDrop: (dayIndex: number) => void;
  /** Whether an external drag is currently in progress */
  isDragging: boolean;
}

export function useExternalDragPreview({
  dragContext,
  weekDates,
  onDrop,
}: UseExternalDragPreviewOptions): UseExternalDragPreviewReturn {
  const dragState = dragContext?.state ?? null;
  const isDragging = dragState?.isDragging ?? false;
  const dragItem = dragState?.item ?? null;
  const previewPosition = dragState?.previewPosition ?? null;

  const externalDragPreview = React.useMemo(() => {
    if (!isDragging || !dragItem || !previewPosition) return null;
    if (previewPosition.dropTarget !== "time-grid") return null;

    const color = getDragItemColor(dragItem);
    if (!color) return null;

    // Use adaptive duration when available (shift+drag mode), otherwise default
    const duration =
      previewPosition.adaptiveDuration ?? getDefaultDuration(dragItem.type);

    return {
      dayIndex: previewPosition.dayIndex,
      startMinutes: previewPosition.startMinutes ?? 0,
      durationMinutes: duration,
      color,
      title: getDragItemTitle(dragItem),
    };
  }, [isDragging, dragItem, previewPosition]);

  const handleExternalDrop = React.useCallback(
    (dayIndex: number, startMinutes: number) => {
      if (!dragItem) return;

      let position: DropPosition;
      if (previewPosition && previewPosition.dropTarget === "existing-block") {
        position = previewPosition;
      } else {
        // Preserve adaptiveDuration from preview position if available
        position = {
          dayIndex,
          startMinutes,
          dropTarget: "time-grid" as const,
          adaptiveDuration: previewPosition?.adaptiveDuration,
        };
      }
      onDrop(dragItem, position, weekDates);
    },
    [dragItem, previewPosition, onDrop, weekDates],
  );

  const handleDeadlineDrop = React.useCallback(
    (dayIndex: number) => {
      if (!dragItem || !dragContext) return;
      onDrop(dragItem, { dayIndex, dropTarget: "day-header" }, weekDates);
      dragContext.endDrag();
    },
    [dragItem, dragContext, onDrop, weekDates],
  );

  return {
    externalDragPreview,
    handleExternalDrop,
    handleDeadlineDrop,
    isDragging,
  };
}

// =============================================================================
// useToastAggregator - Aggregate multiple toast sources
// =============================================================================

export interface UseToastAggregatorReturn {
  /** The current toast message to display (first non-null source wins) */
  toastMessage: string | null;
  /** Setter for sidebar toast messages */
  setSidebarToast: React.Dispatch<React.SetStateAction<string | null>>;
  /** Setter for deadline toast messages */
  setDeadlineToast: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useToastAggregator(
  /** Toast message from calendar keyboard shortcuts */
  calendarToastMessage: string | null,
): UseToastAggregatorReturn {
  const [sidebarToastMessage, setSidebarToastMessage] = React.useState<
    string | null
  >(null);
  const [deadlineToastMessage, setDeadlineToastMessage] = React.useState<
    string | null
  >(null);

  // Auto-clear sidebar toast
  React.useEffect(() => {
    if (sidebarToastMessage) {
      const timer = setTimeout(() => setSidebarToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [sidebarToastMessage]);

  // Auto-clear deadline toast
  React.useEffect(() => {
    if (deadlineToastMessage) {
      const timer = setTimeout(() => setDeadlineToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [deadlineToastMessage]);

  // Priority: calendar > sidebar > deadline
  const toastMessage =
    calendarToastMessage ?? sidebarToastMessage ?? deadlineToastMessage;

  return {
    toastMessage,
    setSidebarToast: setSidebarToastMessage,
    setDeadlineToast: setDeadlineToastMessage,
  };
}
