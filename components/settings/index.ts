/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Barrel file for Life Area settings components.
 *
 * Centralizes exports for modal-based Life Area creation and management
 * surfaces used in settings and onboarding flows.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export Life Area modal components.
 * - Re-export associated public prop types.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing UI logic.
 * - Owning Life Area domain behavior.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Keeps import paths short and stable for consumers.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - LifeAreaCreatorModal
 * - LifeAreaCreatorModalProps
 * - LifeAreaManagerModal
 * - LifeAreaManagerModalProps
 */

export { LifeAreaCreatorModal } from "./life-area-creator-modal";
export type { LifeAreaCreatorModalProps } from "./life-area-creator-modal";

export { LifeAreaManagerModal } from "./life-area-manager-modal";
export type { LifeAreaManagerModalProps } from "./life-area-manager-modal";
