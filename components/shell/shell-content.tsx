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
import { AnimatePresence, motion } from "framer-motion";
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
  useCalendarKeyboard,
  useDeadlineKeyboard,
  formatWeekRange,
  type CalendarEvent,
  type ExternalDragPreview,
} from "@/components/calendar";
import { UndoToast, SimpleToast } from "@/components/ui";
import { useUndoOptional, useUndoKeyboard } from "@/lib/undo";
import {
  Backlog,
  GoalInspirationGallery,
  OnboardingGoalsCard,
  type BacklogItem,
  type BacklogMode,
  type NewGoalData,
  type InspirationCategory,
  type AddedGoal,
  type InlineGoalEditorData,
} from "@/components/backlog";
import { ONBOARDING_GOAL_SUGGESTIONS } from "@/lib/fixtures/onboarding-goals";
import { WeeklyAnalytics, PlanningBudget } from "@/components/weekly-analytics";
import { buildPlanningBudgetData } from "@/lib/adapters";
import { BlockSidebar, useBlockSidebarHandlers } from "@/components/block";
import { GoalDetail } from "@/components/goal-detail";
import { FocusIndicator } from "@/components/focus";
import { DragGhost, useDragContextOptional } from "@/components/drag";
import {
  PlanningPanel,
  PlanWeekPromptCard,
  BlueprintBacklog,
} from "@/components/weekly-planning";
import {
  LifeAreaCreatorModal,
  LifeAreaManagerModal,
} from "@/components/settings";
import { IntegrationsSidebar } from "@/components/integrations";
import { toAnalyticsItems } from "@/lib/adapters";
import {
  blueprintToEvents,
  eventsToBlueprint,
  eventsEssentialsNeedUpdate,
  generateBlueprintEventsForWeeks,
} from "@/lib/blueprint";
import { importEssentialsToEvents } from "@/lib/essentials";
import { usePlanningFlow } from "@/lib/weekly-planning";
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
  RiCalendarCheckLine,
  RiEditLine,
  RiShapesLine,
  RiLayoutGridLine,
  RiApps2Line,
  RiPlayCircleLine,
  RiQuestionLine,
  RiLifebuoyLine,
  RiZoomInLine,
  RiSlackLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import type { WeekStartDay, ProgressMetric } from "@/lib/preferences";
import {
  MIN_CALENDAR_ZOOM,
  MAX_CALENDAR_ZOOM,
  CALENDAR_ZOOM_STEP,
} from "@/lib/preferences";
import type { ShellContentProps } from "./shell-types";
import { useShellLayout } from "./use-shell-layout";
import { useShellFocus } from "./use-shell-focus";
import { useExternalDragPreview } from "./use-external-drag-preview";
import { useToastAggregator } from "./use-toast-aggregator";
import { useUndoableHandlers } from "./use-undoable-handlers";

// Re-export for consumers
export type { ShellContentProps };

// =============================================================================
// Feedback Button Component
// =============================================================================

const FEEDBACK_FORM_URL =
  "https://super-os.notion.site/2f1dc01c453d80e3a60edfa768c067bc";
const ONBOARDING_VIDEO_URL =
  "https://www.loom.com/share/e3d7b59cb4ac4642b34eb35df5e88db4";
const SLACK_COMMUNITY_URL =
  "https://superoscommunity.slack.com";

