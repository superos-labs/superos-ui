/**
 * =============================================================================
 * File: provider-badge.tsx
 * =============================================================================
 *
 * Compact visual indicator for a calendar provider.
 *
 * Renders the provider's icon inside a small rounded badge,
 * typically used on external calendar blocks or event surfaces
 * to communicate the source provider at a glance.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render provider icon with brand color.
 * - Support small and medium size variants.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Handling interactions.
 * - Managing provider state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses a subtle white background and shadow for legibility.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ProviderBadge
 * - ProviderBadgeProps
 */

"use client";

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
