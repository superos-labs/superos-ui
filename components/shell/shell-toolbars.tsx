/**
 * =============================================================================
 * File: shell-toolbars.tsx
 * =============================================================================
 *
 * Collection of toolbar variants used by the Shell.
 *
 * Includes:
 * - Mobile toolbar
 * - Desktop toolbar
 * - Blueprint edit toolbar
 * - Onboarding blueprint toolbar
 *
 * Each toolbar adapts its controls based on active shell mode and screen size.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render navigation and action controls for the shell.
 * - Surface focus session indicator and controls.
 * - Expose minimal settings (week start, blueprint, life areas, shortcuts).
 * - Expose prototype-only feature toggles (quarterly view, next block card).
 * - Reflect shell mode (planning, onboarding, blueprint editing).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing navigation or focus state.
 * - Persisting user preferences.
 * - Implementing business logic.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Toolbars are visually consistent via ShellToolbar.
 * - Desktop and mobile toolbars favor different density and affordances.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ShellMobileToolbar
 * - ShellDesktopToolbar
 * - BlueprintEditToolbar
 * - OnboardingBlueprintToolbar
 * - ShellMobileToolbarProps
 * - ShellDesktopToolbarProps
 * - BlueprintEditToolbarProps
 */

"use client";

import { ShellToolbar } from "@/components/ui/shell";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMoreFill,
  RiSideBarLine,
  RiPieChartLine,
  RiMenuLine,
  RiKeyboardLine,
  RiCalendarCheckLine,
  RiEditLine,
  RiShapesLine,
  RiLayoutGridLine,
  RiApps2Line,
  RiRoadMapLine,
  RiBarChartBoxLine,
} from "@remixicon/react";
import { FocusIndicator } from "@/components/focus";
import { InvitePopover } from "./invite-popover";
import { cn } from "@/lib/utils";
import type { WeekStartDay } from "@/lib/preferences";
import type { ActiveFocusSession } from "@/lib/focus";
import type { CalendarEvent } from "@/components/calendar";
import type { WeeklyPlan } from "@/lib/weekly-planning";

// =============================================================================
// Mobile Toolbar
// =============================================================================

export interface ShellMobileToolbarProps {
  /** Open the backlog overlay */
  onOpenBacklog: () => void;
  /** Whether to show week view (tablet landscape) or day view */
  shouldShowWeekView: boolean;
  /** Navigate to previous week */
  onPreviousWeek: () => void;
  /** Navigate to next week */
  onNextWeek: () => void;
  /** Navigate to previous day (mobile day view) */
  onPreviousDay: () => void;
  /** Navigate to next day (mobile day view) */
  onNextDay: () => void;
  /** Navigate to today */
  onToday: () => void;
  /** Active focus session */
  focusSession: ActiveFocusSession | null;
  /** Elapsed focus time in milliseconds */
  focusElapsedMs: number;
  /** Whether focus timer is running */
  focusIsRunning: boolean;
  /** Pause focus */
  onPauseFocus: () => void;
  /** Resume focus */
  onResumeFocus: () => void;
  /** Navigate to the focused block */
  onNavigateToFocusedBlock: () => void;
  /** Week start day preference */
  weekStartsOn: WeekStartDay;
  /** Change week start day */
  onWeekStartsOnChange: (day: WeekStartDay) => void;
  /** Whether essentials section is hidden */
  isEssentialsHidden: boolean;
  /** Show essentials section */
  onShowEssentials: () => void;
  /** Open life area manager modal */
  onOpenLifeAreaManager: () => void;
  /** Open keyboard shortcuts modal */
  onOpenKeyboardShortcuts: () => void;
}

