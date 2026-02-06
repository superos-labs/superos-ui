/**
 * =============================================================================
 * File: shell.tsx
 * =============================================================================
 *
 * Top-level application shell layout primitives.
 *
 * Provides the outer structural containers that frame the SuperOS app,
 * including a toolbar area and a main content surface.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define the overall vertical app layout.
 * - Provide a consistent toolbar container.
 * - Provide a framed content surface.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing routing or navigation.
 * - Rendering specific application content.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Shell fills the viewport height.
 * - Content is centered and visually elevated via ring and shadow.
 * - Uses data-slot attributes for styling hooks.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - Shell
 * - ShellToolbar
 * - ShellContent
 */

import * as React from "react";

import { cn } from "@/lib/utils";

function Shell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shell"
      className={cn(
        "flex h-screen flex-col overflow-hidden bg-muted p-4",
        className,
      )}
      {...props}
    />
  );
}

function ShellToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shell-toolbar"
      className={cn(
        "relative flex min-h-12 items-center justify-between px-1 py-2",
        className,
      )}
      {...props}
    />
  );
}

function ShellContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shell-content"
      className={cn(
        "mx-auto w-full flex-1 bg-background rounded-xl shadow-sm ring-1 ring-border",
        className,
      )}
      {...props}
    />
  );
}

export { Shell, ShellToolbar, ShellContent };
