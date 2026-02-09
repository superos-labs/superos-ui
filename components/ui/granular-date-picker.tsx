/**
 * =============================================================================
 * File: granular-date-picker.tsx
 * =============================================================================
 *
 * Date picker with Day / Month / Quarter granularity tabs.
 *
 * Inspired by the Linear date picker. Allows users to express dates at
 * different levels of precision: an exact day, a calendar month, or a
 * calendar quarter. The picker resolves the selection to a concrete ISO
 * date string and pairs it with the chosen granularity.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a trigger pill showing the formatted date or a placeholder.
 * - Open a popover with Day / Month / Quarter tab navigation.
 * - Day tab: standard single-date calendar (react-day-picker).
 * - Month tab: 4×3 grid of months with year navigation.
 * - Quarter tab: 4 quarter buttons with year navigation.
 * - Resolve selections to ISO date strings based on role (start / end).
 * - Provide a clear action when a value is set.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting values.
 * - Understanding goal semantics.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - `role` determines resolution: "start" → first day, "end" → last day.
 * - Follows the same visual language as the existing DatePicker component.
 * - Respects the user's week-start preference for the Day tab.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GranularDatePicker
 * - GranularDatePickerProps
 * - GranularDateValue
 */

"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import {
  RiCalendarLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import { usePreferencesOptional } from "@/lib/preferences";
import type { DateGranularity, DateRole } from "@/lib/unified-schedule";
import {
  resolveMonthDate,
  resolveQuarterDate,
  formatGranularDate,
  getMonthLabel,
  getQuarterMonthRange,
  getQuarterForDate,
} from "@/lib/unified-schedule";

// =============================================================================
// Types
// =============================================================================

/** Composite value returned by the picker. */
export interface GranularDateValue {
  /** Resolved ISO date string (e.g., "2026-04-01") */
  date: string;
  /** Granularity at which the date was expressed */
  granularity: DateGranularity;
}

export interface GranularDatePickerProps {
  /** Current value (date + granularity) */
  value?: GranularDateValue;
  /** Called when a date is selected or cleared */
  onChange?: (value: GranularDateValue | undefined) => void;
  /** Whether this date is a start date or end date — controls resolution */
  role: DateRole;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Additional class name for the trigger button */
  className?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const TABS: { key: DateGranularity; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i); // 0–11
const QUARTERS: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

// =============================================================================
// Helpers
// =============================================================================

function parseISODate(iso: string): Date | undefined {
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// =============================================================================
// Component
// =============================================================================

export function GranularDatePicker({
  value,
  onChange,
  role,
  placeholder = "Set date",
  className,
  disabled = false,
}: GranularDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Active tab defaults to the value's granularity, or "day"
  const [activeTab, setActiveTab] = React.useState<DateGranularity>(
    value?.granularity ?? "day",
  );

  // Year navigation for month/quarter tabs
  const [viewYear, setViewYear] = React.useState(() => {
    if (value?.date) {
      const d = parseISODate(value.date);
      if (d) return d.getFullYear();
    }
    return new Date().getFullYear();
  });

  // Sync tab and year when value changes externally
  React.useEffect(() => {
    if (value?.granularity) {
      setActiveTab(value.granularity);
    }
    if (value?.date) {
      const d = parseISODate(value.date);
      if (d) setViewYear(d.getFullYear());
    }
  }, [value?.granularity, value?.date]);

  // Reset view year when opening
  React.useEffect(() => {
    if (open) {
      if (value?.date) {
        const d = parseISODate(value.date);
        if (d) setViewYear(d.getFullYear());
      } else {
        setViewYear(new Date().getFullYear());
      }
    }
  }, [open, value?.date]);

  // Get week start preference
  const preferences = usePreferencesOptional();
  const weekStartsOn = preferences?.weekStartsOn ?? 1;

  // Parse value for DayPicker
  const selectedDate = value?.date ? parseISODate(value.date) : undefined;

  // Detect which month / quarter is currently selected
  const selectedMonth =
    value?.granularity === "month" && selectedDate
      ? selectedDate.getMonth()
      : null;
  const selectedQuarter =
    value?.granularity === "quarter" && selectedDate
      ? getQuarterForDate(selectedDate)
      : null;
  const selectedYear = selectedDate?.getFullYear() ?? null;

  // -------------------------------------------------------------------------
  // Selection handlers
  // -------------------------------------------------------------------------

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      onChange?.({ date: toISODateString(date), granularity: "day" });
    }
    setOpen(false);
  };

  const handleMonthSelect = (month: number) => {
    const iso = resolveMonthDate(viewYear, month, role);
    onChange?.({ date: iso, granularity: "month" });
    setOpen(false);
  };

