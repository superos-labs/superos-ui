"use client";

import * as React from "react";
import {
  RiFileCopyLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiAddLine,
  RiClipboardLine,
  RiFileCopy2Line,
} from "@remixicon/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { CalendarEvent } from "./calendar-types";

// ============================================================================
// Block Context Menu
// ============================================================================

interface BlockContextMenuProps {
  children: React.ReactNode;
  event: CalendarEvent;
  onCopy: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** When undefined, the mark complete/incomplete action is hidden (e.g., for blueprint blocks) */
  onToggleComplete?: () => void;
}

/**
 * Context menu for calendar block events.
 * Provides copy, duplicate, delete, and mark complete actions.
 * The mark complete action is hidden when onToggleComplete is undefined.
 */
function BlockContextMenu({
  children,
  event,
  onCopy,
  onDuplicate,
  onDelete,
  onToggleComplete,
}: BlockContextMenuProps) {
  const isCompleted = event.status === "completed";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onCopy}>
          <RiFileCopyLine className="size-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <RiFileCopy2Line className="size-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        {onToggleComplete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onToggleComplete}>
              <RiCheckLine className="size-4" />
              {isCompleted ? "Mark incomplete" : "Mark complete"}
              <ContextMenuShortcut>⌘⏎</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={onDelete}>
          <RiDeleteBinLine className="size-4" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ============================================================================
// Empty Space Context Menu
// ============================================================================

interface EmptySpaceContextMenuProps {
  children: React.ReactNode;
  canPaste: boolean;
  onPaste: () => void;
  onCreate: () => void;
}

/**
 * Context menu for empty calendar grid space.
 * Provides create block and paste actions.
 */
function EmptySpaceContextMenu({
  children,
  canPaste,
  onPaste,
  onCreate,
}: EmptySpaceContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onCreate}>
          <RiAddLine className="size-4" />
          Create block
        </ContextMenuItem>
        <ContextMenuItem onClick={onPaste} disabled={!canPaste}>
          <RiClipboardLine className="size-4" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export { BlockContextMenu, EmptySpaceContextMenu };
export type { BlockContextMenuProps, EmptySpaceContextMenuProps };
