"use client";

/**
 * Single life area row with display and inline editing modes.
 * Supports icon/color editing for custom life areas.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiPencilLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseFill,
  RiStarLine,
} from "@remixicon/react";
import { getIconColorClass, getIconBgClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, GoalIconOption, LifeArea } from "@/lib/types";
import { IconPicker } from "./icon-picker";
import { ColorPicker } from "./color-picker";

// =============================================================================
// Types
// =============================================================================

export interface LifeAreaRowProps {
  area: LifeArea;
  isCustom: boolean;
  isInUse: boolean;
  goalIcons: GoalIconOption[];
  onUpdate?: (updates: {
    label?: string;
    icon?: IconComponent;
    color?: GoalColor;
  }) => void;
  onRemove?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function LifeAreaRow({
  area,
  isCustom,
  isInUse,
  goalIcons,
  onUpdate,
  onRemove,
}: LifeAreaRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editLabel, setEditLabel] = React.useState(area.label);
  const [editIconIndex, setEditIconIndex] = React.useState<number | null>(null);
  const [editColor, setEditColor] = React.useState<GoalColor>(area.color);
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ensure we have valid icon components
  const AreaIcon = typeof area.icon === "function" ? area.icon : RiStarLine;

  // Get the edit icon - if index is set use that, otherwise use original area icon
  const editIcon: IconComponent = React.useMemo(() => {
    if (editIconIndex !== null) {
      const icon = goalIcons[editIconIndex]?.icon;
      if (typeof icon === "function") return icon;
    }
    return typeof area.icon === "function" ? area.icon : RiStarLine;
  }, [editIconIndex, goalIcons, area.icon]);

  const handleStartEdit = () => {
    setEditLabel(area.label);
    setEditIconIndex(null);
    setEditColor(area.color);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveEdit = () => {
    if (!editLabel.trim()) return;
    onUpdate?.({
      label: editLabel.trim(),
      icon: editIcon,
      color: editColor,
    });
    setIsEditing(false);
    setShowIconPicker(false);
    setShowColorPicker(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowIconPicker(false);
    setShowColorPicker(false);
  };

  const handleDelete = () => {
    if (isInUse) {
      setShowDeleteConfirm(true);
    } else {
      onRemove?.();
    }
  };

  const confirmDelete = () => {
    onRemove?.();
    setShowDeleteConfirm(false);
  };

  // Alias for rendering
  const EditIconComp = editIcon;

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          {/* Icon button */}
          <button
            type="button"
            onClick={() => {
              setShowIconPicker(!showIconPicker);
              setShowColorPicker(false);
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors hover:ring-2 hover:ring-foreground/20"
            title="Change icon"
          >
            <EditIconComp
              className={cn("size-4", getIconColorClass(editColor))}
            />
          </button>

          {/* Label input */}
          <input
            ref={inputRef}
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="h-8 flex-1 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") handleCancelEdit();
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
            title="Change color"
          >
            <div
              className={cn("size-4 rounded-full", getIconBgClass(editColor))}
            />
          </button>

          {/* Save/Cancel */}
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={!editLabel.trim()}
            className="flex size-8 items-center justify-center rounded-md text-emerald-500 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
            title="Save"
          >
            <RiCheckLine className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Cancel"
          >
            <RiCloseFill className="size-4" />
          </button>
        </div>

        {/* Icon picker */}
        {showIconPicker && (
          <IconPicker
            className="rounded-md border bg-background p-2"
            goalIcons={goalIcons}
            selectedIndex={editIconIndex}
            onSelect={(index) => {
              setEditIconIndex(index);
              setShowIconPicker(false);
            }}
          />
        )}

        {/* Color picker */}
        {showColorPicker && (
          <ColorPicker
            className="rounded-md border bg-background p-2"
            selectedColor={editColor}
            onSelect={(color) => {
              setEditColor(color);
              setShowColorPicker(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
      {/* Icon */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          getIconBgClass(area.color) + "/20",
        )}
      >
        <AreaIcon className={cn("size-4", getIconColorClass(area.color))} />
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 text-sm",
          isCustom ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {area.label}
      </span>

      {/* Actions (only for custom areas) */}
      {isCustom && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleStartEdit}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Edit"
          >
            <RiPencilLine className="size-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
            title="Delete"
          >
            <RiDeleteBinLine className="size-3.5" />
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-72 rounded-xl bg-background p-4 shadow-lg ring-1 ring-foreground/10">
            <p className="text-sm text-foreground mb-3">
              This life area is used by goals. Delete anyway?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="h-8 rounded-md bg-red-500 px-3 text-xs font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
