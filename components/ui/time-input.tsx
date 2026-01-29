"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiDeleteBinLine } from "@remixicon/react";
import { formatTime, parseTime } from "@/lib/time-utils";

// =============================================================================
// TimeInput Component
// =============================================================================

export interface TimeInputProps {
  /** Time value in minutes from midnight */
  value: number;
  /** Called when the time changes */
  onChange: (minutes: number) => void;
  className?: string;
}

/**
 * A text input for time values that parses flexible time formats.
 * Displays in 12-hour format and accepts various input formats.
 */
export function TimeInput({ value, onChange, className }: TimeInputProps) {
  const [inputValue, setInputValue] = React.useState(formatTime(value));
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync display value when prop changes (but not while editing)
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
      // Invalid input - revert to current value
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
        "w-[80px] rounded-md bg-background/60 px-2 py-1.5 text-center text-sm text-foreground",
        "focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring/50",
        className,
      )}
    />
  );
}

// =============================================================================
// TimeRangeRow Component
// =============================================================================

export interface TimeRangeRowProps {
  /** Start time in minutes from midnight */
  startMinutes: number;
  /** Duration in minutes */
  durationMinutes: number;
  /** Called when start time changes */
  onStartChange: (minutes: number) => void;
  /** Called when duration changes */
  onDurationChange: (minutes: number) => void;
  /** Called when delete button is clicked */
  onDelete: () => void;
  /** Whether the delete button is shown */
  canDelete: boolean;
}

/**
 * A row with start/end time inputs and an optional delete button.
 * End time changes are converted to duration changes.
 */
export function TimeRangeRow({
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
      <span className="text-muted-foreground/70">–</span>
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
