/**
 * =============================================================================
 * File: types.ts
 * =============================================================================
 *
 * Shared cross-cutting type definitions.
 *
 * Provides small, foundational types that are reused across multiple
 * domains such as calendar blocks, goals, life areas, and UI components.
 *
 * Acts as a single source of truth for lightweight, app-wide contracts.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define block-related enums/unions.
 * - Define standard icon component typing.
 * - Define goal and life-area related interfaces.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Keep this file focused on broadly shared primitives.
 * - Avoid feature-specific or domain-heavy types here.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - BlockType
 * - BlockStatus
 * - IconComponent
 * - LifeArea
 * - GoalIconOption
 */

import type React from "react";
import type { GoalColor } from "./colors";

// =============================================================================
// Block Types
// =============================================================================

/**
 * Block type determines whether a calendar block represents
 * a goal work session, a specific task, an essential, or an external event.
 */
export type BlockType = "goal" | "task" | "essential" | "external";

/**
 * Block status determines the visual state and behavior of a block.
 * - planned: Default state, active block
 * - completed: Block has been marked as done
 */
export type BlockStatus = "planned" | "completed";

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
  /** Whether this is a user-created custom life area */
  isCustom?: boolean;
}

/**
 * Icon option for the goal icon picker.
 * Used in goal creation UI.
 */
export interface GoalIconOption {
  icon: IconComponent;
  label: string;
}
