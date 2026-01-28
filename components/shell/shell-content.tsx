"use client";

/**
 * ShellContent - The core shell component for orchestrating the full application UI.
 *
 * This component handles the rendering of the calendar, backlog, analytics,
 * focus mode, and planning features. It manages its own UI layout state
 * (panel visibility, selections) while accepting business data and handlers via props.
 *
 * This is a feature component - it does NOT contain sample data or demo logic.
 *
 * Responsive behavior:
 * - Mobile/Tablet Portrait: Day view, bottom sheet for block details, full-screen overlay for backlog
 * - Tablet Landscape: Week view, bottom sheet for block details, full-screen overlay for backlog
 * - Desktop: Week view, inline sidebars for backlog and block details
 */

import * as React from "react";
import {
  Shell,
  ShellToolbar,
  ShellContent as ShellContentPrimitive,
} from "@/components/ui/shell";
import {
  BottomSheet,
  FullScreenOverlay,
  KeyboardShortcuts,
} from "@/components/ui";
import {
  Calendar,
  KeyboardToast,
  useCalendarKeyboard,
  useDeadlineKeyboard,
  formatWeekRange,
  type CalendarEvent,
  type ExternalDragPreview,
} from "@/components/calendar";
import {
  Backlog,
  GoalInspirationGallery,
  type BacklogItem,
  type BacklogMode,
  type NewGoalData,
  type InspirationCategory,
} from "@/components/backlog";
import { WeeklyAnalytics } from "@/components/weekly-analytics";
import { BlockSidebar, useBlockSidebarHandlers } from "@/components/block";
import { GoalDetail } from "@/components/goal-detail";
import { FocusIndicator } from "@/components/focus";
import { DragGhost, useDragContextOptional } from "@/components/drag";
import { PlanningPanel } from "@/components/weekly-planning";
import { toAnalyticsItems } from "@/lib/adapters";
import { blueprintToEvents, eventsToBlueprint } from "@/lib/blueprint";
import type { BlueprintIntention } from "@/lib/blueprint";
import { usePlanningFlow } from "@/lib/weekly-planning";
import type { WeeklyIntention } from "@/lib/weekly-planning";
import type { ScheduleGoal, DeadlineTask } from "@/lib/unified-schedule";
import type { GoalColor } from "@/lib/colors";
import { useBreakpoint } from "@/lib/responsive";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMoreFill,
  RiSideBarLine,
  RiPieChartLine,
  RiAddLine,
  RiSubtractLine,
  RiMenuLine,
  RiKeyboardLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import type { WeekStartDay, ProgressMetric } from "@/lib/preferences";
import {
  MIN_CALENDAR_ZOOM,
  MAX_CALENDAR_ZOOM,
  CALENDAR_ZOOM_STEP,
} from "@/lib/preferences";
import type { ShellContentProps } from "./shell-types";
import {
  useShellLayout,
  useShellFocus,
  useExternalDragPreview,
  useToastAggregator,
} from "./use-shell-hooks";

// Re-export for consumers
export type { ShellContentProps };

// =============================================================================
// Component Props (extending the core props with UI-specific options)
// =============================================================================

export interface ShellContentComponentProps extends ShellContentProps {
  /** Categories for goal inspiration gallery */
  inspirationCategories?: InspirationCategory[];
  /** Callback when UI layout changes (for persistence) */
  onLayoutChange?: (layout: {
    showSidebar: boolean;
    showRightSidebar: boolean;
  }) => void;
}

// =============================================================================
// Component Implementation
// =============================================================================

