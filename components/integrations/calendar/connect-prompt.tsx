"use client";

import * as React from "react";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-sync";
import type { CalendarProvider } from "@/lib/calendar-sync";

interface ConnectPromptProps {
  /** The provider to connect */
  provider: CalendarProvider;
  /** Callback when user clicks connect */
  onConnect: () => void;
}

/**
 * Connect CTA shown when a provider is not connected.
 * Displays provider branding and a connect button.
 */
function ConnectPrompt({ provider, onConnect }: ConnectPromptProps) {
  const config = CALENDAR_PROVIDERS[provider];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Provider Icon */}
      <div
        className="mb-4 flex size-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${config.brandColor}15` }}
      >
        <Icon className="size-8" style={{ color: config.brandColor }} />
      </div>

      {/* Description */}
      <p className="mb-6 max-w-[220px] text-sm text-muted-foreground">
        Connect your {config.name} to see your events in SuperOS and sync your
        blueprint.
      </p>

      {/* Connect Button */}
      <button
        onClick={onConnect}
        className="h-9 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Connect {config.name}
      </button>
    </div>
  );
}

export { ConnectPrompt };
export type { ConnectPromptProps };
