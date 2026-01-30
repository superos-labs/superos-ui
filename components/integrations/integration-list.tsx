"use client";

import * as React from "react";
import { IntegrationCard } from "./integration-card";
import { PROVIDER_ORDER } from "@/lib/calendar-sync";
import type {
  CalendarProvider,
  CalendarIntegrationState,
} from "@/lib/calendar-sync";

interface IntegrationListProps {
  integrationStates: Map<CalendarProvider, CalendarIntegrationState>;
  onSelectProvider: (provider: CalendarProvider) => void;
}

/**
 * List of all available calendar integrations.
 * Shows connection status and allows navigation to provider settings.
 */
function IntegrationList({
  integrationStates,
  onSelectProvider,
}: IntegrationListProps) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {PROVIDER_ORDER.map((provider) => {
        const state = integrationStates.get(provider) ?? {
          provider,
          status: "not_connected" as const,
          accountEmail: null,
          calendars: [],
          lastSyncAt: null,
        };

        return (
          <IntegrationCard
            key={provider}
            provider={provider}
            state={state}
            onClick={() => onSelectProvider(provider)}
          />
        );
      })}
    </div>
  );
}

export { IntegrationList };
export type { IntegrationListProps };
