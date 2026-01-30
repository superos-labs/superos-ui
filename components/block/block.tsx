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
import type { CalendarProvider } from "@/lib/calendar-sync";
import { ProviderBadge } from "@/components/integrations";

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
  /** Block type for visual differentiation */
  blockType?: BlockType;
  /** Provider for external blocks (shows provider badge) */
  sourceProvider?: CalendarProvider;
  /** Custom hex color override (for external blocks using provider calendar colors) */
  customColor?: string;
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
  sourceProvider,
  customColor,
  className,
  style,
  ...props
}: BlockProps) {
  const timeDisplay =
    startTime && endTime ? `${startTime} – ${endTime}` : startTime || endTime;

  const colorStyles = BLOCK_COLORS[color];
  const isCompleted = status === "completed";
  const isEssential = blockType === "essential";
  const isExternal = blockType === "external";

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

  // Generate inline styles for external blocks with custom hex colors
  const getExternalBlockInlineStyles = (): React.CSSProperties => {
    if (!isExternal || !customColor) return {};

    // Convert hex to RGB for rgba calculations
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 100, g: 100, b: 100 };
    };

    const rgb = hexToRgb(customColor);
    const bgOpacity = isCompleted ? 0.15 : 0.25;
    const textLightness = isCompleted ? 0.6 : 0.4; // Darken for text

    return {
      borderLeftColor: isCompleted
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`
        : customColor,
      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bgOpacity})`,
      // Darken the color for text by reducing lightness
      color: `rgb(${Math.floor(rgb.r * textLightness)}, ${Math.floor(rgb.g * textLightness)}, ${Math.floor(rgb.b * textLightness)})`,
    };
  };

  // Essential and external blocks use muted/custom styling
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

    // External blocks use inline styles for custom hex colors
    if (isExternal && customColor) {
      return [
        "border-l-[3px]",
        "hover:brightness-95",
        isCompleted && "opacity-60",
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

  // Merge inline styles for external blocks
  const mergedStyle: React.CSSProperties = {
    height,
    ...getExternalBlockInlineStyles(),
    ...style,
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
      style={mergedStyle}
      {...props}
    >
      <span className="truncate font-medium leading-tight">{title}</span>
      {timeDisplay && !isCompact && (
        <span className="mt-0.5 truncate text-[11px]">{timeDisplay}</span>
      )}

      {/* Provider badge for external blocks */}
      {isExternal && sourceProvider && (
        <ProviderBadge
          provider={sourceProvider}
          size="sm"
          className={cn(
            "absolute",
            isCompact ? "top-1/2 right-1.5 -translate-y-1/2" : "top-1.5 right-1.5",
          )}
        />
      )}

      {/* Task count badge for goal blocks (not for essentials, tasks, or external) */}
      {blockType !== "task" &&
        blockType !== "essential" &&
        blockType !== "external" &&
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
