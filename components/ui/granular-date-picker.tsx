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
 * - Open a popover with role label, date display, and Day / Month / Quarter
 *   tab navigation.
 * - Day tab: calendar with custom header, go-to-today, month navigation.
 * - Month tab: scrollable multi-year view with 3-column month grids.
 * - Quarter tab: scrollable multi-year view with 4-column quarter grids.
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
 * - The popover header shows the role label ("Start date" / "Target date")
 *   and a formatted date input display, matching Linear's pattern.
 * - Month and Quarter tabs use scrollable multi-year layouts instead of
 *   single-year views with arrow navigation.
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
  RiArrowGoBackLine,
} from "@remixicon/react";
import { usePreferencesOptional } from "@/lib/preferences";
import type { DateGranularity, DateRole } from "@/lib/unified-schedule";
import {
  resolveMonthDate,
  resolveQuarterDate,
  formatGranularDate,
  getMonthLabel,
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

const ROLE_LABELS: Record<DateRole, string> = {
  start: "Start date",
  end: "Target date",
};

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

/** Format date for the input display field (Linear-style). */
function formatInputDisplay(
  isoDate: string,
  granularity: DateGranularity,
): string {
  const date = parseISODate(isoDate);
  if (!date) return "";

  switch (granularity) {
    case "quarter": {
      const q = getQuarterForDate(date);
      return `Q${q} ${date.getFullYear()}`;
    }
    case "month":
      return format(date, "MMM yyyy");
    case "day":
    default:
      return format(date, "dd/MM/yyyy");
  }
}

/** Get the year range for scrollable month/quarter views. */
function getScrollYears(selectedYear: number | null): number[] {
  const now = new Date().getFullYear();
  const center = selectedYear ?? now;
  const min = Math.min(center, now) - 1;
  const max = Math.max(center, now) + 2;
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
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

  // Sync tab when value changes externally
  React.useEffect(() => {
    if (value?.granularity) {
      setActiveTab(value.granularity);
    }
  }, [value?.granularity]);

  // Get week start preference
  const preferences = usePreferencesOptional();
  const weekStartsOn = preferences?.weekStartsOn ?? 1;

  // Parse value for calendar
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

  const handleMonthSelect = (year: number, month: number) => {
    const iso = resolveMonthDate(year, month, role);
    onChange?.({ date: iso, granularity: "month" });
    setOpen(false);
  };

  const handleQuarterSelect = (year: number, quarter: 1 | 2 | 3 | 4) => {
    const iso = resolveQuarterDate(year, quarter, role);
    onChange?.({ date: iso, granularity: "quarter" });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  // Display text for trigger and input
  const displayText = value
    ? formatGranularDate(value.date, value.granularity)
    : placeholder;

  const inputDisplayText = value
    ? formatInputDisplay(value.date, value.granularity)
    : "";

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
            "z-50 w-[272px] rounded-lg border border-border bg-popover shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          {/* Role label */}
          <div className="px-3 pt-3 pb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {ROLE_LABELS[role]}
            </span>
          </div>

          {/* Date input display */}
          <div className="px-3 pb-2">
            <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
              {inputDisplayText || (
                <span className="text-muted-foreground">No date</span>
              )}
            </div>
          </div>

          {/* Granularity tabs */}
          <div className="flex gap-1 border-b border-border px-3 pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-muted text-foreground shadow-sm"
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
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onSelect={handleMonthSelect}
              />
            )}
            {activeTab === "quarter" && (
              <QuarterTab
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
// Day Tab (calendar with custom header)
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
  const [displayMonth, setDisplayMonth] = React.useState(
    () => selectedDate ?? new Date(),
  );

  const goToToday = () => setDisplayMonth(new Date());

  const prevMonth = () =>
    setDisplayMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );

  const nextMonth = () =>
    setDisplayMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );

  return (
    <div className="flex flex-col gap-2">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {format(displayMonth, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={goToToday}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Go to today"
          >
            <RiArrowGoBackLine className="size-3.5" />
          </button>
          <button
            onClick={prevMonth}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous month"
          >
            <RiArrowLeftSLine className="size-4" />
          </button>
          <button
            onClick={nextMonth}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next month"
          >
            <RiArrowRightSLine className="size-4" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        weekStartsOn={weekStartsOn}
        showOutsideDays
        className="p-0"
        classNames={{
          root: "relative",
          months: "flex flex-col",
          month: "flex flex-col",
          month_caption: "hidden",
          nav: "hidden",
          month_grid: "w-full border-collapse",
          weekdays: "flex",
          weekday:
            "text-muted-foreground w-[34px] font-normal text-[0.65rem] uppercase tracking-wide text-center",
          week: "flex w-full mt-1",
          day: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
          day_button: cn(
            "size-[34px] p-0 font-normal rounded-lg transition-colors",
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
      />
    </div>
  );
}

// =============================================================================
// Month Tab (scrollable multi-year)
// =============================================================================

function MonthTab({
  selectedMonth,
  selectedYear,
  onSelect,
}: {
  selectedMonth: number | null;
  selectedYear: number | null;
  onSelect: (year: number, month: number) => void;
}) {
  const years = React.useMemo(
    () => getScrollYears(selectedYear),
    [selectedYear],
  );
  const selectedYearRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Small delay to ensure DOM is rendered before scrolling
    const raf = requestAnimationFrame(() => {
      selectedYearRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="max-h-[260px] overflow-y-auto">
      {years.map((year) => {
        const isTargetYear = year === (selectedYear ?? new Date().getFullYear());
        return (
          <div
            key={year}
            ref={isTargetYear ? selectedYearRef : undefined}
            className="mb-4 last:mb-0"
          >
            {/* Year label */}
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {year}
            </div>

            {/* Month grid (3 columns) */}
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((month) => {
                const isSelected =
                  selectedMonth === month && selectedYear === year;
                return (
                  <button
                    key={month}
                    onClick={() => onSelect(year, month)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-foreground text-foreground"
                        : "border-border text-foreground hover:bg-muted",
                    )}
                  >
                    {getMonthLabel(month)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Quarter Tab (scrollable multi-year)
// =============================================================================

function QuarterTab({
  selectedQuarter,
  selectedYear,
  onSelect,
}: {
  selectedQuarter: 1 | 2 | 3 | 4 | null;
  selectedYear: number | null;
  onSelect: (year: number, quarter: 1 | 2 | 3 | 4) => void;
}) {
  const years = React.useMemo(
    () => getScrollYears(selectedYear),
    [selectedYear],
  );
  const selectedYearRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      selectedYearRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="max-h-[260px] overflow-y-auto">
      {years.map((year) => {
        const isTargetYear = year === (selectedYear ?? new Date().getFullYear());
        return (
          <div
            key={year}
            ref={isTargetYear ? selectedYearRef : undefined}
            className="mb-4 last:mb-0"
          >
            {/* Year label */}
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {year}
            </div>

            {/* Quarter grid (4 columns) */}
            <div className="grid grid-cols-4 gap-1.5">
              {QUARTERS.map((q) => {
                const isSelected =
                  selectedQuarter === q && selectedYear === year;
                return (
                  <button
                    key={q}
                    onClick={() => onSelect(year, q)}
                    className={cn(
                      "rounded-lg border px-2 py-2.5 text-center text-xs font-medium transition-colors",
                      isSelected
                        ? "border-foreground text-foreground"
                        : "border-border text-foreground hover:bg-muted",
                    )}
                  >
                    Q{q}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
