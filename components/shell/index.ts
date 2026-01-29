// =============================================================================
// Public API for the Shell feature component
// =============================================================================

// Core component
export { ShellContentComponent } from "./shell-content";
export type { ShellContentComponentProps } from "./shell-content";

// Mobile toolbar (for responsive layouts)
export { MobileToolbar } from "./mobile-toolbar";
export type { MobileToolbarProps } from "./mobile-toolbar";

// State orchestration hook
export { useShellState } from "./use-shell-state";

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

// Types
export type {
  ShellContentProps,
  UseShellStateOptions,
  UseShellStateReturn,
  ShellLayoutState,
} from "./shell-types";
