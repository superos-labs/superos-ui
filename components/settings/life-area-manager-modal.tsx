"use client";

/**
 * Modal for managing life areas.
 * Shows all life areas with ability to edit/delete custom ones.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCloseLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiAddLine,
  RiCheckLine,
  RiCloseFill,
  RiStarLine,
} from "@remixicon/react";
import { getIconColorClass, getIconBgClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, GoalIconOption, LifeArea } from "@/lib/types";
import { LIFE_AREAS } from "@/lib/life-areas";

// =============================================================================
// Types
// =============================================================================

export interface LifeAreaManagerModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Custom life areas (editable) */
  customLifeAreas: LifeArea[];
  /** Available icons for selection */
  goalIcons: GoalIconOption[];
  /** Goals (to check if a life area is in use) */
  goals: Array<{ id: string; lifeAreaId: string }>;
  /** Called when adding a new life area */
  onAddLifeArea: (data: {
    label: string;
    icon: IconComponent;
    color: GoalColor;
  }) => void;
  /** Called when updating a custom life area */
  onUpdateLifeArea: (
    id: string,
    updates: { label?: string; icon?: IconComponent; color?: GoalColor },
  ) => void;
  /** Called when removing a custom life area */
  onRemoveLifeArea: (id: string) => void;
}

// Subset of colors for the picker
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
// Life Area Row Component
// =============================================================================

interface LifeAreaRowProps {
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

function LifeAreaRow({
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
    // Fall back to area's original icon
    return typeof area.icon === "function" ? area.icon : RiStarLine;
  }, [editIconIndex, goalIcons, area.icon]);

  const handleStartEdit = () => {
    setEditLabel(area.label);
    setEditIconIndex(null); // Reset - will use area's original icon
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
          <div className="flex flex-wrap gap-1 rounded-md border bg-background p-2">
            {goalIcons.slice(0, 40).map((iconOption, index) => {
              const IconComp = iconOption.icon;
              // Selected if index matches, or if no index set and this matches area's original icon
              const isSelected = editIconIndex === index;
              return (
                <button
                  key={iconOption.label}
                  type="button"
                  onClick={() => {
                    setEditIconIndex(index);
                    setShowIconPicker(false);
                  }}
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
        )}

        {/* Color picker */}
        {showColorPicker && (
          <div className="flex flex-wrap gap-1 rounded-md border bg-background p-2">
            {PICKER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setEditColor(c);
                  setShowColorPicker(false);
                }}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md transition-all",
                  editColor === c &&
                    "ring-2 ring-foreground ring-offset-1 ring-offset-background",
                )}
                title={c}
              >
                <div className={cn("size-5 rounded-full", getIconBgClass(c))} />
              </button>
            ))}
          </div>
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

// =============================================================================
// Main Component
// =============================================================================

export function LifeAreaManagerModal({
  open,
  onClose,
  customLifeAreas,
  goalIcons,
  goals,
  onAddLifeArea,
  onUpdateLifeArea,
  onRemoveLifeArea,
}: LifeAreaManagerModalProps) {
  const [showCreator, setShowCreator] = React.useState(false);

  // Track which life areas are in use
  const usedLifeAreaIds = React.useMemo(
    () => new Set(goals.map((g) => g.lifeAreaId)),
    [goals],
  );

  // All life areas (default + custom)
  const allLifeAreas = React.useMemo(
    () => [...LIFE_AREAS, ...customLifeAreas],
    [customLifeAreas],
  );

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

  // Reset creator state when modal closes
  React.useEffect(() => {
    if (!open) {
      setShowCreator(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="life-area-manager-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 animate-in fade-in duration-100"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-sm flex-col rounded-xl bg-background shadow-lg ring-1 ring-foreground/10 animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="life-area-manager-title"
            className="text-sm font-medium text-foreground"
          >
            Life areas
          </h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {/* Default life areas */}
          <div className="mb-2">
            <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
              Default
            </p>
            {LIFE_AREAS.map((area) => (
              <LifeAreaRow
                key={area.id}
                area={area}
                isCustom={false}
                isInUse={usedLifeAreaIds.has(area.id)}
                goalIcons={goalIcons}
              />
            ))}
          </div>

          {/* Custom life areas */}
          {customLifeAreas.length > 0 && (
            <div className="mb-2 border-t border-border pt-2">
              <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                Custom
              </p>
              {customLifeAreas.map((area) => (
                <LifeAreaRow
                  key={area.id}
                  area={area}
                  isCustom={true}
                  isInUse={usedLifeAreaIds.has(area.id)}
                  goalIcons={goalIcons}
                  onUpdate={(updates) => onUpdateLifeArea(area.id, updates)}
                  onRemove={() => onRemoveLifeArea(area.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Add button */}
        <div className="shrink-0 border-t border-border px-4 py-3">
          {showCreator ? (
            <InlineCreator
              goalIcons={goalIcons}
              existingLifeAreas={allLifeAreas}
              onCreateLifeArea={(data) => {
                onAddLifeArea(data);
                setShowCreator(false);
              }}
              onCancel={() => setShowCreator(false)}
            />
          ) : (
            <button
              onClick={() => setShowCreator(true)}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <RiAddLine className="size-4" />
              Add life area
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Inline Creator (inside the manager)
// =============================================================================

interface InlineCreatorProps {
  goalIcons: GoalIconOption[];
  existingLifeAreas: LifeArea[];
  onCreateLifeArea: (data: {
    label: string;
    icon: IconComponent;
    color: GoalColor;
  }) => void;
  onCancel: () => void;
}

function InlineCreator({
  goalIcons,
  existingLifeAreas,
  onCreateLifeArea,
  onCancel,
}: InlineCreatorProps) {
  const [label, setLabel] = React.useState("");
  // Start with index 4 (star icon) or 0 as fallback
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(
    () => (goalIcons.length > 4 ? 4 : 0),
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

  // selectedIcon is already guaranteed to be valid from useMemo
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
        <div className="flex flex-wrap gap-1 rounded-md border bg-background p-2">
          {goalIcons.slice(0, 40).map((iconOption, index) => {
            const IconComp = iconOption.icon;
            const isSelected = selectedIconIndex === index;
            return (
              <button
                key={iconOption.label}
                type="button"
                onClick={() => {
                  setSelectedIconIndex(index);
                  setShowIconPicker(false);
                }}
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
      )}

      {/* Color picker */}
      {showColorPicker && (
        <div className="flex flex-wrap gap-1 rounded-md border bg-background p-2">
          {PICKER_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setSelectedColor(c);
                setShowColorPicker(false);
              }}
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
      )}
    </div>
  );
}
