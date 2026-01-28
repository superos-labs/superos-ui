"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCheckLine, RiCircleLine } from "@remixicon/react";
import {
  BLOCK_COLORS,
  ESSENTIAL_BLOCK_STYLE,
  type BlockColor,
} from "./block-colors";
import type { BlockStatus, BlockType } from "@/lib/types";

type BlockDuration = 30 | 60 | 240;

/**
 * Segment position for overnight blocks.
 * - 'only': Single-day event (full rounded corners)
 * - 'start': First day of overnight event (rounded top, flat bottom)
 * - 'end': Second day of overnight event (flat top, rounded bottom)
 */
type SegmentPosition = "only" | "start" | "end";

// Height in pixels per 30 minutes
const HEIGHT_PER_30_MIN = 40;

interface BlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  startTime?: string;
  endTime?: string;
  color?: BlockColor;
  status?: BlockStatus;
  duration?: BlockDuration;
  /** Number of incomplete tasks assigned to this block */
  pendingTaskCount?: number;
  /** Number of completed tasks assigned to this block */
  completedTaskCount?: number;
  /** When true, Block fills its container height instead of calculating its own */
  fillContainer?: boolean;
  /** Position within an overnight block for corner styling */
  segmentPosition?: SegmentPosition;
  /**
   * Override compact layout detection. When provided, this takes precedence
   * over the duration-based calculation. Use when the actual rendered height
   * is known (e.g., in calendar context with variable density).
   */
  compactLayout?: boolean;
  /** Whether this block is a valid drop target for the current drag */
  isDropTarget?: boolean;
  /** Whether the drag is currently hovering over this block */
  isDragOver?: boolean;
  /** Block type for visual differentiation (task blocks show checkbox) */
  blockType?: BlockType;
  /** Called when the task checkbox is clicked (task blocks only) */
  onToggleComplete?: () => void;
}

function Block({
  title,
  startTime,
  endTime,
  color = "indigo",
  status = "planned",
  duration = 30,
  pendingTaskCount,
  completedTaskCount,
  fillContainer = false,
  segmentPosition = "only",
  compactLayout,
  isDropTarget = false,
  isDragOver = false,
  blockType,
  onToggleComplete,
  className,
  style,
  ...props
}: BlockProps) {
  const timeDisplay =
    startTime && endTime ? `${startTime} – ${endTime}` : startTime || endTime;

  const colorStyles = BLOCK_COLORS[color];
  const isCompleted = status === "completed";
  const isEssential = blockType === "essential";

  const height = fillContainer
    ? undefined
    : (duration / 30) * HEIGHT_PER_30_MIN;

  // Use explicit compactLayout if provided, otherwise fall back to duration-based detection
  const isCompact = compactLayout ?? duration <= 30;

  // Corner styling based on segment position for overnight blocks
  const cornerStyles = {
    only: "rounded-md",
    start: "rounded-t-md rounded-b-none", // Flat bottom for overnight start
    end: "rounded-t-none rounded-b-md", // Flat top for overnight end
  };

  // Essential blocks use muted neutral styling to visually recede
  const getBlockStyles = () => {
    if (isEssential) {
      return [
        "border-l-[3px]",
        ESSENTIAL_BLOCK_STYLE.border,
        ESSENTIAL_BLOCK_STYLE.bg,
        ESSENTIAL_BLOCK_STYLE.bgHover,
        ESSENTIAL_BLOCK_STYLE.text,
      ];
    }

    if (isCompleted) {
      return [
        "border-l-[3px]",
        colorStyles.completedBorder,
        colorStyles.completedBg,
        colorStyles.completedBgHover,
        colorStyles.completedText,
        "opacity-60",
      ];
    }

    return [
      "border-l-[3px]",
      colorStyles.border,
      colorStyles.bg,
      colorStyles.bgHover,
      colorStyles.text,
    ];
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden px-2.5 text-sm",
        cornerStyles[segmentPosition],
        isCompact ? "justify-center py-1" : "py-2",
        "cursor-pointer transition-all",
        fillContainer && "h-full",
        getBlockStyles(),
        // Drop target visual states
        isDropTarget && !isDragOver && "ring-2 ring-primary/30",
        isDragOver && "ring-2 ring-primary/60 scale-[1.02] shadow-lg",
        className,
      )}
      style={{ height, ...style }}
      {...props}
    >
      <span
        className={cn(
          "truncate font-medium leading-tight",
          blockType === "task" && "pr-6", // Reserve space for checkbox
        )}
      >
        {title}
      </span>
      {timeDisplay && !isCompact && (
        <span className="mt-0.5 truncate text-[11px]">{timeDisplay}</span>
      )}
      {/* Task block checkbox indicator */}
      {blockType === "task" && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleComplete?.();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute flex shrink-0 items-center justify-center rounded transition-colors",
            "size-4",
            isCompact
              ? "top-1/2 right-1.5 -translate-y-1/2"
              : "top-1.5 right-1.5",
            isCompleted
              ? "bg-white/80 text-muted-foreground"
              : "bg-white/60 text-muted-foreground/50 hover:bg-white/80 hover:text-muted-foreground",
          )}
        >
          {isCompleted && <RiCheckLine className="size-2.5" />}
        </button>
      )}
      {/* Task count badge for goal blocks (not for essentials or tasks) */}
      {blockType !== "task" &&
        blockType !== "essential" &&
        (() => {
          const pending = pendingTaskCount ?? 0;
          const completed = completedTaskCount ?? 0;
          const total = pending + completed;
          const allCompleted = total > 0 && pending === 0;

          if (total === 0) return null;

          return (
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
                isCompact
                  ? "absolute top-1/2 right-1.5 -translate-y-1/2"
                  : "absolute bottom-1.5 right-1.5",
              )}
            >
              {allCompleted ? (
                <RiCheckLine className="size-3" />
              ) : (
                <RiCircleLine className="size-3" />
              )}
              <span>{allCompleted ? total : pending}</span>
            </div>
          );
        })()}
    </div>
  );
}

export { Block };
export type {
  BlockProps,
  BlockStatus,
  BlockType,
  BlockDuration,
  SegmentPosition,
};
