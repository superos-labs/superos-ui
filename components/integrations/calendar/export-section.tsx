"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiUploadLine } from "@remixicon/react";
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
 * Two-step flow:
 * 1. Enable/disable export with a master toggle
 * 2. When enabled, select ONE calendar as the export target
 */
function ExportSection({
  calendars,
  provider,
  onToggleExport,
}: ExportSectionProps) {
  if (calendars.length === 0) {
    return null;
  }

  // Find if export is enabled (any calendar has exportBlueprintEnabled)
  const enabledCalendar = calendars.find((c) => c.exportBlueprintEnabled);
  const isExportEnabled = !!enabledCalendar;

  // Handle master toggle
  const handleToggleExport = () => {
    if (isExportEnabled && enabledCalendar) {
      // Disable export by toggling off the currently enabled calendar
      onToggleExport(enabledCalendar.id);
    } else {
      // Enable export by selecting the first calendar
      onToggleExport(calendars[0].id);
    }
  };

  // Handle calendar selection (single select - deselects current, selects new)
  const handleSelectCalendar = (calendarId: string) => {
    if (enabledCalendar?.id === calendarId) {
      // Already selected, do nothing
      return;
    }

    // If another calendar was enabled, toggle it off first
    if (enabledCalendar) {
      onToggleExport(enabledCalendar.id);
    }

    // Toggle on the new calendar
    onToggleExport(calendarId);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header with toggle */}
      <div className="flex items-start justify-between gap-3 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <RiUploadLine className="size-3.5" />
            <span>Export from SuperOS</span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Sync your blueprint as &quot;Reserved focus time&quot; blocks.
          </p>
        </div>

        {/* Master toggle switch */}
        <button
          role="switch"
          aria-checked={isExportEnabled}
          onClick={handleToggleExport}
          className={cn(
            "relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isExportEnabled ? "bg-foreground" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0",
              "transition-transform duration-150",
              isExportEnabled ? "translate-x-[18px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      {/* Calendar selector - only shown when export is enabled */}
      {isExportEnabled && (
        <div className="flex flex-col gap-1 px-2">
          <p className="mb-1 text-xs text-muted-foreground">
            Select calendar:
          </p>
          <div className="flex flex-col gap-0.5">
            {calendars.map((calendar) => {
              const isSelected = calendar.exportBlueprintEnabled;
              return (
                <button
                  key={calendar.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectCalendar(calendar.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left",
                    "transition-colors duration-150",
                    "hover:bg-muted/60",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  )}
                >
                  {/* Radio button */}
                  <div
                    className={cn(
                      "flex size-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-150",
                      isSelected
                        ? "bg-foreground"
                        : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20",
                    )}
                  >
                    {isSelected && (
                      <span className="size-2 rounded-full bg-background" />
                    )}
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
                      isSelected ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {calendar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { ExportSection };
export type { ExportSectionProps };
