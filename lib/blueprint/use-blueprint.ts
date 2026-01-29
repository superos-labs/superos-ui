"use client";

/**
 * Hook for managing the user's blueprint (typical week template).
 * In-memory only — state resets on page refresh.
 */

import * as React from "react";
import type { Blueprint, UseBlueprintReturn } from "./types";

/**
 * Hook for managing the blueprint template.
 * Provides CRUD operations for the blueprint with in-memory state only.
 */
export function useBlueprint(): UseBlueprintReturn {
  // -------------------------------------------------------------------------
  // State (in-memory only)
  // -------------------------------------------------------------------------
  const [blueprint, setBlueprint] = React.useState<Blueprint | null>(null);

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

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    blueprint,
    hasBlueprint: blueprint !== null,
    saveBlueprint,
    updateBlueprint,
    clearBlueprint,
  };
}
