"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiDeleteBinLine,
  RiAddLine,
  RiMoonLine,
  RiSunLine,
  RiCloseLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { BacklogItem } from "./backlog-types";
import { useActivitySchedule } from "./activity-schedule-editor";

// =============================================================================
// Time Formatting Utilities
// =============================================================================

function formatTime(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  return `${hours12}:${mins.toString().padStart(2, "0")} ${period}`;
}

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
// Schedule Summary Formatting
// =============================================================================

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_FULL_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDays(days: number[]): string {
  if (days.length === 0) return "";
  const sortedDays = [...days].sort((a, b) => a - b);

  if (sortedDays.length === 7) return "Every day";
  if (sortedDays.length === 5 && sortedDays.every((d, i) => d === i)) {
    return "Weekdays";
  }
  if (sortedDays.length === 2 && sortedDays[0] === 5 && sortedDays[1] === 6) {
    return "Weekends";
  }

  return sortedDays.map((d) => DAY_FULL_LABELS[d]).join(", ");
}

function formatTimeShort(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

  if (mins === 0) {
    return `${hours12} ${period}`;
  }
  return `${hours12}:${mins.toString().padStart(2, "0")} ${period}`;
}

function formatTimeRange(
  startMinutes: number,
  durationMinutes: number,
): string {
  const endMinutes = startMinutes + durationMinutes;
  const startStr = formatTimeShort(startMinutes);
  const endStr = formatTimeShort(endMinutes);

  const startPeriod = startMinutes >= 720 ? "PM" : "AM";
  const endPeriod = endMinutes >= 720 ? "PM" : "AM";

  if (startPeriod === endPeriod) {
    const startWithoutPeriod = startStr.replace(` ${startPeriod}`, "");
    return `${startWithoutPeriod} – ${endStr}`;
  }

  return `${startStr} – ${endStr}`;
}

