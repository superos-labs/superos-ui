/**
 * Types for the blueprint system.
 * A blueprint is a template for a "typical week" that can be imported
 * during weekly planning to speed up schedule creation.
 */

import type { BlockColor } from "@/components/block";
import type { BlockType } from "@/lib/types";

// ============================================================================
// Blueprint Block
// ============================================================================

/**
 * A single block in the blueprint template.
 * Uses day-of-week (relative) instead of absolute dates.
 */
export interface BlueprintBlock {
  id: string;
  /** Day of week relative to user's week start preference (0-6) */
  dayOfWeek: number;
  /** Start time in minutes from midnight (0-1440) */
  startMinutes: number;
  /** Duration in minutes */
  durationMinutes: number;
  /** Block title */
  title: string;
  /** Block color */
  color: BlockColor;
  /** Block type: goal, task, or essential */
  blockType: BlockType;
  /** For goal/task blocks: the associated goal ID */
  sourceGoalId?: string;
  /** For essential blocks: the associated essential ID */
  sourceEssentialId?: string;
}

// ============================================================================
// Blueprint Intention
// ============================================================================

/**
 * Default intention for a goal in the blueprint.
 * Users can override during weekly planning.
 */
export interface BlueprintIntention {
  /** The goal this intention is for */
  goalId: string;
  /** Target value (interpreted based on goal's progressIndicator) */
  target: number;
}

// ============================================================================
// Blueprint
// ============================================================================

/**
 * The user's blueprint - a template for their typical week.
 * Contains both time blocks and default intention targets.
 */
export interface Blueprint {
  /** Template blocks representing a typical week */
  blocks: BlueprintBlock[];
  /** Default intention targets per goal */
  intentions: BlueprintIntention[];
  /** When this blueprint was last updated (ISO string) */
  updatedAt: string;
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseBlueprintReturn {
  /** The current blueprint (null if none exists) */
  blueprint: Blueprint | null;
  /** Whether a blueprint exists */
  hasBlueprint: boolean;
  /** Save a new blueprint (replaces existing) */
  saveBlueprint: (blueprint: Blueprint) => void;
  /** Update specific fields of the blueprint */
  updateBlueprint: (updates: Partial<Blueprint>) => void;
  /** Clear the blueprint */
  clearBlueprint: () => void;
  /** Get default intention for a goal from blueprint */
  getDefaultIntention: (goalId: string) => number | null;
}
