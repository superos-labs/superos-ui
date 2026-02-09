/**
 * =============================================================================
 * File: sidebar-utils.ts
 * =============================================================================
 *
 * Shared types and utility helpers for the Block sidebar.
 *
 * This file defines:
 * - The BlockSidebarData shape used to render and edit block details
 * - Formatting helpers for date, time, and focus duration
 * - Parsing helpers for user-entered focus time
 * - A small auto-resizing textarea primitive
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Describe the data model consumed by the block sidebar UI.
 * - Provide pure formatting / parsing helpers.
 * - Provide tiny presentational primitives (e.g. auto-resize textarea).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Performing side effects or persistence.
 * - Owning business rules about blocks or scheduling.
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "A thin utility layer that shapes raw block data into display-ready values."
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { BlockColor } from "../block-colors";
import type { BlockType, BlockStatus } from "@/lib/types";
import type { ScheduleTask } from "@/lib/unified-schedule";
import type { BlockSubtask, BlockSidebarSource } from "../block-types";

// =============================================================================
// Types
// =============================================================================

/**
 * Goal task - synced from the goal's master task list.
 * This is an alias for ScheduleTask to maintain backward compatibility.
 * Use ScheduleTask directly for new code.
 */
export type BlockGoalTask = ScheduleTask;

export interface BlockSidebarData {
  id: string;
  title: string;
  /** Block type: 'goal' shows goal tasks section, 'task' shows subtasks, 'essential' shows notes only, 'external' shows calendar source */
  blockType: BlockType;
  /** Block status: 'planned' or 'completed' */
  status?: BlockStatus;
  /** Start date in ISO format (YYYY-MM-DD) */
  date: string;
  /** End date in ISO format (YYYY-MM-DD) - only differs from date for overnight blocks */
  endDate?: string;
  /** Start time in 24h format (HH:MM) */
  startTime: string;
  /** End time in 24h format (HH:MM) - always within 00:00-23:59 */
  endTime: string;
  /** Optional notes for the block */
  notes?: string;
  /** Subtasks for task blocks (synced with the source task) */
  subtasks: BlockSubtask[];
  /** Assigned tasks from the goal (only when blockType === 'goal') */
  goalTasks: BlockGoalTask[];
  /** Color theme for the block */
  color: BlockColor;
  /** Associated goal (for goal/task blocks) */
  goal?: BlockSidebarSource;
  /** Associated essential (for essential blocks) */
  essential?: BlockSidebarSource;

  // --- External Calendar Integration (blockType === 'external') ---
  /** Provider for external events (google, apple, outlook) */
  sourceProvider?: import("@/lib/calendar-sync").CalendarProvider;
  /** Source calendar name (for display) */
  sourceCalendarName?: string;
  /** Source calendar color (hex) */
  sourceCalendarColor?: string;
}

// =============================================================================
// Formatting Helpers
// =============================================================================

/** Format date string for display (e.g. "Monday, January 20") */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Format date string for compact property display (e.g. "Feb 9, 2026") */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Check if block spans overnight (ends on a different day) */
export function isOvernightBlock(block: BlockSidebarData): boolean {
  return !!block.endDate && block.endDate !== block.date;
}

/** Format time string for display (e.g. "9:00 AM") */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/** Format focus time (minutes) for display (e.g. "1h 30m") */
export function formatFocusTime(minutes: number): string {
  const roundedMinutes = Math.round(minutes);
  if (roundedMinutes === 0) return "0m";
  const hours = Math.floor(roundedMinutes / 60);
  const mins = roundedMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Parse focus time input string to minutes (e.g. "1h 30m" -> 90) */
export function parseFocusTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return 0;

  // Try parsing as plain number (minutes)
  const asNumber = parseFloat(trimmed);
  if (!isNaN(asNumber) && asNumber >= 0) {
    return Math.round(asNumber);
  }

  // Try parsing as "Xh Ym" or "Xh" or "Ym"
  const hourMatch = trimmed.match(/(\d+)\s*h/i);
  const minMatch = trimmed.match(/(\d+)\s*m/i);

  if (hourMatch || minMatch) {
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
    return hours * 60 + mins;
  }

  return null; // Invalid input
}

// =============================================================================
// Auto-resizing textarea component
// =============================================================================

type AutoResizeTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoResizeTextarea({
  className,
  value,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Resize when value changes
  React.useEffect(() => {
    resize();
  }, [value, resize]);

  // Resize on mount (handles placeholder / initial content)
  React.useEffect(() => {
    resize();
  }, [resize]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      rows={1}
      className={cn("resize-none overflow-hidden", className)}
      {...props}
    />
  );
}
