/**
 * =============================================================================
 * File: invite-popover.tsx
 * =============================================================================
 *
 * Founding Member invite popover for the shell toolbar.
 *
 * Displays a user's remaining monthly invites, a shareable invite code,
 * and a list of users who have already accepted. Hardcoded with demo data
 * for prototype purposes.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a toolbar trigger button with a remaining-invite badge.
 * - Show invite code with copy-to-clipboard functionality.
 * - Display accepted invites and empty placeholder slots.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting invite state or syncing with a backend.
 * - Managing user authentication or membership status.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Fully self-contained with inline demo data — no props required.
 * - Uses Radix Popover matching the date-picker pattern.
 * - Designed for the desktop toolbar only.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - InvitePopover
 */

"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import {
  RiGiftLine,
  RiFileCopyLine,
  RiCheckLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import type { InviteAcceptance } from "@/lib/types";

// =============================================================================
// Demo Data
// =============================================================================

const INVITE_LINK = "https://superos.app/invite/A7X2";
const TOTAL_INVITES = 3;
const ACCEPTED_INVITES: InviteAcceptance[] = [
  {
    name: "Alex Rivera",
    date: "Feb 8",
    avatarInitial: "A",
    avatarColor: "bg-violet-500",
  },
];
const REMAINING_INVITES = TOTAL_INVITES - ACCEPTED_INVITES.length;

// =============================================================================
// InvitePopover
// =============================================================================

export function InvitePopover() {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some environments — silent fallback
    }
  }, []);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className={cn(
            "relative flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background hover:text-foreground",
            open ? "text-foreground" : "text-muted-foreground",
          )}
          title="Founding Member Invites"
        >
          <RiGiftLine className="size-4" />
          {/* Remaining-invite badge */}
          {REMAINING_INVITES > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold leading-none text-white">
              {REMAINING_INVITES}
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 w-72 rounded-xl border border-border bg-popover shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          {/* Title */}
          <div className="px-4 pt-4 pb-1">
            <h3 className="text-sm font-semibold text-foreground">
              Gift SuperOS to a Friend
            </h3>
          </div>

          {/* Subtext */}
          <p className="px-4 pb-3 text-xs leading-relaxed text-muted-foreground">
            Send your personal invite link to give someone Founding Member
            access. You get {TOTAL_INVITES} invites each month.
          </p>

          {/* Invite link + copy button */}
          <div className="px-4 pb-4">
            <div
              className={cn(
                "flex items-center gap-0 rounded-lg border transition-all",
                copied
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-muted/40",
              )}
            >
              <span className="min-w-0 flex-1 truncate px-3 py-2 text-xs text-muted-foreground">
                {INVITE_LINK}
              </span>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-l px-3 py-2 text-xs font-medium transition-colors",
                  copied
                    ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "border-border text-foreground hover:bg-muted",
                )}
              >
                {copied ? (
                  <>
                    <RiCheckLine className="size-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <RiFileCopyLine className="size-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invites this month — header */}
          <div className="flex items-baseline justify-between px-4 pb-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              Invites this month
            </span>
            <span className="text-[11px] font-semibold text-foreground">
              {REMAINING_INVITES} left
            </span>
          </div>

          {/* Invite list */}
          <div className="px-4 pb-4">
            <div className="space-y-1.5">
              {/* Filled slots */}
              {ACCEPTED_INVITES.map((invite) => (
                <div
                  key={invite.name}
                  className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-2.5 py-2"
                >
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
                      invite.avatarColor,
                    )}
                  >
                    {invite.avatarInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {invite.name}
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground">
                      Founding Member · {invite.date}
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: REMAINING_INVITES }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-2.5 rounded-lg border border-dashed border-border/50 px-2.5 py-2"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/20" />
                  <span className="text-[11px] text-muted-foreground/50">
                    Invite available
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
