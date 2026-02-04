"use client";

import * as React from "react";
import type { EssentialSlot } from "./types";

// =============================================================================
// Types
// =============================================================================

interface TimeRange {
  id: string;
  startMinutes: number;
  durationMinutes: number;
}

export interface UseActivityScheduleOptions {
  /** Initial slots for this essential */
  initialSlots?: EssentialSlot[];
}

export interface UseActivityScheduleReturn {
  selectedDays: number[];
  timeRanges: TimeRange[];
  setSelectedDays: (days: number[]) => void;
  addTimeRange: () => void;
  updateTimeRange: (
    id: string,
    updates: { startMinutes?: number; durationMinutes?: number },
  ) => void;
  deleteTimeRange: (id: string) => void;
  /** Convert current state to EssentialSlot array for saving */
  toSlots: () => EssentialSlot[];
  /** Reset state from slots */
  resetFromSlots: (slots: EssentialSlot[]) => void;
}

// =============================================================================
// Hook for Managing Activity Schedule State
// =============================================================================

/**
 * Hook for managing activity schedule editing state.
 * Converts between the flat EssentialSlot[] format and an editing-friendly
 * format with separate days and time ranges.
 */
export function useActivitySchedule({
  initialSlots = [],
}: UseActivityScheduleOptions = {}): UseActivityScheduleReturn {
  // Extract unique days from all slots
  const extractDays = (slots: EssentialSlot[]): number[] => {
    const daysSet = new Set<number>();
    slots.forEach((slot) => slot.days.forEach((d) => daysSet.add(d)));
    return Array.from(daysSet).sort((a, b) => a - b);
  };

  // Extract time ranges from slots
  const extractTimeRanges = (slots: EssentialSlot[]): TimeRange[] => {
    const seen = new Set<string>();
    const ranges: TimeRange[] = [];

    slots.forEach((slot) => {
      const key = `${slot.startMinutes}-${slot.durationMinutes}`;
      if (!seen.has(key)) {
        seen.add(key);
        ranges.push({
          id: slot.id,
          startMinutes: slot.startMinutes,
          durationMinutes: slot.durationMinutes,
        });
      }
    });

    // Default to noon for 1 hour if no slots
    return ranges.length > 0
      ? ranges
      : [{ id: `range-${Date.now()}`, startMinutes: 720, durationMinutes: 60 }];
  };

  const [selectedDays, setSelectedDays] = React.useState<number[]>(() =>
    extractDays(initialSlots),
  );
  const [timeRanges, setTimeRanges] = React.useState<TimeRange[]>(() =>
    extractTimeRanges(initialSlots),
  );

  const addTimeRange = React.useCallback(() => {
    setTimeRanges((prev) => {
      // Find the latest end time from existing ranges
      const latestEndMinutes = prev.reduce((max, range) => {
        const endMinutes = range.startMinutes + range.durationMinutes;
        return Math.max(max, endMinutes);
      }, 0);

      // Default: 2 hours after the latest end time, or noon if no ranges
      const defaultStart = latestEndMinutes > 0 ? latestEndMinutes + 120 : 720;

      return [
        ...prev,
        {
          id: `range-${Date.now()}`,
          startMinutes: defaultStart,
          durationMinutes: 60,
        },
      ];
    });
  }, []);

  const updateTimeRange = React.useCallback(
    (
      id: string,
      updates: { startMinutes?: number; durationMinutes?: number },
    ) => {
      setTimeRanges((prev) =>
        prev.map((range) =>
          range.id === id ? { ...range, ...updates } : range,
        ),
      );
    },
    [],
  );

  const deleteTimeRange = React.useCallback((id: string) => {
    setTimeRanges((prev) => prev.filter((range) => range.id !== id));
  }, []);

  const toSlots = React.useCallback((): EssentialSlot[] => {
    return timeRanges.map((range) => ({
      id: range.id,
      days: selectedDays,
      startMinutes: range.startMinutes,
      durationMinutes: range.durationMinutes,
    }));
  }, [selectedDays, timeRanges]);

  const resetFromSlots = React.useCallback((slots: EssentialSlot[]) => {
    setSelectedDays(extractDays(slots));
    setTimeRanges(extractTimeRanges(slots));
  }, []);

  return {
    selectedDays,
    timeRanges,
    setSelectedDays,
    addTimeRange,
    updateTimeRange,
    deleteTimeRange,
    toSlots,
    resetFromSlots,
  };
}
