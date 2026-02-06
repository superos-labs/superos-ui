/**
 * =============================================================================
 * File: export-section.tsx
 * =============================================================================
 *
 * Configuration section for exporting SuperOS blocks to an external calendar.
 *
 * Provides a structured, progressive set of controls to define:
 * - Whether export is enabled
 * - How exported events are titled
 * - Which calendar receives exported blocks
 * - What categories of time are shared (essentials, goals, tasks)
 * - Optional per-goal inclusion filtering
 *
 * This component is presentational.
 * All state is owned by a parent and passed in via props.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render export enable/disable control.
 * - Render appearance options for exported events.
 * - Render single-select target calendar chooser.
 * - Render participation and goal filtering controls.
 * - Emit user intent through callbacks.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting sync preferences.
 * - Performing sync or API calls.
 * - Validating provider capabilities.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Secondary controls are hidden until export is enabled.
 * - Advanced options are tucked behind a small accordion.
 * - Enforces single target calendar selection at the UI layer.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ExportSection
 * - ExportSectionProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCheckLine, RiArrowRightSLine } from "@remixicon/react";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-sync";
import type {
  ProviderCalendar,
  CalendarProvider,
  ExportBlockVisibility,
  SyncParticipation,
  GoalFilterMode,
} from "@/lib/calendar-sync";
import type { ScheduleGoal } from "@/lib/unified-schedule";

// =============================================================================
// Helper Components
// =============================================================================

/** Toggle switch component */
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  className,
}: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-foreground" : "bg-muted-foreground/30",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0",
          "transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** Checkbox component */
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg py-1.5 text-left",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded transition-all duration-150",
          checked
            ? "bg-foreground text-background"
            : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20",
        )}
      >
        {checked && <RiCheckLine className="size-3" />}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          checked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

/** Radio button component */
interface RadioButtonProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

function RadioButton({ checked, onChange, label, disabled }: RadioButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg py-1.5 text-left",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-150",
          checked
            ? "bg-foreground"
            : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20",
        )}
      >
        {checked && <span className="size-2 rounded-full bg-background" />}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          checked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

// =============================================================================
// Options Configuration
// =============================================================================

/** Display labels for event title appearance options */
const APPEARANCE_OPTIONS: {
  value: ExportBlockVisibility;
  label: string;
}[] = [
  { value: "blocked_superos", label: "Blocked with SuperOS" },
  { value: "busy", label: "Busy" },
  { value: "goal_title", label: "Goal name" },
  { value: "block_title", label: "Block title" },
  { value: "custom", label: "Custom" },
];

// =============================================================================
// Main Export Section Component
// =============================================================================

interface ExportSectionProps {
  /** List of calendars available for export */
  calendars: ProviderCalendar[];
  /** The provider these calendars belong to */
  provider: CalendarProvider;
  /** Whether export is enabled */
  exportEnabled: boolean;
  /** Current participation settings */
  exportParticipation: SyncParticipation;
  /** Current goal filter mode */
  exportGoalFilter: GoalFilterMode;
  /** Selected goal IDs when filter is "selected" */
  exportSelectedGoalIds: Set<string>;
  /** Default appearance for exported blocks */
  exportDefaultAppearance: ExportBlockVisibility;
  /** Custom label for exported events when appearance is "custom" */
  exportCustomLabel: string;
  /** All available goals for the goal filter */
  availableGoals?: ScheduleGoal[];

  // Callbacks
  onToggleExportEnabled: () => void;
  onParticipationChange: (participation: Partial<SyncParticipation>) => void;
  onGoalFilterChange: (mode: GoalFilterMode, selectedIds?: Set<string>) => void;
  onDefaultAppearanceChange: (appearance: ExportBlockVisibility) => void;
  onCustomLabelChange: (label: string) => void;
  onToggleCalendarExport: (calendarId: string) => void;
}

/**
 * Comprehensive section for configuring external calendar sync.
 *
 * Reorganized into three clear stacked questions:
 * 1. Are we syncing? (Master toggle)
 * 2. What time is shared? (Sync scope)
 * 3. How shared time appears? (Appearance)
 * 4. Target calendar selection
 * 5. Customize what's shared (collapsible)
 */
