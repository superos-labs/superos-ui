"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiFlagLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass } from "@/lib/colors";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { NewGoalData } from "./backlog-types";

// =============================================================================
// Inline Task Creator
// =============================================================================

export interface InlineTaskCreatorProps {
  goalId: string;
  onSave: (goalId: string, label: string) => void;
}

export function InlineTaskCreator({ goalId, onSave }: InlineTaskCreatorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onSave(goalId, value.trim());
      setValue(""); // Clear for next task (rapid entry)
      // Keep focus for rapid entry
      inputRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue("");
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    // Save if there's content, otherwise just close
    if (value.trim()) {
      onSave(goalId, value.trim());
    }
    setValue("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 text-left transition-all hover:bg-muted/60"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground/40 transition-colors group-hover:bg-muted/60 group-hover:text-muted-foreground/60">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-xs text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">
          Add task...
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground/50">
        <RiAddLine className="size-3" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Task name..."
        className="h-5 min-w-0 flex-1 bg-transparent text-xs text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Inline Goal Creator
// =============================================================================

export interface InlineGoalCreatorProps {
  lifeAreas: LifeArea[];
  goalIcons: GoalIconOption[];
  onSave: (goal: NewGoalData) => void;
  onCancel: () => void;
}

export function InlineGoalCreator({
  lifeAreas,
  goalIcons,
  onSave,
  onCancel,
}: InlineGoalCreatorProps) {
  const [label, setLabel] = React.useState("");
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<GoalColor>("violet");
  const [selectedAreaId, setSelectedAreaId] = React.useState(lifeAreas[0]?.id ?? "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedIcon = goalIcons[selectedIconIndex]?.icon ?? RiFlagLine;
  const selectedArea = lifeAreas.find((a) => a.id === selectedAreaId) ?? lifeAreas[0];
  const SelectedAreaIcon = selectedArea?.icon;

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      label: label.trim(),
      icon: selectedIcon,
      color: selectedColor,
      lifeAreaId: selectedAreaId,
    });
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

  // Subset of colors for the picker (most distinct/common)
  const pickerColors: GoalColor[] = [
    "slate", "red", "orange", "amber", "green", "teal", 
    "cyan", "blue", "indigo", "violet", "purple", "pink", "rose"
  ];

  return (
    <div className="mx-3 mb-2 flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
      {/* Header row: Title + Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">New goal</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors",
              label.trim()
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
            title="Save goal"
          >
            <RiCheckLine className="size-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main row: Icon picker + Input + Life Area */}
      <div className="flex items-center gap-2">
        {/* Icon/Color Picker Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 transition-colors hover:bg-muted"
              title="Choose icon and color"
            >
              {React.createElement(selectedIcon, { className: cn("size-4", getIconColorClass(selectedColor)) })}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-2">
            <DropdownMenuLabel className="px-1 py-1">Icon</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              {goalIcons.map((iconOption, index) => {
                const IconComp = iconOption.icon;
                const isSelected = selectedIconIndex === index;
                return (
                  <button
                    key={iconOption.label}
                    onClick={() => setSelectedIconIndex(index)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md transition-colors",
                      isSelected
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    selectedColor === color && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                  )}
                  title={color}
                >
                  <div className={cn("size-4 rounded-full", getIconColorClass(color).replace("text-", "bg-"))} />
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Goal Name Input */}
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Goal name..."
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />

        {/* Life Area Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              {SelectedAreaIcon && <SelectedAreaIcon className="size-3" />}
              <span>{selectedArea?.label}</span>
              <RiArrowDownSLine className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {lifeAreas.map((area) => {
              const AreaIcon = area.icon;
              return (
                <DropdownMenuItem
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={cn(
                    "gap-2",
                    selectedAreaId === area.id && "bg-accent"
                  )}
                >
                  <AreaIcon className={cn("size-3.5", getIconColorClass(area.color))} />
                  {area.label}
                  {selectedAreaId === area.id && (
                    <RiCheckLine className="ml-auto size-3.5" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
