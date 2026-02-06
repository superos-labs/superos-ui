/**
 * =============================================================================
 * File: calendar-row.tsx
 * =============================================================================
 *
 * Single selectable calendar row used in integration settings.
 *
 * Displays:
 * - A custom checkbox indicating enabled/disabled state
 * - Calendar color indicator
 * - Calendar name
 *
 * Can operate in two modes:
 * - "import": toggles whether events are imported from the calendar
 * - "export": toggles whether blueprint blocks are exported to the calendar
 *
 * This component is presentational and stateless.
 * All state is derived from props and changes are emitted upward.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render calendar metadata (name, color).
 * - Derive checked state based on mode.
 * - Emit toggle intent on user interaction.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting settings.
 * - Fetching calendars.
 * - Validating provider capabilities.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Implemented as a button with ARIA checkbox semantics.
 * - Visual state is fully controlled by props.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - CalendarRow
 * - CalendarRowProps
 */

"use client";

import { cn } from "@/lib/utils";
import { RiCheckLine } from "@remixicon/react";
import type { ProviderCalendar } from "@/lib/calendar-sync";

interface CalendarRowProps {
  /** The calendar to display */
  calendar: ProviderCalendar;
  /** Whether to show the import checkbox or export checkbox */
  type: "import" | "export";
  /** Callback when the toggle is clicked */
  onToggle: () => void;
}

/**
 * A single calendar row with color dot, name, and toggle checkbox.
 * Used in both import and export calendar lists.
 */
function CalendarRow({ calendar, type, onToggle }: CalendarRowProps) {
  const isChecked =
    type === "import"
      ? calendar.importEnabled
      : calendar.exportBlueprintEnabled;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      onClick={onToggle}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-1.5 text-left",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* Custom checkbox */}
      <div
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded transition-all duration-150",
          isChecked
            ? "bg-foreground text-background"
            : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20",
        )}
      >
        {isChecked && <RiCheckLine className="size-3" />}
      </div>

      {/* Calendar color indicator */}
      <div
        className="size-3 shrink-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10"
        style={{ backgroundColor: calendar.color }}
        aria-hidden="true"
      />

      {/* Calendar name */}
      <span
        className={cn(
          "truncate text-sm transition-colors",
          isChecked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {calendar.name}
      </span>
    </button>
  );
}

export { CalendarRow };
export type { CalendarRowProps };
