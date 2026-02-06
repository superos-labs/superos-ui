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
 * This file defines the intended integration boundary for consumers of the
 * Shell feature and should remain stable and well-curated.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Re-export all public shell components, hooks, and types.
 * - Express the canonical import paths for Shell consumers.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Implementing behavior.
 * - Aggregating runtime logic.
 * - Enforcing architectural constraints.
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

export { useShellFocus } from "./use-shell-focus";
export type {
  UseShellFocusOptions,
  UseShellFocusReturn,
  FocusSessionState,
} from "./use-shell-focus";

export { useExternalDragPreview } from "./use-external-drag-preview";
export type {
  UseExternalDragPreviewOptions,
  UseExternalDragPreviewReturn,
} from "./use-external-drag-preview";

export { useToastAggregator } from "./use-toast-aggregator";
export type { UseToastAggregatorReturn } from "./use-toast-aggregator";

export { useUndoableHandlers } from "./use-undoable-handlers";

// Extracted hooks
export { useMobileNavigation } from "./use-mobile-navigation";
export type {
  UseMobileNavigationOptions,
  UseMobileNavigationReturn,
} from "./use-mobile-navigation";

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
