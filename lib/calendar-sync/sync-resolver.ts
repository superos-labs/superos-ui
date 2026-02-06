/**
 * =============================================================================
 * File: sync-resolution.ts
 * =============================================================================
 *
 * Core logic for resolving whether calendar blocks should be exported to
 * external calendars and how they should appear once synced.
 *
 * Encapsulates the full precedence hierarchy across:
 * - Global integration settings
 * - Provider state
 * - Sync scope (scheduled vs blueprint)
 * - Block type participation
 * - Goal-level filters
 * - Block- and goal-level appearance overrides
 *
 * Also exposes helpers for computing cross-provider sync state for UI display.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Determine if a week is considered "planned".
 * - Check whether a block falls within the active sync scope.
 * - Determine participation of block types and goals in sync.
 * - Resolve final appearance for a block (block > goal > global).
 * - Resolve per-provider sync decision for a single block.
 * - Aggregate sync destinations across providers for UI.
 * - Define default sync settings for goals and blocks.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Performing actual export to external calendars.
 * - Persisting integration or sync settings.
 * - Rendering sync UI.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Resolution is deterministic and order-independent.
 * - External blocks never participate in export.
 * - Adapters are pure and synchronous.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - SyncResolution
 * - isWeekPlanned
 * - isBlockInScope
 * - blockTypeParticipates
 * - goalParticipates
 * - resolveAppearance
 * - resolveSyncState
 * - getBlockSyncState
 * - DEFAULT_GOAL_SYNC_SETTINGS
 * - DEFAULT_BLOCK_SYNC_SETTINGS
 */

import type {
  CalendarIntegrationState,
  ExportBlockVisibility,
  SyncScope,
  AppearanceOverride,
} from "./types";
import { CALENDAR_PROVIDERS } from "./provider-config";
import type {
  CalendarEvent,
  ScheduleGoal,
  GoalSyncSettings,
  BlockSyncSettings,
  BlockSyncState,
} from "@/lib/unified-schedule/types";

/**
 * Result of sync resolution.
 */
export interface SyncResolution {
  /** Whether this block should be synced */
  shouldSync: boolean;
  /** How this block appears in the external calendar */
  appearance: ExportBlockVisibility;
}

/**
 * Check if a week has been planned (has scheduled blocks).
 * Used to determine if blueprint should be synced for that week.
 *
 * @param weekDates - Array of Date objects for the week
 * @param events - All calendar events
 * @returns true if the week has any non-blueprint scheduled blocks
 */
export function isWeekPlanned(
  weekDates: Date[],
  events: CalendarEvent[]
): boolean {
  const weekDateStrings = new Set(
    weekDates.map((d) => d.toISOString().split("T")[0])
  );

  // A week is "planned" if there are any scheduled blocks (not from blueprint)
  // For now, we consider any event in the week as "planned"
  // In a real implementation, you might track which events came from blueprint
  return events.some(
    (event) =>
      weekDateStrings.has(event.date) &&
      !event.isExternal &&
      event.blockType !== "external"
  );
}

/**
 * Check if a block falls within the given sync scope.
 *
 * @param block - The calendar event to check
 * @param scope - The sync scope setting
 * @param weekDates - Current week dates for context
 * @param isFromBlueprint - Whether this block originated from blueprint
 * @param isWeekAlreadyPlanned - Whether the week has been planned
 */
export function isBlockInScope(
  _block: CalendarEvent,
  scope: SyncScope,
  isFromBlueprint: boolean = false,
  isWeekAlreadyPlanned: boolean = false
): boolean {
  switch (scope) {
    case "scheduled":
      // Only scheduled blocks, not blueprint
      return !isFromBlueprint;

    case "blueprint":
      // Only blueprint blocks, and only for unplanned weeks
      return isFromBlueprint && !isWeekAlreadyPlanned;

    case "scheduled_and_blueprint":
      // Scheduled blocks always sync
      if (!isFromBlueprint) return true;
      // Blueprint blocks only sync if week hasn't been planned
      return !isWeekAlreadyPlanned;

    default:
      return false;
  }
}

