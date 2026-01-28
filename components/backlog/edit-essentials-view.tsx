"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiCloseLine,
  RiMoonLine,
  RiSunLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { BacklogItem } from "./backlog-types";

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

  // Match patterns like: 7, 7:30, 7am, 7:30am, 7 am, 7:30 am, 19:30
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i);

  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toLowerCase();

  // Validate ranges
  if (minutes < 0 || minutes > 59) return null;

  // Handle 24-hour format (no am/pm specified and hours > 12)
  if (!period && hours >= 0 && hours <= 23) {
    // If hours > 12, treat as 24-hour format
    // If hours <= 12, assume AM for morning times, but this is ambiguous
    // For simplicity, treat as 24-hour when no period specified
    return hours * 60 + minutes;
  }

  // Handle 12-hour format with am/pm
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

  // Update input when value prop changes (and not focused)
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
      // Reset to current value if invalid
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
        "w-[90px] rounded-md border border-border bg-background px-2 py-1 text-right text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
    />
  );
}

// =============================================================================
// Types
// =============================================================================

export interface EditEssentialsViewProps {
  allEssentials: BacklogItem[];
  enabledIds: Set<string>;
  onToggle: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  /** Day start time in minutes from midnight */
  dayStartMinutes?: number;
  /** Day end time in minutes from midnight */
  dayEndMinutes?: number;
  /** Callback when day boundaries change */
  onDayBoundariesChange?: (startMinutes: number, endMinutes: number) => void;
}

// =============================================================================
// Day Boundaries Section
// =============================================================================

interface DayBoundariesProps {
  startMinutes: number;
  endMinutes: number;
  onChange: (startMinutes: number, endMinutes: number) => void;
}

function DayBoundaries({
  startMinutes,
  endMinutes,
  onChange,
}: DayBoundariesProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Day Boundaries
        </h4>
      </div>

      <div className="flex flex-col gap-2">
        {/* Wake up time */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <RiSunLine className="size-4 text-amber-500" />
          </div>
          <span className="flex-1 text-sm text-foreground">Wake up</span>
          <TimeInput
            value={startMinutes}
            onChange={(value) => onChange(value, endMinutes)}
          />
        </div>

        {/* Wind down time */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <RiMoonLine className="size-4 text-indigo-400" />
          </div>
          <span className="flex-1 text-sm text-foreground">Wind down</span>
          <TimeInput
            value={endMinutes}
            onChange={(value) => onChange(startMinutes, value)}
          />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Hours outside these times will appear dimmed on your calendar.
      </p>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function EditEssentialsView({
  allEssentials,
  enabledIds,
  onToggle,
  onSave,
  onCancel,
  dayStartMinutes = 420, // 7:00 AM
  dayEndMinutes = 1380, // 11:00 PM
  onDayBoundariesChange,
}: EditEssentialsViewProps) {
  // Local state for day boundaries (in case parent doesn't provide callback)
  const [localStartMinutes, setLocalStartMinutes] =
    React.useState(dayStartMinutes);
  const [localEndMinutes, setLocalEndMinutes] = React.useState(dayEndMinutes);

  const handleDayBoundariesChange = React.useCallback(
    (start: number, end: number) => {
      setLocalStartMinutes(start);
      setLocalEndMinutes(end);
      onDayBoundariesChange?.(start, end);
    },
    [onDayBoundariesChange],
  );

  return (
    <div className="flex flex-col gap-4 px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">
            Edit Essentials
          </h3>
          <p className="text-xs text-muted-foreground">
            Set your typical routine
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-600"
            title="Save changes"
          >
            <RiCheckLine className="size-4" />
          </button>
          <button
            onClick={onCancel}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>
      </div>

      {/* Day Boundaries */}
      <div className="px-3">
        <DayBoundaries
          startMinutes={localStartMinutes}
          endMinutes={localEndMinutes}
          onChange={handleDayBoundariesChange}
        />
      </div>

      {/* Activities to Track */}
      <div className="flex flex-col gap-1 px-3">
        <h4 className="px-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Activities to Track
        </h4>
        <div className="flex flex-col gap-0.5">
          {allEssentials.map((essential) => {
            const isEnabled = enabledIds.has(essential.id);
            const IconComponent = essential.icon;

            return (
              <button
                key={essential.id}
                onClick={() => onToggle(essential.id)}
                className="group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-muted/60"
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
                    isEnabled
                      ? "bg-foreground text-background"
                      : "bg-muted/60 text-transparent",
                  )}
                >
                  <RiCheckLine className="size-3" />
                </div>

                {/* Icon */}
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                  <IconComponent
                    className={cn(
                      "size-4",
                      isEnabled
                        ? getIconColorClass(essential.color)
                        : "text-muted-foreground",
                    )}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "flex-1 text-left text-sm font-medium",
                    isEnabled ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {essential.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