function FeedbackButton({
  calendarZoom,
  handleZoomIn,
  handleZoomOut,
}: {
  calendarZoom: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
      {/* Zoom controls button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="flex size-10 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground hover:shadow-md data-[state=open]:bg-background data-[state=open]:text-foreground data-[state=open]:shadow-md"
            aria-label="Zoom controls"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <RiZoomInLine className="size-5" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-36">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <button
              onClick={handleZoomOut}
              disabled={calendarZoom <= MIN_CALENDAR_ZOOM}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              title="Zoom out"
            >
              <RiSubtractLine className="size-4" />
            </button>
            <span className="text-sm font-medium tabular-nums text-foreground">
              {calendarZoom}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={calendarZoom >= MAX_CALENDAR_ZOOM}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              title="Zoom in"
            >
              <RiAddLine className="size-4" />
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help and feedback button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex size-10 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground hover:shadow-md data-[state=open]:bg-background data-[state=open]:text-foreground data-[state=open]:shadow-md"
            aria-label="Help and feedback"
          >
            <motion.div
              animate={{ rotate: isHovered ? 15 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <RiLifebuoyLine className="size-5" />
            </motion.div>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-48">
          <DropdownMenuItem
            onClick={() =>
              window.open(FEEDBACK_FORM_URL, "_blank", "noopener,noreferrer")
            }
          >
            <RiQuestionLine className="size-4" />
            Share feedback
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(ONBOARDING_VIDEO_URL, "_blank", "noopener,noreferrer")
            }
          >
            <RiPlayCircleLine className="size-4" />
            Watch Ali&apos;s onboarding
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(SLACK_COMMUNITY_URL, "_blank", "noopener,noreferrer")
            }
          >
            <RiSlackLine className="size-4" />
            Slack community
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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
  onUpdateMilestoneDeadline,
  onDeleteMilestone,
  onToggleMilestonesEnabled,
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
  onReplaceEvents,
  onAssignTaskToBlock,
  onUnassignTaskFromBlock,
  onUpdateBlockSyncSettings,
  onUpdateGoalSyncSettings,
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
  hasWeeklyPlan,
  onSetWeeklyFocus,
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
  customLifeAreas,
  goalIcons,
  // Life area management
  onAddLifeArea,
  onUpdateLifeArea,
  onRemoveLifeArea,
  // UI-specific props
  inspirationCategories,
  onLayoutChange,
  // Development
  onSkipOnboarding,
  // Calendar integrations
  calendarIntegrations,
  externalEvents,
  allDayEvents,
  integrationsSidebar,
  onConnectProvider,
  onDisconnectProvider,
  // Import settings callbacks
  onToggleImportEnabled,
  onToggleCalendarImport,
  onToggleMeetingsOnly,
  // Export settings callbacks
  onToggleCalendarExport,
  onToggleExportEnabled,
  onSetExportParticipation,
  onSetExportGoalFilter,
  onSetExportDefaultAppearance,
  onSetExportCustomLabel,
  onUpdateExternalEvent,
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

  // -------------------------------------------------------------------------
  // Undo System Integration
  // -------------------------------------------------------------------------
  const undoContext = useUndoOptional();

  // Helper functions to get data for undo captures
  const getTask = React.useCallback(
    (goalId: string, taskId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      return goal?.tasks?.find((t) => t.id === taskId);
    },
    [goals]
  );

  const getEvent = React.useCallback(
    (eventId: string) => events.find((e) => e.id === eventId),
    [events]
  );

  const getEventsForDay = React.useCallback(
    (dayIndex: number) => events.filter((e) => e.dayIndex === dayIndex),
    [events]
  );

  const getDeadlineTasksForDay = React.useCallback(
    (dayIndex: number) => {
      const dateStr = weekDates[dayIndex]?.toISOString().split("T")[0];
      if (!dateStr) return [];
      const deadlines = weekDeadlines.get(dateStr) ?? [];
      return deadlines.map((d) => ({
        goalId: d.goalId,
        taskId: d.taskId,
        completed: d.completed,
      }));
    },
    [weekDates, weekDeadlines]
  );

  // Wrap handlers with undo recording
  const undoableHandlers = useUndoableHandlers({
    onToggleTaskComplete,
    onDeleteTask,
    onUnassignTaskFromBlock,
    onAssignTaskToBlock,
    onAddTask,
    onUpdateTask,
    onUpdateEvent,
    onAddEvent,
    calendarHandlers,
    getTask,
    getEvent,
    getEventsForDay,
    getDeadlineTasksForDay,
  });

  // Use enhanced handlers that record undo commands
  const enhancedCalendarHandlers = undoableHandlers.calendarHandlers;
  const enhancedToggleTaskComplete = undoableHandlers.onToggleTaskComplete;
  const enhancedDeleteTask = undoableHandlers.onDeleteTask;
  const enhancedUnassignTaskFromBlock = undoableHandlers.onUnassignTaskFromBlock;

  // Determine calendar view based on breakpoint
  // Mobile/Tablet Portrait → Day view, Tablet Landscape/Desktop → Week view
  const shouldShowWeekView = isTabletLandscape || isDesktop;

  // -------------------------------------------------------------------------
  // Calendar Integration State
  // -------------------------------------------------------------------------
  // Integration state is now passed via props from useShellState

  // -------------------------------------------------------------------------
  // Mobile Overlay State
  // -------------------------------------------------------------------------
  const [showBacklogOverlay, setShowBacklogOverlay] = React.useState(false);

  // -------------------------------------------------------------------------
  // Essentials Hidden State (user clicked Skip in CTA)
  // -------------------------------------------------------------------------
  const [isEssentialsHidden, setIsEssentialsHidden] = React.useState(false);

  // -------------------------------------------------------------------------
  // Keyboard Shortcuts Modal State
  // -------------------------------------------------------------------------
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] =
    React.useState(false);

  // -------------------------------------------------------------------------
  // Life Area Modal State
  // -------------------------------------------------------------------------
  const [showLifeAreaCreator, setShowLifeAreaCreator] = React.useState(false);
  const [showLifeAreaManager, setShowLifeAreaManager] = React.useState(false);
  // Track goal ID to auto-assign when creating life area from goal detail
  const [lifeAreaCreatorForGoalId, setLifeAreaCreatorForGoalId] =
    React.useState<string | null>(null);

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
  const layout = useShellLayout({
    initialGoalsCount: goals.length,
  });

  // Scroll-to-current-time key (changes on mount and "Today" click)
  const [scrollToCurrentTimeKey, setScrollToCurrentTimeKey] = React.useState(
    () => Date.now()
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
        (d) => d.toISOString().split("T")[0] === todayStr
      );
      return idx >= 0 ? idx : 0;
    }
  );

  // Reset mobile day index when week changes
  React.useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const idx = weekDates.findIndex(
      (d) => d.toISOString().split("T")[0] === todayStr
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
    setRenderedContent,
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
    // Blueprint edit mode
    isBlueprintEditMode,
    enterBlueprintEditMode,
    exitBlueprintEditMode,
    // Onboarding state
    onboardingStep,
    isOnboarding,
    isOnboardingBlueprint,
    isOnboardingGoalsCentered,
    onContinueFromGoals,
    onCompleteOnboarding,
    onCompleteOnboardingIntoPlanning,
    onSkipBlueprintCreation,
    // Plan week prompt
    showPlanWeekPrompt,
    onDismissPlanWeekPrompt,
    onStartPlanningFromPrompt,
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

  // -------------------------------------------------------------------------
  // Calendar Integrations
  // -------------------------------------------------------------------------
  // Check if any calendar integration is connected and has export enabled
  const hasSyncAvailable = React.useMemo(() => {
    if (!calendarIntegrations) return false;
    
    for (const [_, state] of calendarIntegrations) {
      if (state.status === "connected" && state.exportEnabled) {
        return true;
      }
    }
    return false;
  }, [calendarIntegrations]);

  const planningFlowRef = React.useRef<{
    weeklyFocusTaskIds: Set<string>;
  }>({ weeklyFocusTaskIds: new Set() });

  const planningFlow = usePlanningFlow({
    isActive: isPlanningMode,
    weekDates,
    onConfirm: (saveAsBlueprint: boolean) => {
      // Persist weekly focus to tasks before exiting
      if (planningFlowRef.current.weeklyFocusTaskIds.size > 0) {
        onSetWeeklyFocus(
          planningFlowRef.current.weeklyFocusTaskIds,
          weekStartDate
        );
      }

      // Save the weekly plan
      onSaveWeeklyPlan({
        weekStartDate,
        plannedAt: new Date().toISOString(),
      });

      // On first planning, save the blueprint if user opted in
      if (!hasBlueprint && saveAsBlueprint) {
        const blueprintBlocks = eventsToBlueprint(events, weekDates);
        onSaveBlueprint({
          blocks: blueprintBlocks,
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

  // Keep ref in sync with planning flow state
  React.useEffect(() => {
    planningFlowRef.current.weeklyFocusTaskIds =
      planningFlow.weeklyFocusTaskIds;
  }, [planningFlow.weeklyFocusTaskIds]);

  // Track if user has added essentials this session (for "Add essentials to calendar" button)
  const [hasAddedEssentialsThisSession, setHasAddedEssentialsThisSession] =
    React.useState(false);

  // Reset the flag when planning mode or onboarding blueprint mode is exited
  React.useEffect(() => {
    if (!isPlanningMode && !isOnboardingBlueprint) {
      setHasAddedEssentialsThisSession(false);
    }
  }, [isPlanningMode, isOnboardingBlueprint]);

  // Handler for "Add essentials to calendar" button
  const handleAddEssentialsToCalendar = React.useCallback(() => {
    onImportEssentialsToWeek();
    setHasAddedEssentialsThisSession(true);
  }, [onImportEssentialsToWeek]);

  // Handler for adding an essential during blueprint creation (auto-imports to calendar)
  const handleAddEssentialWithImport = React.useCallback(
    (
      data: { label: string; icon: import("@/lib/types").IconComponent; color: import("@/lib/colors").GoalColor },
      slots: import("@/lib/essentials").EssentialSlot[]
    ) => {
      // Create the essential and get the generated ID
      const essentialId = onCreateEssential(data, slots);

      // Auto-import the new essential to the calendar using the same ID
      const newEvents = importEssentialsToEvents({
        templates: [{ essentialId, slots }],
        weekDates,
        essentials: [{ id: essentialId, label: data.label, color: data.color }],
      });

      newEvents.forEach((event) => {
        onAddEvent(event);
      });
    },
    [onCreateEssential, weekDates, onAddEvent]
  );

  // Handler for deleting an essential during blueprint creation (also removes calendar events)
  const handleDeleteEssentialWithCleanup = React.useCallback(
    (essentialId: string) => {
      // Delete the essential
      onDeleteEssential(essentialId);

      // Remove all calendar events for this essential
      const eventsToRemove = events.filter(
        (e) => e.blockType === "essential" && e.sourceEssentialId === essentialId
      );
      eventsToRemove.forEach((event) => {
        calendarHandlers.onEventDelete(event.id);
      });
    },
    [onDeleteEssential, events, calendarHandlers]
  );

  // Handler for saving essential schedule that syncs to calendar in blueprint edit mode
  const handleSaveEssentialScheduleWithSync = React.useCallback(
    (essentialId: string, slots: import("@/lib/essentials").EssentialSlot[]) => {
      // Save the schedule template
      onSaveEssentialSchedule(essentialId, slots);

      // In blueprint edit mode, update the calendar events for this essential
      if (isBlueprintEditMode) {
        // Find the essential data
        const essential = allEssentials.find((e) => e.id === essentialId);
        if (!essential) return;

        // Remove existing calendar events for this essential
        const eventsToRemove = events.filter(
          (e) => e.blockType === "essential" && e.sourceEssentialId === essentialId
        );
        eventsToRemove.forEach((event) => {
          calendarHandlers.onEventDelete(event.id);
        });

        // Import new events with the updated schedule
        const newEvents = importEssentialsToEvents({
          templates: [{ essentialId, slots }],
          weekDates,
          essentials: [{ id: essentialId, label: essential.label, color: essential.color }],
        });

        newEvents.forEach((event) => {
          onAddEvent(event);
        });
      }
    },
    [onSaveEssentialSchedule, isBlueprintEditMode, allEssentials, events, calendarHandlers, weekDates, onAddEvent]
  );

  // Auto-open planning budget sidebar when entering schedule step or blueprint creation
  React.useEffect(() => {
    if (isPlanning && planningFlow.step === "schedule") {
      setShowRightSidebar(true);
    }
    if (isOnboardingBlueprint) {
      setShowRightSidebar(true);
    }
  }, [
    isPlanning,
    planningFlow.step,
    isOnboardingBlueprint,
    setShowRightSidebar,
  ]);

  // Duplicate last week's schedule from blueprint
  const handleDuplicateLastWeek = React.useCallback(() => {
    if (!blueprint) return;
    const importedEvents = blueprintToEvents(blueprint, weekDates);
    importedEvents.forEach((event) => {
      onAddEvent(event);
    });
  }, [blueprint, weekDates, onAddEvent]);

  // -------------------------------------------------------------------------
  // Blueprint Edit Mode
  // -------------------------------------------------------------------------
  const [originalEventsSnapshot, setOriginalEventsSnapshot] = React.useState<
    typeof events | null
  >(null);

  const handleEnterBlueprintEdit = React.useCallback(() => {
    if (!blueprint) return;
    // Snapshot current events for restoration
    setOriginalEventsSnapshot([...events]);
    // Replace calendar with blueprint blocks
    const blueprintEvents = blueprintToEvents(blueprint, weekDates);
    onReplaceEvents(blueprintEvents);
    // Enter edit mode (clears selections and sidebars)
    enterBlueprintEditMode();
  }, [blueprint, events, weekDates, onReplaceEvents, enterBlueprintEditMode]);

  const handleCancelBlueprintEdit = React.useCallback(() => {
    if (originalEventsSnapshot) {
      // Restore original events
      onReplaceEvents(originalEventsSnapshot);
      setOriginalEventsSnapshot(null);
    }
    exitBlueprintEditMode();
  }, [originalEventsSnapshot, onReplaceEvents, exitBlueprintEditMode]);

  const handleSaveBlueprintEdit = React.useCallback(() => {
    // Convert current events to blueprint and save
    const newBlueprintBlocks = eventsToBlueprint(events, weekDates);
    const newBlueprint = {
      blocks: newBlueprintBlocks,
      updatedAt: new Date().toISOString(),
    };
    onSaveBlueprint(newBlueprint);

    // Restore original events for the current week
    // Then update future unplanned weeks with the new blueprint
    if (originalEventsSnapshot) {
      // Get current week's date range
      const currentWeekStartDate = weekDates[0].toISOString().split("T")[0];
      const currentWeekEndDate = weekDates[6].toISOString().split("T")[0];

      // Separate original events into:
      // 1. Current week events (restore these)
      // 2. Planned week events (restore these)
      // 3. Unplanned future week events (will be replaced with new blueprint)
      const eventsToRestore: typeof events = [];
      const unplannedWeekStartDates = new Set<string>();

      originalEventsSnapshot.forEach((event) => {
        const eventDate = event.date;
        // Check if event is in current week
        if (eventDate >= currentWeekStartDate && eventDate <= currentWeekEndDate) {
          eventsToRestore.push(event);
        } else {
          // For future weeks, check if they're planned
          // Find the week start for this event using weekStartsOn preference
          const eventDateObj = new Date(eventDate);
          const dayOfWeek = eventDateObj.getDay();
          const weekStartOffset = (dayOfWeek - weekStartsOn + 7) % 7;
          const weekStartDate = new Date(eventDateObj);
          weekStartDate.setDate(weekStartDate.getDate() - weekStartOffset);
          const weekStartStr = weekStartDate.toISOString().split("T")[0];

          if (hasWeeklyPlan(weekStartStr)) {
            // This week has been planned, keep the event
            eventsToRestore.push(event);
          } else {
            // Track this as an unplanned week that needs blueprint refresh
            unplannedWeekStartDates.add(weekStartStr);
          }
        }
      });

      // Generate new blueprint events for unplanned weeks
      const futureEvents = generateBlueprintEventsForWeeks(
        newBlueprint,
        weekDates,
        4, // 4 weeks ahead
        hasWeeklyPlan,
        eventsToRestore, // Use restored events as base to avoid duplicates
      );

      // Combine restored events with new blueprint events for future weeks
      onReplaceEvents([...eventsToRestore, ...futureEvents]);
      setOriginalEventsSnapshot(null);
    }
    exitBlueprintEditMode();
  }, [
    events,
    weekDates,
    weekStartsOn,
    onSaveBlueprint,
    originalEventsSnapshot,
    onReplaceEvents,
    hasWeeklyPlan,
    exitBlueprintEditMode,
  ]);

  // -------------------------------------------------------------------------
  // Blueprint Creation During Onboarding
  // -------------------------------------------------------------------------
  const handleSaveOnboardingBlueprint = React.useCallback(() => {
    // Convert current events to blueprint and save
    const blueprintBlocks = eventsToBlueprint(events, weekDates);
    const newBlueprint = {
      blocks: blueprintBlocks,
      updatedAt: new Date().toISOString(),
    };
    onSaveBlueprint(newBlueprint);

    // Keep events in calendar - they become the user's actual schedule
    // Also populate future weeks (1-4 weeks ahead) with blueprint blocks
    const futureEvents = generateBlueprintEventsForWeeks(
      newBlueprint,
      weekDates,
      4, // 4 weeks ahead
      hasWeeklyPlan,
      events, // Pass current events to avoid duplicates
    );

    // Add all future events
    futureEvents.forEach((event) => {
      onAddEvent(event);
    });

    // Complete onboarding and go straight into weekly planning
    onCompleteOnboardingIntoPlanning();
  }, [
    events,
    weekDates,
    onSaveBlueprint,
    hasWeeklyPlan,
    onAddEvent,
    onCompleteOnboardingIntoPlanning,
  ]);

  // Handler to skip blueprint creation and clear any events added during the step
  const handleSkipOnboardingBlueprint = React.useCallback(() => {
    // Clear any events the user may have added during blueprint creation
    onReplaceEvents([]);
    // Skip blueprint creation (shows plan week prompt)
    onSkipBlueprintCreation();
  }, [onReplaceEvents, onSkipBlueprintCreation]);

  // Compute if current events' essentials differ from essential templates
  // During blueprint edit mode, we compare the current events (not the saved blueprint)
  const essentialsNeedUpdateInBlueprint = React.useMemo(() => {
    if (!isBlueprintEditMode) return false;
    return eventsEssentialsNeedUpdate(
      events,
      weekDates,
      essentialTemplates,
      allEssentials.map((e) => e.id)
    );
  }, [
    isBlueprintEditMode,
    events,
    weekDates,
    essentialTemplates,
    allEssentials,
  ]);

  // Handler to update essentials in blueprint edit mode
  const handleUpdateBlueprintEssentials = React.useCallback(() => {
    // Remove all existing essential events from current events (which are the blueprint events)
    const nonEssentialEvents = events.filter(
      (e) => e.blockType !== "essential"
    );

    // Get enabled templates
    const enabledTemplates = essentialTemplates.filter((t) =>
      allEssentials.some((e) => e.id === t.essentialId)
    );

    // Map essentials to the format expected by importEssentialsToEvents
    const essentialsData = allEssentials.map((e) => ({
      id: e.id,
      label: e.label,
      color: e.color,
    }));

    // Import fresh essentials from templates
    const newEssentialEvents = importEssentialsToEvents({
      templates: enabledTemplates,
      weekDates,
      essentials: essentialsData,
    });

    // Replace events with non-essential events + new essential events
    onReplaceEvents([...nonEssentialEvents, ...newEssentialEvents]);
  }, [events, essentialTemplates, allEssentials, weekDates, onReplaceEvents]);

  // -------------------------------------------------------------------------
  // Derived Data
  // -------------------------------------------------------------------------
  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId) ?? null
    : null;

  // -------------------------------------------------------------------------
  // Zoom Handlers
  // -------------------------------------------------------------------------
  const handleZoomIn = React.useCallback(() => {
    onCalendarZoomChange(
      Math.min(MAX_CALENDAR_ZOOM, calendarZoom + CALENDAR_ZOOM_STEP)
    );
  }, [calendarZoom, onCalendarZoomChange]);

  const handleZoomOut = React.useCallback(() => {
    onCalendarZoomChange(
      Math.max(MIN_CALENDAR_ZOOM, calendarZoom - CALENDAR_ZOOM_STEP)
    );
  }, [calendarZoom, onCalendarZoomChange]);

  // -------------------------------------------------------------------------
  // Keyboard Shortcuts & Toast Aggregation
  // -------------------------------------------------------------------------
  // Note: We use enhanced handlers for delete/complete so they record undo commands
  const { toastMessage: calendarToastMessage } = useCalendarKeyboard({
    hoveredEvent,
    hoverPosition,
    hasClipboardContent: enhancedCalendarHandlers.hasClipboardContent,
    hoveredDayIndex,
    onCopy: enhancedCalendarHandlers.onEventCopy,
    onPaste: enhancedCalendarHandlers.onEventPaste,
    onDuplicate: (eventId, newDayIndex, newStartMinutes) =>
      enhancedCalendarHandlers.onEventDuplicate(eventId, newDayIndex, newStartMinutes),
    onDelete: (eventId) => enhancedCalendarHandlers.onEventDelete(eventId),
    onToggleComplete: (eventId, currentStatus) => {
      const newStatus = currentStatus === "completed" ? "planned" : "completed";
      enhancedCalendarHandlers.onEventStatusChange(eventId, newStatus);
    },
    onMarkDayComplete: enhancedCalendarHandlers.onMarkDayComplete,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
  });

  const toasts = useToastAggregator(calendarToastMessage);

  // Use enhanced toggle for deadlines
  useDeadlineKeyboard({
    hoveredDeadline,
    onToggleComplete: enhancedToggleTaskComplete,
    onUnassign: onClearTaskDeadline,
    showToast: toasts.setDeadlineToast,
  });

  // Undo keyboard shortcut (CMD+Z)
  useUndoKeyboard({
    enabled: !useMobileLayout,
  });

  // Determine which toast to show (priority: undo action > calendar/deadline toast)
  const undoLastCommand = undoContext?.lastCommand;
  const showUndoActionToast = undoLastCommand !== null;
  const simpleToastMessage = toasts.toastMessage;

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

  // All calendar integrations (for sync status across all providers)
  // The hook will filter to only connected ones with export enabled

  const {
    sidebarData,
    availableGoals,
    syncState,
    blockSyncSettings,
    handlers: sidebarHandlers,
  } = useBlockSidebarHandlers({
    selectedEvent,
    goals,
    essentials,
    weekDates,
    schedule: {
      updateEvent: onUpdateEvent,
      updateTask: onUpdateTask,
      toggleTaskComplete: enhancedToggleTaskComplete, // Use enhanced handler for undo
      addTask: onAddTask,
      addSubtask: onAddSubtask,
      toggleSubtaskComplete: onToggleSubtaskComplete,
      updateSubtask: onUpdateSubtask,
      deleteSubtask: onDeleteSubtask,
      assignTaskToBlock: onAssignTaskToBlock,
      unassignTaskFromBlock: enhancedUnassignTaskFromBlock, // Use enhanced handler for undo
      updateBlockSyncSettings: onUpdateBlockSyncSettings,
      calendarHandlers: enhancedCalendarHandlers, // Use enhanced handlers for undo
    },
    calendarIntegrations,
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
      }),
    [goals, getGoalStats, useFocusedHours]
  );

  // Planning budget data (for time budget mode during weekly planning)
  const planningBudgetData = React.useMemo(
    () =>
      buildPlanningBudgetData({
        goals,
        essentials,
        getGoalStats,
        getEssentialStats,
      }),
    [goals, essentials, getGoalStats, getEssentialStats]
  );

  // -------------------------------------------------------------------------
  // Integrations Sidebar Toggle
  // -------------------------------------------------------------------------
  const handleIntegrationsToggle = React.useCallback(() => {
    if (integrationsSidebar.isOpen) {
      integrationsSidebar.close();
    } else {
      // Close other sidebars to ensure mutual exclusivity
      setSelectedEventId(null);
      setShowRightSidebar(false);
      integrationsSidebar.open();
      // Set rendered content immediately so it persists during close animation
      setRenderedContent("integrations");
    }
  }, [
    integrationsSidebar,
    setSelectedEventId,
    setShowRightSidebar,
    setRenderedContent,
  ]);

  // Close integrations sidebar when block or analytics sidebar opens
  React.useEffect(() => {
    if ((selectedEventId || showRightSidebar) && integrationsSidebar.isOpen) {
      integrationsSidebar.close();
    }
  }, [selectedEventId, showRightSidebar, integrationsSidebar]);

  // Compute if integrations sidebar is the active right sidebar (for width animation)
  const showIntegrationsSidebar =
    integrationsSidebar.isOpen && !selectedEventId && !showRightSidebar;

  // -------------------------------------------------------------------------
  // Sleep/Day Boundaries Handler
  // -------------------------------------------------------------------------
  // When sleep times are configured via SleepRow, also enable day boundaries
  const handleSleepTimesChange = React.useCallback(
    (wakeUp: number, windDown: number) => {
      onDayBoundariesChange(wakeUp, windDown);
      // Auto-enable day boundaries when user configures sleep times
      if (!dayBoundariesEnabled) {
        onDayBoundariesEnabledChange(true);
      }
    },
    [onDayBoundariesChange, onDayBoundariesEnabledChange, dayBoundariesEnabled]
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
    [onAddGoal, backlogMode, setSelectedGoalId]
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

    // Close inspiration gallery if open
    handleCloseInspiration();
    setBacklogMode("goal-detail");
    setSelectedGoalId(newGoalId);
  }, [
    onAddGoal,
    goalIcons,
    lifeAreas,
    handleCloseInspiration,
    setBacklogMode,
    setSelectedGoalId,
  ]);

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
  // Onboarding Goal Handlers
  // -------------------------------------------------------------------------
  const handleOnboardingAddGoal = React.useCallback(
    (data: InlineGoalEditorData) => {
      const newGoalId = crypto.randomUUID();
      onAddGoal({
        id: newGoalId,
        label: data.label,
        icon: data.icon,
        color: data.color,
        lifeAreaId: data.lifeAreaId,
        deadline: data.deadline,
        tasks: [],
      });
    },
    [onAddGoal]
  );

  const handleOnboardingUpdateGoal = React.useCallback(
    (goalId: string, data: InlineGoalEditorData) => {
      onUpdateGoal(goalId, {
        label: data.label,
        icon: data.icon,
        color: data.color,
        lifeAreaId: data.lifeAreaId,
        deadline: data.deadline,
      });
    },
    [onUpdateGoal]
  );

  const handleOnboardingRemoveGoal = React.useCallback(
    (goalId: string) => {
      onDeleteGoal(goalId);
    },
    [onDeleteGoal]
  );

  // Convert goals to AddedGoal format for OnboardingGoalsCard
  const onboardingGoals: AddedGoal[] = React.useMemo(
    () =>
      goals.map((g) => ({
        id: g.id,
        label: g.label,
        icon: g.icon,
        color: g.color,
        lifeAreaId: g.lifeAreaId ?? "",
        deadline: g.deadline,
      })),
    [goals]
  );

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
    [setSelectedEventId]
  );

  // Close bottom sheet handler for mobile
  const handleCloseBottomSheet = React.useCallback(() => {
    setSelectedEventId(null);
  }, [setSelectedEventId]);

  // -------------------------------------------------------------------------
  // All-Day Event Toggle Handler
  // -------------------------------------------------------------------------
  const handleToggleAllDayEvent = React.useCallback(
    (eventId: string) => {
      // Find the current event status and toggle it
      const currentEvent = externalEvents.find((e) => e.id === eventId);
      if (currentEvent) {
        const newStatus =
          currentEvent.status === "completed" ? "planned" : "completed";
        onUpdateExternalEvent(eventId, { status: newStatus });
      }
    },
    [externalEvents, onUpdateExternalEvent]
  );

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
            {/* Show "Set essentials" when hidden */}
            {isEssentialsHidden && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEssentialsHidden(false)}>
                  <RiCalendarCheckLine className="size-4" />
                  Set essentials
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLifeAreaManager(true)}>
              <RiLayoutGridLine className="size-4" />
              Edit life areas
            </DropdownMenuItem>
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
        {/* Hide sidebar toggle during onboarding or planning */}
        {!isOnboarding && !isPlanning && (
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
              showSidebar ? "text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <RiSideBarLine className="size-4" />
          </button>
        )}
        {/* Show essentials button when hidden (not during onboarding or planning) */}
        {isEssentialsHidden && showSidebar && !isOnboarding && !isPlanning && (
          <button
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            onClick={() => setIsEssentialsHidden(false)}
            title="Show essentials"
          >
            <RiShapesLine className="size-4" />
          </button>
        )}
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
        {/* Show Plan week button only if week is not already planned and not in onboarding/blueprint edit */}
        {showPlanWeek &&
          currentWeekPlan === null &&
          !isPlanning &&
          !isOnboarding &&
          !isBlueprintEditMode && (
            <button
              className="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
              onClick={handlePlanWeekClick}
            >
              Plan week
            </button>
          )}
        {/* Hide integrations and analytics buttons during onboarding */}
        {!isOnboarding && (
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
              showIntegrationsSidebar
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            onClick={handleIntegrationsToggle}
            title="Integrations"
          >
            <RiApps2Line className="size-4" />
          </button>
        )}
        {!isOnboarding && (
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
              showRightSidebar || selectedEvent
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            onClick={handleAnalyticsToggle}
            title="Toggle analytics"
          >
            <RiPieChartLine className="size-4" />
          </button>
        )}
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
            {/* Show "Edit blueprint" when blueprint exists */}
            {hasBlueprint && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEnterBlueprintEdit}>
                  <RiEditLine className="size-4" />
                  Edit blueprint
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLifeAreaManager(true)}>
              <RiLayoutGridLine className="size-4" />
              Edit life areas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)}>
              <RiKeyboardLine className="size-4" />
              Keyboard shortcuts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ShellToolbar>
  );

  // Desktop toolbar for blueprint edit mode
  const renderBlueprintEditToolbar = () => (
    <ShellToolbar>
      <div className="flex items-center gap-1">
        {/* Sidebar toggle still available */}
        <button
          className={cn(
            "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
            showSidebar ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <RiSideBarLine className="size-4" />
        </button>
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center">
        <span className="text-sm font-medium text-foreground">
          Editing blueprint
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCancelBlueprintEdit}
          className="flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveBlueprintEdit}
          className="flex h-8 items-center rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Save changes
        </button>
      </div>
    </ShellToolbar>
  );

  // Desktop toolbar for onboarding blueprint creation
  const renderOnboardingBlueprintToolbar = () => (
    <ShellToolbar>
      <div className="flex items-center gap-1">
        {/* Empty left section for balance */}
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center">
        <span className="text-sm font-medium text-foreground">
          Create your blueprint
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Empty right section for balance */}
      </div>
    </ShellToolbar>
  );

  return (
    <>
      <Shell>
        {/* Dev skip button - top-right during onboarding goals step */}
        {isOnboardingGoalsCentered &&
          process.env.NODE_ENV === "development" &&
          onSkipOnboarding && (
            <button
              onClick={onSkipOnboarding}
              className="absolute right-6 top-6 z-50 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              Skip onboarding (Dev)
            </button>
          )}

        {/* Render appropriate toolbar based on breakpoint and mode */}
        {/* Hide toolbar during centered goals onboarding step for cleaner focus */}
        {!isOnboardingGoalsCentered &&
          (useMobileLayout
            ? renderMobileToolbar()
            : isOnboardingBlueprint
            ? renderOnboardingBlueprintToolbar()
            : isBlueprintEditMode
            ? renderBlueprintEditToolbar()
            : renderDesktopToolbar())}

        {/* Main Content Area - responsive layout */}
        {useMobileLayout ? (
          // Mobile/Tablet: Full-width calendar only
          <ShellContentPrimitive className="overflow-hidden">
            <div className="relative h-full">
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
                allDayEvents={allDayEvents}
                onToggleAllDayEvent={handleToggleAllDayEvent}
                dayStartMinutes={dayStartMinutes}
                dayEndMinutes={dayEndMinutes}
                dayBoundariesEnabled={dayBoundariesEnabled}
                dayBoundariesDisplay={dayBoundariesDisplay}
              />
              <FeedbackButton
                calendarZoom={calendarZoom}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
              />
            </div>
          </ShellContentPrimitive>
        ) : isOnboardingGoalsCentered ? (
          // Desktop: Centered goals card for onboarding first step
          <ShellContentPrimitive className="flex items-center justify-center bg-muted shadow-none ring-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="onboarding-goals"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <OnboardingGoalsCard
                  goals={onboardingGoals}
                  onAddGoal={handleOnboardingAddGoal}
                  onUpdateGoal={handleOnboardingUpdateGoal}
                  onRemoveGoal={handleOnboardingRemoveGoal}
                  onContinue={onContinueFromGoals}
                  suggestions={ONBOARDING_GOAL_SUGGESTIONS}
                  lifeAreas={lifeAreas}
                  goalIcons={goalIcons}
                />
              </motion.div>
            </AnimatePresence>
          </ShellContentPrimitive>
        ) : (
          // Desktop: Three-panel layout
          <AnimatePresence mode="wait">
            <motion.div
              key="main-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`flex min-h-0 flex-1 ${
                showSidebar ||
                isRightSidebarOpen ||
                showIntegrationsSidebar ||
                isPlanning ||
                isBlueprintEditMode ||
                isOnboardingBlueprint
                  ? "gap-4"
                  : "gap-0"
              }`}
            >
              {/* Left Sidebar - Backlog, Planning Panel, or Blueprint Backlog */}
              <div
                className={cn(
                  "shrink-0 overflow-hidden transition-all duration-300 ease-out",
                  isPlanning
                    ? "w-[420px] opacity-100"
                    : showSidebar ||
                      isBlueprintEditMode ||
                      isOnboardingBlueprint
                    ? "w-[360px] opacity-100"
                    : "w-0 opacity-0"
                )}
              >
                {isOnboardingBlueprint ? (
                  <BlueprintBacklog
                    goals={goals}
                    essentials={essentials}
                    onSave={handleSaveOnboardingBlueprint}
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    // Essentials creation props
                    wakeUpMinutes={dayStartMinutes}
                    windDownMinutes={dayEndMinutes}
                    onSleepTimesChange={handleSleepTimesChange}
                    isSleepConfigured={dayBoundariesEnabled}
                    onAddEssential={handleAddEssentialWithImport}
                    essentialTemplates={essentialTemplates}
                    onSaveSchedule={onSaveEssentialSchedule}
                    onDeleteEssential={handleDeleteEssentialWithCleanup}
                    essentialIcons={goalIcons}
                    className="h-full w-[360px] max-w-none"
                  />
                ) : isPlanning ? (
                  <PlanningPanel
                    goals={goals}
                    essentials={essentials}
                    blueprint={blueprint}
                    weekDates={weekDates}
                    onDuplicateLastWeek={
                      hasBlueprint ? handleDuplicateLastWeek : undefined
                    }
                    onCancel={planningFlow.cancel}
                    isFirstPlan={!hasBlueprint}
                    // Two-step planning flow
                    step={planningFlow.step}
                    onNextStep={planningFlow.nextStep}
                    onConfirm={planningFlow.confirm}
                    weeklyFocusTaskIds={planningFlow.weeklyFocusTaskIds}
                    onAddToFocus={planningFlow.addToWeeklyFocus}
                    onRemoveFromFocus={planningFlow.removeFromWeeklyFocus}
                    onAddTask={onAddTask}
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    // Add essentials to calendar (for planning without blueprint)
                    showAddEssentialsButton={
                      !hasBlueprint && !hasAddedEssentialsThisSession
                    }
                    onAddEssentialsToCalendar={handleAddEssentialsToCalendar}
                    className="h-full w-[420px] max-w-none"
                  />
                ) : (
                  <Backlog
                    essentials={essentials as BacklogItem[]}
                    goals={goals as BacklogItem[]}
                    className="h-full w-[360px] max-w-none"
                    showTasks={showTasks && !isBlueprintEditMode}
                    onToggleGoalTask={enhancedToggleTaskComplete}
                    onAddTask={onAddTask}
                    onUpdateTask={onUpdateTask}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtaskComplete}
                    onUpdateSubtask={onUpdateSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    onDeleteTask={enhancedDeleteTask}
                    getGoalStats={getGoalStats}
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    draggable={!isOnboarding}
                    essentialTemplates={essentialTemplates}
                    onSaveEssentialSchedule={
                      isBlueprintEditMode
                        ? handleSaveEssentialScheduleWithSync
                        : onSaveEssentialSchedule
                    }
                    onCreateEssential={
                      isBlueprintEditMode
                        ? handleAddEssentialWithImport
                        : onCreateEssential
                    }
                    onDeleteEssential={
                      isBlueprintEditMode
                        ? handleDeleteEssentialWithCleanup
                        : onDeleteEssential
                    }
                    wakeUpMinutes={dayStartMinutes}
                    windDownMinutes={dayEndMinutes}
                    onSleepTimesChange={handleSleepTimesChange}
                    isSleepConfigured={dayBoundariesEnabled}
                    isEssentialsHidden={isEssentialsHidden}
                    onEssentialsHide={() => setIsEssentialsHidden(true)}
                    isBlueprintEditMode={isBlueprintEditMode}
                    onCreateGoal={handleCreateGoal}
                    lifeAreas={lifeAreas}
                    goalIcons={goalIcons}
                    onCreateAndSelectGoal={handleCreateAndSelectGoal}
                    selectedGoalId={selectedGoalId}
                    onSelectGoal={handleSelectGoal}
                    onBrowseInspiration={handleBrowseInspiration}
                    isInspirationActive={showInspirationGallery}
                    // Onboarding props
                    onboardingStep={onboardingStep}
                    onOnboardingContinue={onContinueFromGoals}
                    // Weekly focus
                    currentWeekStart={weekStartDate}
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
                    deadline={selectedGoal.deadline}
                    notes={goalNotes[selectedGoal.id] ?? ""}
                    onNotesChange={handleGoalNotesChange}
                    onTitleChange={(title) =>
                      onUpdateGoal(selectedGoal.id, { label: title })
                    }
                    onDeadlineChange={(deadline) =>
                      onUpdateGoal(selectedGoal.id, { deadline })
                    }
                    getTaskSchedule={getTaskSchedule}
                    getTaskDeadline={getTaskDeadline}
                    onToggleTask={(taskId) =>
                      enhancedToggleTaskComplete(selectedGoal.id, taskId)
                    }
                    onAddTask={(label, milestoneId) =>
                      onAddTask(selectedGoal.id, label, milestoneId)
                    }
                    onUpdateTask={(taskId, updates) =>
                      onUpdateTask(selectedGoal.id, taskId, updates)
                    }
                    onDeleteTask={(taskId) =>
                      enhancedDeleteTask(selectedGoal.id, taskId)
                    }
                    onAddSubtask={(taskId, label) =>
                      onAddSubtask(selectedGoal.id, taskId, label)
                    }
                    onToggleSubtask={(taskId, subtaskId) =>
                      onToggleSubtaskComplete(
                        selectedGoal.id,
                        taskId,
                        subtaskId
                      )
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
                    onUpdateMilestoneDeadline={(milestoneId, deadline) =>
                      onUpdateMilestoneDeadline(selectedGoal.id, milestoneId, deadline)
                    }
                    onDeleteMilestone={(milestoneId) =>
                      onDeleteMilestone(selectedGoal.id, milestoneId)
                    }
                    onToggleMilestones={() =>
                      onToggleMilestonesEnabled(selectedGoal.id)
                    }
                    onDelete={handleDeleteGoal}
                    onBack={handleCloseGoalDetail}
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
                    onAddLifeArea={() => {
                      setLifeAreaCreatorForGoalId(selectedGoal.id);
                      setShowLifeAreaCreator(true);
                    }}
                    onSyncSettingsChange={(settings) =>
                      onUpdateGoalSyncSettings(selectedGoal.id, settings)
                    }
                    hasSyncAvailable={hasSyncAvailable}
                    className="h-full"
                  />
                ) : showCalendar ? (
                  <div className="relative h-full">
                    <Calendar
                      selectedDate={selectedDate}
                      events={events}
                      weekStartsOn={weekStartsOn}
                      zoom={calendarZoom}
                      scrollToCurrentTimeKey={scrollToCurrentTimeKey}
                      {...calendarHandlers}
                      onEventClick={handleEventClick}
                      enableExternalDrop={
                        !isOnboarding || isOnboardingBlueprint
                      }
                      onExternalDrop={handleExternalDrop}
                      externalDragPreview={externalDragPreview}
                      onDeadlineDrop={handleDeadlineDrop}
                      deadlines={weekDeadlines}
                      allDayEvents={allDayEvents}
                      onDeadlineToggleComplete={onToggleTaskComplete}
                      onDeadlineUnassign={onClearTaskDeadline}
                      onDeadlineHover={setHoveredDeadline}
                      onToggleAllDayEvent={handleToggleAllDayEvent}
                      dayStartMinutes={dayStartMinutes}
                      dayEndMinutes={dayEndMinutes}
                      dayBoundariesEnabled={dayBoundariesEnabled}
                      dayBoundariesDisplay={dayBoundariesDisplay}
                    />
                    {/* Dimming overlay - shown during onboarding (except blueprint step), planning prioritize step, and plan week prompt */}
                    {((isOnboarding && !isOnboardingBlueprint) ||
                      showPlanWeekPrompt ||
                      (isPlanning && planningFlow.step === "prioritize")) && (
                      <div className="absolute inset-0 bg-background/60 pointer-events-none z-10" />
                    )}

                    {/* Plan week prompt card - shown after onboarding completes */}
                    {showPlanWeekPrompt && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <PlanWeekPromptCard
                          onStartPlanning={onStartPlanningFromPrompt}
                          onDismiss={onDismissPlanWeekPrompt}
                        />
                      </div>
                    )}

                    {/* Feedback button - always visible in bottom-right corner */}
                    <FeedbackButton
                      calendarZoom={calendarZoom}
                      handleZoomIn={handleZoomIn}
                      handleZoomOut={handleZoomOut}
                    />
                  </div>
                ) : null}
              </ShellContentPrimitive>

              {/* Right Sidebar - Block Details / Analytics / Integrations */}
              <div
                className={cn(
                  "shrink-0 overflow-hidden transition-all duration-300 ease-out",
                  isRightSidebarOpen || showIntegrationsSidebar
                    ? "w-[380px] opacity-100"
                    : "w-0 opacity-0"
                )}
              >
                {/* Use renderedContent for content persistence during close animation */}
                {renderedContent === "integrations" ? (
                  <IntegrationsSidebar
                    integrationStates={calendarIntegrations}
                    currentView={integrationsSidebar.currentView}
                    availableGoals={goals}
                    onClose={integrationsSidebar.close}
                    onNavigateToProvider={
                      integrationsSidebar.navigateToProvider
                    }
                    onNavigateToList={integrationsSidebar.navigateToList}
                    onConnectProvider={onConnectProvider}
                    onDisconnectProvider={onDisconnectProvider}
                    onToggleImportEnabled={onToggleImportEnabled}
                    onToggleCalendarImport={onToggleCalendarImport}
                    onToggleMeetingsOnly={onToggleMeetingsOnly}
                    onToggleCalendarExport={onToggleCalendarExport}
                    onToggleExportEnabled={onToggleExportEnabled}
                    onSetExportParticipation={onSetExportParticipation}
                    onSetExportGoalFilter={onSetExportGoalFilter}
                    onSetExportDefaultAppearance={onSetExportDefaultAppearance}
                    onSetExportCustomLabel={onSetExportCustomLabel}
                    className="h-full w-[380px] max-w-none overflow-y-auto"
                  />
                ) : renderedContent === "block" && sidebarDataToRender ? (
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
                        ? selectedEvent?.focusedMinutes ?? 0
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
                    syncState={syncState}
                    blockSyncSettings={blockSyncSettings}
                    className="h-full w-[380px] max-w-none overflow-y-auto"
                  />
                ) : renderedContent === "analytics" ? (
                  isPlanning || isOnboardingBlueprint ? (
                    <PlanningBudget
                      goals={planningBudgetData.goals}
                      essentials={planningBudgetData.essentials}
                      wakeUpMinutes={dayStartMinutes}
                      windDownMinutes={dayEndMinutes}
                      isSleepConfigured={dayBoundariesEnabled}
                      weekLabel={
                        isOnboardingBlueprint
                          ? "Your typical week"
                          : formatWeekRange(weekDates)
                      }
                      lifeAreas={lifeAreas}
                      className="h-full w-[380px] max-w-none overflow-y-auto"
                    />
                  ) : (
                    <WeeklyAnalytics
                      goals={analyticsGoals}
                      weekLabel={formatWeekRange(weekDates)}
                      progressMetric={progressMetric}
                      onProgressMetricChange={onProgressMetricChange}
                      className="h-full w-[380px] max-w-none overflow-y-auto"
                    />
                  )
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
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
            essentialTemplates={essentialTemplates}
            onSaveEssentialSchedule={
              isBlueprintEditMode
                ? handleSaveEssentialScheduleWithSync
                : onSaveEssentialSchedule
            }
            onCreateEssential={
              isBlueprintEditMode
                ? handleAddEssentialWithImport
                : onCreateEssential
            }
            onDeleteEssential={
              isBlueprintEditMode
                ? handleDeleteEssentialWithCleanup
                : onDeleteEssential
            }
            wakeUpMinutes={dayStartMinutes}
            windDownMinutes={dayEndMinutes}
            onSleepTimesChange={handleSleepTimesChange}
            isSleepConfigured={dayBoundariesEnabled}
            isEssentialsHidden={isEssentialsHidden}
            onEssentialsHide={() => setIsEssentialsHidden(true)}
            isBlueprintEditMode={isBlueprintEditMode}
            goalIcons={goalIcons}
            currentWeekStart={weekStartDate}
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
                ? selectedEvent?.focusedMinutes ?? 0
                : undefined
            }
            syncState={syncState}
            blockSyncSettings={blockSyncSettings}
            onSyncAppearanceChange={sidebarHandlers.onSyncAppearanceChange}
            className="border-0 rounded-none shadow-none max-w-none w-full"
          />
        </BottomSheet>
      )}

      {/* Only show toast and drag ghost on desktop */}
      {!useMobileLayout && (
        <React.Fragment key="desktop-extras">
          {/* Show undo toast for undoable actions, simple toast for other feedback */}
          {showUndoActionToast && undoLastCommand ? (
            <UndoToast
              message={undoLastCommand.description}
              onUndo={() => {
                undoContext?.undo();
              }}
              onDismiss={() => undoContext?.clearLastCommand()}
            />
          ) : (
            <SimpleToast message={simpleToastMessage} />
          )}
          <DragGhost />
        </React.Fragment>
      )}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Life area creator modal */}
      <LifeAreaCreatorModal
        open={showLifeAreaCreator}
        onClose={() => {
          setShowLifeAreaCreator(false);
          setLifeAreaCreatorForGoalId(null);
        }}
        goalIcons={goalIcons}
        existingLifeAreas={lifeAreas}
        onCreateLifeArea={(data) => {
          const newLifeAreaId = onAddLifeArea(data);
          // If opened from a goal detail, auto-assign the new life area to that goal
          if (newLifeAreaId && lifeAreaCreatorForGoalId) {
            onUpdateGoal(lifeAreaCreatorForGoalId, {
              lifeAreaId: newLifeAreaId,
            });
          }
          setLifeAreaCreatorForGoalId(null);
        }}
      />

      {/* Life area manager modal */}
      <LifeAreaManagerModal
        open={showLifeAreaManager}
        onClose={() => setShowLifeAreaManager(false)}
        customLifeAreas={customLifeAreas}
        goalIcons={goalIcons}
        goals={goals}
        onAddLifeArea={onAddLifeArea}
        onUpdateLifeArea={onUpdateLifeArea}
        onRemoveLifeArea={onRemoveLifeArea}
      />
    </>
  );
}
