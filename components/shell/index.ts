// =============================================================================
// Public API for the Shell feature component
// =============================================================================

// Core component
export { ShellContentComponent } from "./shell-content";
export type { ShellContentComponentProps } from "./shell-content";

// State orchestration hook
export { useShellState } from "./use-shell-state";

// Internal hooks (for advanced customization)
export {
  useShellLayout,
  useShellFocus,
  useExternalDragPreview,
  useToastAggregator,
} from "./use-shell-hooks";
export type {
  UseShellLayoutReturn,
  UseShellFocusOptions,
  UseShellFocusReturn,
  UseExternalDragPreviewOptions,
  UseExternalDragPreviewReturn,
  UseToastAggregatorReturn,
  FocusSessionState,
} from "./use-shell-hooks";

// Types
export type {
  ShellContentProps,
  UseShellStateOptions,
  UseShellStateReturn,
  ShellLayoutState,
} from "./shell-types";
