/**
 * =============================================================================
 * File: life-area-row.tsx
 * =============================================================================
 *
 * Editable row for displaying and managing a single Life Area.
 *
 * Used inside the Life Area manager modal to list both built-in and custom
 * Life Areas, with inline editing, deletion, and inline delete confirmation.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render Life Area icon pill (color-tinted), label, and "Built-in" badge.
 * - Always-visible muted edit/delete action icons for custom areas.
 * - Inline edit mode as expanded card form.
 * - Inline delete confirmation strip (no second modal).
 * - Emit update and remove events.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting Life Areas.
 * - Resolving usage references.
 * - Enforcing higher-level business rules.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Edit mode transforms the row into a card-style form (icon + input +
 *   color palette + action buttons).
 * - Delete confirmation is an inline red-tinted strip, not a second modal.
 * - Enter saves, Escape cancels (both edit and delete confirm).
 * - Built-in areas show a micro-badge; custom areas show action icons.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - LifeAreaRow
 * - LifeAreaRowProps
 */

"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RiPencilLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiStarLine,
} from "@remixicon/react";
import {
  getIconColorClass,
  getIconBgClass,
  getIconBgSoftClass,
} from "@/lib/colors";
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
  /** Number of goals using this life area */
  useCount: number;
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
  useCount,
  goalIcons,
  onUpdate,
  onRemove,
}: LifeAreaRowProps) {
  const [mode, setMode] = React.useState<"view" | "edit" | "confirm-delete">(
    "view",
  );
  const [editLabel, setEditLabel] = React.useState(area.label);
  const [editIconIndex, setEditIconIndex] = React.useState<number | null>(null);
  const [editColor, setEditColor] = React.useState<GoalColor>(area.color);
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ensure we have valid icon components
  const AreaIcon = typeof area.icon === "function" ? area.icon : RiStarLine;

  // Get the edit icon — if index is set use that, otherwise use original area icon
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
    setMode("edit");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveEdit = () => {
    if (!editLabel.trim()) return;
    onUpdate?.({
      label: editLabel.trim(),
      icon: editIcon,
      color: editColor,
    });
    setMode("view");
    setShowIconPicker(false);
    setShowColorPicker(false);
  };

  const handleCancelEdit = () => {
    setMode("view");
    setShowIconPicker(false);
    setShowColorPicker(false);
  };

  const handleDelete = () => {
    if (useCount > 0) {
      setMode("confirm-delete");
    } else {
      onRemove?.();
    }
  };

  const confirmDelete = () => {
    onRemove?.();
    setMode("view");
  };

  // Alias for rendering
  const EditIconComp = editIcon;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* ------------------------------------------------------------------ */}
      {/* Edit mode — expanded card form                                     */}
      {/* ------------------------------------------------------------------ */}
      {mode === "edit" && (
        <motion.div
          key="edit"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 my-0.5"
        >
          {/* Top row: icon + input */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowIconPicker(!showIconPicker);
                setShowColorPicker(false);
              }}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-all",
                getIconBgSoftClass(editColor),
                "hover:ring-2 hover:ring-foreground/20",
              )}
              title="Change icon"
            >
              <EditIconComp
                className={cn("size-4", getIconColorClass(editColor))}
              />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
            />
          </div>

          {/* Icon picker */}
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
                  selectedIndex={editIconIndex}
                  onSelect={(index) => {
                    setEditIconIndex(index);
                    setShowIconPicker(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Color palette row */}
          <ColorPicker
            className="gap-1.5"
            selectedColor={editColor}
            onSelect={(color) => {
              setEditColor(color);
              setShowColorPicker(false);
            }}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={!editLabel.trim()}
              className="h-7 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50 disabled:pointer-events-none"
            >
              Save
            </button>
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Delete confirmation — inline red strip                             */}
      {/* ------------------------------------------------------------------ */}
      {mode === "confirm-delete" && (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 my-0.5"
        >
          <p className="flex-1 text-xs text-red-600 dark:text-red-400">
            Used by {useCount} goal{useCount !== 1 ? "s" : ""}. Delete?
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMode("view")}
              className="h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              No
            </button>
            <button
              onClick={confirmDelete}
              className="h-7 rounded-md bg-red-500 px-2.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
            >
              Yes
            </button>
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* View mode — default row                                            */}
      {/* ------------------------------------------------------------------ */}
      {mode === "view" && (
        <motion.div
          key="view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
        >
          {/* Icon pill */}
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              getIconBgSoftClass(area.color),
            )}
          >
            <AreaIcon
              className={cn("size-4", getIconColorClass(area.color))}
            />
          </div>

          {/* Label */}
          <span className="flex-1 text-sm font-medium text-foreground">
            {area.label}
          </span>

          {/* Built-in badge (for default areas) */}
          {!isCustom && (
            <span className="text-[10px] font-medium text-muted-foreground/50">
              Built-in
            </span>
          )}

          {/* Actions — always visible but muted (custom areas only) */}
          {isCustom && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleStartEdit}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground"
                title="Edit"
              >
                <RiPencilLine className="size-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
                title="Delete"
              >
                <RiDeleteBinLine className="size-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
