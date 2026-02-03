"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiUploadLine, RiCheckLine } from "@remixicon/react";
import type {
  ProviderCalendar,
  CalendarProvider,
  ExportBlockVisibility,
  SyncScope,
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
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0",
          "transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
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
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded transition-all duration-150",
          checked
            ? "bg-foreground text-background"
            : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20"
        )}
      >
        {checked && <RiCheckLine className="size-3" />}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          checked ? "text-foreground" : "text-muted-foreground"
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
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-150",
          checked
            ? "bg-foreground"
            : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20"
        )}
      >
        {checked && <span className="size-2 rounded-full bg-background" />}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          checked ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
}

// =============================================================================
// Visibility Options
// =============================================================================

/** Display labels for visibility options */
const VISIBILITY_OPTIONS: {
  value: ExportBlockVisibility;
  label: string;
}[] = [
  { value: "block_title", label: "Block title" },
  { value: "goal_title", label: "Goal name" },
  { value: "busy", label: "Busy" },
];

/** Display labels for sync scope options */
const SCOPE_OPTIONS: {
  value: SyncScope;
  label: string;
}[] = [
  { value: "scheduled", label: "Scheduled blocks" },
  { value: "blueprint", label: "Blueprint blocks" },
  { value: "scheduled_and_blueprint", label: "Scheduled + Blueprint" },
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
  /** Current sync scope */
  exportScope: SyncScope;
  /** Current participation settings */
  exportParticipation: SyncParticipation;
  /** Current goal filter mode */
  exportGoalFilter: GoalFilterMode;
  /** Selected goal IDs when filter is "selected" */
  exportSelectedGoalIds: Set<string>;
  /** Default appearance for exported blocks */
  exportDefaultAppearance: ExportBlockVisibility;
  /** All available goals for the goal filter */
  availableGoals?: ScheduleGoal[];

  // Callbacks
  onToggleExportEnabled: () => void;
  onScopeChange: (scope: SyncScope) => void;
  onParticipationChange: (participation: Partial<SyncParticipation>) => void;
  onGoalFilterChange: (mode: GoalFilterMode, selectedIds?: Set<string>) => void;
  onDefaultAppearanceChange: (appearance: ExportBlockVisibility) => void;
  onToggleCalendarExport: (calendarId: string) => void;
}

/**
 * Comprehensive section for configuring external calendar sync.
 *
 * Includes:
 * 1. Master toggle for sync
 * 2. Sync scope (scheduled, blueprint, or both)
 * 3. What participates (essentials, goals, tasks)
 * 4. Goal filter (all or selected)
 * 5. Default appearance selector
 * 6. Target calendar selector
 */
function ExportSection({
  calendars,
  provider,
  exportEnabled,
  exportScope,
  exportParticipation,
  exportGoalFilter,
  exportSelectedGoalIds,
  exportDefaultAppearance,
  availableGoals = [],
  onToggleExportEnabled,
  onScopeChange,
  onParticipationChange,
  onGoalFilterChange,
  onDefaultAppearanceChange,
  onToggleCalendarExport,
}: ExportSectionProps) {
  if (calendars.length === 0) {
    return null;
  }

  // Find the currently enabled export calendar
  const enabledCalendar = calendars.find((c) => c.exportBlueprintEnabled);

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
      {/* Section 1: Master Toggle */}
      <div className="flex items-start justify-between gap-3 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <RiUploadLine className="size-3.5" />
            <span>Sync to External Calendar</span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Share your planning with external calendars.
          </p>
        </div>
        <ToggleSwitch
          checked={exportEnabled}
          onChange={onToggleExportEnabled}
          className="mt-0.5"
        />
      </div>

      {/* Rest of settings - only shown when enabled */}
      {exportEnabled && (
        <div className="flex flex-col gap-5 px-2">
          {/* Section 2: Sync Scope */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Which planning layers should appear?
            </p>
            <div className="flex flex-col gap-0.5">
              {SCOPE_OPTIONS.map((option) => (
                <RadioButton
                  key={option.value}
                  checked={exportScope === option.value}
                  onChange={() => onScopeChange(option.value)}
                  label={option.label}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              Scheduled blocks reflect planned time. Blueprint reflects your
              typical week in upcoming weeks to block future time.
            </p>
          </div>

          {/* Section 3: What Participates */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              What gets shared?
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

            {/* Goal Selection - inline list with checkboxes */}
            {exportParticipation.goals && availableGoals.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground mb-1">
                  Which goals to sync:
                </p>
                {availableGoals.map((goal) => {
                  const isSelected =
                    exportGoalFilter === "all" ||
                    exportSelectedGoalIds.has(goal.id);
                  const GoalIcon = goal.icon;

                  const handleToggle = () => {
                    if (exportGoalFilter === "all") {
                      // Switch to selected mode, with all goals except this one
                      const newSelected = new Set(
                        availableGoals
                          .filter((g) => g.id !== goal.id)
                          .map((g) => g.id)
                      );
                      onGoalFilterChange("selected", newSelected);
                    } else {
                      // Toggle this goal in the selected set
                      const newSelected = new Set(exportSelectedGoalIds);
                      if (newSelected.has(goal.id)) {
                        newSelected.delete(goal.id);
                      } else {
                        newSelected.add(goal.id);
                      }
                      // If all goals are now selected, switch back to "all" mode
                      if (newSelected.size === availableGoals.length) {
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
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-[18px] shrink-0 items-center justify-center rounded transition-all duration-150",
                          isSelected
                            ? "bg-foreground text-background"
                            : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20"
                        )}
                      >
                        {isSelected && <RiCheckLine className="size-3" />}
                      </div>
                      <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
                        <GoalIcon
                          className={cn("size-3", `text-${goal.color}-500`)}
                        />
                      </div>
                      <span
                        className={cn(
                          "truncate text-sm transition-colors",
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {goal.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Default Appearance */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Default block appearance
            </p>
            <div
              className="inline-flex rounded-lg bg-muted p-0.5"
              role="radiogroup"
              aria-label="Block appearance"
            >
              {VISIBILITY_OPTIONS.map((option) => {
                const isSelected = exportDefaultAppearance === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onDefaultAppearanceChange(option.value)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      isSelected
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              You can override this per goal or per block.
            </p>
          </div>

          {/* Calendar Selector */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Target calendar
            </p>
            <div className="flex flex-col gap-0.5">
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
                      "group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left",
                      "transition-colors duration-150",
                      "hover:bg-muted/60",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    )}
                  >
                    {/* Radio button */}
                    <div
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-150",
                        isSelected
                          ? "bg-foreground"
                          : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20"
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
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {calendar.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ExportSection };
export type { ExportSectionProps };
