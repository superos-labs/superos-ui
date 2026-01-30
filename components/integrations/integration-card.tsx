"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiArrowRightSLine, RiCheckLine } from "@remixicon/react";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-sync";
import type {
  CalendarProvider,
  CalendarIntegrationState,
} from "@/lib/calendar-sync";

interface IntegrationCardProps {
  provider: CalendarProvider;
  state: CalendarIntegrationState;
  onClick: () => void;
}

/**
 * Card representing a single calendar integration.
 * Shows connection status, enabled calendar count, and navigation arrow.
 */
function IntegrationCard({ provider, state, onClick }: IntegrationCardProps) {
  const config = CALENDAR_PROVIDERS[provider];
  const Icon = config.icon;
  const isConnected = state.status === "connected";
  const enabledCount = state.calendars.filter((c) => c.importEnabled).length;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
        "hover:bg-muted",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
      )}
    >
      {/* Provider Icon */}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${config.brandColor}15`, color: config.brandColor }}
      >
        <Icon className="size-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {config.name}
          </span>
          {isConnected && <RiCheckLine className="size-4 text-emerald-500" />}
        </div>
        <span className="text-xs text-muted-foreground">
          {isConnected
            ? `${enabledCount} calendar${enabledCount !== 1 ? "s" : ""} synced`
            : "Not connected"}
        </span>
      </div>

      {/* Arrow */}
      <RiArrowRightSLine className="size-5 text-muted-foreground" />
    </button>
  );
}

export { IntegrationCard };
export type { IntegrationCardProps };
