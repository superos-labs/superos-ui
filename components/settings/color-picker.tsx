/**
 * =============================================================================
 * File: color-picker.tsx
 * =============================================================================
 *
 * Reusable color picker grid for selecting a Goal color.
 *
 * Renders a compact grid of color swatch buttons and reports the selected
 * value to the parent via a callback.
 *
 * Used across goal and life-area creation / editing surfaces.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a fixed subset of allowed Goal colors.
 * - Display current selection state.
 * - Emit selected color via callback.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting selected color.
 * - Defining or validating the full color system.
 * - Managing focus, keyboard navigation, or accessibility semantics.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses getIconBgClass for consistent color styling.
 * - Visual selection indicated via ring styling.
 * - Intentionally small and dense for inline forms and modals.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ColorPicker
 * - ColorPickerProps
 */

"use client";

/**
 * Reusable color picker grid.
 * Renders a grid of color swatch buttons for selection.
 */

import { cn } from "@/lib/utils";
import { getIconBgClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";

// =============================================================================
// Constants
// =============================================================================

/** Subset of goal colors used in picker UIs */
const PICKER_COLORS: GoalColor[] = [
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

// =============================================================================
// Types
// =============================================================================

export interface ColorPickerProps {
  /** Currently selected color */
  selectedColor: GoalColor;
  /** Called when a color is selected */
  onSelect: (color: GoalColor) => void;
  /** Additional class names for the container */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ColorPicker({
  selectedColor,
  onSelect,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {PICKER_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={cn(
            "flex size-7 items-center justify-center rounded-md transition-all",
            selectedColor === c &&
              "ring-2 ring-foreground ring-offset-1 ring-offset-background",
          )}
          title={c}
        >
          <div className={cn("size-5 rounded-full", getIconBgClass(c))} />
        </button>
      ))}
    </div>
  );
}
