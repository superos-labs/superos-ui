/**
 * =============================================================================
 * File: use-integrations-sidebar.ts
 * =============================================================================
 *
 * Client-side hook for managing integrations sidebar UI state.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Track open/close state.
 * - Manage navigation between list and provider views.
 */

"use client";

import * as React from "react";
import type {
  CalendarProvider,
  IntegrationsSidebarView,
  UseIntegrationsSidebarReturn,
} from "./types";

export function useIntegrationsSidebar(): UseIntegrationsSidebarReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<IntegrationsSidebarView>(
    {
      type: "list",
    }
  );

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
