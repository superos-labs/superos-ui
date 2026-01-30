"use client";

import * as React from "react";
import { RiDownloadLine } from "@remixicon/react";
import { CalendarRow } from "./calendar-row";
import type { ProviderCalendar, CalendarProvider } from "@/lib/calendar-sync";

interface CalendarListProps {
  /** List of calendars to display */
  calendars: ProviderCalendar[];
  /** The provider these calendars belong to */
  provider: CalendarProvider;
  /** Callback when a calendar's import toggle is clicked */
  onToggleImport: (calendarId: string) => void;
}

/**
 * List of calendars with import toggles.
 * Shows which calendars will have their events imported into SuperOS.
 */
function CalendarList({ calendars, provider, onToggleImport }: CalendarListProps) {
  if (calendars.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-sm text-muted-foreground">
        No calendars available
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Section Label with Icon */}
      <div className="flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <RiDownloadLine className="size-3.5" />
        <span>Import to SuperOS</span>
      </div>

      {/* Calendar Toggles */}
      <div className="flex flex-col">
        {calendars.map((calendar) => (
          <CalendarRow
            key={calendar.id}
            calendar={calendar}
            type="import"
            onToggle={() => onToggleImport(calendar.id)}
          />
        ))}
      </div>
    </div>
  );
}

export { CalendarList };
export type { CalendarListProps };
