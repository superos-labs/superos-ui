"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiArrowLeftSLine, RiApps2Line } from "@remixicon/react";
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
  /** Toggle meetings-only filter for an integration */
  onToggleMeetingsOnly?: (provider: CalendarProvider) => void;
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
  onToggleMeetingsOnly,
  className,
}: IntegrationsSidebarProps) {
  const isListView = currentView.type === "list";

  const getProviderTitle = (provider: CalendarProvider): string => {
    return CALENDAR_PROVIDERS[provider].name;
  };

  const getProviderIcon = (provider: CalendarProvider) => {
    return CALENDAR_PROVIDERS[provider].icon;
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

  // Get provider icon for header when in provider view
  const ProviderIcon = !isListView
    ? getProviderIcon(currentView.provider)
    : null;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          {!isListView ? (
            <>
              <button
                onClick={onNavigateToList}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg",
                  "text-muted-foreground transition-colors duration-150",
                  "hover:bg-muted hover:text-foreground",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label="Back to integrations"
              >
                <RiArrowLeftSLine className="size-4" />
              </button>
              {ProviderIcon && (
                <div
                  className="flex size-6 items-center justify-center rounded-full ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.08]"
                  style={{
                    backgroundColor: `${CALENDAR_PROVIDERS[currentView.provider].brandColor}12`,
                    color: CALENDAR_PROVIDERS[currentView.provider].brandColor,
                  }}
                >
                  <ProviderIcon className="size-3.5" />
                </div>
              )}
            </>
          ) : (
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
              <RiApps2Line className="size-4 text-muted-foreground" />
            </div>
          )}
          <h2 className="text-sm font-semibold text-foreground">
            {isListView
              ? "Integrations"
              : getProviderTitle(currentView.provider)}
          </h2>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            "text-muted-foreground transition-colors duration-150",
            "hover:bg-muted hover:text-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Close"
        >
          <RiCloseLine className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
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
            onToggleMeetingsOnly={() =>
              onToggleMeetingsOnly?.(currentView.provider)
            }
          />
        )}
      </div>
    </div>
  );
}

export { IntegrationsSidebar };
export type { IntegrationsSidebarProps };
