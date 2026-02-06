/**
 * =============================================================================
 * File: integration-list.tsx
 * =============================================================================
 *
 * Composite list of SuperOS apps and calendar integrations.
 *
 * Renders two stacked sections:
 * - Native / companion apps (iOS, Android, Chrome Extension)
 * - Calendar integration providers with connection status
 *
 * Acts as the primary browsing surface for the Integrations area.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render ordered list of companion apps.
 * - Render ordered list of calendar providers.
 * - Provide a fallback default state for providers with no stored state.
 * - Emit selected provider when a card is clicked.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching integration state.
 * - Persisting changes.
 * - Performing navigation.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Ordering is driven by APP_ORDER and PROVIDER_ORDER.
 * - Uses IntegrationCard and AppCard as building blocks.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - IntegrationList
 * - IntegrationListProps
 */

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
            exportDefaultAppearance: "blocked_superos" as const,
            exportCustomLabel: "",
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
