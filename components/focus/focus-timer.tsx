"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatElapsedMs } from "@/lib/time-utils";
import { RiPlayFill, RiPauseFill, RiStopFill } from "@remixicon/react";
import { BLOCK_COLORS, type BlockColor } from "@/components/block";

// =============================================================================
// FocusTimer Component
// =============================================================================

export interface FocusTimerProps {
  /** Elapsed time in milliseconds */
  elapsedMs: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Block color for the indicator dot */
  color: BlockColor;
  /** Called when pause button is clicked */
  onPause?: () => void;
  /** Called when resume button is clicked */
  onResume?: () => void;
  /** Called when stop button is clicked */
  onStop?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Focus timer display with pause/resume and stop controls.
 * Shows elapsed time in HH:MM:SS format with a colored indicator dot.
 */
export function FocusTimer({
  elapsedMs,
  isRunning,
  color,
  onPause,
  onResume,
  onStop,
  className,
}: FocusTimerProps) {
  const colorConfig = BLOCK_COLORS[color];
  // Extract the color name for the dot (e.g., "violet" from "text-violet-600")
  const dotColorClass = colorConfig.text
    .replace("text-", "bg-")
    .replace("-600", "-500");

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2",
        className,
      )}
    >
      {/* Timer display */}
      <div className="flex items-center gap-2.5">
        {/* Animated dot */}
        <div
          className={cn(
            "size-2.5 rounded-full",
            dotColorClass,
            isRunning && "animate-pulse",
          )}
        />
        {/* Time */}
        <span
          className={cn(
            "font-mono text-lg font-semibold tabular-nums tracking-tight",
            isRunning ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {formatElapsedMs(elapsedMs)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Pause/Resume toggle */}
        <button
          onClick={isRunning ? onPause : onResume}
          className={cn(
            "flex size-7 items-center justify-center rounded-md transition-colors",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          aria-label={isRunning ? "Pause focus" : "Resume focus"}
        >
          {isRunning ? (
            <RiPauseFill className="size-4" />
          ) : (
            <RiPlayFill className="size-4" />
          )}
        </button>

        {/* Stop button */}
        <button
          onClick={onStop}
          className={cn(
            "flex size-7 items-center justify-center rounded-md transition-colors",
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          )}
          aria-label="End focus session"
        >
          <RiStopFill className="size-4" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// StartFocusButton Component
// =============================================================================

export interface StartFocusButtonProps {
  /** Called when the button is clicked */
  onClick?: () => void;
  /** Whether the button is disabled (e.g., another block is focused) */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Button to start focus mode on the current block.
 */
export function StartFocusButton({
  onClick,
  disabled,
  className,
}: StartFocusButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <RiPlayFill className="size-4" />
      <span>Start Focus</span>
    </button>
  );
}
