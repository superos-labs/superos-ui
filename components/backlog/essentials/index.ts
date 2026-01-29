/**
 * Essentials subfolder - components for essential management in the Backlog.
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
