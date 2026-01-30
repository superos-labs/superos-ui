"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-sync";
import type { CalendarProvider } from "@/lib/calendar-sync";

interface ProviderBadgeProps {
  provider: CalendarProvider;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Small badge showing a calendar provider's icon.
 * Used on external blocks to indicate the source calendar.
 */
function ProviderBadge({
  provider,
  size = "sm",
  className,
}: ProviderBadgeProps) {
  const config = CALENDAR_PROVIDERS[provider];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "size-4 p-0.5",
    md: "size-5 p-1",
  };

  const iconSizeClasses = {
    sm: "size-2.5",
    md: "size-3",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded bg-white/90 shadow-sm",
        sizeClasses[size],
        className,
      )}
      title={config.name}
      style={{ color: config.brandColor }}
    >
      <Icon className={iconSizeClasses[size]} />
    </div>
  );
}

export { ProviderBadge };
export type { ProviderBadgeProps };