function ExportSection({
  calendars,
  provider,
  exportEnabled,
  exportParticipation,
  exportGoalFilter,
  exportSelectedGoalIds,
  exportDefaultAppearance,
  exportCustomLabel,
  availableGoals = [],
  onToggleExportEnabled,
  onParticipationChange,
  onGoalFilterChange,
  onDefaultAppearanceChange,
  onCustomLabelChange,
  onToggleCalendarExport,
}: ExportSectionProps) {
  const [customizeOpen, setCustomizeOpen] = React.useState(false);

  if (calendars.length === 0) {
    return null;
  }

  // Find the currently enabled export calendar
  const enabledCalendar = calendars.find((c) => c.exportBlueprintEnabled);
  const providerConfig = CALENDAR_PROVIDERS[provider];

  // Handle calendar selection (single select - deselects current, selects new)
  const handleSelectCalendar = (calendarId: string) => {
    if (enabledCalendar?.id === calendarId) {
      return; // Already selected
    }

    // If another calendar was enabled, toggle it off first
    if (enabledCalendar) {
      onToggleCalendarExport(enabledCalendar.id);
    }

    // Toggle on the new calendar
    onToggleCalendarExport(calendarId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Question 1: Are we syncing? */}
      <div className="flex items-center justify-between gap-3 px-2">
        <span className="text-sm text-foreground">
          Show SuperOS blocks on {providerConfig.name}
        </span>
        <ToggleSwitch
          checked={exportEnabled}
          onChange={onToggleExportEnabled}
        />
      </div>

      {/* Rest of settings - only shown when enabled */}
      {exportEnabled && (
        <div className="flex flex-col gap-5 px-2">
          {/* Event title appearance */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Event title
            </p>
            <div className="flex flex-col gap-0.5" role="radiogroup">
              {APPEARANCE_OPTIONS.map((option) => (
                <RadioButton
                  key={option.value}
                  checked={exportDefaultAppearance === option.value}
                  onChange={() => onDefaultAppearanceChange(option.value)}
                  label={option.label}
                />
              ))}
            </div>
            {/* Custom label input - shown when custom is selected */}
            {exportDefaultAppearance === "custom" && (
              <input
                type="text"
                value={exportCustomLabel}
                onChange={(e) => onCustomLabelChange(e.target.value)}
                placeholder="Enter custom label..."
                className={cn(
                  "mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground/60",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                )}
              />
            )}
          </div>

          {/* Target calendar */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Target calendar
            </p>
            <div className="flex flex-col gap-0.5" role="radiogroup">
              {calendars.map((calendar) => {
                const isSelected = calendar.exportBlueprintEnabled;
                return (
                  <button
                    key={calendar.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectCalendar(calendar.id)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left",
                      "transition-colors duration-150",
                      "hover:bg-muted/60",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    {/* Radio button */}
                    <div
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-150",
                        isSelected
                          ? "bg-foreground"
                          : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20",
                      )}
                    >
                      {isSelected && (
                        <span className="size-2 rounded-full bg-background" />
                      )}
                    </div>

                    {/* Calendar color indicator */}
                    <div
                      className="size-3 shrink-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10"
                      style={{ backgroundColor: calendar.color }}
                      aria-hidden="true"
                    />

                    {/* Calendar name */}
                    <span
                      className={cn(
                        "truncate text-sm transition-colors",
                        isSelected
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {calendar.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customize Accordion */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setCustomizeOpen(!customizeOpen)}
              className={cn(
                "group flex w-full items-center gap-1.5 py-1 text-left",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded",
              )}
            >
              <RiArrowRightSLine
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  customizeOpen && "rotate-90",
                )}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Customize what&apos;s shared
              </span>
            </button>

            {/* Customize Panel */}
            {customizeOpen && (
              <div className="mt-3 flex flex-col gap-2 pl-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Include
                </p>
                <div className="flex flex-col gap-0.5">
                  <Checkbox
                    checked={exportParticipation.essentials}
                    onChange={() =>
                      onParticipationChange({
                        essentials: !exportParticipation.essentials,
                      })
                    }
                    label="Essentials"
                  />
                  <Checkbox
                    checked={exportParticipation.goals}
                    onChange={() =>
                      onParticipationChange({
                        goals: !exportParticipation.goals,
                      })
                    }
                    label="Goals"
                  />
                  <Checkbox
                    checked={exportParticipation.standaloneTaskBlocks}
                    onChange={() =>
                      onParticipationChange({
                        standaloneTaskBlocks:
                          !exportParticipation.standaloneTaskBlocks,
                      })
                    }
                    label="Tasks as standalone blocks"
                  />
                </div>

                {/* Goal Selection - shown when Goals is selected */}
                {exportParticipation.goals &&
                  (() => {
                    // Filter out goals that have sync disabled at the goal level
                    const syncableGoals = availableGoals.filter(
                      (g) => g.syncSettings?.syncEnabled !== false,
                    );

                    if (syncableGoals.length === 0) return null;

                    return (
                      <div className="mt-3 flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Select goals
                        </p>
                        <div className="flex flex-col gap-0.5">
                          {syncableGoals.map((goal) => {
                            const isSelected =
                              exportGoalFilter === "all" ||
                              exportSelectedGoalIds.has(goal.id);
                            const GoalIcon = goal.icon;

                            const handleToggle = () => {
                              if (exportGoalFilter === "all") {
                                // Switch to selected mode, with all syncable goals except this one
                                const newSelected = new Set(
                                  syncableGoals
                                    .filter((g) => g.id !== goal.id)
                                    .map((g) => g.id),
                                );
                                onGoalFilterChange("selected", newSelected);
                              } else {
                                // Toggle this goal in the selected set
                                const newSelected = new Set(
                                  exportSelectedGoalIds,
                                );
                                if (newSelected.has(goal.id)) {
                                  newSelected.delete(goal.id);
                                } else {
                                  newSelected.add(goal.id);
                                }
                                // If all syncable goals are now selected, switch back to "all" mode
                                if (newSelected.size === syncableGoals.length) {
                                  onGoalFilterChange("all");
                                } else {
                                  onGoalFilterChange("selected", newSelected);
                                }
                              }
                            };

                            return (
                              <button
                                key={goal.id}
                                type="button"
                                role="checkbox"
                                aria-checked={isSelected}
                                onClick={handleToggle}
                                className={cn(
                                  "group flex items-center gap-2.5 rounded-lg py-1.5 px-2 text-left",
                                  "transition-colors duration-150 hover:bg-muted/60",
                                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex size-[18px] shrink-0 items-center justify-center rounded transition-all duration-150",
                                    isSelected
                                      ? "bg-foreground text-background"
                                      : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20",
                                  )}
                                >
                                  {isSelected && (
                                    <RiCheckLine className="size-3" />
                                  )}
                                </div>
                                <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
                                  <GoalIcon
                                    className={cn(
                                      "size-3",
                                      `text-${goal.color}-500`,
                                    )}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    "truncate text-sm transition-colors",
                                    isSelected
                                      ? "text-foreground"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {goal.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { ExportSection };
export type { ExportSectionProps };
