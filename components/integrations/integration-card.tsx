"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiArrowRightSLine } from "@remixicon/react";
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
 * Format relative time for last sync display.
 * Shows "Just now", "X min ago", "X hr ago", or "X days ago".
 */
function formatLastSync(date: Date | null): string | null {
  if (!date) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
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
  const lastSyncText = formatLastSync(state.lastSyncAt);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl p-3 text-left",
        "bg-gradient-to-r from-transparent to-transparent",
        "transition-all duration-200",
        "hover:from-muted/60 hover:to-muted/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* Provider Icon - Circular container */}
      <div
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-full",
          "ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.08]",
          "transition-shadow duration-150 group-hover:shadow-sm",
        )}
        style={{
          backgroundColor: `${config.brandColor}12`,
          color: config.brandColor,
        }}
      >
        <Icon className="size-5" />
        {/* Connected indicator dot */}
        {isConnected && (
          <span
            className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
            aria-label="Connected"
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground">
          {config.name}
        </span>
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <span className="text-xs text-muted-foreground">
                {enabledCount} calendar{enabledCount !== 1 ? "s" : ""} synced
              </span>
              {lastSyncText && (
                <>
                  <span className="text-xs text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground/60">
                    {lastSyncText}
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground/60">
              Not connected
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <RiArrowRightSLine className="size-5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
    </button>
  );
}

export { IntegrationCard };
export type { IntegrationCardProps };
