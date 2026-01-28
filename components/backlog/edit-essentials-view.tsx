"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiCloseLine,
  RiMoonLine,
  RiSunLine,
  RiAddLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { DayBoundariesDisplay } from "@/lib/preferences";
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

export interface EditEssentialsViewProps {
  allEssentials: BacklogItem[];
  enabledIds: Set<string>;
  onToggle: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  dayStartMinutes?: number;
  dayEndMinutes?: number;
  onDayBoundariesChange?: (startMinutes: number, endMinutes: number) => void;
  dayBoundariesEnabled?: boolean;
  onDayBoundariesEnabledChange?: (enabled: boolean) => void;
  dayBoundariesDisplay?: DayBoundariesDisplay;
  onDayBoundariesDisplayChange?: (display: DayBoundariesDisplay) => void;
  templates?: EssentialTemplate[];
  onSaveEssentialSchedule?: (
    essentialId: string,
    slots: EssentialSlot[],
  ) => void;
}

// =============================================================================
// Sleep Activity Row (special case with wake up/wind down)
// =============================================================================

interface SleepActivityRowProps {
  isEnabled: boolean;
  onToggle: () => void;
  startMinutes: number;
  endMinutes: number;
  onTimesChange: (startMinutes: number, endMinutes: number) => void;
  displayMode: DayBoundariesDisplay;
  onDisplayModeChange: (mode: DayBoundariesDisplay) => void;
}

function SleepActivityRow({
  isEnabled,
  onToggle,
  startMinutes,
  endMinutes,
  onTimesChange,
  displayMode,
  onDisplayModeChange,
}: SleepActivityRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl transition-colors",
        isEnabled ? "bg-muted/30" : "hover:bg-muted/60",
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
            isEnabled
              ? "bg-foreground text-background"
              : "bg-muted/60 text-transparent",
          )}
        >
          <RiCheckLine className="size-3" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            isEnabled ? "bg-background" : "bg-muted/60",
          )}
        >
          <RiMoonLine
            className={cn(
              "size-4",
              isEnabled ? "text-indigo-400" : "text-muted-foreground",
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
          Sleep
        </span>
      </div>

      {/* Expanded content when enabled */}
      {isEnabled && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          {/* Wake up time */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
              <RiSunLine className="size-4 text-amber-500" />
            </div>
            <span className="flex-1 text-sm text-foreground">Wake up</span>
            <TimeInput
              value={startMinutes}
              onChange={(value) => onTimesChange(value, endMinutes)}
            />
          </div>

          {/* Wind down time */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
              <RiMoonLine className="size-4 text-indigo-400" />
            </div>
            <span className="flex-1 text-sm text-foreground">Wind down</span>
            <TimeInput
              value={endMinutes}
              onChange={(value) => onTimesChange(startMinutes, value)}
            />
          </div>

          {/* Display mode selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Out-of-bounds hours:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onDisplayModeChange("dimmed")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  displayMode === "dimmed"
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                Dimmed
              </button>
              <button
                onClick={() => onDisplayModeChange("hidden")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  displayMode === "hidden"
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                Hidden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Activity Row Component (for regular activities)
// =============================================================================

interface ActivityRowProps {
  essential: BacklogItem;
  isEnabled: boolean;
  onToggle: () => void;
  template?: EssentialTemplate;
  onSaveSchedule: (slots: EssentialSlot[]) => void;
}

function ActivityRow({
  essential,
  isEnabled,
  onToggle,
  template,
  onSaveSchedule,
}: ActivityRowProps) {
  const IconComponent = essential.icon;
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
        isEnabled ? "bg-muted/30" : "hover:bg-muted/60",
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
            isEnabled
              ? "bg-foreground text-background"
              : "bg-muted/60 text-transparent",
          )}
        >
          <RiCheckLine className="size-3" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            isEnabled ? "bg-background" : "bg-muted/60",
          )}
        >
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

        {/* Save button (only when enabled) */}
        {isEnabled && (
          <button
            onClick={handleSave}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-600"
            title="Save schedule"
          >
            <RiCheckLine className="size-4" />
          </button>
        )}
      </div>

      {/* Schedule editor (auto-expanded when enabled) */}
      {isEnabled && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          {/* Day selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
                        ? "bg-foreground text-background"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
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
        </div>
      )}
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
  dayStartMinutes = 420,
  dayEndMinutes = 1380,
  onDayBoundariesChange,
  dayBoundariesEnabled = false,
  onDayBoundariesEnabledChange,
  dayBoundariesDisplay = "dimmed",
  onDayBoundariesDisplayChange,
  templates = [],
  onSaveEssentialSchedule,
}: EditEssentialsViewProps) {
  // Local state for day boundaries (Sleep)
  const [localSleepEnabled, setLocalSleepEnabled] =
    React.useState(dayBoundariesEnabled);
  const [localStartMinutes, setLocalStartMinutes] =
    React.useState(dayStartMinutes);
  const [localEndMinutes, setLocalEndMinutes] = React.useState(dayEndMinutes);
  const [localDisplayMode, setLocalDisplayMode] =
    React.useState<DayBoundariesDisplay>(dayBoundariesDisplay);

  const handleSleepToggle = React.useCallback(() => {
    const newEnabled = !localSleepEnabled;
    setLocalSleepEnabled(newEnabled);
    onDayBoundariesEnabledChange?.(newEnabled);
  }, [localSleepEnabled, onDayBoundariesEnabledChange]);

  const handleTimesChange = React.useCallback(
    (start: number, end: number) => {
      setLocalStartMinutes(start);
      setLocalEndMinutes(end);
      onDayBoundariesChange?.(start, end);
    },
    [onDayBoundariesChange],
  );

  const handleDisplayModeChange = React.useCallback(
    (mode: DayBoundariesDisplay) => {
      setLocalDisplayMode(mode);
      onDayBoundariesDisplayChange?.(mode);
    },
    [onDayBoundariesDisplayChange],
  );

  const getTemplate = (essentialId: string) =>
    templates.find((t) => t.essentialId === essentialId);

  const handleSaveSchedule = React.useCallback(
    (essentialId: string, slots: EssentialSlot[]) => {
      onSaveEssentialSchedule?.(essentialId, slots);
    },
    [onSaveEssentialSchedule],
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

      {/* Activities Section */}
      <div className="flex flex-col gap-2 px-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Activities
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Make time for what matters. Visibility increases awareness and helps
            protect your time.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          {/* Sleep (special activity for day boundaries) */}
          <SleepActivityRow
            isEnabled={localSleepEnabled}
            onToggle={handleSleepToggle}
            startMinutes={localStartMinutes}
            endMinutes={localEndMinutes}
            onTimesChange={handleTimesChange}
            displayMode={localDisplayMode}
            onDisplayModeChange={handleDisplayModeChange}
          />

          {/* Regular activities */}
          {allEssentials.map((essential) => {
            const isEnabled = enabledIds.has(essential.id);

            return (
              <ActivityRow
                key={essential.id}
                essential={essential}
                isEnabled={isEnabled}
                onToggle={() => onToggle(essential.id)}
                template={getTemplate(essential.id)}
                onSaveSchedule={(slots) =>
                  handleSaveSchedule(essential.id, slots)
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
