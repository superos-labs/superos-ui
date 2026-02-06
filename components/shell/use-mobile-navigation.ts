"use client";

/**
 * useMobileNavigation - Mobile day-level navigation within a week.
 *
 * Manages the selected day index for mobile/tablet day view,
 * and provides handlers for navigating between days (with week boundary crossing).
 */

import * as React from "react";

// =============================================================================
// Types
// =============================================================================

export interface UseMobileNavigationOptions {
  /** The 7 dates of the current week */
  weekDates: Date[];
  /** The currently selected date (fallback for mobile view) */
  selectedDate: Date;
  /** Navigate to the previous week */
  onPreviousWeek: () => void;
  /** Navigate to the next week */
  onNextWeek: () => void;
}

export interface UseMobileNavigationReturn {
  /** Currently selected day index within the week (0-6) */
  mobileSelectedDayIndex: number;
  /** The Date corresponding to the selected day */
  mobileSelectedDate: Date;
  /** Navigate to the previous day (crosses week boundary) */
  handleMobilePreviousDay: () => void;
  /** Navigate to the next day (crosses week boundary) */
  handleMobileNextDay: () => void;
}

// =============================================================================
// Hook
// =============================================================================

export function useMobileNavigation({
  weekDates,
  selectedDate,
  onPreviousWeek,
  onNextWeek,
}: UseMobileNavigationOptions): UseMobileNavigationReturn {
  // Track which day within the week to show in day view
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

  // Navigate to previous day, crossing week boundary if needed
  const handleMobilePreviousDay = React.useCallback(() => {
    if (mobileSelectedDayIndex > 0) {
      setMobileSelectedDayIndex(mobileSelectedDayIndex - 1);
    } else {
      // Go to previous week, last day
      onPreviousWeek();
      setMobileSelectedDayIndex(6);
    }
  }, [mobileSelectedDayIndex, onPreviousWeek]);

  // Navigate to next day, crossing week boundary if needed
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

  return {
    mobileSelectedDayIndex,
    mobileSelectedDate,
    handleMobilePreviousDay,
    handleMobileNextDay,
  };
}
