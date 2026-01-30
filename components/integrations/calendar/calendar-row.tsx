"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors",
        "hover:bg-muted",
      )}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onToggle}
        className="size-4 rounded border-border accent-foreground"
      />
      <div
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: calendar.color }}
        aria-hidden="true"
      />
      <span className="truncate text-sm text-foreground">{calendar.name}</span>
    </label>
  );
}

export { CalendarRow };
export type { CalendarRowProps };
