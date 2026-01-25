"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useBlockDrag, type DragPreviewPosition } from "./use-block-drag";

/** Props passed to the render function */
interface DragRenderProps {
  isDragging: boolean;
  /** Whether the Option/Alt key is currently held during drag */
  isOptionHeld: boolean;
  /** The projected position during drag (null when not dragging) */
  previewPosition: DragPreviewPosition | null;
}

interface DraggableBlockWrapperProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onDragEnd"
> {
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
  /** Called when drag operation ends with the final position (move) */
  onDragEnd?: (newDayIndex: number, newStartMinutes: number) => void;
  /** Called when drag operation ends with Option key held (duplicate) */
  onDuplicate?: (newDayIndex: number, newStartMinutes: number) => void;
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
  onDuplicate,
  className,
  style,
  ...rest
}: DraggableBlockWrapperProps) {
  const {
    isDragging,
    isOptionHeld,
    dragOffset,
    previewPosition,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useBlockDrag({
    startMinutes,
    dayIndex,
    durationMinutes,
    pixelsPerMinute,
    dayColumnWidth,
    snapInterval,
    minDayIndex,
    maxDayIndex,
    onDragEnd,
    onDuplicate,
  });

  // For duplicate (Option held): original stays in place, ghost follows cursor
  // For move: original follows cursor
  const isDuplicating = isDragging && isOptionHeld;
  const isMoving = isDragging && !isOptionHeld;

  // When duplicating, we need two versions of the content:
  // - Original: static (no preview position, shows original time)
  // - Ghost: dynamic (with preview position, shows new time)
  // When moving or idle, we just need one version with the current state.
  const originalContent =
    typeof children === "function"
      ? children({
          isDragging,
          isOptionHeld,
          // Original block shows static time when duplicating
          previewPosition: isDuplicating ? null : previewPosition,
        })
      : children;

  const ghostContent =
    typeof children === "function"
      ? children({ isDragging, isOptionHeld, previewPosition })
      : children;

  // Get the bounding rect for positioning the ghost
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [ghostRect, setGhostRect] = React.useState<DOMRect | null>(null);

  // Capture the rect when drag starts for ghost positioning
  React.useEffect(() => {
    if (isDragging && wrapperRef.current) {
      setGhostRect(wrapperRef.current.getBoundingClientRect());
    } else if (!isDragging) {
      setGhostRect(null);
    }
  }, [isDragging]);

  return (
    <>
      <div
        ref={wrapperRef}
        {...rest}
        className={cn(
          "group/drag relative touch-none",
          isDragging
            ? isOptionHeld
              ? "cursor-copy z-10"
              : "cursor-grabbing z-50"
            : "cursor-grab z-10",
          className,
        )}
        style={{
          ...style,
          // Only apply transform when moving (not duplicating)
          transform: isMoving
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
            isMoving && "ring-2 ring-primary/30 shadow-lg",
          )}
        />
        {originalContent}
      </div>

      {/* Ghost preview when duplicating (Option+drag) */}
      {isDuplicating && ghostRect && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            top: ghostRect.top,
            left: ghostRect.left,
            width: ghostRect.width,
            height: ghostRect.height,
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          }}
        >
          <div className="relative h-full w-full">
            {/* Ghost overlay ring */}
            <div className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-emerald-500/40 shadow-lg" />
            <div className="h-full w-full opacity-80">{ghostContent}</div>
          </div>
        </div>
      )}
    </>
  );
}

export type { DraggableBlockWrapperProps, DragRenderProps };
