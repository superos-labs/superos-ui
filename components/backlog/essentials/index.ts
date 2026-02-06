/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public export surface for backlog Essentials components and types.
 *
 * Acts as the single entry point for importing Essentials-related UI primitives,
 * orchestration components, and shared types.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export core Essentials components.
 * - Re-export associated prop types.
 * - Re-export shared Essentials domain/UI types.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Containing logic.
 * - Defining behavior or styling.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Consumers should import from this file instead of deep paths.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - EssentialsSection
 * - EssentialRow, SleepRow
 * - InlineEssentialCreator
 * - EssentialsCTA
 * - EssentialItem, NewEssentialData
 * - EssentialSlot, EssentialTemplate, EssentialConfig
 */

// =============================================================================
// Components
// =============================================================================

export { EssentialsSection } from "./essentials-section";
export type { EssentialsSectionProps } from "./essentials-section";

export { EssentialRow, SleepRow } from "./essential-row";
export type { EssentialRowProps, SleepRowProps } from "./essential-row";

export { InlineEssentialCreator } from "./inline-essential-creator";
export type { InlineEssentialCreatorProps } from "./inline-essential-creator";

export { EssentialsCTA } from "./essentials-cta";
export type { EssentialsCTAProps } from "./essentials-cta";

// =============================================================================
// Types
// =============================================================================

export type {
  EssentialItem,
  NewEssentialData,
  EssentialSlot,
  EssentialTemplate,
  EssentialConfig,
} from "./essential-types";
