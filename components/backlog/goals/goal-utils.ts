/**
 * =============================================================================
 * File: task-formatters.ts
 * =============================================================================
 *
 * Formatting helpers for displaying task schedule and deadline information
 * inside backlog task rows.
 *
 * These utilities convert raw schedule/deadline data into short, human-readable
 * strings suitable for dense list UIs.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Format scheduled start times with optional day prefix.
 * - Format deadline dates with relative labels (Today, Tomorrow, weekday).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Parsing or validating domain data.
 * - Internationalization.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Assumes dayIndex 0 = Monday for scheduled tasks.
 * - Uses local time for deadline comparisons.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - formatScheduledTime
 * - formatDeadlineDate
 */

import type {
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";

/**
 * Format a scheduled time for display in the task row.
 */
export function formatScheduledTime(schedule: TaskScheduleInfo): string {
  const hours = Math.floor(schedule.startMinutes / 60);
  const minutes = schedule.startMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const timeStr =
    minutes > 0
      ? `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
      : `${displayHours} ${period}`;

  // Get day name (assuming dayIndex 0 = Monday)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to our Monday=0 format

  if (schedule.dayIndex === todayIndex) {
    return timeStr; // Just show time for today
  }

  return `${days[schedule.dayIndex]} ${timeStr}`;
}

/**
 * Format a deadline date for display in the task row.
 */
export function formatDeadlineDate(deadline: TaskDeadlineInfo): string {
  const date = new Date(deadline.date + "T00:00:00"); // Parse as local date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const deadlineTime = date.getTime();
  const todayTime = today.getTime();
  const tomorrowTime = tomorrow.getTime();

  if (deadlineTime === todayTime) {
    return "Today";
  }
  if (deadlineTime === tomorrowTime) {
    return "Tomorrow";
  }

  // Check if within this week (next 7 days)
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  if (deadlineTime < weekFromNow.getTime() && deadlineTime > todayTime) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }

  // Otherwise show date
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
