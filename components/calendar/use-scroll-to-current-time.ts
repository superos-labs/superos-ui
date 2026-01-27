"use client";

import * as React from "react";
import { getGridHeightFromZoom } from "./calendar-types";

export interface UseScrollToCurrentTimeOptions {
  /** Zoom level (50-150) for grid height calculation */
  zoom?: number;
  /** Key that triggers scroll when changed (e.g., Date.now() on "Today" click) */
  triggerKey?: string | number;
  /** Whether to enable auto-scroll (should be true only when viewing current day/week) */
  enabled?: boolean;
}

/**
 * Hook to scroll the calendar to the current time on mount and when triggerKey changes.
 * Positions the current time slightly above center (~35% from top) for optimal visibility.
 */
export function useScrollToCurrentTime(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  { zoom = 100, triggerKey, enabled = true }: UseScrollToCurrentTimeOptions = {}
): void {
  React.useLayoutEffect(() => {
    if (!enabled || !scrollRef.current) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const gridHeight = getGridHeightFromZoom(zoom);
    const pixelsFromTop = (currentMinutes / 1440) * gridHeight;

    const container = scrollRef.current;
    const viewportHeight = container.clientHeight;

    // Position current time at ~35% from top (above center)
    const offset = viewportHeight * 0.35;
    const targetScroll = Math.max(0, pixelsFromTop - offset);

    // Clamp to valid range
    const maxScroll = container.scrollHeight - viewportHeight;
    container.scrollTop = Math.min(targetScroll, Math.max(0, maxScroll));
  }, [triggerKey, zoom, enabled]);
}