export function ShellMobileToolbar({
  onOpenBacklog,
  shouldShowWeekView,
  onPreviousWeek,
  onNextWeek,
  onPreviousDay,
  onNextDay,
  onToday,
  focusSession,
  focusElapsedMs,
  focusIsRunning,
  onPauseFocus,
  onResumeFocus,
  onNavigateToFocusedBlock,
  weekStartsOn,
  onWeekStartsOnChange,
  isEssentialsHidden,
  onShowEssentials,
  onOpenLifeAreaManager,
  onOpenKeyboardShortcuts,
}: ShellMobileToolbarProps) {
  return (
    <ShellToolbar>
      {/* Left: Hamburger menu */}
      <button
        onClick={onOpenBacklog}
        className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        aria-label="Open backlog"
      >
        <RiMenuLine className="size-5" />
      </button>

      {/* Center: Date navigation */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
        <button
          onClick={shouldShowWeekView ? onPreviousWeek : onPreviousDay}
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label={shouldShowWeekView ? "Previous week" : "Previous day"}
        >
          <RiArrowLeftSLine className="size-5" />
        </button>

        <button
          onClick={onToday}
          className="flex h-10 min-w-[100px] items-center justify-center rounded-lg px-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          title="Go to today"
        >
          Today
        </button>

        <button
          onClick={shouldShowWeekView ? onNextWeek : onNextDay}
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
            onClick={onNavigateToFocusedBlock}
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
                <DropdownMenuItem onClick={onShowEssentials}>
                  <RiCalendarCheckLine className="size-4" />
                  Set essentials
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenLifeAreaManager}>
              <RiLayoutGridLine className="size-4" />
              Edit life areas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenKeyboardShortcuts}>
              <RiKeyboardLine className="size-4" />
              Keyboard shortcuts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ShellToolbar>
  );
}

// =============================================================================
// Desktop Toolbar
// =============================================================================

export interface ShellDesktopToolbarProps {
  // Mode flags
  isOnboarding: boolean;
  isPlanning: boolean;
  isBlueprintEditMode: boolean;
  isOnboardingBlueprint: boolean;
  // Left sidebar
  showSidebar: boolean;
  onToggleSidebar: () => void;
  isEssentialsHidden: boolean;
  onShowEssentials: () => void;
  // Quarter view
  isQuarterView: boolean;
  onQuarterViewToggle: () => void;
  // Stats view
  isStatsView: boolean;
  onStatsViewToggle: () => void;
  // Navigation
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  // Focus
  showFocusIndicator: boolean;
  focusSession: ActiveFocusSession | null;
  focusElapsedMs: number;
  focusIsRunning: boolean;
  onPauseFocus: () => void;
  onResumeFocus: () => void;
  onNavigateToFocusedBlock: () => void;
  // Plan week
  showPlanWeek: boolean;
  currentWeekPlan: WeeklyPlan | null;
  onPlanWeek: () => void;
  // Right side buttons
  showIntegrationsSidebar: boolean;
  onToggleIntegrations: () => void;
  showRightSidebar: boolean;
  selectedEvent: CalendarEvent | null;
  onToggleAnalytics: () => void;
  // Settings
  weekStartsOn: WeekStartDay;
  onWeekStartsOnChange: (day: WeekStartDay) => void;
  hasBlueprint: boolean;
  onEditBlueprint: () => void;
  onOpenLifeAreaManager: () => void;
  onOpenKeyboardShortcuts: () => void;
  // Prototype-only features
  showQuarterlyViewButton: boolean;
  onShowQuarterlyViewButtonChange: (enabled: boolean) => void;
  showNextBlockCard: boolean;
  onShowNextBlockCardChange: (enabled: boolean) => void;
  showStatsViewButton: boolean;
  onShowStatsViewButtonChange: (enabled: boolean) => void;
}

