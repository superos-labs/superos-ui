/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Barrel file for Life Area settings components.
 *
 * Centralizes exports for the Life Area manager modal used in settings
 * and goal-detail flows.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export Life Area manager modal and its prop types.
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
 * - LifeAreaManagerModal
 * - LifeAreaManagerModalProps
 */

export { LifeAreaManagerModal } from "./life-area-manager-modal";
export type { LifeAreaManagerModalProps } from "./life-area-manager-modal";
