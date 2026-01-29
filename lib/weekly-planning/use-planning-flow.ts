"use client";

/**
 * Hook for managing the weekly planning flow state.
 * Simplified to a single-step scheduling flow.
 */

import * as React from "react";
import type { UsePlanningFlowOptions, UsePlanningFlowReturn } from "./types";

/**
 * Hook for managing the planning flow.
 * Handles confirm/cancel actions for the planning session.
 */
export function usePlanningFlow({
  isActive: _isActive,
  weekDates: _weekDates,
  onConfirm,
  onCancel,
}: UsePlanningFlowOptions): UsePlanningFlowReturn {
  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const confirm = React.useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const cancel = React.useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    confirm,
    cancel,
  };
}
