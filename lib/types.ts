/**
 * Shared types used across the application.
 * Single source of truth for cross-cutting type definitions.
 */

import type React from "react";
import type { GoalColor } from "./colors";

// =============================================================================
// Block Types
// =============================================================================

/**
 * Block type determines whether a calendar block represents
 * a goal work session, a specific task, or a commitment.
 */
export type BlockType = "goal" | "task" | "commitment";

/**
 * Block status determines the visual state and behavior of a block.
 * - planned: Default state, active block
 * - completed: Block has been marked as done
 * - blueprint: Template block shown only in planning mode
 */
export type BlockStatus = "planned" | "completed" | "blueprint";

// =============================================================================
// Component Types
// =============================================================================

/**
 * Standard icon component type used throughout the application.
 * Compatible with Remix Icons and similar icon libraries.
 */
export type IconComponent = React.ComponentType<{ className?: string }>;

// =============================================================================
// Goal & Life Area Types
// =============================================================================

/**
 * Life area for categorizing goals.
 * Used in goal creation UI and organization.
 */
export interface LifeArea {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

/**
 * Icon option for the goal icon picker.
 * Used in goal creation UI.
 */
export interface GoalIconOption {
  icon: IconComponent;
  label: string;
}
