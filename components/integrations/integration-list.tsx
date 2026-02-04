"use client";

import * as React from "react";
import { IntegrationCard } from "./integration-card";
import { AppCard, APP_ORDER } from "./app-card";
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
 * List of apps and calendar integrations.
 * Shows native apps first, then calendar integrations with connection status.
 */
function IntegrationList({
  integrationStates,
  onSelectProvider,
}: IntegrationListProps) {
  return (
    <div className="flex flex-col">
      {/* Apps Section */}
      <div className="flex flex-col gap-1 p-3">
        <h3 className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Apps
        </h3>
        {APP_ORDER.map((appType) => (
          <AppCard key={appType} appType={appType} />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-border/60" />

      {/* Integrations Section */}
      <div className="flex flex-col gap-1 p-3">
        <h3 className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Integrations
        </h3>
        {PROVIDER_ORDER.map((provider) => {
          const state = integrationStates.get(provider) ?? {
            provider,
            status: "not_connected" as const,
            accountEmail: null,
            calendars: [],
            lastSyncAt: null,
            importEnabled: true,
            importMeetingsOnly: true,
            exportEnabled: false,
            exportScope: "scheduled_and_blueprint" as const,
            exportParticipation: {
              essentials: true,
              goals: true,
              standaloneTaskBlocks: false,
            },
            exportGoalFilter: "all" as const,
            exportSelectedGoalIds: new Set<string>(),
            exportDefaultAppearance: "busy" as const,
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
    </div>
  );
}

export { IntegrationList };
export type { IntegrationListProps };
