"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiFlagLine, RiCheckLine, RiCloseLine } from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass, getIconBgClass } from "@/lib/colors";
import { DAY_LABELS, DAY_FULL_LABELS } from "@/lib/time-utils";
import { TimeInput } from "@/components/ui/time-input";
import type { GoalIconOption } from "@/lib/types";
import type { EssentialSlot } from "@/lib/essentials";
import type { NewEssentialData } from "./essential-types";

// =============================================================================
// Inline Essential Creator
// =============================================================================

export interface InlineEssentialCreatorProps {
  essentialIcons: GoalIconOption[];
  onSave: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  onCancel: () => void;
}

export function InlineEssentialCreator({
  essentialIcons,
  onSave,
  onCancel,
}: InlineEssentialCreatorProps) {
  const [label, setLabel] = React.useState("");
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<GoalColor>("amber");
  const [selectedDays, setSelectedDays] = React.useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [startMinutes, setStartMinutes] = React.useState(720); // 12:00 PM
  const [durationMinutes, setDurationMinutes] = React.useState(60); // 1 hour
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedIcon = essentialIcons[selectedIconIndex]?.icon ?? RiFlagLine;

  const handleSave = () => {
    if (!label.trim()) return;

    const slots: EssentialSlot[] = [
      {
        id: `slot-${Date.now()}`,
        days: selectedDays,
        startMinutes,
        durationMinutes,
      },
    ];

    onSave(
      {
        label: label.trim(),
        icon: selectedIcon,
        color: selectedColor,
      },
      slots,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort((a, b) => a - b));
    }
  };

  const handleEndChange = (newEnd: number) => {
    const newDuration = newEnd - startMinutes;
    if (newDuration > 0) {
      setDurationMinutes(newDuration);
    }
  };

  // Subset of colors for the picker
  const pickerColors: GoalColor[] = [
    "slate",
    "red",
    "orange",
    "amber",
    "green",
    "teal",
    "cyan",
    "blue",
    "indigo",
    "violet",
    "purple",
    "pink",
    "rose",
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3">
      {/* Icon picker + Label input + Actions */}
      <div className="flex items-center gap-2">
        {/* Icon/Color Picker Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background transition-colors hover:bg-background/80"
              title="Choose icon and color"
            >
              {React.createElement(selectedIcon, {
                className: cn("size-4", getIconColorClass(selectedColor)),
              })}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-2">
            <DropdownMenuLabel className="px-1 py-1">Icon</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              {essentialIcons.map((iconOption, index) => {
                const IconComp = iconOption.icon;
                const isSelected = selectedIconIndex === index;
                return (
                  <button
                    key={iconOption.label}
                    onClick={() => setSelectedIconIndex(index)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md transition-colors",
                      isSelected
                        ? "bg-foreground/80 text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    title={iconOption.label}
                  >
                    <IconComp className="size-3.5" />
                  </button>
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-1 py-1">Color</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-1 pb-1">
              {pickerColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md transition-all",
                    selectedColor === color &&
                      "ring-2 ring-foreground/70 ring-offset-1 ring-offset-background",
                  )}
                  title={color}
                >
                  <div
                    className={cn("size-4 rounded-full", getIconBgClass(color))}
                  />
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Essential Name Input */}
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Name"
          className="h-9 min-w-0 flex-1 rounded-md bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring/50"
        />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors",
              label.trim()
                ? "text-muted-foreground hover:bg-background hover:text-foreground"
                : "cursor-not-allowed text-muted-foreground/30",
            )}
            title="Save essential"
          >
            <RiCheckLine className="size-4" />
          </button>
          <button
            onClick={onCancel}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>
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
                    : "bg-background text-muted-foreground/50 hover:bg-background/80 hover:text-muted-foreground",
                )}
                title={DAY_FULL_LABELS[index]}
              >
                {dayLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time range */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          Time
        </span>
        <div className="flex items-center gap-2">
          <TimeInput
            value={startMinutes}
            onChange={setStartMinutes}
            className="bg-background"
          />
          <span className="text-muted-foreground/70">–</span>
          <TimeInput
            value={startMinutes + durationMinutes}
            onChange={handleEndChange}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  );
}