/**
 * Check if a block's type participates in sync based on participation settings.
 */
export function blockTypeParticipates(
  block: CalendarEvent,
  participation: CalendarIntegrationState["exportParticipation"]
): boolean {
  switch (block.blockType) {
    case "essential":
      return participation.essentials;

    case "goal":
      return participation.goals;

    case "task":
      return participation.standaloneTaskBlocks;

    case "external":
      // External blocks are never synced back out
      return false;

    default:
      // Unknown block type - default to goals participation
      return participation.goals;
  }
}

/**
 * Check if a goal participates in sync based on filter settings.
 */
export function goalParticipates(
  goal: ScheduleGoal | undefined,
  integrationState: CalendarIntegrationState
): boolean {
  if (!goal) return true; // No goal context, allow sync

  // Check goal-level sync enabled setting
  if (goal.syncSettings?.syncEnabled === false) {
    return false;
  }

  // Check global goal filter
  if (integrationState.exportGoalFilter === "all") {
    return true;
  }

  // Filter is "selected" - check if goal is in the selected set
  return integrationState.exportSelectedGoalIds.has(goal.id);
}

/**
 * Resolve the final appearance for a block based on the override hierarchy.
 *
 * Precedence: Block override > Goal override > Global default
 */
export function resolveAppearance(
  blockOverride: AppearanceOverride | undefined,
  goalOverride: AppearanceOverride | undefined,
  globalDefault: ExportBlockVisibility
): ExportBlockVisibility {
  // Block-level override takes precedence
  if (blockOverride && blockOverride !== "use_default") {
    return blockOverride as ExportBlockVisibility;
  }

  // Goal-level override
  if (goalOverride && goalOverride !== "use_default") {
    return goalOverride as ExportBlockVisibility;
  }

  // Fall back to global default
  return globalDefault;
}

/**
 * Main sync resolution function.
 *
 * Determines if a block should be synced to external calendars
 * and how it should appear based on the full precedence hierarchy.
 *
 * @param block - The calendar event to resolve
 * @param goal - The associated goal (if any)
 * @param integrationState - The provider's integration state
 * @param options - Additional context for resolution
 * @returns SyncResolution or null if export is disabled
 */
export function resolveSyncState(
  block: CalendarEvent,
  goal: ScheduleGoal | undefined,
  integrationState: CalendarIntegrationState,
  options: {
    isFromBlueprint?: boolean;
    isWeekPlanned?: boolean;
  } = {}
): SyncResolution | null {
  const { isFromBlueprint = false, isWeekPlanned = false } = options;

  // 1. Check if export is globally enabled
  if (!integrationState.exportEnabled) {
    return null;
  }

  // 2. Check if a target calendar is selected
  const hasExportCalendar = integrationState.calendars.some(
    (c) => c.exportBlueprintEnabled
  );
  if (!hasExportCalendar) {
    return null;
  }

  // 3. Check sync scope
  if (
    !isBlockInScope(
      block,
      integrationState.exportScope,
      isFromBlueprint,
      isWeekPlanned
    )
  ) {
    return {
      shouldSync: false,
      appearance: integrationState.exportDefaultAppearance,
    };
  }

  // 4. Check block type participation
  if (!blockTypeParticipates(block, integrationState.exportParticipation)) {
    return {
      shouldSync: false,
      appearance: integrationState.exportDefaultAppearance,
    };
  }

  // 5. Check goal filter (if applicable)
  if (block.blockType === "goal" || block.blockType === "task") {
    if (!goalParticipates(goal, integrationState)) {
      return {
        shouldSync: false,
        appearance: integrationState.exportDefaultAppearance,
      };
    }
  }

  // 6. Resolve appearance (block > goal > global)
  const appearance = resolveAppearance(
    block.syncSettings?.appearanceOverride,
    goal?.syncSettings?.appearanceOverride,
    integrationState.exportDefaultAppearance
  );

  return { shouldSync: true, appearance };
}

