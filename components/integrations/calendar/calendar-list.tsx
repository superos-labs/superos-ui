/**
 * =============================================================================
 * File: calendar-list.tsx
 * =============================================================================
 *
 * Calendar import configuration list for a single provider.
 *
 * Renders:
 * - A master toggle to enable/disable importing events
 * - A list of provider calendars with per-calendar import toggles
 * - An optional "meetings only" filter toggle
 *
 * This component is purely presentational.
 * It receives state and callbacks from its parent and emits user intent upward.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render provider calendars for import selection.
 * - Expose master import enable/disable control.
 * - Expose meetings-only filter toggle.
 * - Forward toggle events via callbacks.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching calendars.
 * - Persisting user preferences.
 * - Interpreting calendar data semantics.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Hidden when no calendars are available.
 * - Secondary controls only appear when master import is enabled.
 * - Uses a small internal ToggleSwitch helper for consistent toggles.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - CalendarList
 * - CalendarListProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarRow } from "./calendar-row";
import type { ProviderCalendar, CalendarProvider } from "@/lib/calendar-sync";

// =============================================================================
// Helper Components
// =============================================================================

/** Toggle switch component */
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  className,
}: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-foreground" : "bg-muted-foreground/30",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0",
          "transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// =============================================================================
// Main CalendarList Component
// =============================================================================

interface CalendarListProps {
  /** List of calendars to display */
  calendars: ProviderCalendar[];
  /** The provider these calendars belong to */
  provider: CalendarProvider;
  /** Whether import is enabled at the provider level */
  importEnabled: boolean;
  /** Whether to only show meetings */
  importMeetingsOnly: boolean;
  /** Callback to toggle the master import switch */
  onToggleImportEnabled: () => void;
  /** Callback when a calendar's import toggle is clicked */
  onToggleImport: (calendarId: string) => void;
  /** Callback to toggle meetings-only filter */
  onToggleMeetingsOnly: () => void;
}

/**
 * List of calendars with import toggles.
 * Shows which calendars will have their events imported into SuperOS.
 * Includes master toggle and meetings-only filter.
 */
function CalendarList({
  calendars,
  importEnabled,
  importMeetingsOnly,
  onToggleImportEnabled,
  onToggleImport,
  onToggleMeetingsOnly,
}: CalendarListProps) {
  if (calendars.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Master Toggle */}
      <div className="flex items-center justify-between gap-3 px-2">
        <span className="text-sm text-foreground">
          Import calendar events to SuperOS
        </span>
        <ToggleSwitch
          checked={importEnabled}
          onChange={onToggleImportEnabled}
        />
      </div>

      {/* Rest of settings - only shown when enabled */}
      {importEnabled && (
        <div className="flex flex-col gap-4 px-2">
          {/* Calendar selection */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Calendars
            </p>
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

          {/* Meetings-only toggle */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Only show meetings
            </span>
            <ToggleSwitch
              checked={importMeetingsOnly}
              onChange={onToggleMeetingsOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { CalendarList };
export type { CalendarListProps };
