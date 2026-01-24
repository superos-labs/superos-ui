"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useBlockResize } from "@/components/use-block-resize"

interface ResizableBlockWrapperProps {
  children: React.ReactNode
  startMinutes: number
  durationMinutes: number
  /** Pixels per minute in the calendar grid */
  pixelsPerMinute: number
  /** Snap to this interval in minutes (default: 15) */
  snapInterval?: number
  /** Minimum duration in minutes (default: 15) */
  minDuration?: number
  /** Called during resize with new values */
  onResize?: (newStartMinutes: number, newDurationMinutes: number) => void
  /** Called when resize operation ends */
  onResizeEnd?: () => void
  className?: string
  style?: React.CSSProperties
}

function ResizeHandle({ 
  edge, 
  isActive,
  onPointerDown,
}: { 
  edge: "top" | "bottom"
  isActive: boolean
  onPointerDown: (e: React.PointerEvent) => void 
}) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-20 flex items-center justify-center",
        "cursor-ns-resize touch-none",
        "opacity-0 transition-opacity group-hover/resize:opacity-100",
        isActive && "opacity-100",
        edge === "top" ? "-top-1 h-3" : "-bottom-1 h-3"
      )}
      onPointerDown={onPointerDown}
    >
      {/* Visual indicator */}
      <div 
        className={cn(
          "h-1 w-8 rounded-full transition-colors",
          "bg-foreground/20",
          isActive && "bg-foreground/40"
        )} 
      />
    </div>
  )
}

export function ResizableBlockWrapper({
  children,
  startMinutes,
  durationMinutes,
  pixelsPerMinute,
  snapInterval = 15,
  minDuration = 15,
  onResize,
  onResizeEnd,
  className,
  style,
}: ResizableBlockWrapperProps) {
  const {
    isResizing,
    activeEdge,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useBlockResize({
    startMinutes,
    durationMinutes,
    pixelsPerMinute,
    snapInterval,
    minDuration,
    onResize,
    onResizeEnd,
  })

  return (
    <div
      className={cn(
        "group/resize relative",
        isResizing && "z-30",
        className
      )}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Top resize handle */}
      <ResizeHandle 
        edge="top" 
        isActive={activeEdge === "top"}
        onPointerDown={(e) => handlePointerDown(e, "top")} 
      />
      
      {/* Block content */}
      {children}
      
      {/* Bottom resize handle */}
      <ResizeHandle 
        edge="bottom" 
        isActive={activeEdge === "bottom"}
        onPointerDown={(e) => handlePointerDown(e, "bottom")} 
      />
    </div>
  )
}

export type { ResizableBlockWrapperProps }
