"use client";

import * as React from "react";
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
        "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left",
        "transition-colors duration-150",
        "hover:bg-muted/60",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      )}
    >
      {/* Custom checkbox */}
      <div
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-md transition-all duration-150",
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
