"use client";

/**
 * Hook for managing the user's blueprint (typical week template).
 * Uses localStorage for persistence in the demo.
 */

import * as React from "react";
import type { Blueprint, UseBlueprintOptions, UseBlueprintReturn } from "./types";

const DEFAULT_STORAGE_KEY = "superos-blueprint";

/**
 * Hook for managing the blueprint template.
 * Provides CRUD operations for the blueprint with localStorage persistence.
 */
export function useBlueprint(
  options: UseBlueprintOptions = {}
): UseBlueprintReturn {
  const { storageKey = DEFAULT_STORAGE_KEY } = options;

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [blueprint, setBlueprint] = React.useState<Blueprint | null>(() => {
    // Load from localStorage on mount
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // -------------------------------------------------------------------------
  // Persist to localStorage
  // -------------------------------------------------------------------------
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (blueprint) {
        localStorage.setItem(storageKey, JSON.stringify(blueprint));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [blueprint, storageKey]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const saveBlueprint = React.useCallback((newBlueprint: Blueprint) => {
    setBlueprint({
      ...newBlueprint,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const updateBlueprint = React.useCallback((updates: Partial<Blueprint>) => {
    setBlueprint((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const clearBlueprint = React.useCallback(() => {
    setBlueprint(null);
  }, []);

  const getDefaultIntention = React.useCallback(
    (goalId: string): number | null => {
      if (!blueprint) return null;
      const intention = blueprint.intentions.find((i) => i.goalId === goalId);
      return intention?.target ?? null;
    },
    [blueprint]
  );

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    blueprint,
    hasBlueprint: blueprint !== null,
    saveBlueprint,
    updateBlueprint,
    clearBlueprint,
    getDefaultIntention,
  };
}
