/**
 * =============================================================================
 * File: next-block-card.tsx
 * =============================================================================
 *
 * Lightweight execution companion card for the week view left sidebar.
 *
 * Surfaces the currently active or next upcoming goal/task block with its
 * parent goal, available time, and assigned tasks. Provides a "Focus now"
 * action for upcoming blocks (moves the block to the present time and
 * starts focus), "Start Focus" for active blocks, or a "Focusing…" state
 * when the block is already in an active focus session.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render two visual states: active/upcoming block, or done for today.
 * - Show goal icon, block title, time context, and assigned task labels.
 * - Provide Focus action button (context-aware label and behavior).
 * - Reflect active focus session state on the button.
 * - Hide entirely when there are no goal/task blocks today.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Determining which block is active/next (delegated to useNextBlock).
 * - Rescheduling, reprioritizing, or assigning tasks.
 * - Persisting any state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Outer card uses overflow-hidden so the accent bar clips to border-radius.
 * - Content uses px-3 > px-3 nesting (24px total) to align with GoalSection's
 *   px-3 wrapper + GoalItemRow's px-3 inner padding.
 * - Goal icon uses a compact size-6 container (vs backlog's size-8).
 * - "Focus now" for upcoming blocks moves the block to present time.
 * - Returns null when totalBlocksToday === 0 (no blocks at all today).
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - NextBlockCard
 * - NextBlockCardProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiPlayFill,
  RiCheckboxCircleLine,
  RiCircleLine,
  RiFocusLine,
} from "@remixicon/react";
import { formatTimeShort } from "@/lib/time-utils";
import {
  getIconBgClass,
  getIconBgSoftClass,
  getIconColorClass,
} from "@/lib/colors";
import type {
  NextBlockInfo,
  CalendarEvent,
  ScheduleGoal,
} from "@/lib/unified-schedule";

// =============================================================================
// Props
// =============================================================================

export interface NextBlockCardProps {
  /** Derived next block info from useNextBlock */
  nextBlock: NextBlockInfo;
  /** All events for the current week */
  events: CalendarEvent[];
  /** All goals */
  goals: ScheduleGoal[];
  /** Week date objects */
  weekDates: Date[];
  /** ID of the block currently in a focus session (null if not focusing) */
  focusedBlockId?: string | null;
  /** Start a focus session for the given block */
  onStartFocus?: (blockId: string, title: string, color: string) => void;
  /** Move a block to a new start time (for "Focus now") */
  onUpdateEvent?: (eventId: string, updates: Partial<CalendarEvent>) => void;
  /** Open the block detail sidebar */
  onClick?: (blockId: string) => void;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatMinutesUntil(minutes: number): string {
  if (minutes < 1) return "now";
  if (minutes < 60) return `in ${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `in ${h}h`;
  return `in ${h}h ${m}m`;
}

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// =============================================================================
// Done State
// =============================================================================

function DoneForToday({
  completedBlocksToday,
  totalBlocksToday,
}: {
  completedBlocksToday: number;
  totalBlocksToday: number;
}) {
  return (
    <div className="flex flex-col gap-1 px-6 py-2.5">
      <span className="text-[13px] text-muted-foreground/60">
        No more blocks today
      </span>
      {totalBlocksToday > 0 && (
        <div className="flex items-center gap-1.5">
          <RiCheckboxCircleLine className="size-3 text-emerald-500/50" />
          <span className="text-xs text-muted-foreground/40">
            {completedBlocksToday}/{totalBlocksToday} completed
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function NextBlockCard({
  nextBlock,
  events,
  goals,
  weekDates,
  focusedBlockId,
  onStartFocus,
  onUpdateEvent,
  onClick,
  className,
}: NextBlockCardProps) {
  const {
    block,
    goal,
    status,
    remainingMinutes,
    minutesUntilStart,
    assignedTaskLabels,
    completedBlocksToday,
    totalBlocksToday,
  } = nextBlock;

  // Hide entirely when there are no goal/task blocks today
  if (totalBlocksToday === 0) return null;

  const isBlockFocused = block != null && focusedBlockId === block.id;

  const handleCardClick = React.useCallback(() => {
    if (block && onClick) {
      onClick(block.id);
    }
  }, [block, onClick]);

  // "Focus now" for upcoming: move block to present time, then start focus
  // "Start Focus" for active: just start focus
  // "Focusing…" for already-focused: open sidebar
  const handleFocusAction = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!block) return;

      // If already focusing this block, open the sidebar
      if (isBlockFocused) {
        onClick?.(block.id);
        return;
      }

      if (status === "upcoming" && onUpdateEvent) {
        // Move block start to now, preserving duration
        const nowMins = getNowMinutes();
        onUpdateEvent(block.id, { startMinutes: nowMins });
      }

      onStartFocus?.(block.id, block.title, block.color);
    },
    [block, status, isBlockFocused, onStartFocus, onUpdateEvent, onClick],
  );

  // Resolve goal icon
  const GoalIcon = goal?.icon;

  // Build the meta line below the title
  const metaLine = React.useMemo(() => {
    if (!block) return "";
    if (status === "active") {
      return `Now · ${formatDuration(remainingMinutes)} left`;
    }
    const timeRange = `${formatTimeShort(block.startMinutes)} – ${formatTimeShort(block.startMinutes + block.durationMinutes)}`;
    return `${formatMinutesUntil(minutesUntilStart ?? 0)} · ${timeRange}`;
  }, [block, status, remainingMinutes, minutesUntilStart]);

  // Focus button label and icon
  const focusLabel = isBlockFocused
    ? "Focusing…"
    : status === "active"
      ? "Start Focus"
      : "Focus now";

  const FocusIcon = isBlockFocused ? RiFocusLine : RiPlayFill;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "none" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DoneForToday
              completedBlocksToday={completedBlocksToday}
              totalBlocksToday={totalBlocksToday}
            />
          </motion.div>
        ) : (
          <motion.div
            key={block?.id ?? "block"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Color accent bar for active state */}
            {status === "active" && block && (
              <div
                className={cn("h-0.5", getIconBgClass(block.color))}
                aria-hidden
              />
            )}

            {/* Clickable card body — px-3 outer (card padding) + px-3 inner (content inset) */}
            <button
              onClick={handleCardClick}
              className="flex w-full flex-col px-3 pt-4 pb-2.5 text-left transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3 px-3">
                {/* Goal icon — compact version of backlog icon container */}
                {GoalIcon && block && (
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md",
                      getIconBgSoftClass(block.color),
                    )}
                  >
                    <GoalIcon
                      className={cn("size-3.5", getIconColorClass(block.color))}
                    />
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                  {/* Block title — prominent */}
                  {block && (
                    <span className="truncate text-sm font-medium text-foreground">
                      {block.title}
                    </span>
                  )}

                  {/* Meta line: time context */}
                  <span className="text-[13px] text-muted-foreground">
                    {metaLine}
                  </span>
                </div>
              </div>

              {/* Assigned task labels — subtle inline list, aligned with text column */}
              {assignedTaskLabels.length > 0 && (
                <div className="mt-2 flex flex-col gap-0.5 pl-[48px]">
                  {assignedTaskLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <RiCircleLine className="size-2.5 shrink-0 text-muted-foreground/20" />
                      <span className="truncate text-xs text-muted-foreground/50">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </button>

            {/* Focus action button */}
            {block && (
              <div className="px-6 pb-4">
                <button
                  onClick={handleFocusAction}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isBlockFocused
                      ? cn(
                          "bg-muted/60 hover:bg-muted hover:text-foreground",
                          getIconColorClass(block.color),
                        )
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <FocusIcon className="size-4" />
                  <span>{focusLabel}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