/**
 * Get the computed sync state for a block across all providers (for UI display).
 *
 * This checks all connected providers and returns sync destinations for each
 * provider where the block would be synced.
 */
export function getBlockSyncState(
  block: CalendarEvent,
  goal: ScheduleGoal | undefined,
  integrationStates:
    | Map<string, CalendarIntegrationState>
    | CalendarIntegrationState
    | undefined,
  options: {
    isFromBlueprint?: boolean;
    isWeekPlanned?: boolean;
  } = {}
): BlockSyncState {
  // External blocks don't sync
  if (block.isExternal || block.blockType === "external") {
    return { isSynced: false, destinations: [] };
  }

  // Normalize to array of integration states
  const states: CalendarIntegrationState[] = [];
  if (integrationStates instanceof Map) {
    integrationStates.forEach((state) => {
      if (state.status === "connected" && state.exportEnabled) {
        states.push(state);
      }
    });
  } else if (integrationStates && integrationStates.exportEnabled) {
    states.push(integrationStates);
  }

  if (states.length === 0) {
    return { isSynced: false, destinations: [] };
  }

  // Check if the goal participates in sync (check first provider - all should have same goal filter)
  // For goal/task blocks, we need to check if the goal participates in ANY provider
  let doesGoalParticipate = true;
  if (block.blockType === "goal" || block.blockType === "task") {
    // Goal participates if it's included in at least one provider's export
    doesGoalParticipate = states.some((state) => goalParticipates(goal, state));
  }

  // Collect destinations from all providers
  const destinations: BlockSyncState["destinations"] = [];

  for (const state of states) {
    // Skip if goal doesn't participate in this provider
    if (
      (block.blockType === "goal" || block.blockType === "task") &&
      !goalParticipates(goal, state)
    ) {
      continue;
    }

    const resolution = resolveSyncState(block, goal, state, options);

    if (resolution && resolution.shouldSync) {
      const providerConfig = CALENDAR_PROVIDERS[state.provider];
      const targetCalendar = state.calendars.find(
        (c) => c.exportBlueprintEnabled
      );

      if (targetCalendar) {
        // Map ExportBlockVisibility to SyncDestination.syncedAs
        const syncedAs =
          resolution.appearance === "blocked_superos"
            ? "blocked_superos"
            : resolution.appearance === "busy"
            ? "busy"
            : resolution.appearance === "goal_title"
            ? "goal_title"
            : resolution.appearance === "custom"
            ? "custom"
            : "block_title";

        // Compute the actual display text based on appearance mode
        let displayText: string;
        switch (resolution.appearance) {
          case "blocked_superos":
            displayText = "Blocked with SuperOS";
            break;
          case "busy":
            displayText = "Busy";
            break;
          case "goal_title":
            displayText = goal?.label ?? block.title ?? "Goal";
            break;
          case "block_title":
            displayText = block.title ?? goal?.label ?? "Block";
            break;
          case "custom":
            // Custom label precedence: block > goal > global
            displayText =
              block.syncSettings?.customLabel ||
              goal?.syncSettings?.customLabel ||
              state.exportCustomLabel ||
              "Custom";
            break;
          default:
            displayText = "Blocked with SuperOS";
        }

        destinations.push({
          provider: state.provider,
          providerName: providerConfig?.name ?? state.provider,
          calendarName: targetCalendar.name,
          calendarColor: targetCalendar.color,
          syncedAs,
          displayText,
        });
      }
    }
  }

  return {
    isSynced: destinations.length > 0,
    goalParticipates: doesGoalParticipate,
    destinations,
  };
}

/**
 * Default sync settings for a goal.
 */
export const DEFAULT_GOAL_SYNC_SETTINGS: GoalSyncSettings = {
  syncEnabled: true,
  appearanceOverride: "use_default",
};

/**
 * Default sync settings for a block.
 */
export const DEFAULT_BLOCK_SYNC_SETTINGS: BlockSyncSettings = {
  appearanceOverride: "use_default",
};
