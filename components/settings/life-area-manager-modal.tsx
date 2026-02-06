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
import { RiCloseLine, RiAddLine } from "@remixicon/react";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, GoalIconOption, LifeArea } from "@/lib/types";
import { LIFE_AREAS } from "@/lib/life-areas";
import { LifeAreaRow } from "./life-area-row";
import { LifeAreaInlineCreator } from "./life-area-inline-creator";

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

// =============================================================================
// Component
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
            <LifeAreaInlineCreator
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
