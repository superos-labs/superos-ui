/**
 * =============================================================================
 * File: connect-prompt.tsx
 * =============================================================================
 *
 * Connection call-to-action for an unconnected calendar provider.
 *
 * Displays provider branding, a short description, and a primary
 * "Connect" button that initiates the OAuth / connection flow.
 *
 * This component is presentational.
 * It receives the target provider and emits user intent upward.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render provider icon, name, and brand styling.
 * - Communicate the value of connecting the provider.
 * - Trigger connect callback on user action.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Performing the actual connection.
 * - Handling OAuth or tokens.
 * - Managing connection state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Centered, empty-state style layout.
 * - Uses provider brand color for subtle visual identity.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ConnectPrompt
 * - ConnectPromptProps
 */

"use client";

import { cn } from "@/lib/utils";
import { RiLinksLine } from "@remixicon/react";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-sync";
import type { CalendarProvider } from "@/lib/calendar-sync";

interface ConnectPromptProps {
  /** The provider to connect */
  provider: CalendarProvider;
  /** Callback when user clicks connect */
  onConnect: () => void;
}

/**
 * Connect CTA shown when a provider is not connected.
 * Displays provider branding and a connect button.
 */
function ConnectPrompt({ provider, onConnect }: ConnectPromptProps) {
  const config = CALENDAR_PROVIDERS[provider];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {/* Provider Icon - Circular with subtle shadow */}
      <div
        className={cn(
          "mb-5 flex size-16 items-center justify-center rounded-full",
          "ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.08]",
          "shadow-sm",
        )}
        style={{
          backgroundColor: `${config.brandColor}10`,
          color: config.brandColor,
        }}
      >
        <Icon className="size-7" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-sm font-medium text-foreground">
        Connect {config.name}
      </h3>

      {/* Description */}
      <p className="mb-6 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
        See your events in SuperOS and sync your blueprint as focus time blocks.
      </p>

      {/* Connect Button - Full width with icon */}
      <button
        onClick={onConnect}
        className={cn(
          "flex w-full max-w-[200px] items-center justify-center gap-2",
          "rounded-lg bg-foreground px-4 py-2.5",
          "text-sm font-medium text-background",
          "transition-colors duration-150 hover:bg-foreground/90",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <RiLinksLine className="size-4" />
        <span>Connect</span>
      </button>
    </div>
  );
}

export { ConnectPrompt };
export type { ConnectPromptProps };
