/**
 * =============================================================================
 * File: goal-inspiration-gallery.tsx
 * =============================================================================
 *
 * Gallery-style surface for browsing and adding inspirational goals.
 *
 * Displays goals grouped by life area, allowing users to quickly seed their
 * backlog with pre-defined ideas that align with personal priorities.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render categories of inspiration goals.
 * - Visually indicate which goals have already been added.
 * - Allow adding goals with a single action.
 * - Bridge selections to parent via NewGoalData.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting goals.
 * - Defining inspiration data.
 * - Validating goal semantics.
 *
 * -----------------------------------------------------------------------------
 * KEY DEPENDENCIES
 * -----------------------------------------------------------------------------
 * - framer-motion
 * - goal-types (InspirationCategory, InspirationGoal, NewGoalData)
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Tracks locally added goals to provide immediate feedback.
 * - Merges local and external added IDs for consistent UI.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalInspirationGallery
 * - GoalInspirationGalleryProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RiAddLine, RiCloseLine, RiCheckLine } from "@remixicon/react";
import { getIconColorClass, getIconBgSoftClass } from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type {
  InspirationCategory,
  InspirationGoal,
  NewGoalData,
} from "./goal-types";

// =============================================================================
// Inspiration Goal Card
// =============================================================================

interface InspirationGoalCardProps {
  goal: InspirationGoal;
  lifeAreaId: string;
  lifeAreaColor: GoalColor;
  onAdd: (goal: InspirationGoal, lifeAreaId: string) => void;
  isAdded?: boolean;
}

function InspirationGoalCard({
  goal,
  lifeAreaId,
  lifeAreaColor,
  onAdd,
  isAdded,
}: InspirationGoalCardProps) {
  const Icon = goal.icon;

  return (
    <motion.button
      onClick={() => !isAdded && onAdd(goal, lifeAreaId)}
      disabled={isAdded}
      whileTap={{ scale: isAdded ? 1 : 0.98 }}
      className={cn(
        "group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-colors duration-150",
        isAdded
          ? "cursor-default border-border/50 bg-muted/30"
          : "cursor-pointer border-border bg-background hover:bg-muted/30",
      )}
    >
      {/* Larger icon container with colored background */}
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors",
          isAdded ? "bg-muted/50" : getIconBgSoftClass(lifeAreaColor),
        )}
      >
        <Icon
          className={cn(
            "size-6 transition-colors",
            isAdded
              ? "text-muted-foreground/50"
              : getIconColorClass(lifeAreaColor),
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 text-sm font-medium leading-tight",
          isAdded ? "text-muted-foreground/60" : "text-foreground",
        )}
      >
        {goal.label}
      </span>

      {/* Added checkmark or hover add indicator */}
      <div className="shrink-0">
        {isAdded ? (
          <div className="flex size-7 items-center justify-center rounded-full bg-green-500/10">
            <RiCheckLine className="size-4 text-green-500" />
          </div>
        ) : (
          <div className="flex size-7 items-center justify-center rounded-full bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/10 group-hover:opacity-100">
            <RiAddLine className="size-4 text-foreground" />
          </div>
        )}
      </div>
    </motion.button>
  );
}

// =============================================================================
// Inspiration Category Section
// =============================================================================

interface InspirationCategorySectionProps {
  category: InspirationCategory;
  onAdd: (goal: InspirationGoal, lifeAreaId: string) => void;
  addedGoalIds: Set<string>;
}

function InspirationCategorySection({
  category,
  onAdd,
  addedGoalIds,
}: InspirationCategorySectionProps) {
  const LifeAreaIcon = category.lifeArea.icon;

  return (
    <div className="mb-8">
      {/* Life area header - larger and more prominent */}
      <div className="flex items-center gap-3 pb-4 pt-2">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            getIconBgSoftClass(category.lifeArea.color),
          )}
        >
          <LifeAreaIcon
            className={cn("size-5", getIconColorClass(category.lifeArea.color))}
          />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {category.lifeArea.label}
        </h3>
      </div>

      {/* Goal suggestion cards in a grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.goals.map((goal) => (
          <InspirationGoalCard
            key={goal.id}
            goal={goal}
            lifeAreaId={category.lifeArea.id}
            lifeAreaColor={category.lifeArea.color}
            onAdd={onAdd}
            isAdded={addedGoalIds.has(goal.id)}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalInspirationGalleryProps {
  /** Categories of inspiration goals to display */
  categories: InspirationCategory[];
  /** Callback when a goal is added */
  onAddGoal: (goalData: NewGoalData) => void;
  /** Callback to close the gallery */
  onClose?: () => void;
  /** Set of goal IDs that have already been added */
  addedGoalIds?: Set<string>;
  className?: string;
}

export function GoalInspirationGallery({
  categories,
  onAddGoal,
  onClose,
  addedGoalIds = new Set(),
  className,
}: GoalInspirationGalleryProps) {
  // Track locally added goals during this session
  const [locallyAdded, setLocallyAdded] = React.useState<Set<string>>(
    new Set(),
  );

  // Combine externally added and locally added goal IDs
  const allAddedIds = React.useMemo(() => {
    const combined = new Set(addedGoalIds);
    locallyAdded.forEach((id) => combined.add(id));
    return combined;
  }, [addedGoalIds, locallyAdded]);

  const handleAddGoal = React.useCallback(
    (goal: InspirationGoal, lifeAreaId: string) => {
      // Find the category to get the color
      const category = categories.find((c) => c.lifeArea.id === lifeAreaId);
      if (!category) return;

      // Create the new goal data
      const newGoalData: NewGoalData = {
        label: goal.label,
        icon: goal.icon,
        color: category.lifeArea.color,
        lifeAreaId,
      };

      // Mark as added locally
      setLocallyAdded((prev) => new Set(prev).add(goal.id));

      // Call the parent callback
      onAddGoal(newGoalData);
    },
    [categories, onAddGoal],
  );

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Find inspiration
          </h2>
          <p className="text-sm text-muted-foreground">
            Add goals that match your priorities
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close inspiration gallery"
          >
            <RiCloseLine className="size-5" />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="scrollbar-hidden flex-1 overflow-y-auto px-6 py-4">
        {categories.map((category) => (
          <InspirationCategorySection
            key={category.lifeArea.id}
            category={category}
            onAdd={handleAddGoal}
            addedGoalIds={allAddedIds}
          />
        ))}
      </div>
    </div>
  );
}
