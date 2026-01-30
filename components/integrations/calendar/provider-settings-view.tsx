"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiUserLine } from "@remixicon/react";
import { ConnectPrompt } from "./connect-prompt";
import { CalendarList } from "./calendar-list";
import { ExportSection } from "./export-section";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex flex-col gap-5 p-4">
      {/* Account Info */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-3",
          "ring-1 ring-inset ring-border/60",
        )}
      >
        {/* Account icon */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <RiUserLine className="size-4 text-muted-foreground" />
        </div>

        {/* Email and disconnect */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {state.accountEmail}
          </span>
          <button
            onClick={onDisconnect}
            className="w-fit text-xs text-muted-foreground/70 transition-colors hover:text-destructive"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Calendar Import List */}
      <CalendarList
        calendars={state.calendars}
        provider={provider}
        onToggleImport={onToggleCalendarImport}
      />

      {/* Soft Divider */}
      <div className="px-2">
        <Separator className="bg-border/60" />
      </div>

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
