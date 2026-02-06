"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import { motion } from "framer-motion";
import { getIconColorClass } from "@/lib/colors";
import type { EssentialSlot } from "@/lib/essentials";
import type { NewEssentialData } from "./essential-types";
import type { SuggestedEssential } from "./suggested-essentials";
import { DAY_LABELS, DAY_FULL_LABELS } from "@/lib/time-utils";
import { TimeInput } from "@/components/ui/time-input";

// =============================================================================
// Types
// =============================================================================

interface TimeRange {
  id: string;
  startMinutes: number;
  durationMinutes: number;
}

interface SuggestionEditorProps {
  suggestion: SuggestedEssential;
  onSave: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  onCancel: () => void;
}

// =============================================================================
// Suggestion Editor
// =============================================================================

function SuggestionEditor({
  suggestion,
  onSave,
  onCancel,
}: SuggestionEditorProps) {
  const [selectedDays, setSelectedDays] = React.useState<number[]>(
    suggestion.defaultDays
  );
  const [timeRanges, setTimeRanges] = React.useState<TimeRange[]>([
    {
      id: `range-${Date.now()}`,
      startMinutes: suggestion.defaultStartMinutes,
      durationMinutes: suggestion.defaultDurationMinutes,
    },
  ]);

  const IconComponent = suggestion.icon;

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort((a, b) => a - b));
    }
  };

  const updateTimeRange = (
    id: string,
    updates: { startMinutes?: number; durationMinutes?: number }
  ) => {
    setTimeRanges((prev) =>
      prev.map((range) => (range.id === id ? { ...range, ...updates } : range))
    );
  };

  const addTimeRange = () => {
    // Find the latest end time from existing ranges
    const latestEndMinutes = timeRanges.reduce((max, range) => {
      const endMinutes = range.startMinutes + range.durationMinutes;
      return Math.max(max, endMinutes);
    }, 0);

    // Default: 2 hours after the latest end time
    const defaultStart = latestEndMinutes + 120;

    setTimeRanges((prev) => [
      ...prev,
      {
        id: `range-${Date.now()}`,
        startMinutes: defaultStart,
        durationMinutes: 60,
      },
    ]);
  };

  const deleteTimeRange = (id: string) => {
    setTimeRanges((prev) => prev.filter((range) => range.id !== id));
  };

  const handleSave = () => {
    if (selectedDays.length === 0) return;

    const slots: EssentialSlot[] = timeRanges.map((range) => ({
      id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      days: selectedDays,
      startMinutes: range.startMinutes,
      durationMinutes: range.durationMinutes,
    }));

    onSave(
      {
        label: suggestion.label,
        icon: suggestion.icon,
        color: suggestion.color,
      },
      slots
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3">
        {/* Header with icon, label, and cancel button */}
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
            <IconComponent
              className={cn("size-4", getIconColorClass(suggestion.color))}
            />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">
            {suggestion.label}
          </span>
          <button
            onClick={onCancel}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Day selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Days
          </span>
          <div className="flex gap-1">
            {DAY_LABELS.map((dayLabel, index) => {
              const isSelected = selectedDays.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleDay(index)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-foreground/20 text-foreground"
                      : "bg-background text-muted-foreground/50 hover:bg-background/80 hover:text-muted-foreground"
                  )}
                  title={DAY_FULL_LABELS[index]}
                >
                  {dayLabel}
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
            {timeRanges.map((range) => {
              const canDelete = timeRanges.length > 1;
              return (
                <div key={range.id} className="flex items-center gap-2">
                  <TimeInput
                    value={range.startMinutes}
                    onChange={(minutes) =>
                      updateTimeRange(range.id, { startMinutes: minutes })
                    }
                    className="bg-background"
                  />
                  <span className="text-muted-foreground/70">–</span>
                  <TimeInput
                    value={range.startMinutes + range.durationMinutes}
                    onChange={(newEnd) => {
                      const newDuration = newEnd - range.startMinutes;
                      if (newDuration > 0) {
                        updateTimeRange(range.id, {
                          durationMinutes: newDuration,
                        });
                      }
                    }}
                    className="bg-background"
                  />
                  {canDelete && (
                    <button
                      onClick={() => deleteTimeRange(range.id)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Remove time range"
                    >
                      <RiCloseLine className="size-4" />
                    </button>
                  )}
                </div>
              );
            })}
            {timeRanges.length < 3 && (
              <button
                onClick={addTimeRange}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <RiAddLine className="size-3.5" />
                Add time range
              </button>
            )}
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleSave}
          disabled={selectedDays.length === 0}
          className={cn(
            "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
            selectedDays.length > 0
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Placeholder Suggestion Row
// =============================================================================

export interface PlaceholderRowProps {
  suggestion: SuggestedEssential;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  onCancel: () => void;
}

export function PlaceholderRow({
  suggestion,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}: PlaceholderRowProps) {
  const IconComponent = suggestion.icon;
  const [isHovered, setIsHovered] = React.useState(false);

  if (isEditing) {
    return (
      <SuggestionEditor
        suggestion={suggestion}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <button
      onClick={onStartEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/60"
      )}
    >
      {/* Icon */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40 transition-colors group-hover:bg-muted/60">
        <IconComponent
          className={cn(
            "size-4 transition-colors",
            isHovered
              ? getIconColorClass(suggestion.color)
              : "text-muted-foreground/40"
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 text-sm transition-colors",
          isHovered ? "text-muted-foreground" : "text-muted-foreground/50"
        )}
      >
        {suggestion.label}
      </span>

      {/* Plus icon - animated on hover */}
      <motion.div
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0.3,
          scale: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.15 }}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground"
      >
        <RiAddLine className="size-4" />
      </motion.div>
    </button>
  );
}
