"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiArrowLeftSLine } from "@remixicon/react";
import { IntegrationList } from "./integration-list";
import { ProviderSettingsView } from "./calendar";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-sync";
import type {
  CalendarProvider,
  CalendarIntegrationState,
  IntegrationsSidebarView,
} from "@/lib/calendar-sync";

interface IntegrationsSidebarProps {
  /** State for each calendar provider */
  integrationStates: Map<CalendarProvider, CalendarIntegrationState>;
  /** Current view within the sidebar */
  currentView: IntegrationsSidebarView;
  /** Close the sidebar */
  onClose: () => void;
  /** Navigate to a provider's settings */
  onNavigateToProvider: (provider: CalendarProvider) => void;
  /** Navigate back to the list */
  onNavigateToList: () => void;
  /** Connect a provider */
  onConnectProvider?: (provider: CalendarProvider) => void;
  /** Disconnect a provider */
  onDisconnectProvider?: (provider: CalendarProvider) => void;
  /** Toggle importing events from a calendar */
  onToggleCalendarImport?: (
    provider: CalendarProvider,
    calendarId: string,
  ) => void;
  /** Toggle exporting blueprint to a calendar */
  onToggleCalendarExport?: (
    provider: CalendarProvider,
    calendarId: string,
  ) => void;
  /** Optional class name */
  className?: string;
}

/**
 * Sidebar for managing calendar integrations.
 *
 * Features:
 * - List view: Shows all available providers with connection status
 * - Provider view: Settings for a specific provider with calendar toggles
 */
function IntegrationsSidebar({
  integrationStates,
  currentView,
  onClose,
  onNavigateToProvider,
  onNavigateToList,
  onConnectProvider,
  onDisconnectProvider,
  onToggleCalendarImport,
  onToggleCalendarExport,
  className,
}: IntegrationsSidebarProps) {
  const isListView = currentView.type === "list";

  const getProviderTitle = (provider: CalendarProvider): string => {
    return CALENDAR_PROVIDERS[provider].name;
  };

  const getIntegrationState = (
    provider: CalendarProvider,
  ): CalendarIntegrationState => {
    return (
      integrationStates.get(provider) ?? {
        provider,
        status: "not_connected",
        accountEmail: null,
        calendars: [],
        lastSyncAt: null,
      }
    );
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {!isListView && (
            <button
              onClick={onNavigateToList}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Back to integrations"
            >
              <RiArrowLeftSLine className="size-5" />
            </button>
          )}
          <h2 className="text-sm font-medium text-foreground">
            {isListView
              ? "Integrations"
              : getProviderTitle(currentView.provider)}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <RiCloseLine className="size-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isListView ? (
          <IntegrationList
            integrationStates={integrationStates}
            onSelectProvider={onNavigateToProvider}
          />
        ) : (
          <ProviderSettingsView
            provider={currentView.provider}
            state={getIntegrationState(currentView.provider)}
            onConnect={() => onConnectProvider?.(currentView.provider)}
            onDisconnect={() => onDisconnectProvider?.(currentView.provider)}
            onToggleCalendarImport={(calendarId) =>
              onToggleCalendarImport?.(currentView.provider, calendarId)
            }
            onToggleCalendarExport={(calendarId) =>
              onToggleCalendarExport?.(currentView.provider, calendarId)
            }
          />
        )}
      </div>
    </div>
  );
}

export { IntegrationsSidebar };
export type { IntegrationsSidebarProps };
