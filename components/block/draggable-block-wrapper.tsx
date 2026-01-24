"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useBlockDrag, type DragPreviewPosition } from "./use-block-drag";

/** Props passed to the render function */
interface DragRenderProps {
  isDragging: boolean;
  /** The projected position during drag (null when not dragging) */
  previewPosition: DragPreviewPosition | null;
}

interface DraggableBlockWrapperProps {
  /** Render prop that receives drag state for customizing content during drag */
  children: React.ReactNode | ((props: DragRenderProps) => React.ReactNode);
  startMinutes: number;
  dayIndex: number;
  durationMinutes: number;
  /** Pixels per minute in the calendar grid */
  pixelsPerMinute: number;
  /** Width of each day column in pixels */
  dayColumnWidth: number;
  /** Snap to this interval in minutes (default: 15) */
  snapInterval?: number;
  /** Minimum day index (default: 0 = Monday) */
  minDayIndex?: number;
  /** Maximum day index (default: 6 = Sunday) */
  maxDayIndex?: number;
  /** Called when drag operation ends with the final position */
  onDragEnd?: (newDayIndex: number, newStartMinutes: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DraggableBlockWrapper({
  children,
  startMinutes,
  dayIndex,
  durationMinutes,
  pixelsPerMinute,
  dayColumnWidth,
  snapInterval = 15,
  minDayIndex = 0,
  maxDayIndex = 6,
  onDragEnd,
  className,
  style,
}: DraggableBlockWrapperProps) {
  const { isDragging, dragOffset, previewPosition, handlePointerDown, handlePointerMove, handlePointerUp } =
    useBlockDrag({
      startMinutes,
      dayIndex,
      durationMinutes,
      pixelsPerMinute,
      dayColumnWidth,
      snapInterval,
      minDayIndex,
      maxDayIndex,
      onDragEnd,
    });

  // Support both render prop and regular children
  const content = typeof children === "function" 
    ? children({ isDragging, previewPosition }) 
    : children;

  return (
    <div
      className={cn(
        "group/drag relative touch-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        isDragging && "z-50",
        className,
      )}
      style={{
        ...style,
        // Apply visual offset during drag for smooth feedback
        transform: isDragging
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
          : undefined,
        transition: isDragging ? "none" : "box-shadow 0.15s ease",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Drag visual feedback overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-md transition-all duration-150",
          isDragging && "ring-2 ring-primary/30 shadow-lg",
        )}
      />
      {content}
    </div>
  );
}

export type { DraggableBlockWrapperProps, DragRenderProps };
