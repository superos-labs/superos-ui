/**
 * =============================================================================
 * File: keyboard-shortcuts.tsx
 * =============================================================================
 *
 * Modal overlay that displays available keyboard shortcuts.
 *
 * Provides a categorized, platform-aware (Mac vs non-Mac) list of shortcuts
 * to help users discover and learn power-user interactions.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a modal dialog with backdrop.
 * - Lock body scroll while open.
 * - Handle escape-key dismissal.
 * - Detect platform to display appropriate modifier keys.
 * - Render shortcut categories and rows.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Registering or handling keyboard shortcuts.
 * - Managing application command logic.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Returns null when `open` is false.
 * - Modifier symbols adapt based on detected platform.
 * - Categories and shortcuts are defined locally in this file.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - KeyboardShortcuts
 * - KeyboardShortcutsProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiKeyboardLine } from "@remixicon/react";

// =============================================================================
// Platform Detection
// =============================================================================

function usePlatform() {
  const [isMac, setIsMac] = React.useState(true);

  React.useEffect(() => {
    // Detect platform on mount
    setIsMac(
      typeof navigator !== "undefined" &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    );
  }, []);

  return { isMac };
}

// =============================================================================
// Types
// =============================================================================

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

export interface KeyboardShortcutsProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
}

// =============================================================================
// Shortcut Key Badge
// =============================================================================

function ShortcutKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border",
        "bg-muted px-1.5 text-[11px] font-medium text-muted-foreground",
        "font-sans",
      )}
    >
      {children}
    </kbd>
  );
}

// =============================================================================
// Shortcut Row
// =============================================================================

function ShortcutRow({
  keys,
  description,
  isMac,
}: ShortcutItem & { isMac: boolean }) {
  // Replace modifier symbols based on platform
  const displayKeys = keys.map((key) => {
    if (key === "⌘" || key === "Cmd") return isMac ? "⌘" : "Ctrl";
    if (key === "⌥" || key === "Alt" || key === "Option")
      return isMac ? "⌥" : "Alt";
    if (key === "⇧" || key === "Shift") return "⇧";
    if (key === "⏎" || key === "Enter") return "⏎";
    if (key === "⌫" || key === "Backspace" || key === "Delete")
      return isMac ? "⌫" : "Del";
    return key;
  });

  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-foreground">{description}</span>
      <div className="flex shrink-0 items-center gap-1">
        {displayKeys.map((key, i) => (
          <ShortcutKey key={i}>{key}</ShortcutKey>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Shortcut Category Section
// =============================================================================

function ShortcutSection({
  title,
  shortcuts,
  isMac,
}: ShortcutCategory & { isMac: boolean }) {
  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col divide-y divide-border/50">
        {shortcuts.map((shortcut, i) => (
          <ShortcutRow key={i} {...shortcut} isMac={isMac} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Keyboard Shortcuts Data
// =============================================================================

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Calendar Blocks",
    shortcuts: [
      { keys: ["⌘", "C"], description: "Copy hovered block" },
      { keys: ["⌘", "V"], description: "Paste at cursor position" },
      { keys: ["⌘", "D"], description: "Duplicate to next day" },
      { keys: ["⌘", "⏎"], description: "Toggle complete" },
      { keys: ["⌫"], description: "Delete block" },
      { keys: ["⌥"], description: "Hold while dragging to duplicate" },
    ],
  },
  {
    title: "Precision Mode",
    shortcuts: [
      { keys: ["⇧"], description: "Hold while dragging for 1-min precision" },
      { keys: ["⇧"], description: "Hold while resizing for 1-min precision" },
      { keys: ["⇧"], description: "Hold while creating for 1-min duration" },
      { keys: ["⇧"], description: "Hold while dropping to allow overlaps" },
    ],
  },
  {
    title: "Calendar View",
    shortcuts: [
      { keys: ["+"], description: "Zoom in" },
      { keys: ["-"], description: "Zoom out" },
    ],
  },
  {
    title: "Deadlines",
    shortcuts: [
      { keys: ["⌘", "⏎"], description: "Toggle complete" },
      { keys: ["⌫"], description: "Remove deadline" },
    ],
  },
  {
    title: "Tasks",
    shortcuts: [
      { keys: ["⌫"], description: "Delete task (when hovered)" },
      { keys: ["Esc"], description: "Collapse expanded task" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["⌘", "Z"], description: "Undo last action" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
];

// =============================================================================
// Main Component
// =============================================================================

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  const { isMac } = usePlatform();

  // Handle escape key
  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
          "animate-in fade-in-0 duration-200",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "flex max-h-[85vh] flex-col overflow-hidden",
          "rounded-xl bg-background shadow-xl ring-1 ring-border",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <RiKeyboardLine className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-6">
            {SHORTCUT_CATEGORIES.map((category, i) => (
              <ShortcutSection key={i} {...category} isMac={isMac} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-4 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Shortcuts work when hovering over the relevant element
          </p>
        </div>
      </div>
    </>
  );
}
