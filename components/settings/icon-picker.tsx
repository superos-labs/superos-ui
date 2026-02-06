/**
 * =============================================================================
 * File: icon-picker.tsx
 * =============================================================================
 *
 * Reusable icon picker grid for selecting a Goal or Life Area icon.
 *
 * Renders a grid of icon buttons from a provided icon set and reports the
 * selected index to the parent.
 *
 * Used across goal and life-area creation / editing surfaces.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a subset of available icon options.
 * - Display current selection state.
 * - Emit selected icon index via callback.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting selected icon.
 * - Defining icon catalogs or loading icons.
 * - Mapping index to domain entities.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Selection is index-based to keep component stateless.
 * - maxIcons allows lightweight truncation for dense UIs.
 * - Visual selection uses foreground/background inversion.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - IconPicker
 * - IconPickerProps
 */

"use client";

/**
 * Reusable icon picker grid.
 * Renders a grid of icon buttons for selection.
 */

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
