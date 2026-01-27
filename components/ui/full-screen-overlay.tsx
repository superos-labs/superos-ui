"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiArrowLeftLine } from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

export interface FullScreenOverlayProps {
  /** Whether the overlay is open */
  open: boolean;
  /** Called when the overlay should close */
  onClose: () => void;
  /** Overlay content */
  children: React.ReactNode;
  /** Title for the header */
  title?: string;
  /** Whether to show back arrow (left) or close button (right) */
  closeStyle?: "back" | "close";
  /** Additional class name for the overlay container */
  className?: string;
  /** Additional class name for the content area */
  contentClassName?: string;
  /** Optional header right content */
  headerRight?: React.ReactNode;
}

// =============================================================================
// FullScreenOverlay Component
// =============================================================================

/**
 * Full-screen overlay for mobile that takes over the entire viewport.
 *
 * Used for:
 * - Backlog view on mobile
 * - Any content that needs full-screen focus
 *
 * Features:
 * - Slides in from right
 * - Fixed header with title and close button
 * - Scrollable content area
 * - Escape key to close
 *
 * @example
 * ```tsx
 * <FullScreenOverlay
 *   open={showBacklog}
 *   onClose={() => setShowBacklog(false)}
 *   title="Backlog"
 * >
 *   <Backlog ... />
 * </FullScreenOverlay>
 * ```
 */
export function FullScreenOverlay({
  open,
  onClose,
  children,
  title,
  closeStyle = "close",
  className,
  contentClassName,
  headerRight,
}: FullScreenOverlayProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!open) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  const CloseIcon = closeStyle === "back" ? RiArrowLeftLine : RiCloseLine;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background",
        "animate-in slide-in-from-right duration-300 ease-out",
        className
      )}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        {/* Left: close button (back style) or spacer */}
        {closeStyle === "back" ? (
          <button
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Go back"
          >
            <CloseIcon className="size-5" />
          </button>
        ) : (
          <div className="size-10" />
        )}

        {/* Center: title */}
        {title && (
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
        )}

        {/* Right: close button (close style) or custom content or spacer */}
        {closeStyle === "close" ? (
          <button
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <CloseIcon className="size-5" />
          </button>
        ) : headerRight ? (
          headerRight
        ) : (
          <div className="size-10" />
        )}
      </header>

      {/* Content */}
      <div
        className={cn(
          "scrollbar-hidden flex-1 overflow-y-auto",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
