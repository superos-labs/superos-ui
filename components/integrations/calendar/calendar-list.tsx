"use client";

import * as React from "react";
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
    <div className="flex flex-col">
      {/* Section Label */}
      <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
        Import to SuperOS
      </p>

      {/* Calendar Toggles */}
      <div className="flex flex-col gap-0.5">
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