export function ShellContentComponent({
  // Data
  goals,
  essentials,
  allEssentials,
  events,
  weekDates,
  weekDeadlines,
  // Selection (passed in for coordination)
  selectedEventId: selectedEventIdProp,
  selectedGoalId: selectedGoalIdProp,
  hoveredEvent,
  hoverPosition,
  hoveredDayIndex,
  // Essential management
  enabledEssentialIds,
  draftEnabledEssentialIds,
  onToggleEssentialEnabled,
  onStartEditingEssentials,
  onSaveEssentialChanges,
  onCancelEssentialChanges,
  onCreateEssential,
  onDeleteEssential,
  // Day boundaries
  dayStartMinutes,
  dayEndMinutes,
  onDayBoundariesChange,
  dayBoundariesEnabled,
  onDayBoundariesEnabledChange,
  dayBoundariesDisplay,
  onDayBoundariesDisplayChange,
  // Essential templates
  essentialTemplates,
  onSaveEssentialSchedule,
  onImportEssentialsToWeek,
  weekNeedsEssentialImport,
  // Goal CRUD
  onAddGoal,
  onDeleteGoal,
  onUpdateGoal,
  // Task CRUD
  onToggleTaskComplete,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  // Subtask CRUD
  onAddSubtask,
  onToggleSubtaskComplete,
  onUpdateSubtask,
  onDeleteSubtask,
  // Milestone CRUD
  onAddMilestone,
  onToggleMilestoneComplete,
  onUpdateMilestone,
  onDeleteMilestone,
  // Deadline management
  onClearTaskDeadline,
  // Stats accessors
  getGoalStats,
  getEssentialStats,
  getTaskSchedule,
  getTaskDeadline,
  // Calendar handlers
  calendarHandlers,
  // Event management
  onAddEvent,
  onUpdateEvent,
  onAssignTaskToBlock,
  onUnassignTaskFromBlock,
  // Drop handling
  onDrop,
  // Focus mode
  focusSession,
  focusIsRunning,
  focusElapsedMs,
  onStartFocus,
  onPauseFocus,
  onResumeFocus,
  onEndFocus,
  // Blueprint & planning
  blueprint,
  hasBlueprint,
  onSaveBlueprint,
  currentWeekPlan,
  onSaveWeeklyPlan,
  getIntentionProgress,
  // Preferences
  weekStartsOn,
  onWeekStartsOnChange,
  progressMetric,
  onProgressMetricChange,
  calendarZoom,
  onCalendarZoomChange,
  // Navigation
  selectedDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  // Reference data
  lifeAreas,
  goalIcons,
  // UI-specific props
  inspirationCategories,
  onLayoutChange,
}: ShellContentComponentProps) {
  // -------------------------------------------------------------------------
  // Responsive Breakpoint Detection
  // -------------------------------------------------------------------------
  const {
    isMobile,
    isTablet,
    isTabletPortrait,
    isTabletLandscape,
    isDesktop,
    isTouchDevice,
  } = useBreakpoint();

  // Determine if we should use mobile/tablet layout (overlays instead of sidebars)
  const useMobileLayout = isMobile || isTablet;

  // Determine calendar view based on breakpoint
  // Mobile/Tablet Portrait → Day view, Tablet Landscape/Desktop → Week view
  const shouldShowWeekView = isTabletLandscape || isDesktop;

  // -------------------------------------------------------------------------
  // Mobile Overlay State
  // -------------------------------------------------------------------------
  const [showBacklogOverlay, setShowBacklogOverlay] = React.useState(false);

  // -------------------------------------------------------------------------
  // Keyboard Shortcuts Modal State
  // -------------------------------------------------------------------------
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] =
    React.useState(false);

  // Global ? key to open keyboard shortcuts
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      // ? key (Shift + /) opens keyboard shortcuts
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // -------------------------------------------------------------------------
  // UI Layout State
  // -------------------------------------------------------------------------
  const layout = useShellLayout();

  // Scroll-to-current-time key (changes on mount and "Today" click)
  const [scrollToCurrentTimeKey, setScrollToCurrentTimeKey] = React.useState(
    () => Date.now(),
  );

  // Handler for "Today" button that also triggers scroll to current time
  const handleTodayClick = React.useCallback(() => {
    onToday();
    setScrollToCurrentTimeKey(Date.now());
  }, [onToday]);

  // Mobile navigation state (track which day within the week to show)
  const [mobileSelectedDayIndex, setMobileSelectedDayIndex] = React.useState(
    () => {
      // Default to today's index within the week, or 0
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const idx = weekDates.findIndex(
        (d) => d.toISOString().split("T")[0] === todayStr,
      );
      return idx >= 0 ? idx : 0;
    },
  );

  // Reset mobile day index when week changes
  React.useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const idx = weekDates.findIndex(
      (d) => d.toISOString().split("T")[0] === todayStr,
    );
    setMobileSelectedDayIndex(idx >= 0 ? idx : 0);
  }, [weekDates]);

  // Mobile day navigation (for day view)
  const handleMobilePreviousDay = React.useCallback(() => {
    if (mobileSelectedDayIndex > 0) {
      setMobileSelectedDayIndex(mobileSelectedDayIndex - 1);
    } else {
      // Go to previous week, last day
      onPreviousWeek();
      setMobileSelectedDayIndex(6);
    }
  }, [mobileSelectedDayIndex, onPreviousWeek]);

  const handleMobileNextDay = React.useCallback(() => {
    if (mobileSelectedDayIndex < 6) {
      setMobileSelectedDayIndex(mobileSelectedDayIndex + 1);
    } else {
      // Go to next week, first day
      onNextWeek();
      setMobileSelectedDayIndex(0);
    }
  }, [mobileSelectedDayIndex, onNextWeek]);

  // Get the currently selected date for mobile day view
  const mobileSelectedDate = weekDates[mobileSelectedDayIndex] ?? selectedDate;

  const {
    showPlanWeek,
    showCalendar,
    showSidebar,
    setShowSidebar,
    showRightSidebar,
    setShowRightSidebar,
    showTasks,
    setShowTasks,
    showInspirationGallery,
    backlogMode,
    setBacklogMode,
    selectedEventId,
    setSelectedEventId,
    selectedGoalId,
    setSelectedGoalId,
    goalNotes,
    renderedContent,
    frozenSidebarData,
    isRightSidebarOpen,
    updateFrozenSidebarData,
    isPlanning,
    isGoalDetailMode,
    handleEventClick,
    handleCloseSidebar,
    handleSelectGoal,
    handleCloseGoalDetail,
    handleBrowseInspiration,
    handleCloseInspiration,
    handlePlanWeekClick,
    handleGoalNotesChange,
    handleAnalyticsToggle,
    isPlanningMode,
    setIsPlanningMode,
  } = layout;

  // -------------------------------------------------------------------------
  // Deadline Hover State
  // -------------------------------------------------------------------------
  const [hoveredDeadline, setHoveredDeadline] =
    React.useState<DeadlineTask | null>(null);

  // -------------------------------------------------------------------------
  // Planning Flow
  // -------------------------------------------------------------------------
  const weekStartDate = weekDates[0]?.toISOString().split("T")[0] ?? "";

  const planningFlow = usePlanningFlow({
    isActive: isPlanningMode,
    weekDates,
    onConfirm: (intentions) => {
      // Save the weekly plan
      onSaveWeeklyPlan({
        weekStartDate,
        intentions,
        plannedAt: new Date().toISOString(),
      });

      // On first planning, save the blueprint
      if (!hasBlueprint) {
        const blueprintBlocks = eventsToBlueprint(events, weekDates);
        const blueprintIntentions: BlueprintIntention[] = intentions.map(
          (i) => ({
            goalId: i.goalId,
            target: i.target,
          }),
        );
        onSaveBlueprint({
          blocks: blueprintBlocks,
          intentions: blueprintIntentions,
          updatedAt: new Date().toISOString(),
        });
      }

      // Exit planning mode
      setIsPlanningMode(false);
    },
    onCancel: () => {
      setIsPlanningMode(false);
    },
  });

  // Initialize planning flow with blueprint defaults when entering planning mode
  React.useEffect(() => {
    if (isPlanningMode) {
      const initialIntentions = currentWeekPlan?.intentions ?? [];
      if (initialIntentions.length === 0 && blueprint) {
        planningFlow.reset(
          blueprint.intentions.map((i) => ({
            goalId: i.goalId,
            target: i.target,
          })),
        );
      } else {
        planningFlow.reset(initialIntentions);
      }
    }
  }, [isPlanningMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Import blueprint blocks to calendar
  const handleImportBlueprint = React.useCallback(() => {
    if (!blueprint) return;
    const importedEvents = blueprintToEvents(blueprint, weekDates);
    importedEvents.forEach((event) => {
      onAddEvent(event);
    });
  }, [blueprint, weekDates, onAddEvent]);

  // Handle continue to schedule step (auto-imports essentials)
  const handleContinueToSchedule = React.useCallback(() => {
    // Auto-import essentials if needed
    if (weekNeedsEssentialImport) {
      onImportEssentialsToWeek();
    }
    // Continue to schedule step
    planningFlow.continueToSchedule();
  }, [weekNeedsEssentialImport, onImportEssentialsToWeek, planningFlow]);

  // -------------------------------------------------------------------------
  // Derived Data
  // -------------------------------------------------------------------------
  const selectedEvent = selectedEventId
    ? (events.find((e) => e.id === selectedEventId) ?? null)
    : null;

  // -------------------------------------------------------------------------
  // Zoom Handlers
  // -------------------------------------------------------------------------
  const handleZoomIn = React.useCallback(() => {
    onCalendarZoomChange(
      Math.min(MAX_CALENDAR_ZOOM, calendarZoom + CALENDAR_ZOOM_STEP),
    );
  }, [calendarZoom, onCalendarZoomChange]);

  const handleZoomOut = React.useCallback(() => {
    onCalendarZoomChange(
      Math.max(MIN_CALENDAR_ZOOM, calendarZoom - CALENDAR_ZOOM_STEP),
    );
  }, [calendarZoom, onCalendarZoomChange]);

  // -------------------------------------------------------------------------
  // Keyboard Shortcuts & Toast Aggregation
  // -------------------------------------------------------------------------
  const { toastMessage: calendarToastMessage } = useCalendarKeyboard({
    hoveredEvent,
    hoverPosition,
    hasClipboardContent: calendarHandlers.hasClipboardContent,
    hoveredDayIndex,
    onCopy: calendarHandlers.onEventCopy,
    onPaste: calendarHandlers.onEventPaste,
    onDuplicate: (eventId, newDayIndex, newStartMinutes) =>
      calendarHandlers.onEventDuplicate(eventId, newDayIndex, newStartMinutes),
    onDelete: (eventId) => calendarHandlers.onEventDelete(eventId),
    onToggleComplete: (eventId, currentStatus) => {
      const newStatus = currentStatus === "completed" ? "planned" : "completed";
      calendarHandlers.onEventStatusChange(eventId, newStatus);
    },
    onMarkDayComplete: calendarHandlers.onMarkDayComplete,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
  });

  const toasts = useToastAggregator(calendarToastMessage);
  const { toastMessage } = toasts;

  useDeadlineKeyboard({
    hoveredDeadline,
    onToggleComplete: onToggleTaskComplete,
    onUnassign: onClearTaskDeadline,
    showToast: toasts.setDeadlineToast,
  });

  // -------------------------------------------------------------------------
  // Focus Mode Computed Values
  // -------------------------------------------------------------------------
  const {
    isSidebarBlockFocused,
    showFocusIndicator,
    handleStartFocus,
    handleNavigateToFocusedBlock,
  } = useShellFocus({
    focusSession,
    selectedEventId,
    selectedEvent,
    startFocus: onStartFocus,
    onNavigateToBlock: setSelectedEventId,
  });

  // -------------------------------------------------------------------------
  // External Drag & Drop
  // -------------------------------------------------------------------------
  const dragContext = useDragContextOptional();
  const { externalDragPreview, handleExternalDrop, handleDeadlineDrop } =
    useExternalDragPreview({
      dragContext,
      weekDates,
      onDrop,
    });

  // -------------------------------------------------------------------------
  // Block Sidebar Handlers
  // -------------------------------------------------------------------------
  const {
    sidebarData,
    availableGoals,
    handlers: sidebarHandlers,
  } = useBlockSidebarHandlers({
    selectedEvent,
    goals,
    essentials,
    weekDates,
    schedule: {
      updateEvent: onUpdateEvent,
      updateTask: onUpdateTask,
      toggleTaskComplete: onToggleTaskComplete,
      addTask: onAddTask,
      addSubtask: onAddSubtask,
      toggleSubtaskComplete: onToggleSubtaskComplete,
      updateSubtask: onUpdateSubtask,
      deleteSubtask: onDeleteSubtask,
      assignTaskToBlock: onAssignTaskToBlock,
      unassignTaskFromBlock: onUnassignTaskFromBlock,
      calendarHandlers,
    },
    onToast: toasts.setSidebarToast,
    onEndFocus:
      focusSession?.blockId === selectedEvent?.id ? onEndFocus : undefined,
    onClose: handleCloseSidebar,
  });

  // Update frozen sidebar data for animation
  React.useEffect(() => {
    updateFrozenSidebarData(sidebarData);
  }, [sidebarData, updateFrozenSidebarData]);

  const sidebarDataToRender = selectedEvent ? sidebarData : frozenSidebarData;

  // -------------------------------------------------------------------------
  // Analytics Data
  // -------------------------------------------------------------------------
  const useFocusedHours = progressMetric === "focused";
  const analyticsGoals = React.useMemo(
    () =>
      toAnalyticsItems(goals, getGoalStats, {
        useFocusedHours,
        getIntentionProgress,
      }),
    [goals, getGoalStats, useFocusedHours, getIntentionProgress],
  );

  // -------------------------------------------------------------------------
  // Goal Creation Handlers
  // -------------------------------------------------------------------------
  const handleCreateGoal = React.useCallback(
    (data: NewGoalData) => {
      const newGoalId = crypto.randomUUID();
      onAddGoal({
        id: newGoalId,
        label: data.label,
        icon: data.icon,
        color: data.color,
        lifeAreaId: data.lifeAreaId,
        tasks: [],
      });
      if (backlogMode === "goal-detail") {
        setSelectedGoalId(newGoalId);
      }
    },
    [onAddGoal, backlogMode, setSelectedGoalId],
  );

  const handleCreateAndSelectGoal = React.useCallback(() => {
    const newGoalId = crypto.randomUUID();
    const defaultIcon = goalIcons[0]?.icon;
    const defaultLifeAreaId = lifeAreas[0]?.id ?? "";

    onAddGoal({
      id: newGoalId,
      label: "New goal",
      icon: defaultIcon,
      color: "violet",
      lifeAreaId: defaultLifeAreaId,
      tasks: [],
    });

    setBacklogMode("goal-detail");
    setSelectedGoalId(newGoalId);
  }, [onAddGoal, goalIcons, lifeAreas, setBacklogMode, setSelectedGoalId]);

  // -------------------------------------------------------------------------
  // Goal Deletion Handler
  // -------------------------------------------------------------------------
  const handleDeleteGoal = React.useCallback(() => {
    if (!selectedGoalId) return;
    onDeleteGoal(selectedGoalId);
    setSelectedGoalId(null);
    setBacklogMode("view");
  }, [selectedGoalId, onDeleteGoal, setSelectedGoalId, setBacklogMode]);

  // -------------------------------------------------------------------------
  // Goal Detail Mode Derived Data
  // -------------------------------------------------------------------------
  const selectedGoal = selectedGoalId
    ? (goals.find((g) => g.id === selectedGoalId) as ScheduleGoal | undefined)
    : undefined;

  const selectedGoalLifeArea = React.useMemo(() => {
    if (!selectedGoal?.lifeAreaId) return undefined;
    return lifeAreas.find((area) => area.id === selectedGoal.lifeAreaId);
  }, [selectedGoal, lifeAreas]);

  const selectedGoalStats = selectedGoalId
    ? getGoalStats(selectedGoalId)
    : { plannedHours: 0, completedHours: 0, focusedHours: 0 };

  // -------------------------------------------------------------------------
  // Mobile Event Click Handler (opens bottom sheet)
  // -------------------------------------------------------------------------
  const handleMobileEventClick = React.useCallback(
    (event: CalendarEvent) => {
      setSelectedEventId(event.id);
    },
    [setSelectedEventId],
  );

  // Close bottom sheet handler for mobile
  const handleCloseBottomSheet = React.useCallback(() => {
    setSelectedEventId(null);
  }, [setSelectedEventId]);

  // Format date for mobile toolbar
  const formatMobileDateLabel = (date: Date, isWeekView: boolean): string => {
    if (isWeekView) {
      // Week view: show week range
      const weekStart = weekDates[0];
      const weekEnd = weekDates[6];
      if (!weekStart || !weekEnd) return "";

      const startMonth = weekStart.toLocaleDateString("en-US", {
        month: "short",
      });
      const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();

      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} – ${endDay}`;
      }
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
    }
    // Day view: "Mon, Jan 27"
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Mobile/Tablet Toolbar
  const renderMobileToolbar = () => (
    <ShellToolbar>
      {/* Left: Hamburger menu */}
      <button
        onClick={() => setShowBacklogOverlay(true)}
        className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        aria-label="Open backlog"
      >
        <RiMenuLine className="size-5" />
      </button>

      {/* Center: Date navigation */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
        <button
          onClick={
            shouldShowWeekView ? onPreviousWeek : handleMobilePreviousDay
          }
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label={shouldShowWeekView ? "Previous week" : "Previous day"}
        >
          <RiArrowLeftSLine className="size-5" />
        </button>

        <button
          onClick={handleTodayClick}
          className="flex h-10 min-w-[100px] items-center justify-center rounded-lg px-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          title="Go to today"
        >
          Today
        </button>

        <button
          onClick={shouldShowWeekView ? onNextWeek : handleMobileNextDay}
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label={shouldShowWeekView ? "Next week" : "Next day"}
        >
          <RiArrowRightSLine className="size-5" />
        </button>
      </div>

      {/* Right: Focus indicator and/or settings */}
      <div className="flex items-center gap-1">
        {/* Focus indicator (when active) */}
        {focusSession && (
          <FocusIndicator
            blockTitle={focusSession.blockTitle}
            blockColor={focusSession.blockColor}
            elapsedMs={focusElapsedMs}
            isRunning={focusIsRunning}
            onPause={onPauseFocus}
            onResume={onResumeFocus}
            onClick={handleNavigateToFocusedBlock}
          />
        )}

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <RiMoreFill className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Week starts on</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={weekStartsOn.toString()}
              onValueChange={(v) =>
                onWeekStartsOnChange(Number(v) as WeekStartDay)
              }
            >
              <DropdownMenuRadioItem value="1">Monday</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="0">Sunday</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)}>
              <RiKeyboardLine className="size-4" />
              Keyboard shortcuts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ShellToolbar>
  );

  // Desktop Toolbar
  const renderDesktopToolbar = () => (
    <ShellToolbar>
      <div className="flex items-center gap-1">
        <button
          className={cn(
            "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
            showSidebar ? "text-foreground" : "text-muted-foreground",
          )}
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <RiSideBarLine className="size-4" />
        </button>
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
        <button
          onClick={onPreviousWeek}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          title="Previous week (←)"
        >
          <RiArrowLeftSLine className="size-4" />
        </button>
        <button
          onClick={handleTodayClick}
          className="flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          title="Go to today (T)"
        >
          Today
        </button>
        <button
          onClick={onNextWeek}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          title="Next week (→)"
        >
          <RiArrowRightSLine className="size-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        {showFocusIndicator && focusSession && (
          <FocusIndicator
            blockTitle={focusSession.blockTitle}
            blockColor={focusSession.blockColor}
            elapsedMs={focusElapsedMs}
            isRunning={focusIsRunning}
            onPause={onPauseFocus}
            onResume={onResumeFocus}
            onClick={handleNavigateToFocusedBlock}
          />
        )}
        {/* Show Plan week button only if week is not already planned */}
        {showPlanWeek && currentWeekPlan === null && !isPlanning && (
          <button
            className="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
            onClick={handlePlanWeekClick}
          >
            Plan week
          </button>
        )}
        <button
          className={cn(
            "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
            showRightSidebar || selectedEvent
              ? "text-foreground"
              : "text-muted-foreground",
          )}
          onClick={handleAnalyticsToggle}
          title="Toggle analytics"
        >
          <RiPieChartLine className="size-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
              <RiMoreFill className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Week starts on</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={weekStartsOn.toString()}
              onValueChange={(v) =>
                onWeekStartsOnChange(Number(v) as WeekStartDay)
              }
            >
              <DropdownMenuRadioItem value="1">Monday</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="0">Sunday</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Zoom</DropdownMenuLabel>
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <button
                onClick={handleZoomOut}
                disabled={calendarZoom <= MIN_CALENDAR_ZOOM}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                title="Zoom out (- key when hovering)"
              >
                <RiSubtractLine className="size-3.5" />
              </button>
              <span className="w-12 text-center text-xs tabular-nums">
                {calendarZoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={calendarZoom >= MAX_CALENDAR_ZOOM}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                title="Zoom in (+ key when hovering)"
              >
                <RiAddLine className="size-3.5" />
              </button>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)}>
              <RiKeyboardLine className="size-4" />
              Keyboard shortcuts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ShellToolbar>
  );

  return (
    <>
      <Shell>
        {/* Render appropriate toolbar based on breakpoint */}
        {useMobileLayout ? renderMobileToolbar() : renderDesktopToolbar()}

        {/* Main Content Area - responsive layout */}
        {useMobileLayout ? (
          // Mobile/Tablet: Full-width calendar only
          <ShellContentPrimitive className="overflow-hidden">
            <Calendar
              view={shouldShowWeekView ? "week" : "day"}
              selectedDate={
                shouldShowWeekView ? selectedDate : mobileSelectedDate
              }
              events={events}
              weekStartsOn={weekStartsOn}
              zoom={calendarZoom}
              scrollToCurrentTimeKey={scrollToCurrentTimeKey}
              // On mobile, only allow viewing - disable creation/editing handlers
              onEventClick={handleMobileEventClick}
              // Disable drag & drop on mobile/tablet
              enableExternalDrop={false}
              // Disable deadlines on mobile for simplicity
              onDeadlineToggleComplete={onToggleTaskComplete}
              onDeadlineUnassign={onClearTaskDeadline}
              deadlines={weekDeadlines}
              dayStartMinutes={dayStartMinutes}
              dayEndMinutes={dayEndMinutes}
              dayBoundariesEnabled={dayBoundariesEnabled}
              dayBoundariesDisplay={dayBoundariesDisplay}
            />
          </ShellContentPrimitive>
        ) : (
          // Desktop: Three-panel layout
          <div
            className={`flex min-h-0 flex-1 ${showSidebar || isRightSidebarOpen || isPlanning ? "gap-4" : "gap-0"}`}
          >
            {/* Left Sidebar - Backlog or Planning Panel */}
            <div
              className={cn(
                "shrink-0 overflow-hidden transition-all duration-300 ease-out",
                isPlanning
                  ? "w-[420px] opacity-100"
                  : showSidebar
                    ? "w-[360px] opacity-100"
                    : "w-0 opacity-0",
              )}
            >
              {isPlanning ? (
                <PlanningPanel
                  goals={goals}
                  essentials={essentials}
                  blueprint={blueprint}
                  weekDates={weekDates}
                  intentions={planningFlow.draftIntentions}
                  onSetIntention={planningFlow.setIntention}
                  onClearIntention={planningFlow.clearIntention}
                  onImportBlueprint={
                    hasBlueprint ? handleImportBlueprint : undefined
                  }
                  onConfirm={planningFlow.confirm}
                  onCancel={planningFlow.cancel}
                  isFirstPlan={!hasBlueprint}
                  onAddTask={onAddTask}
                  // Step management props
                  step={planningFlow.step}
                  onContinue={handleContinueToSchedule}
                  onBack={planningFlow.backToIntentions}
                  highlightedTaskIds={planningFlow.highlightedTaskIds}
                  // Schedule step data accessors
                  getTaskSchedule={getTaskSchedule}
                  getTaskDeadline={getTaskDeadline}
                  className="h-full w-[420px] max-w-none"
                />
              ) : (
                <Backlog
                  essentials={essentials as BacklogItem[]}
                  goals={goals as BacklogItem[]}
                  className="h-full w-[360px] max-w-none"
                  showTasks={showTasks}
                  onToggleGoalTask={onToggleTaskComplete}
                  onAddTask={onAddTask}
                  onUpdateTask={onUpdateTask}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtaskComplete}
                  onUpdateSubtask={onUpdateSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  onDeleteTask={onDeleteTask}
                  getGoalStats={getGoalStats}
                  getTaskSchedule={getTaskSchedule}
                  getTaskDeadline={getTaskDeadline}
                  draggable={true}
                  mode={backlogMode}
                  essentialTemplates={essentialTemplates}
                  onSaveEssentialSchedule={onSaveEssentialSchedule}
                  onCreateEssential={onCreateEssential}
                  onDeleteEssential={onDeleteEssential}
                  wakeUpMinutes={dayStartMinutes}
                  windDownMinutes={dayEndMinutes}
                  onSleepTimesChange={onDayBoundariesChange}
                  onCreateGoal={handleCreateGoal}
                  lifeAreas={lifeAreas}
                  goalIcons={goalIcons}
                  onCreateAndSelectGoal={handleCreateAndSelectGoal}
                  selectedGoalId={selectedGoalId}
                  onSelectGoal={handleSelectGoal}
                  onBack={handleCloseGoalDetail}
                  onBrowseInspiration={handleBrowseInspiration}
                  isInspirationActive={showInspirationGallery}
                />
              )}
            </div>

            {/* Main Content - Calendar, Goal Detail, or Inspiration Gallery */}
            <ShellContentPrimitive className="overflow-hidden">
              {showInspirationGallery && inspirationCategories ? (
                <GoalInspirationGallery
                  categories={inspirationCategories}
                  onAddGoal={handleCreateGoal}
                  onClose={handleCloseInspiration}
                  className="h-full"
                />
              ) : isGoalDetailMode && selectedGoal ? (
                <GoalDetail
                  goal={selectedGoal}
                  lifeArea={selectedGoalLifeArea}
                  notes={goalNotes[selectedGoal.id] ?? ""}
                  onNotesChange={handleGoalNotesChange}
                  onTitleChange={(title) =>
                    onUpdateGoal(selectedGoal.id, { label: title })
                  }
                  getTaskSchedule={getTaskSchedule}
                  getTaskDeadline={getTaskDeadline}
                  onToggleTask={(taskId) =>
                    onToggleTaskComplete(selectedGoal.id, taskId)
                  }
                  onAddTask={(label) => onAddTask(selectedGoal.id, label)}
                  onUpdateTask={(taskId, updates) =>
                    onUpdateTask(selectedGoal.id, taskId, updates)
                  }
                  onDeleteTask={(taskId) =>
                    onDeleteTask(selectedGoal.id, taskId)
                  }
                  onAddSubtask={(taskId, label) =>
                    onAddSubtask(selectedGoal.id, taskId, label)
                  }
                  onToggleSubtask={(taskId, subtaskId) =>
                    onToggleSubtaskComplete(selectedGoal.id, taskId, subtaskId)
                  }
                  onUpdateSubtask={(taskId, subtaskId, label) =>
                    onUpdateSubtask(selectedGoal.id, taskId, subtaskId, label)
                  }
                  onDeleteSubtask={(taskId, subtaskId) =>
                    onDeleteSubtask(selectedGoal.id, taskId, subtaskId)
                  }
                  onAddMilestone={(label) =>
                    onAddMilestone(selectedGoal.id, label)
                  }
                  onToggleMilestone={(milestoneId) =>
                    onToggleMilestoneComplete(selectedGoal.id, milestoneId)
                  }
                  onUpdateMilestone={(milestoneId, label) =>
                    onUpdateMilestone(selectedGoal.id, milestoneId, label)
                  }
                  onDeleteMilestone={(milestoneId) =>
                    onDeleteMilestone(selectedGoal.id, milestoneId)
                  }
                  onDelete={handleDeleteGoal}
                  lifeAreas={lifeAreas}
                  goalIcons={goalIcons}
                  onIconChange={(icon) =>
                    onUpdateGoal(selectedGoal.id, { icon })
                  }
                  onColorChange={(color) =>
                    onUpdateGoal(selectedGoal.id, { color })
                  }
                  onLifeAreaChange={(lifeAreaId) =>
                    onUpdateGoal(selectedGoal.id, { lifeAreaId })
                  }
                  onProgressIndicatorChange={(progressIndicator) =>
                    onUpdateGoal(selectedGoal.id, { progressIndicator })
                  }
                  className="h-full"
                />
              ) : showCalendar ? (
                <Calendar
                  selectedDate={selectedDate}
                  events={events}
                  weekStartsOn={weekStartsOn}
                  zoom={calendarZoom}
                  scrollToCurrentTimeKey={scrollToCurrentTimeKey}
                  {...calendarHandlers}
                  onEventClick={handleEventClick}
                  enableExternalDrop={true}
                  onExternalDrop={handleExternalDrop}
                  externalDragPreview={externalDragPreview}
                  onDeadlineDrop={handleDeadlineDrop}
                  deadlines={weekDeadlines}
                  onDeadlineToggleComplete={onToggleTaskComplete}
                  onDeadlineUnassign={onClearTaskDeadline}
                  onDeadlineHover={setHoveredDeadline}
                  dayStartMinutes={dayStartMinutes}
                  dayEndMinutes={dayEndMinutes}
                  dayBoundariesEnabled={dayBoundariesEnabled}
                  dayBoundariesDisplay={dayBoundariesDisplay}
                />
              ) : null}
            </ShellContentPrimitive>

            {/* Right Sidebar - Block Details / Analytics */}
            <div
              className={cn(
                "shrink-0 overflow-hidden transition-all duration-300 ease-out",
                isRightSidebarOpen ? "w-[380px] opacity-100" : "w-0 opacity-0",
              )}
            >
              {renderedContent === "block" && sidebarDataToRender ? (
                <BlockSidebar
                  block={sidebarDataToRender.block}
                  availableGoalTasks={sidebarDataToRender.availableGoalTasks}
                  availableGoals={availableGoals}
                  onClose={handleCloseSidebar}
                  {...sidebarHandlers}
                  isFocused={isSidebarBlockFocused}
                  focusIsRunning={focusIsRunning}
                  focusElapsedMs={focusElapsedMs}
                  onStartFocus={handleStartFocus}
                  onPauseFocus={onPauseFocus}
                  onResumeFocus={onResumeFocus}
                  onEndFocus={onEndFocus}
                  focusDisabled={
                    focusSession !== null && !isSidebarBlockFocused
                  }
                  totalFocusedMinutes={
                    selectedEvent?.blockType !== "essential"
                      ? (selectedEvent?.focusedMinutes ?? 0)
                      : undefined
                  }
                  onFocusedMinutesChange={
                    selectedEvent?.blockType !== "essential" && selectedEvent
                      ? (minutes) =>
                          onUpdateEvent(selectedEvent.id, {
                            focusedMinutes: minutes,
                          })
                      : undefined
                  }
                  className="h-full w-[380px] max-w-none overflow-y-auto"
                />
              ) : renderedContent === "analytics" ? (
                <WeeklyAnalytics
                  goals={analyticsGoals}
                  weekLabel={formatWeekRange(weekDates)}
                  progressMetric={progressMetric}
                  onProgressMetricChange={onProgressMetricChange}
                  className="h-full w-[380px] max-w-none overflow-y-auto"
                />
              ) : null}
            </div>
          </div>
        )}
      </Shell>

      {/* Mobile/Tablet: Backlog Full-Screen Overlay */}
      {useMobileLayout && (
        <FullScreenOverlay
          key="backlog-overlay"
          open={showBacklogOverlay}
          onClose={() => setShowBacklogOverlay(false)}
          title="Backlog"
          closeStyle="close"
        >
          <Backlog
            essentials={essentials as BacklogItem[]}
            goals={goals as BacklogItem[]}
            className="h-full max-w-none border-0 rounded-none shadow-none"
            showTasks={true}
            onToggleGoalTask={onToggleTaskComplete}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtaskComplete}
            onUpdateSubtask={onUpdateSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onDeleteTask={onDeleteTask}
            getGoalStats={getGoalStats}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            draggable={false}
            mode="view"
          />
        </FullScreenOverlay>
      )}

      {/* Mobile/Tablet: Block Details Bottom Sheet */}
      {useMobileLayout && sidebarDataToRender && (
        <BottomSheet
          key="block-sheet"
          open={selectedEventId !== null}
          onClose={handleCloseBottomSheet}
          title={sidebarDataToRender.block.title}
          showCloseButton={true}
          showDragHandle={true}
        >
          <BlockSidebar
            block={sidebarDataToRender.block}
            availableGoalTasks={sidebarDataToRender.availableGoalTasks}
            availableGoals={availableGoals}
            onClose={handleCloseBottomSheet}
            // Limited edit mode for mobile - only toggle tasks and focus
            onToggleGoalTask={sidebarHandlers.onToggleGoalTask}
            isFocused={isSidebarBlockFocused}
            focusIsRunning={focusIsRunning}
            focusElapsedMs={focusElapsedMs}
            onStartFocus={handleStartFocus}
            onPauseFocus={onPauseFocus}
            onResumeFocus={onResumeFocus}
            onEndFocus={onEndFocus}
            focusDisabled={focusSession !== null && !isSidebarBlockFocused}
            totalFocusedMinutes={
              selectedEvent?.blockType !== "essential"
                ? (selectedEvent?.focusedMinutes ?? 0)
                : undefined
            }
            className="border-0 rounded-none shadow-none max-w-none w-full"
          />
        </BottomSheet>
      )}

      {/* Only show keyboard toast and drag ghost on desktop */}
      {!useMobileLayout && (
        <React.Fragment key="desktop-extras">
          <KeyboardToast message={toastMessage} />
          <DragGhost />
        </React.Fragment>
      )}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </>
  );
}
