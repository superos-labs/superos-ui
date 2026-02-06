/**
 * =============================================================================
 * File: date-picker.tsx
 * =============================================================================
 *
 * Lightweight date picker built on top of Radix Popover and react-day-picker.
 *
 * Allows selecting (or clearing) a single calendar date and returns the value
 * as an ISO date string (yyyy-MM-dd).
 *
 * Designed for compact inline usage (e.g. deadlines, due dates).
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a trigger button showing formatted date or placeholder.
 * - Open a popover calendar for single-date selection.
 * - Convert between Date objects and ISO date strings.
 * - Respect user week-start preference when available.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing higher-level scheduling logic.
 * - Validating semantic meaning of selected dates.
 * - Persisting values.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Controlled via `value` (ISO string) and `onChange`.
 * - Closing the popover occurs after selection.
 * - Clear action is available when a value exists and the popover is open.
 * - Week start defaults to Monday if not provided or in preferences.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - DatePicker
 * - DatePickerProps
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

// =============================================================================
// Types
// =============================================================================

export interface DatePickerProps {
  /** Currently selected date (ISO string, e.g., "2026-01-15") */
  value?: string;
  /** Called when date is selected or cleared */
  onChange?: (date: string | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Additional class name for the trigger button */
  className?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Which day the week starts on (0 = Sunday, 1 = Monday). Falls back to user preference from context. */
  weekStartsOn?: 0 | 1;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format an ISO date string for display.
 * e.g., "2026-01-15" -> "Jan 15, 2026"
 */
function formatDateDisplay(isoDate: string): string {
  const date = parse(isoDate, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return isoDate;
  return format(date, "MMM d, yyyy");
}

/**
 * Convert a Date object to ISO date string.
 * e.g., Date -> "2026-01-15"
 */
function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Parse an ISO date string to Date object.
 */
function parseISODate(isoDate: string): Date | undefined {
  const date = parse(isoDate, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : undefined;
}

// =============================================================================
// Component
// =============================================================================

export function DatePicker({
  value,
  onChange,
  placeholder = "Set deadline",
  className,
  disabled = false,
  weekStartsOn: weekStartsOnProp,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Get week start preference from context, fallback to Monday (1)
  const preferences = usePreferencesOptional();
  const weekStartsOn = weekStartsOnProp ?? preferences?.weekStartsOn ?? 1;

  // Parse value to Date for DayPicker
  const selectedDate = value ? parseISODate(value) : undefined;

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(toISODateString(date));
    }
    setOpen(false);
  };

  // Handle clearing the date
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

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
          <span>{value ? formatDateDisplay(value) : placeholder}</span>
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
            "z-50 rounded-lg border border-border bg-popover p-3 shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