function formatScheduleSummary(slots: EssentialSlot[]): string {
  if (slots.length === 0) return "Not scheduled";

  const byDaysPattern = new Map<string, EssentialSlot[]>();
  slots.forEach((slot) => {
    const key = [...slot.days].sort((a, b) => a - b).join(",");
    if (!byDaysPattern.has(key)) {
      byDaysPattern.set(key, []);
    }
    byDaysPattern.get(key)!.push(slot);
  });

  const summaries: string[] = [];

  byDaysPattern.forEach((groupSlots, daysKey) => {
    const days = daysKey.split(",").map(Number);
    const daysLabel = formatDays(days);
    const timeRanges = groupSlots
      .map((s) => formatTimeRange(s.startMinutes, s.durationMinutes))
      .join(", ");
    summaries.push(`${daysLabel}, ${timeRanges}`);
  });

  return summaries.join(" · ");
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
        "w-[80px] rounded-md bg-background/60 px-2 py-1.5 text-center text-sm text-foreground",
        "focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring/50",
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

// =============================================================================
// Essential Row Types
// =============================================================================

export interface EssentialRowProps {
  essential: BacklogItem;
  template?: EssentialTemplate;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSaveSchedule: (slots: EssentialSlot[]) => void;
  onDelete?: () => void;
  className?: string;
}

// =============================================================================
// Essential Row Component
// =============================================================================

export function EssentialRow({
  essential,
  template,
  isExpanded,
  onToggleExpand,
  onSaveSchedule,
  onDelete,
  className,
}: EssentialRowProps) {
  const IconComponent = essential.icon;
  const schedule = template
    ? formatScheduleSummary(template.slots)
    : "Not scheduled";

  const scheduleState = useActivitySchedule({
    initialSlots: template?.slots ?? [],
  });

  // Reset schedule state when template changes
  React.useEffect(() => {
    if (template?.slots) {
      scheduleState.resetFromSlots(template.slots);
    }
  }, [template?.slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    const slots = scheduleState.toSlots();
    onSaveSchedule(slots);
  };

  // Auto-save when collapsing
  const handleToggle = () => {
    if (isExpanded) {
      // Save before collapsing
      handleSave();
    }
    onToggleExpand();
  };

  const toggleDay = (dayIndex: number) => {
    if (scheduleState.selectedDays.includes(dayIndex)) {
      scheduleState.setSelectedDays(
        scheduleState.selectedDays.filter((d) => d !== dayIndex),
      );
    } else {
      scheduleState.setSelectedDays(
        [...scheduleState.selectedDays, dayIndex].sort((a, b) => a - b),
      );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl transition-colors",
        isExpanded ? "bg-muted/30" : "hover:bg-muted/60",
        className,
      )}
    >
      {/* Main row */}
      <div className="group flex w-full items-center gap-3 px-3 py-2.5">
        {/* Clickable area for expand/collapse */}
        <button
          onClick={handleToggle}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {/* Icon */}
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              isExpanded ? "bg-background" : "bg-muted/60",
            )}
          >
            <IconComponent
              className={cn("size-4", getIconColorClass(essential.color))}
            />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {essential.label}
            </span>
            {!isExpanded && (
              <span className="truncate text-xs text-muted-foreground">
                {schedule}
              </span>
            )}
          </div>
        </button>

        {/* Delete button (only for non-required essentials) */}
        {onDelete && !isExpanded && (
          <button
            onClick={onDelete}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            title="Remove essential"
          >
            <RiDeleteBinLine className="size-3.5" />
          </button>
        )}
      </div>

      {/* Expanded schedule editor */}
      {isExpanded && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          {/* Day selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
              Days
            </span>
            <div className="flex gap-1">
              {DAY_LABELS.map((label, index) => {
                const isSelected = scheduleState.selectedDays.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => toggleDay(index)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-foreground/80 text-background"
                        : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground",
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
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
              Time ranges
            </span>
            <div className="flex flex-col gap-2">
              {scheduleState.timeRanges.map((range) => (
                <TimeRangeRow
                  key={range.id}
                  startMinutes={range.startMinutes}
                  durationMinutes={range.durationMinutes}
                  onStartChange={(minutes) =>
                    scheduleState.updateTimeRange(range.id, {
                      startMinutes: minutes,
                    })
                  }
                  onDurationChange={(minutes) =>
                    scheduleState.updateTimeRange(range.id, {
                      durationMinutes: minutes,
                    })
                  }
                  onDelete={() => scheduleState.deleteTimeRange(range.id)}
                  canDelete={scheduleState.timeRanges.length > 1}
                />
              ))}
            </div>
            <button
              onClick={scheduleState.addTimeRange}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RiAddLine className="size-3.5" />
              Add another time
            </button>
          </div>

          {/* Delete button when expanded */}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs text-destructive/70 transition-colors hover:text-destructive"
            >
              <RiDeleteBinLine className="size-3.5" />
              Remove essential
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Sleep Row Component (Special Case)
// =============================================================================

export interface SleepRowProps {
  essential: BacklogItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  wakeUpMinutes: number;
  windDownMinutes: number;
  onTimesChange: (wakeUp: number, windDown: number) => void;
  /** Whether sleep visualization is configured/enabled */
  isConfigured?: boolean;
  className?: string;
}

export function SleepRow({
  essential,
  isExpanded,
  onToggleExpand,
  wakeUpMinutes,
  windDownMinutes,
  onTimesChange,
  isConfigured = false,
  className,
}: SleepRowProps) {
  const IconComponent = essential.icon;

  // Local state for editing times (only saved on confirm)
  const [localWakeUp, setLocalWakeUp] = React.useState(wakeUpMinutes);
  const [localWindDown, setLocalWindDown] = React.useState(windDownMinutes);

  // Sync local state when props change (e.g., after save)
  React.useEffect(() => {
    setLocalWakeUp(wakeUpMinutes);
    setLocalWindDown(windDownMinutes);
  }, [wakeUpMinutes, windDownMinutes]);

  // Check if local values differ from saved values, or if not yet configured
  const hasChanges =
    !isConfigured ||
    localWakeUp !== wakeUpMinutes ||
    localWindDown !== windDownMinutes;

  // Handle confirm button click
  const handleConfirm = () => {
    onTimesChange(localWakeUp, localWindDown);
  };

  // Format sleep schedule summary
  const scheduleSummary = isConfigured
    ? `${formatTimeShort(wakeUpMinutes)} – ${formatTimeShort(windDownMinutes)}`
    : "Visualize your sleep time";

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl transition-colors",
        isExpanded ? "bg-muted/30" : "hover:bg-muted/60",
        className,
      )}
    >
      {/* Main row */}
      <div className="flex w-full items-center gap-3 px-3 py-2.5">
        {/* Clickable area for expand/collapse */}
        <button
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {/* Icon */}
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              isExpanded ? "bg-background" : "bg-muted/60",
            )}
          >
            <IconComponent
              className={cn("size-4", getIconColorClass(essential.color))}
            />
          </div>

          {/* Content - always show two lines */}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {essential.label}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {scheduleSummary}
            </span>
          </div>
        </button>

        {/* Close button when expanded */}
        {isExpanded && (
          <button
            onClick={onToggleExpand}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Collapse"
          >
            <RiCloseLine className="size-4" />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          {/* Wake up time */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
              <RiSunLine className="size-4 text-amber-500" />
            </div>
            <span className="flex-1 text-sm text-foreground">Wake up</span>
            <TimeInput value={localWakeUp} onChange={setLocalWakeUp} />
          </div>

          {/* Wind down time */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
              <RiMoonLine className="size-4 text-indigo-400" />
            </div>
            <span className="flex-1 text-sm text-foreground">Wind down</span>
            <TimeInput value={localWindDown} onChange={setLocalWindDown} />
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!hasChanges}
            className={cn(
              "w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              hasChanges
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
