/**
 * =============================================================================
 * File: life-area-manager-modal.tsx
 * =============================================================================
 *
 * Modal for managing Life Areas (add, edit, remove).
 *
 * Renders a flat list of default and custom Life Areas with inline editing,
 * always-visible actions, and an expanded inline creator form.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Display all life areas in a single flat list.
 * - Distinguish defaults with a "Built-in" micro-badge.
 * - Provide inline CRUD via LifeAreaRow and LifeAreaInlineCreator.
 * - Animate list changes with framer-motion.
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
 * - No section headers — defaults and custom areas share one list.
 * - Creator form lives inside the scroll area (not the footer).
 * - Footer has a clean "Add life area" trigger, no dashed borders.
 * - Subtle framer-motion layout animations for add/remove.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - LifeAreaManagerModal
 * - LifeAreaManagerModalProps
 */

"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  /** Called when adding a new life area. Should return the new ID or null. */
  onAddLifeArea: (data: {
    label: string;
    icon: IconComponent;
    color: GoalColor;
  }) => string | null;
  /** Called when updating a custom life area */
  onUpdateLifeArea: (
    id: string,
    updates: { label?: string; icon?: IconComponent; color?: GoalColor },
  ) => void;
  /** Called when removing a custom life area */
  onRemoveLifeArea: (id: string) => void;
  /** When true, the inline creator form is shown immediately on open */
  initialShowCreator?: boolean;
  /** Called after a life area is successfully created, with the new ID */
  onLifeAreaCreated?: (newId: string) => void;
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
  initialShowCreator = false,
  onLifeAreaCreated,
}: LifeAreaManagerModalProps) {
  const [showCreator, setShowCreator] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Count goals per life area
  const useCountByAreaId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const g of goals) {
      map.set(g.lifeAreaId, (map.get(g.lifeAreaId) ?? 0) + 1);
    }
    return map;
  }, [goals]);

  // All life areas (default + custom) — flat list
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

  // Reset or initialize creator state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setShowCreator(initialShowCreator);
    } else {
      setShowCreator(false);
    }
  }, [open, initialShowCreator]);

  // Scroll to bottom when creator opens
  React.useEffect(() => {
    if (showCreator && scrollRef.current) {
      // Small delay to let the form render
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
  }, [showCreator]);

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
        <div className="flex shrink-0 items-center justify-between px-5 py-4">
          <h2
            id="life-area-manager-title"
            className="text-base font-semibold text-foreground"
          >
            Life areas
          </h2>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1">
          <AnimatePresence initial={false}>
            {allLifeAreas.map((area) => {
              const isCustom = !!area.isCustom;
              const useCount = useCountByAreaId.get(area.id) ?? 0;

              return (
                <motion.div
                  key={area.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <LifeAreaRow
                    area={area}
                    isCustom={isCustom}
                    useCount={useCount}
                    goalIcons={goalIcons}
                    onUpdate={
                      isCustom
                        ? (updates) => onUpdateLifeArea(area.id, updates)
                        : undefined
                    }
                    onRemove={
                      isCustom ? () => onRemoveLifeArea(area.id) : undefined
                    }
                  />
                </motion.div>
              );
            })}

            {/* Inline creator — inside the scroll area */}
            {showCreator && (
              <motion.div
                key="creator"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8, height: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="mt-1"
              >
                <LifeAreaInlineCreator
                  goalIcons={goalIcons}
                  existingLifeAreas={allLifeAreas}
                  onCreateLifeArea={(data) => {
                    const newId = onAddLifeArea(data);
                    if (newId) onLifeAreaCreated?.(newId);
                    setShowCreator(false);
                  }}
                  onCancel={() => setShowCreator(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — Add button */}
        <div className="shrink-0 px-3 pb-3 pt-1">
          <AnimatePresence mode="wait">
            {!showCreator && (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                onClick={() => setShowCreator(true)}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <RiAddLine className="size-4" />
                Add life area
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
