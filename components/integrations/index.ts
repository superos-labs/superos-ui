/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public export surface for the Integrations UI domain.
 *
 * Re-exports all integration-related building blocks, including:
 * - Provider discovery and listing
 * - Sidebar navigation
 * - Integration cards and badges
 * - Companion app promotion
 * - Calendar provider settings and sync configuration
 *
 * Serves as the single import entry point for integrations UI.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Centralize and organize integrations-related exports.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Defining component behavior.
 * - Owning business logic.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ProviderBadge (+ props)
 * - IntegrationsSidebar (+ props)
 * - IntegrationList (+ props)
 * - IntegrationCard (+ props)
 * - AppCard, APP_ORDER (+ props, types)
 * - Calendar integration components (+ props)
 */

export { ProviderBadge } from "./provider-badge";
export type { ProviderBadgeProps } from "./provider-badge";

export { IntegrationsSidebar } from "./integrations-sidebar";
export type { IntegrationsSidebarProps } from "./integrations-sidebar";

export { IntegrationList } from "./integration-list";
export type { IntegrationListProps } from "./integration-list";

export { IntegrationCard } from "./integration-card";
export type { IntegrationCardProps } from "./integration-card";

export { AppCard, APP_ORDER } from "./app-card";
export type { AppCardProps, AppType } from "./app-card";

// Calendar settings components
export {
  ProviderSettingsView,
  ConnectPrompt,
  CalendarList,
  CalendarRow,
  ExportSection,
} from "./calendar";
export type {
  ProviderSettingsViewProps,
  ConnectPromptProps,
  CalendarListProps,
  CalendarRowProps,
  ExportSectionProps,
} from "./calendar";
