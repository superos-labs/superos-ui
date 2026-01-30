"use client";

import * as React from "react";
import { ConnectPrompt } from "./connect-prompt";
import { CalendarList } from "./calendar-list";
import { ExportSection } from "./export-section";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-sync";
import type {
  CalendarProvider,
  CalendarIntegrationState,
} from "@/lib/calendar-sync";

interface ProviderSettingsViewProps {
  /** The provider being configured */
  provider: CalendarProvider;
  /** Current state of the integration */
  state: CalendarIntegrationState;
  /** Callback to connect the provider */
  onConnect: () => void;
  /** Callback to disconnect the provider */
  onDisconnect: () => void;
  /** Callback when a calendar's import toggle is clicked */
  onToggleCalendarImport: (calendarId: string) => void;
  /** Callback when a calendar's export toggle is clicked */
  onToggleCalendarExport: (calendarId: string) => void;
}

/**
 * Settings view for a connected calendar provider.
 *
 * Features:
 * - Shows connect prompt if not connected
 * - Account info with disconnect button when connected
 * - Calendar import toggles
 * - Blueprint export settings
 */
function ProviderSettingsView({
  provider,
  state,
  onConnect,
  onDisconnect,
  onToggleCalendarImport,
  onToggleCalendarExport,
}: ProviderSettingsViewProps) {
  const config = CALENDAR_PROVIDERS[provider];
  const isConnected = state.status === "connected";

  // Show connect prompt if not connected
  if (!isConnected) {
    return <ConnectPrompt provider={provider} onConnect={onConnect} />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Account Info */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="truncate text-sm text-foreground">
          {state.accountEmail}
        </span>
        <button
          onClick={onDisconnect}
          className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-red-500"
        >
          Disconnect
        </button>
      </div>

      {/* Calendar Import List */}
      <CalendarList
        calendars={state.calendars}
        provider={provider}
        onToggleImport={onToggleCalendarImport}
      />

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Blueprint Export Section */}
      <ExportSection
        calendars={state.calendars}
        provider={provider}
        onToggleExport={onToggleCalendarExport}
      />
    </div>
  );
}

export { ProviderSettingsView };
export type { ProviderSettingsViewProps };
