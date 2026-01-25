"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { BLOCK_COLORS, type BlockColor } from "./block-colors";
type BlockStatus = "planned" | "completed" | "blueprint";
type BlockDuration = 30 | 60 | 240;

// Height in pixels per 30 minutes
const HEIGHT_PER_30_MIN = 40;

interface BlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  startTime?: string;
  endTime?: string;
  color?: BlockColor;
  status?: BlockStatus;
  duration?: BlockDuration;
  taskCount?: number;
  /** Show action buttons on hover for outlined variant (default: true) */
  showOutlinedActions?: boolean;
  /** When true, Block fills its container height instead of calculating its own */
  fillContainer?: boolean;
}

function Block({
  title,
  startTime,
  endTime,
  color = "indigo",
  status = "planned",
  duration = 30,
  taskCount,
  showOutlinedActions = true,
  fillContainer = false,
  className,
  style,
  ...props
}: BlockProps) {
  const timeDisplay =
    startTime && endTime ? `${startTime} – ${endTime}` : startTime || endTime;

  const colorStyles = BLOCK_COLORS[color];
  const isCompleted = status === "completed";
  const isOutlined = status === "blueprint";

  const height = fillContainer
    ? undefined
    : (duration / 30) * HEIGHT_PER_30_MIN;

  const isCompact = duration <= 30;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md px-2.5 text-sm",
        isCompact ? "justify-center py-1" : "py-2",
        "cursor-pointer transition-all",
        fillContainer && "h-full",
        isOutlined
          ? [
              "border border-dashed",
              colorStyles.outlinedBorder,
              colorStyles.outlinedBg,
              colorStyles.outlinedBgHover,
              colorStyles.text,
            ]
          : isCompleted
            ? [
                "border-l-[3px]",
                colorStyles.completedBorder,
                colorStyles.completedBg,
                colorStyles.completedBgHover,
                colorStyles.completedText,
                "opacity-60",
              ]
            : [
                "border-l-[3px]",
                colorStyles.border,
                colorStyles.bg,
                colorStyles.bgHover,
                colorStyles.text,
              ],
        className,
      )}
      style={{ height, ...style }}
      {...props}
    >
      <span className="truncate font-medium leading-tight">{title}</span>
      {timeDisplay && !isCompact && (
        <span className="mt-0.5 truncate text-[11px]">{timeDisplay}</span>
      )}
      {taskCount !== undefined && taskCount > 0 && !isOutlined && (
        <div
          className={cn(
            "flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
            isCompact
              ? "absolute top-1/2 right-1.5 -translate-y-1/2"
              : "absolute bottom-1.5 right-1.5",
          )}
        >
          <RiCheckLine className="size-3" />
          <span>{taskCount}</span>
        </div>
      )}
      {isOutlined && showOutlinedActions && (
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            isCompact
              ? "absolute top-1/2 right-1.5 -translate-y-1/2"
              : "absolute top-1.5 right-1.5",
          )}
        >
          <button
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors",
              "bg-white shadow-sm hover:text-green-600",
              colorStyles.text,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <RiCheckLine className="size-3.5" />
          </button>
          <button
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors",
              "bg-white text-muted-foreground shadow-sm hover:text-foreground",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <RiCloseLine className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export { Block };
export type { BlockProps, BlockStatus, BlockDuration };
