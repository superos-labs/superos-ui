"use client";

/**
 * Reusable icon picker grid.
 * Renders a grid of icon buttons for selection.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GoalIconOption } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface IconPickerProps {
  /** Available icons to display */
  goalIcons: GoalIconOption[];
  /** Index of the currently selected icon, or null for none */
  selectedIndex: number | null;
  /** Called when an icon is selected */
  onSelect: (index: number) => void;
  /** Maximum number of icons to display (default: 40) */
  maxIcons?: number;
  /** Additional class names for the container */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function IconPicker({
  goalIcons,
  selectedIndex,
  onSelect,
  maxIcons = 40,
  className,
}: IconPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {goalIcons.slice(0, maxIcons).map((iconOption, index) => {
        const IconComp = iconOption.icon;
        const isSelected = selectedIndex === index;
        return (
          <button
            key={iconOption.label}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors",
              isSelected
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={iconOption.label}
          >
            <IconComp className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
