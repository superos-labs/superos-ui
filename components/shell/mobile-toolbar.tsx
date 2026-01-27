"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiMenuLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMoreFill,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { FocusIndicator } from "@/components/focus";
import type { WeekStartDay } from "@/lib/preferences";
import type { GoalColor } from "@/lib/colors";

// =============================================================================
// Types
// =============================================================================

export interface MobileToolbarProps {
  /** Current date being viewed */
  currentDate: Date;
  /** Whether showing week view (tablet landscape) or day view */
  isWeekView?: boolean;
  /** Callback to open backlog overlay */
  onOpenBacklog: () => void;
  /** Navigate to previous day/week */
  onPrevious: () => void;
  /** Navigate to next day/week */
  onNext: () => void;
  /** Navigate to today */
  onToday: () => void;
  /** Current week start preference */
  weekStartsOn: WeekStartDay;
  /** Callback to change week start */
  onWeekStartsOnChange: (day: WeekStartDay) => void;
  /** Focus session info (if active) */
  focusSession?: {
    blockTitle: string;
    blockColor: GoalColor;
    elapsedMs: number;
    isRunning: boolean;
  } | null;
  /** Focus control callbacks */
  onPauseFocus?: () => void;
  onResumeFocus?: () => void;
  onNavigateToFocusedBlock?: () => void;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Check if a date is today.
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Format date for mobile toolbar display.
 * Day view: "Mon, Jan 27"
 * Week view: "Jan 20 – 26"
 */
function formatDateLabel(date: Date, isWeekView: boolean): string {
  if (isWeekView) {
    // Week view: show week range
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    // Adjust to start of week (assuming Monday start for simplicity)
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + diff);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
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
}

// =============================================================================
// MobileToolbar Component
// =============================================================================

/**
 * Simplified toolbar for mobile/tablet views.
 *
 * Layout:
 * [☰]  [◀] Mon, Jan 27 [▶]  [Today] [⋯]
 *
 * Features:
 * - Hamburger menu to open backlog
 * - Date navigation with compact label
 * - Today button
 * - Settings dropdown (week start)
 * - Focus indicator (when active)
 */
export function MobileToolbar({
  currentDate,
  isWeekView = false,
  onOpenBacklog,
  onPrevious,
  onNext,
  onToday,
  weekStartsOn,
  onWeekStartsOnChange,
  focusSession,
  onPauseFocus,
  onResumeFocus,
  onNavigateToFocusedBlock,
  className,
}: MobileToolbarProps) {
  const dateLabel = formatDateLabel(currentDate, isWeekView);
  const viewingToday = isToday(currentDate);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-2",
        className
      )}
    >
      {/* Left: Hamburger menu */}
      <button
        onClick={onOpenBacklog}
        className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        aria-label="Open backlog"
      >
        <RiMenuLine className="size-5" />
      </button>

      {/* Center: Date navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevious}
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label={isWeekView ? "Previous week" : "Previous day"}
        >
          <RiArrowLeftSLine className="size-5" />
        </button>

        <span className="flex h-10 min-w-[100px] items-center justify-center px-2 text-sm font-medium text-foreground">
          {dateLabel}
        </span>

        <button
          onClick={onNext}
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label={isWeekView ? "Next week" : "Next day"}
        >
          <RiArrowRightSLine className="size-5" />
        </button>
      </div>

      {/* Right: Today button, focus indicator, and settings */}
      <div className="flex items-center gap-1">
        {/* Today button - shows "Today" when viewing today, "Back to today" otherwise */}
        <button
          onClick={onToday}
          disabled={viewingToday}
          className={cn(
            "flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
            viewingToday
              ? "cursor-default text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          title={viewingToday ? "Viewing today" : "Go to today"}
        >
          {viewingToday ? "Today" : "Back to today"}
        </button>

        {/* Focus indicator (when active) */}
        {focusSession && (
          <FocusIndicator
            blockTitle={focusSession.blockTitle}
            blockColor={focusSession.blockColor}
            elapsedMs={focusSession.elapsedMs}
            isRunning={focusSession.isRunning}
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
              onValueChange={(v) => onWeekStartsOnChange(Number(v) as WeekStartDay)}
            >
              <DropdownMenuRadioItem value="1">Monday</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="0">Sunday</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
