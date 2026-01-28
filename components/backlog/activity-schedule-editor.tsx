"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiDeleteBinLine, RiCheckLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { BacklogItem } from "./backlog-types";
import type { EssentialSlot } from "@/lib/essentials";

// =============================================================================
// Time Formatting Utilities
// =============================================================================

/** Format minutes from midnight to 12-hour time string (e.g., "7:00 AM") */
function formatTime(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  return `${hours12}:${mins.toString().padStart(2, "0")} ${period}`;
}

/**
 * Parse a time string into minutes from midnight.
 * Supports formats: "7", "7:30", "7am", "7:30am", "7 AM", "7:30 AM", "19:30"
 */
function parseTime(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toLowerCase();

  if (minutes < 0 || minutes > 59) return null;

  if (!period && hours >= 0 && hours <= 23) {
    return hours * 60 + minutes;
  }

  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === "pm" || period === "p") {
      if (hours !== 12) hours += 12;
    } else if (period === "am" || period === "a") {
      if (hours === 12) hours = 0;
    }
  }

  return hours * 60 + minutes;
}

// =============================================================================
// Day Labels
// =============================================================================

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_FULL_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// =============================================================================
// Time Input Component
// =============================================================================

interface TimeInputProps {
  value: number;
  onChange: (minutes: number) => void;
  className?: string;
}

function TimeInput({ value, onChange, className }: TimeInputProps) {
  const [inputValue, setInputValue] = React.useState(formatTime(value));
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(formatTime(value));
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseTime(inputValue);
    if (parsed !== null) {
      onChange(parsed);
      setInputValue(formatTime(parsed));
    } else {
      setInputValue(formatTime(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-[80px] rounded-md border border-border bg-background px-2 py-1 text-center text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
    />
  );
}

// =============================================================================
// Time Range Row
// =============================================================================

interface TimeRangeRowProps {
  startMinutes: number;
  durationMinutes: number;
  onStartChange: (minutes: number) => void;
  onDurationChange: (minutes: number) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function TimeRangeRow({
  startMinutes,
  durationMinutes,
  onStartChange,
  onDurationChange,
  onDelete,
  canDelete,
}: TimeRangeRowProps) {
  const endMinutes = startMinutes + durationMinutes;

  const handleEndChange = (newEnd: number) => {
    const newDuration = newEnd - startMinutes;
    if (newDuration > 0) {
      onDurationChange(newDuration);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TimeInput value={startMinutes} onChange={onStartChange} />
      <span className="text-muted-foreground">–</span>
      <TimeInput value={endMinutes} onChange={handleEndChange} />
      {canDelete && (
        <button
          onClick={onDelete}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Remove time range"
        >
          <RiDeleteBinLine className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// Types
// =============================================================================

export interface ActivityScheduleEditorProps {
  /** The essential being edited */
  essential: BacklogItem;
  /** Current selected days (0-6, where 0 = Monday) */
  selectedDays: number[];
  /** Time ranges for this activity */
  timeRanges: Array<{
    id: string;
    startMinutes: number;
    durationMinutes: number;
  }>;
  /** Called when days selection changes */
  onDaysChange: (days: number[]) => void;
  /** Called when a time range is added */
  onAddTimeRange: () => void;
  /** Called when a time range is updated */
  onUpdateTimeRange: (
    id: string,
    updates: { startMinutes?: number; durationMinutes?: number },
  ) => void;
  /** Called when a time range is deleted */
  onDeleteTimeRange: (id: string) => void;
  /** Called when save is clicked */
  onSave: () => void;
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function ActivityScheduleEditor({
  essential,
  selectedDays,
  timeRanges,
  onDaysChange,
  onAddTimeRange,
  onUpdateTimeRange,
  onDeleteTimeRange,
  onSave,
  className,
}: ActivityScheduleEditorProps) {
  const IconComponent = essential.icon;

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      onDaysChange(selectedDays.filter((d) => d !== dayIndex));
    } else {
      onDaysChange([...selectedDays, dayIndex].sort((a, b) => a - b));
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg bg-muted/30 p-3",
        className,
      )}
    >
      {/* Header with icon and label */}
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
          <IconComponent
            className={cn("size-4", getIconColorClass(essential.color))}
          />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground">
          {essential.label}
        </span>
        <button
          onClick={onSave}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-600"
          title="Save schedule"
        >
          <RiCheckLine className="size-4" />
        </button>
      </div>

      {/* Day selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Days
        </span>
        <div className="flex gap-1">
          {DAY_LABELS.map((label, index) => {
            const isSelected = selectedDays.includes(index);
            return (
              <button
                key={index}
                onClick={() => toggleDay(index)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={DAY_FULL_LABELS[index]}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time ranges */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Time ranges
        </span>
        <div className="flex flex-col gap-2">
          {timeRanges.map((range) => (
            <TimeRangeRow
              key={range.id}
              startMinutes={range.startMinutes}
              durationMinutes={range.durationMinutes}
              onStartChange={(minutes) =>
                onUpdateTimeRange(range.id, { startMinutes: minutes })
              }
              onDurationChange={(minutes) =>
                onUpdateTimeRange(range.id, { durationMinutes: minutes })
              }
              onDelete={() => onDeleteTimeRange(range.id)}
              canDelete={timeRanges.length > 1}
            />
          ))}
        </div>
        <button
          onClick={onAddTimeRange}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RiAddLine className="size-3.5" />
          Add another time
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Hook for Managing Activity Schedule State
// =============================================================================

interface TimeRange {
  id: string;
  startMinutes: number;
  durationMinutes: number;
}

interface UseActivityScheduleOptions {
  /** Initial slots for this essential */
  initialSlots?: EssentialSlot[];
}

interface UseActivityScheduleReturn {
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
    setTimeRanges((prev) => [
      ...prev,
      { id: `range-${Date.now()}`, startMinutes: 720, durationMinutes: 60 },
    ]);
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
