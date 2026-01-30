/**
 * Integrations module - External calendar integration components.
 *
 * @example
 * ```tsx
 * import {
 *   ProviderBadge,
 *   IntegrationsSidebar,
 *   IntegrationList,
 *   IntegrationCard,
 *   ProviderSettingsView,
 * } from "@/components/integrations";
 * ```
 */

export { ProviderBadge } from "./provider-badge";
export type { ProviderBadgeProps } from "./provider-badge";

export { IntegrationsSidebar } from "./integrations-sidebar";
export type { IntegrationsSidebarProps } from "./integrations-sidebar";

export { IntegrationList } from "./integration-list";
export type { IntegrationListProps } from "./integration-list";

export { IntegrationCard } from "./integration-card";
export type { IntegrationCardProps } from "./integration-card";

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
