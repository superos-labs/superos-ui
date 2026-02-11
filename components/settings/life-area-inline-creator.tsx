/**
 * =============================================================================
 * File: life-area-inline-creator.tsx
 * =============================================================================
 *
 * Expanded inline creator for adding a new Life Area.
 *
 * Card-style form used inside the Life Area manager modal to create a
 * Life Area with icon, name, and color in a spacious layout.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render an expanded card form with icon button + name input, color palette,
 *   and Cancel / Create action buttons.
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
 * - Icon picker toggles inline with height animation.
 * - Color palette is always visible as a horizontal row.
 * - Enter submits, Escape cancels.
 * - Card visual matches the edit-mode card in LifeAreaRow.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - LifeAreaInlineCreator
 * - LifeAreaInlineCreatorProps
 */

"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RiStarLine } from "@remixicon/react";
import { getIconColorClass, getIconBgSoftClass } from "@/lib/colors";
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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3">
      {/* Top row: icon button + name input */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowIconPicker(!showIconPicker)}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-all",
            getIconBgSoftClass(selectedColor),
            "hover:ring-2 hover:ring-foreground/20",
          )}
          title="Choose icon"
        >
          <SelectedIconComp
            className={cn("size-4", getIconColorClass(selectedColor))}
          />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Life area name..."
          className={cn(
            "h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-ring/30",
            isDuplicate && "border-red-500 focus:ring-red-500/30",
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onCancel();
          }}
        />
      </div>

      {/* Duplicate error */}
      {isDuplicate && (
        <p className="text-xs text-red-500 px-1 -mt-1">Name already exists</p>
      )}

      {/* Icon picker — animated expand/collapse */}
      <AnimatePresence>
        {showIconPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <IconPicker
              className="max-h-32 overflow-y-auto rounded-lg border border-border bg-background p-2"
              goalIcons={goalIcons}
              selectedIndex={selectedIconIndex}
              onSelect={(index) => {
                setSelectedIconIndex(index);
                setShowIconPicker(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color palette — always visible */}
      <ColorPicker
        className="gap-1.5"
        selectedColor={selectedColor}
        onSelect={(color) => setSelectedColor(color)}
      />

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-7 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50 disabled:pointer-events-none"
        >
          Create
        </button>
      </div>
    </div>
  );
}