export function ShellDesktopToolbar({
  isOnboarding,
  isPlanning,
  isBlueprintEditMode,
  showSidebar,
  onToggleSidebar,
  isEssentialsHidden,
  onShowEssentials,
  isQuarterView,
  onQuarterViewToggle,
  isStatsView,
  onStatsViewToggle,
  onPreviousWeek,
  onNextWeek,
  onToday,
  showFocusIndicator,
  focusSession,
  focusElapsedMs,
  focusIsRunning,
  onPauseFocus,
  onResumeFocus,
  onNavigateToFocusedBlock,
  showPlanWeek,
  currentWeekPlan,
  onPlanWeek,
  showIntegrationsSidebar,
  onToggleIntegrations,
  showRightSidebar,
  selectedEvent,
  onToggleAnalytics,
  weekStartsOn,
  onWeekStartsOnChange,
  hasBlueprint,
  onEditBlueprint,
  onOpenLifeAreaManager,
  onOpenKeyboardShortcuts,
  showQuarterlyViewButton,
  onShowQuarterlyViewButtonChange,
  showNextBlockCard,
  onShowNextBlockCardChange,
  showStatsViewButton,
  onShowStatsViewButtonChange,
}: ShellDesktopToolbarProps) {
  return (
    <ShellToolbar>
      <div className="flex items-center gap-1">
        {/* Hide sidebar toggle during onboarding or planning */}
        {!isOnboarding && !isPlanning && (
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
              showSidebar ? "text-foreground" : "text-muted-foreground",
            )}
            onClick={onToggleSidebar}
          >
            <RiSideBarLine className="size-4" />
          </button>
        )}
        {/* Show essentials button when hidden (not during onboarding or planning) */}
        {isEssentialsHidden && showSidebar && !isOnboarding && !isPlanning && (
          <button
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            onClick={onShowEssentials}
            title="Show essentials"
          >
            <RiShapesLine className="size-4" />
          </button>
        )}
        {/* Quarter view toggle (not during onboarding or planning) */}
        {!isOnboarding && !isPlanning && !isBlueprintEditMode && showQuarterlyViewButton && (
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
              isQuarterView ? "text-foreground" : "text-muted-foreground",
            )}
            onClick={onQuarterViewToggle}
            title={isQuarterView ? "Back to week view" : "Quarter overview"}
          >
            <RiRoadMapLine className="size-4" />
          </button>
        )}
        {/* Stats view toggle (not during onboarding or planning) */}
        {!isOnboarding && !isPlanning && !isBlueprintEditMode && showStatsViewButton && (
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
              isStatsView ? "text-foreground" : "text-muted-foreground",
            )}
            onClick={onStatsViewToggle}
            title={isStatsView ? "Back to week view" : "Stats overview"}
          >
            <RiBarChartBoxLine className="size-4" />
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
          onClick={onToday}
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
            onClick={onNavigateToFocusedBlock}
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
              onClick={onPlanWeek}
            >
              Plan week
            </button>
          )}
        {/* Founding Member invites */}
        {!isOnboarding && <InvitePopover />}
        {/* Hide integrations and analytics buttons during onboarding */}
        {!isOnboarding && (
          <button
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
              showIntegrationsSidebar
                ? "text-foreground"
                : "text-muted-foreground",
            )}
            onClick={onToggleIntegrations}
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
                : "text-muted-foreground",
            )}
            onClick={onToggleAnalytics}
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
                <DropdownMenuItem onClick={onEditBlueprint}>
                  <RiEditLine className="size-4" />
                  Edit blueprint
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenLifeAreaManager}>
              <RiLayoutGridLine className="size-4" />
              Edit life areas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenKeyboardShortcuts}>
              <RiKeyboardLine className="size-4" />
              Keyboard shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Prototype-only features</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={showQuarterlyViewButton}
              onCheckedChange={onShowQuarterlyViewButtonChange}
            >
              Quarterly view
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showNextBlockCard}
              onCheckedChange={onShowNextBlockCardChange}
            >
              Next block card
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showStatsViewButton}
              onCheckedChange={onShowStatsViewButtonChange}
            >
              Stats view
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ShellToolbar>
  );
}

// =============================================================================
// Blueprint Edit Toolbar
// =============================================================================

export interface BlueprintEditToolbarProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function BlueprintEditToolbar({
  showSidebar,
  onToggleSidebar,
  onCancel,
  onSave,
}: BlueprintEditToolbarProps) {
  return (
    <ShellToolbar>
      <div className="flex items-center gap-1">
        <button
          className={cn(
            "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
            showSidebar ? "text-foreground" : "text-muted-foreground",
          )}
          onClick={onToggleSidebar}
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
          onClick={onCancel}
          className="flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex h-8 items-center rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Save changes
        </button>
      </div>
    </ShellToolbar>
  );
}

// =============================================================================
// Onboarding Blueprint Toolbar
// =============================================================================

export function OnboardingBlueprintToolbar() {
  return (
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
}
