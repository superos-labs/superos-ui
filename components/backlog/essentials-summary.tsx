"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiSettings4Line } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { EssentialTemplate, EssentialSlot } from "@/lib/essentials";
import type { BacklogItem } from "./backlog-types";

// =============================================================================
// Schedule Formatting Utilities
// =============================================================================

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Format a set of days into a human-readable string.
 * Examples: "Every day", "Weekdays", "Mon, Wed, Fri"
 */
function formatDays(days: number[]): string {
  if (days.length === 0) return "";

  const sortedDays = [...days].sort((a, b) => a - b);

  // Check for common patterns
  if (sortedDays.length === 7) {
    return "Every day";
  }

  if (sortedDays.length === 5 && sortedDays.every((d, i) => d === i)) {
    return "Weekdays";
  }

  if (sortedDays.length === 2 && sortedDays[0] === 5 && sortedDays[1] === 6) {
    return "Weekends";
  }

  // Otherwise, list the days
  return sortedDays.map((d) => DAY_LABELS[d]).join(", ");
}

/**
 * Format minutes to 12-hour time string without minutes if on the hour.
 * Examples: "12 PM", "7:30 AM"
 */
function formatTimeShort(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

  if (mins === 0) {
    return `${hours12} ${period}`;
  }
  return `${hours12}:${mins.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format a slot's time range.
 * Example: "12 – 1 PM"
 */
function formatTimeRange(
  startMinutes: number,
  durationMinutes: number,
): string {
  const endMinutes = startMinutes + durationMinutes;
  const startStr = formatTimeShort(startMinutes);
  const endStr = formatTimeShort(endMinutes);

  // If both are in same period, only show period once
  const startPeriod = startMinutes >= 720 ? "PM" : "AM";
  const endPeriod = endMinutes >= 720 ? "PM" : "AM";

  if (startPeriod === endPeriod) {
    const startWithoutPeriod = startStr.replace(` ${startPeriod}`, "");
    return `${startWithoutPeriod} – ${endStr}`;
  }

  return `${startStr} – ${endStr}`;
}

/**
 * Format all slots for an essential into a summary string.
 * Groups by day pattern, then lists time ranges.
 * Example: "Every day, 12 – 1 PM, 7 – 8 PM"
 */
function formatScheduleSummary(slots: EssentialSlot[]): string {
  if (slots.length === 0) return "Not scheduled";

  // Group slots by days pattern
  const byDaysPattern = new Map<string, EssentialSlot[]>();
  slots.forEach((slot) => {
    const key = slot.days.sort((a, b) => a - b).join(",");
    if (!byDaysPattern.has(key)) {
      byDaysPattern.set(key, []);
    }
    byDaysPattern.get(key)!.push(slot);
  });

  const summaries: string[] = [];

  byDaysPattern.forEach((groupSlots, daysKey) => {
    const days = daysKey.split(",").map(Number);
    const daysLabel = formatDays(days);
    const timeRanges = groupSlots
      .map((s) => formatTimeRange(s.startMinutes, s.durationMinutes))
      .join(", ");
    summaries.push(`${daysLabel}, ${timeRanges}`);
  });

  return summaries.join(" · ");
}

// =============================================================================
// Types
// =============================================================================

export interface EssentialsSummaryProps {
  /** Enabled essentials to display */
  essentials: BacklogItem[];
  /** Templates with schedule data */
  templates: EssentialTemplate[];
  /** Called when "Add to week" is clicked */
  onAddToWeek: () => void;
  /** Called when edit button is clicked */
  onEdit: () => void;
  className?: string;
}

// =============================================================================
// Essential Summary Card
// =============================================================================

interface EssentialCardProps {
  essential: BacklogItem;
  template?: EssentialTemplate;
}

function EssentialCard({ essential, template }: EssentialCardProps) {
  const IconComponent = essential.icon;
  const schedule = template
    ? formatScheduleSummary(template.slots)
    : "Not scheduled";

  return (
    <div className="flex items-start gap-3 rounded-lg px-3 py-2">
      {/* Icon */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <IconComponent
          className={cn("size-4", getIconColorClass(essential.color))}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {essential.label}
        </span>
        <span className="text-xs text-muted-foreground">{schedule}</span>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function EssentialsSummary({
  essentials,
  templates,
  onAddToWeek,
  onEdit,
  className,
}: EssentialsSummaryProps) {
  const getTemplate = (essentialId: string) =>
    templates.find((t) => t.essentialId === essentialId);

  if (essentials.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2 py-2", className)}>
      {/* Header with Add to week button */}
      <div className="flex items-center justify-between px-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Essentials
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddToWeek}
            className="flex h-6 items-center gap-1 rounded-md bg-foreground px-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
            title="Add all essentials to the current week"
          >
            <RiAddLine className="size-3" />
            Add to week
          </button>
          <button
            onClick={onEdit}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Edit essentials"
          >
            <RiSettings4Line className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Essential cards */}
      <div className="flex flex-col">
        {essentials.map((essential) => (
          <EssentialCard
            key={essential.id}
            essential={essential}
            template={getTemplate(essential.id)}
          />
        ))}
      </div>
    </div>
  );
}
