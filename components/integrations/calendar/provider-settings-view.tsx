/**
 * =============================================================================
 * File: provider-settings-view.tsx
 * =============================================================================
 *
 * Top-level settings view for configuring a single calendar provider integration.
 *
 * Acts as the composition root for all provider-specific integration UI:
 * - Connection / disconnection state
 * - Calendar import configuration
 * - External calendar export configuration
 *
 * Decides which subviews to render based on connection status.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Show connect prompt when provider is not connected.
 * - Show account info and disconnect action when connected.
 * - Compose CalendarList and ExportSection with correct state and callbacks.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Performing connection or disconnection.
 * - Persisting integration settings.
 * - Fetching calendars or goals.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Serves as a thin orchestration layer for integration UI.
 * - All business state is injected via props.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ProviderSettingsView
 * - ProviderSettingsViewProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiUserLine } from "@remixicon/react";
import { ConnectPrompt } from "./connect-prompt";
import { CalendarList } from "./calendar-list";
import { ExportSection } from "./export-section";
import { Separator } from "@/components/ui/separator";
import type {
  CalendarProvider,
  CalendarIntegrationState,
  ExportBlockVisibility,
  SyncParticipation,
  GoalFilterMode,
} from "@/lib/calendar-sync";
import type { ScheduleGoal } from "@/lib/unified-schedule";

interface ProviderSettingsViewProps {
  /** The provider being configured */
  provider: CalendarProvider;
  /** Current state of the integration */
  state: CalendarIntegrationState;
  /** All available goals for the goal filter */
  availableGoals?: ScheduleGoal[];
  /** Callback to connect the provider */
  onConnect: () => void;
  /** Callback to disconnect the provider */
  onDisconnect: () => void;
  // Import settings callbacks
  /** Toggle import enabled */
  onToggleImportEnabled: () => void;
  /** Callback when a calendar's import toggle is clicked */
  onToggleCalendarImport: (calendarId: string) => void;
  /** Callback to toggle meetings-only filter for this integration */
  onToggleMeetingsOnly: () => void;
  // Export settings callbacks
  /** Callback when a calendar's export toggle is clicked */
  onToggleCalendarExport: (calendarId: string) => void;
  /** Toggle export enabled */
  onToggleExportEnabled: () => void;
  /** Update participation settings */
  onParticipationChange: (participation: Partial<SyncParticipation>) => void;
  /** Set goal filter */
  onGoalFilterChange: (mode: GoalFilterMode, selectedIds?: Set<string>) => void;
  /** Set default appearance */
  onDefaultAppearanceChange: (appearance: ExportBlockVisibility) => void;
  /** Set custom label for exported events */
  onCustomLabelChange: (label: string) => void;
}

/**
 * Settings view for a connected calendar provider.
 *
 * Features:
 * - Shows connect prompt if not connected
 * - Account info with disconnect button when connected
 * - Calendar import section with master toggle
 * - Comprehensive export settings
 */
function ProviderSettingsView({
  provider,
  state,
  availableGoals = [],
  onConnect,
  onDisconnect,
  onToggleImportEnabled,
  onToggleCalendarImport,
  onToggleMeetingsOnly,
  onToggleCalendarExport,
  onToggleExportEnabled,
  onParticipationChange,
  onGoalFilterChange,
  onDefaultAppearanceChange,
  onCustomLabelChange,
}: ProviderSettingsViewProps) {
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

      {/* Calendar Import Section */}
      <CalendarList
        calendars={state.calendars}
        provider={provider}
        importEnabled={state.importEnabled}
        importMeetingsOnly={state.importMeetingsOnly}
        onToggleImportEnabled={onToggleImportEnabled}
        onToggleImport={onToggleCalendarImport}
        onToggleMeetingsOnly={onToggleMeetingsOnly}
      />

      {/* Soft Divider */}
      <div className="px-2">
        <Separator className="bg-border/60" />
      </div>

      {/* External Calendar Sync Section */}
      <ExportSection
        calendars={state.calendars}
        provider={provider}
        exportEnabled={state.exportEnabled}
        exportParticipation={state.exportParticipation}
        exportGoalFilter={state.exportGoalFilter}
        exportSelectedGoalIds={state.exportSelectedGoalIds}
        exportDefaultAppearance={state.exportDefaultAppearance}
        exportCustomLabel={state.exportCustomLabel}
        availableGoals={availableGoals}
        onToggleExportEnabled={onToggleExportEnabled}
        onParticipationChange={onParticipationChange}
        onGoalFilterChange={onGoalFilterChange}
        onDefaultAppearanceChange={onDefaultAppearanceChange}
        onCustomLabelChange={onCustomLabelChange}
        onToggleCalendarExport={onToggleCalendarExport}
      />
    </div>
  );
}

export { ProviderSettingsView };
export type { ProviderSettingsViewProps };
