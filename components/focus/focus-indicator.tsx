"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatElapsedMsCompact } from "@/lib/time-utils";
import { RiPlayFill, RiPauseFill } from "@remixicon/react";
import { BLOCK_COLORS, type BlockColor } from "@/components/block";

// =============================================================================
// FocusIndicator Component
// =============================================================================

export interface FocusIndicatorProps {
  /** Title of the focused block */
  blockTitle: string;
  /** Color of the focused block */
  blockColor: BlockColor;
  /** Elapsed time in milliseconds */
  elapsedMs: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Called when pause button is clicked */
  onPause?: () => void;
  /** Called when resume button is clicked */
  onResume?: () => void;
  /** Called when the indicator is clicked (to navigate to the focused block) */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Compact focus indicator for the shell toolbar.
 * Shows when the user is focused on a block but viewing a different block in the sidebar.
 */
export function FocusIndicator({
  blockTitle,
  blockColor,
  elapsedMs,
  isRunning,
  onPause,
  onResume,
  onClick,
  className,
}: FocusIndicatorProps) {
  const colorConfig = BLOCK_COLORS[blockColor];
  // Extract the color name for the dot
  const dotColorClass = colorConfig.text
    .replace("text-", "bg-")
    .replace("-600", "-500");

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md bg-background/80 pl-2.5 pr-1 py-1 shadow-sm ring-1 ring-border/50 backdrop-blur-sm",
        className,
      )}
    >
      {/* Clickable area: dot + title + time */}
      <button
        onClick={onClick}
        className="flex items-center gap-2 rounded px-1 py-0.5 transition-colors hover:bg-muted/60"
      >
        {/* Animated dot */}
        <div
          className={cn(
            "size-2 rounded-full",
            dotColorClass,
            isRunning && "animate-pulse",
          )}
        />
        {/* Title (truncated) */}
        <span className="max-w-[120px] truncate text-xs font-medium text-foreground">
          {blockTitle}
        </span>
        {/* Time */}
        <span
          className={cn(
            "font-mono text-xs tabular-nums",
            isRunning ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {formatElapsedMsCompact(elapsedMs)}
        </span>
      </button>

      {/* Pause/Resume toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          isRunning ? onPause?.() : onResume?.();
        }}
        className={cn(
          "flex size-6 items-center justify-center rounded transition-colors",
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-label={isRunning ? "Pause focus" : "Resume focus"}
      >
        {isRunning ? (
          <RiPauseFill className="size-3.5" />
        ) : (
          <RiPlayFill className="size-3.5" />
        )}
      </button>
    </div>
  );
}