  const handleQuarterSelect = (quarter: 1 | 2 | 3 | 4) => {
    const iso = resolveQuarterDate(viewYear, quarter, role);
    onChange?.({ date: iso, granularity: "quarter" });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  // Display text
  const displayText = value
    ? formatGranularDate(value.date, value.granularity)
    : placeholder;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
            "bg-background hover:bg-background/80",
            value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <RiCalendarLine className="size-3.5" />
          <span>{displayText}</span>
          {value && open && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="ml-0.5 flex size-4 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-muted hover:text-foreground"
              aria-label="Clear date"
            >
              <RiCloseLine className="size-3" />
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-50 rounded-lg border border-border bg-popover shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          {/* Granularity tabs */}
          <div className="flex border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-3">
            {activeTab === "day" && (
              <DayTab
                selectedDate={selectedDate}
                onSelect={handleDaySelect}
                weekStartsOn={weekStartsOn}
              />
            )}
            {activeTab === "month" && (
              <MonthTab
                viewYear={viewYear}
                onViewYearChange={setViewYear}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onSelect={handleMonthSelect}
              />
            )}
            {activeTab === "quarter" && (
              <QuarterTab
                viewYear={viewYear}
                onViewYearChange={setViewYear}
                selectedQuarter={selectedQuarter}
                selectedYear={selectedYear}
                onSelect={handleQuarterSelect}
              />
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

// =============================================================================
// Day Tab (wraps react-day-picker)
// =============================================================================

function DayTab({
  selectedDate,
  onSelect,
  weekStartsOn,
}: {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  weekStartsOn: 0 | 1;
}) {
  return (
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={onSelect}
      weekStartsOn={weekStartsOn}
      showOutsideDays
      className="p-0"
      classNames={{
        root: "relative",
        months: "flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center items-center h-9",
        caption_label: "text-sm font-medium",
        nav: "absolute top-0 left-0 right-0 flex items-center justify-between h-9 px-1",
        button_previous: cn(
          "size-7 flex items-center justify-center rounded-lg",
          "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        ),
        button_next: cn(
          "size-7 flex items-center justify-center rounded-lg",
          "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-8 font-normal text-[0.65rem] uppercase tracking-wide text-center",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
        day_button: cn(
          "size-8 p-0 font-normal rounded-lg transition-colors",
          "hover:bg-muted hover:text-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        ),
        selected: cn(
          "bg-foreground text-background rounded-lg",
          "hover:bg-foreground hover:text-background",
          "focus:bg-foreground focus:text-background",
        ),
        today: "bg-accent text-accent-foreground rounded-lg",
        outside:
          "text-muted-foreground/40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground/30 cursor-not-allowed",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <RiArrowLeftSLine className="size-4" />
          ) : (
            <RiArrowRightSLine className="size-4" />
          ),
      }}
    />
  );
}

// =============================================================================
// Month Tab
// =============================================================================

function MonthTab({
  viewYear,
  onViewYearChange,
  selectedMonth,
  selectedYear,
  onSelect,
}: {
  viewYear: number;
  onViewYearChange: (year: number) => void;
  selectedMonth: number | null;
  selectedYear: number | null;
  onSelect: (month: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Year navigation */}
      <YearNavigation year={viewYear} onYearChange={onViewYearChange} />

      {/* Month grid (4×3) */}
      <div className="grid grid-cols-4 gap-1.5">
        {MONTHS.map((month) => {
          const isSelected =
            selectedMonth === month && selectedYear === viewYear;
          return (
            <button
              key={month}
              onClick={() => onSelect(month)}
              className={cn(
                "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {getMonthLabel(month)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Quarter Tab
// =============================================================================

function QuarterTab({
  viewYear,
  onViewYearChange,
  selectedQuarter,
  selectedYear,
  onSelect,
}: {
  viewYear: number;
  onViewYearChange: (year: number) => void;
  selectedQuarter: 1 | 2 | 3 | 4 | null;
  selectedYear: number | null;
  onSelect: (quarter: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Year navigation */}
      <YearNavigation year={viewYear} onYearChange={onViewYearChange} />

      {/* Quarter buttons */}
      <div className="grid grid-cols-2 gap-2">
        {QUARTERS.map((q) => {
          const isSelected =
            selectedQuarter === q && selectedYear === viewYear;
          return (
            <button
              key={q}
              onClick={() => onSelect(q)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-3 transition-colors",
                isSelected
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span className="text-sm font-medium">Q{q}</span>
              <span
                className={cn(
                  "text-[0.65rem]",
                  isSelected
                    ? "text-background/70"
                    : "text-muted-foreground",
                )}
              >
                {getQuarterMonthRange(q)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Year Navigation (shared by Month and Quarter tabs)
// =============================================================================

function YearNavigation({
  year,
  onYearChange,
}: {
  year: number;
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onYearChange(year - 1)}
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Previous year"
      >
        <RiArrowLeftSLine className="size-4" />
      </button>
      <span className="text-sm font-medium">{year}</span>
      <button
        onClick={() => onYearChange(year + 1)}
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Next year"
      >
        <RiArrowRightSLine className="size-4" />
      </button>
    </div>
  );
}
