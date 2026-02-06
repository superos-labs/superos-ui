/**
 * =============================================================================
 * File: index.ts
 * =============================================================================
 *
 * Public export surface for calendar integration UI components.
 *
 * Centralizes and re-exports all integration-related views and building blocks
 * used by provider settings and sync configuration flows.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Provide a single import entry point for integrations UI.
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
 * - ProviderSettingsView (+ props)
 * - ConnectPrompt (+ props)
 * - CalendarList (+ props)
 * - CalendarRow (+ props)
 * - ExportSection (+ props)
 */

export { ProviderSettingsView } from "./provider-settings-view";
export type { ProviderSettingsViewProps } from "./provider-settings-view";

export { ConnectPrompt } from "./connect-prompt";
export type { ConnectPromptProps } from "./connect-prompt";

export { CalendarList } from "./calendar-list";
export type { CalendarListProps } from "./calendar-list";

export { CalendarRow } from "./calendar-row";
export type { CalendarRowProps } from "./calendar-row";

export { ExportSection } from "./export-section";
export type { ExportSectionProps } from "./export-section";
