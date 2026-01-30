"use client";

import * as React from "react";
import { CalendarRow } from "./calendar-row";
import type { ProviderCalendar, CalendarProvider } from "@/lib/calendar-sync";

interface ExportSectionProps {
  /** List of calendars available for export */
  calendars: ProviderCalendar[];
  /** The provider these calendars belong to */
  provider: CalendarProvider;
  /** Callback when a calendar's export toggle is clicked */
  onToggleExport: (calendarId: string) => void;
}

/**
 * Section for configuring blueprint export to external calendars.
 * Users can select which calendars to sync their SuperOS blueprint to.
 */
function ExportSection({
  calendars,
  provider,
  onToggleExport,
}: ExportSectionProps) {
  if (calendars.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Section Label */}
      <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
        Export from SuperOS
      </p>

      {/* Description */}
      <p className="px-2 pb-2 text-xs text-muted-foreground">
        Sync your blueprint as recurring &quot;Reserved focus time&quot; blocks.
      </p>

      {/* Calendar Toggles */}
      <div className="flex flex-col gap-0.5">
        {calendars.map((calendar) => (
          <CalendarRow
            key={calendar.id}
            calendar={calendar}
            type="export"
            onToggle={() => onToggleExport(calendar.id)}
          />
        ))}
      </div>
    </div>
  );
}

export { ExportSection };
export type { ExportSectionProps };
