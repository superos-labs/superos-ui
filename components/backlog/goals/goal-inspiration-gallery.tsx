"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiCloseLine, RiCheckLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type {
  InspirationCategory,
  InspirationGoal,
  NewGoalData,
} from "./goal-types";

// =============================================================================
// Inspiration Goal Row
// =============================================================================

interface InspirationGoalRowProps {
  goal: InspirationGoal;
  lifeAreaId: string;
  lifeAreaColor: string;
  onAdd: (goal: InspirationGoal, lifeAreaId: string) => void;
  isAdded?: boolean;
}

function InspirationGoalRow({
  goal,
  lifeAreaId,
  lifeAreaColor,
  onAdd,
  isAdded,
}: InspirationGoalRowProps) {
  const Icon = goal.icon;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
        isAdded ? "bg-muted/40" : "hover:bg-muted/60",
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          "flex-1 text-sm",
          isAdded ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {goal.label}
      </span>
      {isAdded ? (
        <div className="flex size-6 items-center justify-center">
          <RiCheckLine className="size-4 text-green-500" />
        </div>
      ) : (
        <button
          onClick={() => onAdd(goal, lifeAreaId)}
          className="flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          aria-label={`Add ${goal.label}`}
        >
          <RiAddLine className="size-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
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
    <div className="mb-6">
      {/* Life area header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-background pb-2 pt-1">
        <LifeAreaIcon
          className={cn("size-4", getIconColorClass(category.lifeArea.color))}
        />
        <h3 className="text-sm font-medium text-foreground">
          {category.lifeArea.label}
        </h3>
      </div>

      {/* Goal suggestions */}
      <div className="space-y-0.5">
        {category.goals.map((goal) => (
          <InspirationGoalRow
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
