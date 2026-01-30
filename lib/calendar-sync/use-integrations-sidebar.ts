"use client";

import * as React from "react";
import type {
  CalendarProvider,
  IntegrationsSidebarView,
  UseIntegrationsSidebarReturn,
} from "./types";

/**
 * Hook for managing the integrations sidebar state.
 *
 * Handles:
 * - Sidebar open/close state
 * - Navigation between list view and provider settings view
 *
 * @example
 * ```tsx
 * const {
 *   isOpen,
 *   currentView,
 *   open,
 *   close,
 *   navigateToProvider,
 *   navigateToList,
 * } = useIntegrationsSidebar();
 * ```
 */
export function useIntegrationsSidebar(): UseIntegrationsSidebarReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<IntegrationsSidebarView>({
    type: "list",
  });

  const open = React.useCallback(() => {
    setIsOpen(true);
    setCurrentView({ type: "list" });
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const navigateToProvider = React.useCallback((provider: CalendarProvider) => {
    setCurrentView({ type: "provider", provider });
  }, []);

  const navigateToList = React.useCallback(() => {
    setCurrentView({ type: "list" });
  }, []);

  return {
    isOpen,
    currentView,
    open,
    close,
    navigateToProvider,
    navigateToList,
  };
}
