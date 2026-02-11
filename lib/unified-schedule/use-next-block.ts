/**
 * =============================================================================
 * File: use-next-block.ts
 * =============================================================================
 *
 * Derives the currently active or next upcoming block from today's events.
 *
 * Provides a lightweight, continuously-updated view of the user's immediate
 * time context — which block they should be working on right now, or which
 * block is coming up next. Only surfaces goal and task blocks (essentials
 * and external events are filtered out).
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Filter today's events to goal/task blocks.
 * - Determine the active block (in progress right now) or next upcoming block.
 * - Resolve the parent goal for the block.
 * - Compute remaining time, minutes until start, and scope type.
 * - Count completed goal/task blocks for the "done for today" state.
 * - Re-evaluate every 60 seconds.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rescheduling or reprioritizing blocks.
 * - Persisting any state.
 * - Rendering UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses a 60-second polling interval (same cadence as CurrentTimeLine).
 * - Pure derivation from events + goals — no side effects.
 * - Returns null when there are no goal/task blocks today at all.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - useNextBlock
 * - NextBlockInfo
 * - NextBlockStatus
 */

"use client";

import * as React from "react";
import type { CalendarEvent, ScheduleGoal } from "./types";

// =============================================================================
// Types
// =============================================================================

export type NextBlockStatus = "active" | "upcoming" | "none";

export interface NextBlockInfo {
  /** The resolved block (active or upcoming). Null when status is "none". */
  block: CalendarEvent | null;
  /** The parent goal for the block. Null for task blocks without a goal or when status is "none". */
  goal: ScheduleGoal | null;
  /** Whether the block is currently active, upcoming, or there are no more blocks today. */
  status: NextBlockStatus;
  /** For active: minutes remaining. For upcoming: block duration. 0 when none. */
  remainingMinutes: number;
  /** Minutes until the block starts. Null when active or none. */
  minutesUntilStart: number | null;
  /** Whether the block has assigned tasks (fixed) or is open-ended. */
  scopeType: "open" | "fixed";
  /** Number of tasks assigned to this block. */
  assignedTaskCount: number;
  /** Number of completed tasks assigned to this block. */
  completedTaskCount: number;
  /** Labels of tasks assigned to this block (for inline display). */
  assignedTaskLabels: string[];
  /** Number of goal/task blocks completed today (shown in "done" state). */
  completedBlocksToday: number;
  /** Total goal/task blocks scheduled today. */
  totalBlocksToday: number;
}

// =============================================================================
// Helpers
// =============================================================================

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function isGoalOrTaskBlock(event: CalendarEvent): boolean {
  return event.blockType === "goal" || event.blockType === "task";
}

function deriveNextBlock(
  events: CalendarEvent[],
  goals: ScheduleGoal[],
): NextBlockInfo {
  const todayISO = getTodayISO();
  const nowMinutes = getNowMinutes();

  // Filter to today's goal/task blocks, sorted by start time
  const todayBlocks = events
    .filter((e) => e.date === todayISO && isGoalOrTaskBlock(e))
    .sort((a, b) => a.startMinutes - b.startMinutes);

  if (todayBlocks.length === 0) {
    return {
      block: null,
      goal: null,
      status: "none",
      remainingMinutes: 0,
      minutesUntilStart: null,
      scopeType: "open",
      assignedTaskCount: 0,
      completedTaskCount: 0,
      assignedTaskLabels: [],
      completedBlocksToday: 0,
      totalBlocksToday: 0,
    };
  }

  const completedBlocksToday = todayBlocks.filter(
    (b) => b.status === "completed",
  ).length;
  const totalBlocksToday = todayBlocks.length;

  // Build a task label lookup from all goals
  const taskLabelMap = new Map<string, string>();
  for (const g of goals) {
    for (const t of g.tasks ?? []) {
      taskLabelMap.set(t.id, t.label);
    }
  }

  // Find active block (currently in progress)
  const activeBlock = todayBlocks.find((b) => {
    const endMinutes = b.startMinutes + b.durationMinutes;
    return b.startMinutes <= nowMinutes && nowMinutes < endMinutes;
  });

  if (activeBlock) {
    const endMinutes = activeBlock.startMinutes + activeBlock.durationMinutes;
    const remaining = Math.max(0, endMinutes - nowMinutes);
    const goal =
      goals.find((g) => g.id === activeBlock.sourceGoalId) ?? null;
    const assignedIds = activeBlock.assignedTaskIds ?? [];
    const assignedCount = assignedIds.length;
    const assignedTaskLabels = assignedIds
      .map((id) => taskLabelMap.get(id))
      .filter((label): label is string => label !== undefined);

    return {
      block: activeBlock,
      goal,
      status: "active",
      remainingMinutes: remaining,
      minutesUntilStart: null,
      scopeType: assignedCount > 0 ? "fixed" : "open",
      assignedTaskCount: assignedCount,
      completedTaskCount: activeBlock.completedTaskCount ?? 0,
      assignedTaskLabels,
      completedBlocksToday,
      totalBlocksToday,
    };
  }

  // Find next upcoming block (starts after now)
  const upcomingBlock = todayBlocks.find((b) => b.startMinutes > nowMinutes);

  if (upcomingBlock) {
    const minutesUntil = upcomingBlock.startMinutes - nowMinutes;
    const goal =
      goals.find((g) => g.id === upcomingBlock.sourceGoalId) ?? null;
    const assignedIds = upcomingBlock.assignedTaskIds ?? [];
    const assignedCount = assignedIds.length;
    const assignedTaskLabels = assignedIds
      .map((id) => taskLabelMap.get(id))
      .filter((label): label is string => label !== undefined);

    return {
      block: upcomingBlock,
      goal,
      status: "upcoming",
      remainingMinutes: upcomingBlock.durationMinutes,
      minutesUntilStart: minutesUntil,
      scopeType: assignedCount > 0 ? "fixed" : "open",
      assignedTaskCount: assignedCount,
      completedTaskCount: upcomingBlock.completedTaskCount ?? 0,
      assignedTaskLabels,
      completedBlocksToday,
      totalBlocksToday,
    };
  }

  // All blocks are in the past — done for today
  return {
    block: null,
    goal: null,
    status: "none",
    remainingMinutes: 0,
    minutesUntilStart: null,
    scopeType: "open",
    assignedTaskCount: 0,
    completedTaskCount: 0,
    assignedTaskLabels: [],
    completedBlocksToday,
    totalBlocksToday,
  };
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Derives the currently active or next upcoming goal/task block from today's
 * events. Re-evaluates every 60 seconds.
 */
export function useNextBlock(
  events: CalendarEvent[],
  goals: ScheduleGoal[],
): NextBlockInfo {
  const [info, setInfo] = React.useState<NextBlockInfo>(() =>
    deriveNextBlock(events, goals),
  );

  // Re-derive when events or goals change
  React.useEffect(() => {
    setInfo(deriveNextBlock(events, goals));
  }, [events, goals]);

  // Re-derive every 60 seconds to keep time context fresh
  React.useEffect(() => {
    const interval = setInterval(() => {
      setInfo(deriveNextBlock(events, goals));
    }, 60_000);

    return () => clearInterval(interval);
  }, [events, goals]);

  return info;
}
