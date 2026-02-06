"use client";

/**
 * useLifeAreas - Custom life area state management.
 *
 * Manages the user's custom life areas (create, update, remove)
 * and merges them with the built-in defaults from LIFE_AREAS.
 */

import * as React from "react";
import type { LifeArea, IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import { LIFE_AREAS } from "@/lib/life-areas";

// =============================================================================
// Types
// =============================================================================

export interface UseLifeAreasReturn {
  /** All life areas (built-in defaults + user-created) */
  allLifeAreas: LifeArea[];
  /** Only the user-created life areas */
  customLifeAreas: LifeArea[];
  /** Add a custom life area. Returns the new ID, or null if duplicate label. */
  addLifeArea: (data: {
    label: string;
    icon: IconComponent;
    color: GoalColor;
  }) => string | null;
  /** Update a custom life area */
  updateLifeArea: (
    id: string,
    updates: { label?: string; icon?: IconComponent; color?: GoalColor }
  ) => void;
  /** Remove a custom life area */
  removeLifeArea: (id: string) => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useLifeAreas(): UseLifeAreasReturn {
  const [customLifeAreas, setCustomLifeAreas] = React.useState<LifeArea[]>([]);

  // Combined life areas (defaults + custom)
  const allLifeAreas = React.useMemo(
    () => [...LIFE_AREAS, ...customLifeAreas],
    [customLifeAreas]
  );

  const addLifeArea = React.useCallback(
    (data: {
      label: string;
      icon: IconComponent;
      color: GoalColor;
    }): string | null => {
      // Validate: no duplicate labels (case-insensitive)
      const exists = allLifeAreas.some(
        (a) => a.label.toLowerCase() === data.label.toLowerCase()
      );
      if (exists) return null;

      const newArea: LifeArea = {
        id: `custom-${Date.now()}`,
        label: data.label,
        icon: data.icon,
        color: data.color,
        isCustom: true,
      };
      setCustomLifeAreas((prev) => [...prev, newArea]);
      return newArea.id;
    },
    [allLifeAreas]
  );

  const updateLifeArea = React.useCallback(
    (
      id: string,
      updates: { label?: string; icon?: IconComponent; color?: GoalColor }
    ) => {
      // Only allow updating custom areas
      setCustomLifeAreas((prev) =>
        prev.map((area) => (area.id === id ? { ...area, ...updates } : area))
      );
    },
    []
  );

  const removeLifeArea = React.useCallback((id: string) => {
    setCustomLifeAreas((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    allLifeAreas,
    customLifeAreas,
    addLifeArea,
    updateLifeArea,
    removeLifeArea,
  };
}
