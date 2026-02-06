"use client";

/**
 * Modal for creating a new custom life area.
 * Uses the same icon and color pickers as goal creation.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiStarLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, GoalIconOption, LifeArea } from "@/lib/types";
import { IconPicker } from "./icon-picker";
import { ColorPicker } from "./color-picker";

// =============================================================================
// Types
// =============================================================================

export interface LifeAreaCreatorModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Available icons for selection */
  goalIcons: GoalIconOption[];
  /** Existing life areas (for duplicate validation) */
  existingLifeAreas: LifeArea[];
  /** Called when a new life area is created */
  onCreateLifeArea: (data: {
    label: string;
    icon: IconComponent;
    color: GoalColor;
  }) => void;
}

// =============================================================================
// Component
// =============================================================================

export function LifeAreaCreatorModal({
  open,
  onClose,
  goalIcons,
  existingLifeAreas,
  onCreateLifeArea,
}: LifeAreaCreatorModalProps) {
  const [label, setLabel] = React.useState("");
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<GoalColor>("violet");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get the selected icon component safely
  const selectedIcon: IconComponent = React.useMemo(() => {
    const icon = goalIcons[selectedIconIndex]?.icon;
    if (typeof icon === "function") return icon;
    // Fallback to first available icon or RiStarLine
    if (goalIcons.length > 0 && typeof goalIcons[0].icon === "function") {
      return goalIcons[0].icon;
    }
    return RiStarLine;
  }, [goalIcons, selectedIconIndex]);

  // Check for duplicate label
  const isDuplicate = React.useMemo(() => {
    if (!label.trim()) return false;
    return existingLifeAreas.some(
      (a) => a.label.toLowerCase() === label.trim().toLowerCase(),
    );
  }, [label, existingLifeAreas]);

  const canSubmit = label.trim().length > 0 && !isDuplicate;

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setLabel("");
      setSelectedIconIndex(0);
      setSelectedColor("violet");
      // Focus input after a short delay for animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    if (!open) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onCreateLifeArea({
      label: label.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    onClose();
  };

  if (!open) return null;

  // selectedIcon is already guaranteed to be a valid component from useMemo
  const SelectedIconComponent = selectedIcon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="life-area-creator-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 animate-in fade-in duration-100"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-background p-4 shadow-lg ring-1 ring-foreground/10 animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="life-area-creator-title"
            className="text-sm font-medium text-foreground"
          >
            Add life area
          </h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Preview */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <SelectedIconComponent
                className={cn("size-5", getIconColorClass(selectedColor))}
              />
            </div>
            <span className="text-sm font-medium text-foreground">
              {label.trim() || "New life area"}
            </span>
          </div>

          {/* Label Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="life-area-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <input
              ref={inputRef}
              id="life-area-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Spirituality"
              className={cn(
                "h-9 w-full rounded-md border bg-background px-3 text-sm",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-2 focus:ring-foreground/20",
                isDuplicate && "border-red-500 focus:ring-red-500/20",
              )}
            />
            {isDuplicate && (
              <p className="text-xs text-red-500">
                A life area with this name already exists
              </p>
            )}
          </div>

          {/* Icon Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Icon
            </span>
            <IconPicker
              className="rounded-md border p-2"
              goalIcons={goalIcons}
              selectedIndex={selectedIconIndex}
              onSelect={setSelectedIconIndex}
            />
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Color
            </span>
            <ColorPicker
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "h-8 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors",
                "hover:bg-foreground/90",
                "disabled:opacity-50 disabled:pointer-events-none",
              )}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
