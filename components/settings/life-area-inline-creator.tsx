/**
 * =============================================================================
 * File: life-area-inline-creator.tsx
 * =============================================================================
 *
 * Inline creator for adding a new Life Area.
 *
 * Compact form used inside the Life Area manager modal to quickly create
 * a Life Area without opening a separate dialog.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render inline inputs for label, icon, and color.
 * - Manage local creation form state.
 * - Validate against duplicate Life Area labels.
 * - Emit create event with normalized data.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting Life Areas.
 * - Generating IDs.
 * - Owning Life Area collections or ordering.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Auto-focuses label input on mount.
 * - Toggles icon and color pickers inline.
 * - Enter submits, Escape cancels.
 * - Optimized for fast, keyboard-driven creation.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - LifeAreaInlineCreator
 * - LifeAreaInlineCreatorProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCheckLine, RiCloseFill, RiStarLine } from "@remixicon/react";
import { getIconColorClass, getIconBgClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, GoalIconOption, LifeArea } from "@/lib/types";
import { IconPicker } from "./icon-picker";
import { ColorPicker } from "./color-picker";

// =============================================================================
// Types
// =============================================================================

export interface LifeAreaInlineCreatorProps {
  goalIcons: GoalIconOption[];
  existingLifeAreas: LifeArea[];
  onCreateLifeArea: (data: {
    label: string;
    icon: IconComponent;
    color: GoalColor;
  }) => void;
  onCancel: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function LifeAreaInlineCreator({
  goalIcons,
  existingLifeAreas,
  onCreateLifeArea,
  onCancel,
}: LifeAreaInlineCreatorProps) {
  const [label, setLabel] = React.useState("");
  // Start with index 4 (star icon) or 0 as fallback
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(() =>
    goalIcons.length > 4 ? 4 : 0,
  );
  const [selectedColor, setSelectedColor] = React.useState<GoalColor>("violet");
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get the selected icon component safely
  const selectedIcon: IconComponent = React.useMemo(() => {
    const icon = goalIcons[selectedIconIndex]?.icon;
    if (typeof icon === "function") return icon;
    if (goalIcons.length > 0 && typeof goalIcons[0].icon === "function") {
      return goalIcons[0].icon;
    }
    return RiStarLine;
  }, [goalIcons, selectedIconIndex]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isDuplicate = React.useMemo(() => {
    if (!label.trim()) return false;
    return existingLifeAreas.some(
      (a) => a.label.toLowerCase() === label.trim().toLowerCase(),
    );
  }, [label, existingLifeAreas]);

  const canSubmit = label.trim().length > 0 && !isDuplicate;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCreateLifeArea({
      label: label.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
  };

  const SelectedIconComp = selectedIcon;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Icon button */}
        <button
          type="button"
          onClick={() => {
            setShowIconPicker(!showIconPicker);
            setShowColorPicker(false);
          }}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors hover:ring-2 hover:ring-foreground/20"
          title="Choose icon"
        >
          <SelectedIconComp
            className={cn("size-4", getIconColorClass(selectedColor))}
          />
        </button>

        {/* Label input */}
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Life area name..."
          className={cn(
            "h-8 flex-1 rounded-md border bg-background px-2 text-sm",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-foreground/20",
            isDuplicate && "border-red-500",
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onCancel();
          }}
        />

        {/* Color button */}
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowIconPicker(false);
          }}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted"
          title="Choose color"
        >
          <div
            className={cn("size-4 rounded-full", getIconBgClass(selectedColor))}
          />
        </button>

        {/* Add button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex size-8 items-center justify-center rounded-md bg-foreground text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:pointer-events-none"
          title="Add"
        >
          <RiCheckLine className="size-4" />
        </button>

        {/* Cancel button */}
        <button
          type="button"
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Cancel"
        >
          <RiCloseFill className="size-4" />
        </button>
      </div>

      {isDuplicate && (
        <p className="text-xs text-red-500 px-1">Name already exists</p>
      )}

      {/* Icon picker */}
      {showIconPicker && (
        <IconPicker
          className="rounded-md border bg-background p-2"
          goalIcons={goalIcons}
          selectedIndex={selectedIconIndex}
          onSelect={(index) => {
            setSelectedIconIndex(index);
            setShowIconPicker(false);
          }}
        />
      )}

      {/* Color picker */}
      {showColorPicker && (
        <ColorPicker
          className="rounded-md border bg-background p-2"
          selectedColor={selectedColor}
          onSelect={(color) => {
            setSelectedColor(color);
            setShowColorPicker(false);
          }}
        />
      )}
    </div>
  );
}
