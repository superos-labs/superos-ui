/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public API surface for the Shell feature.
 *
 * Centralized export hub for:
 * - Shell composition components
 * - Layout variants (desktop / mobile)
 * - Toolbars and floating controls
 * - Shell orchestration hooks
 * - Domain-specific handler hooks
 * - Shared shell types
 *
 * Note: useShellFocus, useToastAggregator, and useMobileNavigation are
 * inlined directly in use-shell-wiring.ts and are not exported separately.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export public shell components, hooks, and types.
 * - Express the canonical import paths for Shell consumers.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing behavior.
 * - Aggregating runtime logic.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Prefer explicit named exports over wildcard exports.
 * - Group exports by conceptual area for readability.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - (Barrel file; see named exports below)
 */

// Core component
export { ShellContentComponent } from "./shell-content";
export type { ShellContentComponentProps } from "./shell-content";

// Toolbar components
export {
  ShellMobileToolbar,
  ShellDesktopToolbar,
  BlueprintEditToolbar,
  OnboardingBlueprintToolbar,
} from "./shell-toolbars";
export type {
  ShellMobileToolbarProps,
  ShellDesktopToolbarProps,
  BlueprintEditToolbarProps,
} from "./shell-toolbars";

// Invite popover
export { InvitePopover } from "./invite-popover";

// Feedback button
export { FeedbackButton } from "./feedback-button";
export type { FeedbackButtonProps } from "./feedback-button";

// Mobile toolbar (standalone, for external layouts)
export { MobileToolbar } from "./mobile-toolbar";
export type { MobileToolbarProps } from "./mobile-toolbar";

// State orchestration hook
export { useShellState } from "./use-shell-state";

// Shell wiring hook
export { useShellWiring } from "./use-shell-wiring";
export type { ShellWiring } from "./use-shell-wiring";

// Layout components
export { ShellDesktopLayout } from "./shell-desktop-layout";
export type { ShellDesktopLayoutProps } from "./shell-desktop-layout";

export { ShellMobileLayout } from "./shell-mobile-layout";
export type { ShellMobileLayoutProps } from "./shell-mobile-layout";

// Internal hooks (for advanced customization)
export { useShellLayout } from "./use-shell-layout";
export type { UseShellLayoutReturn, OnboardingStep } from "./use-shell-layout";

export { useExternalDragPreview } from "./use-external-drag-preview";
export type {
  UseExternalDragPreviewOptions,
  UseExternalDragPreviewReturn,
} from "./use-external-drag-preview";

export { useUndoableHandlers } from "./use-undoable-handlers";

export { useGoalHandlers } from "./use-goal-handlers";
export type {
  UseGoalHandlersOptions,
  UseGoalHandlersReturn,
} from "./use-goal-handlers";

export { usePlanningIntegration } from "./use-planning-integration";
export type {
  UsePlanningIntegrationOptions,
  UsePlanningIntegrationReturn,
} from "./use-planning-integration";

export { useBlueprintHandlers } from "./use-blueprint-handlers";
export type {
  UseBlueprintHandlersOptions,
  UseBlueprintHandlersReturn,
} from "./use-blueprint-handlers";

export { useLifeAreas } from "./use-life-areas";
export type { UseLifeAreasReturn } from "./use-life-areas";

export { useEssentialHandlers } from "./use-essential-handlers";
export type {
  UseEssentialHandlersOptions,
  UseEssentialHandlersReturn,
} from "./use-essential-handlers";

// Types
export type {
  ShellContentProps,
  UseShellStateOptions,
  UseShellStateReturn,
  ShellLayoutState,
} from "./shell-types";
