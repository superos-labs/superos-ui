/**
 * =============================================================================
 * File: bottom-sheet.tsx
 * =============================================================================
 *
 * Mobile-friendly bottom sheet dialog that slides up from the bottom of the screen.
 *
 * Used for lightweight, focused detail views and quick actions, especially on
 * small screens where full modals feel heavy.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a modal sheet anchored to the bottom viewport edge.
 * - Handle open/close lifecycle and escape-key dismissal.
 * - Lock body scroll while open.
 * - Provide optional header, close button, and drag handle.
 * - Support drag-down-to-dismiss interaction.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing application state that determines when the sheet opens.
 * - Performing any business logic for the content.
 * - Persisting or validating data.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Returns null when `open` is false.
 * - Uses pointer events for drag gestures.
 * - Backdrop click can optionally close the sheet.
 * - Max height is constrained to 85vh.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - BottomSheet
 * - BottomSheetProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCloseLine } from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

export interface BottomSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Called when the sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Optional title for the header */
  title?: string;
  /** Whether to show the close button in header */
  showCloseButton?: boolean;
  /** Whether to show the drag handle */
  showDragHandle?: boolean;
  /** Whether clicking backdrop closes the sheet */
  closeOnBackdropClick?: boolean;
  /** Additional class name for the sheet container */
  className?: string;
  /** Additional class name for the content area */
  contentClassName?: string;
}

// =============================================================================
// BottomSheet Component
// =============================================================================

/**
 * Mobile-friendly bottom sheet that slides up from the bottom of the screen.
 *
 * Features:
 * - Slides up with animation
 * - Backdrop overlay
 * - Drag handle for visual affordance
 * - Swipe down to dismiss (via drag handle)
 * - Scrollable content area
 *
 * @example
 * ```tsx
 * <BottomSheet open={isOpen} onClose={() => setIsOpen(false)} title="Block Details">
 *   <BlockContent />
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  open,
  onClose,
  children,
  title,
  showCloseButton = true,
  showDragHandle = true,
  closeOnBackdropClick = true,
  className,
  contentClassName,
}: BottomSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const dragStartY = React.useRef(0);

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

  // Drag to dismiss handlers
  const handleDragStart = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    // Only allow dragging down
    setDragOffset(Math.max(0, delta));
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // If dragged more than 100px, close
    if (dragOffset > 100) {
      onClose();
    }
    setDragOffset(0);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
          "animate-in fade-in-0 duration-200",
        )}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col",
          "rounded-t-2xl bg-background shadow-xl ring-1 ring-border",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          !isDragging && "transition-transform",
          className,
        )}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
        }}
      >
        {/* Drag handle */}
        {showDragHandle && (
          <div
            className="flex shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
          >
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Header (optional) */}
        {(title || showCloseButton) && (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 pb-3">
            {title ? (
              <h2 className="text-base font-semibold text-foreground">
                {title}
              </h2>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <RiCloseLine className="size-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "scrollbar-hidden flex-1 overflow-y-auto",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}
