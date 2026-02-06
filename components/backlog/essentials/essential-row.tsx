/**
 * =============================================================================
 * File: essential-row.tsx
 * =============================================================================
 *
 * Row-level UI components for configuring backlog "Essentials" schedules.
 *
 * Provides two closely related interactive rows:
 * - EssentialRow: generic essential activity with selectable days and one or
 *   more time ranges.
 * - SleepRow: special-case essential for sleep visualization using wake-up and
 *   wind-down times.
 *
 * These components are purely presentational + interaction-oriented:
 * - They own transient UI state for editing.
 * - They do NOT persist data.
 * - They delegate all saving via callbacks.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render collapsed and expanded row states.
 * - Display current schedule summary when collapsed.
 * - Provide inline editors for days and time ranges.
 * - Auto-save EssentialRow changes when collapsing.
 * - Allow optional deletion of an essential.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or storing templates.
 * - Deciding which essentials exist.
 * - Validating business rules beyond basic UI constraints.
 *
 * -----------------------------------------------------------------------------
 * KEY DEPENDENCIES
 * -----------------------------------------------------------------------------
 * - useActivitySchedule (lib/essentials): manages editable schedule state.
 * - TimeInput: minute-based time picker.
 * - time-utils: formatting and day labels.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Desktop-first, compact rows optimized for dense backlog lists.
 * - Expansion uses CSS grid row animation instead of conditional mounting.
 * - SleepRow intentionally diverges from generic schedule editing to support
 *   visualization-specific semantics.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - EssentialRow
 * - SleepRow
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiDeleteBinLine,
  RiMoonLine,
  RiSunLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiAddLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import {
  DAY_LABELS,
  DAY_FULL_LABELS,
  formatTimeShort,
  formatScheduleSummary,
} from "@/lib/time-utils";
import { TimeInput } from "@/components/ui/time-input";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import { useActivitySchedule } from "@/lib/essentials";
import type { EssentialItem } from "./essential-types";

// =============================================================================
// Essential Row Types
// =============================================================================

export interface EssentialRowProps {
  essential: EssentialItem;
  template?: EssentialTemplate;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSaveSchedule: (slots: EssentialSlot[]) => void;
  onDelete?: () => void;
  className?: string;
}

// =============================================================================
// Essential Row Component
// =============================================================================

export function EssentialRow({
  essential,
  template,
  isExpanded,
  onToggleExpand,
  onSaveSchedule,
  onDelete,
  className,
}: EssentialRowProps) {
  const IconComponent = essential.icon;
  const schedule = template
    ? formatScheduleSummary(template.slots)
    : "Not scheduled";

  const scheduleState = useActivitySchedule({
    initialSlots: template?.slots ?? [],
  });

  // Reset schedule state when template changes
  React.useEffect(() => {
    if (template?.slots) {
      scheduleState.resetFromSlots(template.slots);
    }
  }, [template?.slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    const slots = scheduleState.toSlots();
    onSaveSchedule(slots);
  };

  // Auto-save when collapsing
  const handleToggle = () => {
    if (isExpanded) {
      // Save before collapsing
      handleSave();
    }
    onToggleExpand();
  };

  const toggleDay = (dayIndex: number) => {
    if (scheduleState.selectedDays.includes(dayIndex)) {
      scheduleState.setSelectedDays(
        scheduleState.selectedDays.filter((d) => d !== dayIndex),
      );
    } else {
      scheduleState.setSelectedDays(
        [...scheduleState.selectedDays, dayIndex].sort((a, b) => a - b),
      );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl transition-colors",
        isExpanded ? "bg-muted/30" : "hover:bg-muted/60",
        className,
      )}
    >
      {/* Main row */}
      <div className="group flex w-full items-center gap-3 px-3 py-2.5">
        {/* Clickable area for expand/collapse */}
        <button
          onClick={handleToggle}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {/* Icon */}
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              isExpanded ? "bg-background" : "bg-muted/60",
            )}
          >
            <IconComponent
              className={cn("size-4", getIconColorClass(essential.color))}
            />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {essential.label}
            </span>
            {!isExpanded && (
              <span className="truncate text-xs text-muted-foreground">
                {schedule}
              </span>
            )}
          </div>
        </button>

        {/* Close button when expanded */}
        {isExpanded && (
          <button
            onClick={handleToggle}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Collapse"
          >
            <RiCloseLine className="size-4" />
          </button>
        )}

        {/* Accordion indicator when collapsed */}
        {!isExpanded && (
          <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
            <RiArrowDownSLine className="size-4" />
          </div>
        )}
      </div>

      {/* Expanded schedule editor */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-3 pb-3">
            {/* Day selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                Days
              </span>
              <div className="flex gap-1">
                {DAY_LABELS.map((label, index) => {
                  const isSelected = scheduleState.selectedDays.includes(index);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-foreground/20 text-foreground"
                          : "bg-background text-muted-foreground/50 hover:bg-background/80 hover:text-muted-foreground",
                      )}
                      title={DAY_FULL_LABELS[index]}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time ranges - supports multiple */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                Time
              </span>
              <div className="flex flex-col gap-2">
                {scheduleState.timeRanges.map((range) => {
                  const canDelete = scheduleState.timeRanges.length > 1;
                  return (
                    <div key={range.id} className="flex items-center gap-2">
                      <TimeInput
                        value={range.startMinutes}
                        onChange={(minutes) =>
                          scheduleState.updateTimeRange(range.id, {
                            startMinutes: minutes,
                          })
                        }
                        className="bg-background"
                      />
                      <span className="text-muted-foreground/70">–</span>
                      <TimeInput
                        value={range.startMinutes + range.durationMinutes}
                        onChange={(newEnd) => {
                          const newDuration = newEnd - range.startMinutes;
                          if (newDuration > 0) {
                            scheduleState.updateTimeRange(range.id, {
                              durationMinutes: newDuration,
                            });
                          }
                        }}
                        className="bg-background"
                      />
                      {canDelete && (
                        <button
                          onClick={() =>
                            scheduleState.deleteTimeRange(range.id)
                          }
                          className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Remove time range"
                        >
                          <RiCloseLine className="size-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {scheduleState.timeRanges.length < 3 && (
                  <button
                    onClick={() => scheduleState.addTimeRange()}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RiAddLine className="size-3.5" />
                    Add time range
                  </button>
                )}
              </div>
            </div>

            {/* Delete button when expanded */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 text-xs text-destructive/70 transition-colors hover:text-destructive"
              >
                <RiDeleteBinLine className="size-3.5" />
                Remove essential
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Sleep Row Component (Special Case)
// =============================================================================

export interface SleepRowProps {
  essential: EssentialItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  wakeUpMinutes: number;
  windDownMinutes: number;
  onTimesChange: (wakeUp: number, windDown: number) => void;
  /** Whether sleep visualization is configured/enabled */
  isConfigured?: boolean;
  className?: string;
}

export function SleepRow({
  essential,
  isExpanded,
  onToggleExpand,
  wakeUpMinutes,
  windDownMinutes,
  onTimesChange,
  isConfigured = false,
  className,
}: SleepRowProps) {
  const IconComponent = essential.icon;

  // Local state for editing times (only saved on confirm)
  const [localWakeUp, setLocalWakeUp] = React.useState(wakeUpMinutes);
  const [localWindDown, setLocalWindDown] = React.useState(windDownMinutes);

  // Sync local state when props change (e.g., after save)
  React.useEffect(() => {
    setLocalWakeUp(wakeUpMinutes);
    setLocalWindDown(windDownMinutes);
  }, [wakeUpMinutes, windDownMinutes]);

  // Check if local values differ from saved values, or if not yet configured
  const hasChanges =
    !isConfigured ||
    localWakeUp !== wakeUpMinutes ||
    localWindDown !== windDownMinutes;

  // Handle confirm button click
  const handleConfirm = () => {
    onTimesChange(localWakeUp, localWindDown);
    // Collapse the row after confirming
    onToggleExpand();
  };

  // Format sleep schedule summary
  const scheduleSummary = isConfigured
    ? `${formatTimeShort(wakeUpMinutes)} – ${formatTimeShort(windDownMinutes)}`
    : "Visualize your sleep time";

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl transition-colors",
        isExpanded ? "bg-muted/30" : "hover:bg-muted/60",
        className,
      )}
    >
      {/* Main row */}
      <div className="group flex w-full items-center gap-3 px-3 py-2.5">
        {/* Clickable area for expand/collapse */}
        <button
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {/* Icon */}
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              isExpanded ? "bg-background" : "bg-muted/60",
            )}
          >
            <IconComponent
              className={cn("size-4", getIconColorClass(essential.color))}
            />
          </div>

          {/* Content - always show two lines */}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {essential.label}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {scheduleSummary}
            </span>
          </div>
        </button>

        {/* Close button when expanded */}
        {isExpanded && (
          <button
            onClick={onToggleExpand}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Collapse"
          >
            <RiCloseLine className="size-4" />
          </button>
        )}

        {/* Accordion indicator when collapsed */}
        {!isExpanded && (
          <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
            <RiArrowDownSLine className="size-4" />
          </div>
        )}
      </div>

      {/* Expanded content */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-3 pb-3">
            {/* Wind down time */}
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
                <RiMoonLine className="size-4 text-indigo-400" />
              </div>
              <span className="flex-1 text-sm text-foreground">Wind down</span>
              <TimeInput value={localWindDown} onChange={setLocalWindDown} />
            </div>

            {/* Wake up time */}
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
                <RiSunLine className="size-4 text-amber-500" />
              </div>
              <span className="flex-1 text-sm text-foreground">Wake up</span>
              <TimeInput value={localWakeUp} onChange={setLocalWakeUp} />
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!hasChanges}
              className={cn(
                "w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                hasChanges
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
