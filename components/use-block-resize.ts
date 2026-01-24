"use client"

import * as React from "react"

interface UseBlockResizeOptions {
  startMinutes: number
  durationMinutes: number
  /** Pixels per minute in the calendar grid */
  pixelsPerMinute: number
  /** Snap to this interval in minutes (default: 15) */
  snapInterval?: number
  /** Minimum duration in minutes (default: 15) */
  minDuration?: number
  /** Maximum end time in minutes from midnight (default: 1440 = 24 hours) */
  maxEndMinutes?: number
  /** Called during resize with new values */
  onResize?: (newStartMinutes: number, newDurationMinutes: number) => void
  /** Called when resize operation ends */
  onResizeEnd?: () => void
}

interface UseBlockResizeReturn {
  isResizing: boolean
  activeEdge: "top" | "bottom" | null
  handlePointerDown: (e: React.PointerEvent, edge: "top" | "bottom") => void
  handlePointerMove: (e: React.PointerEvent) => void
  handlePointerUp: (e: React.PointerEvent) => void
}

export function useBlockResize({
  startMinutes,
  durationMinutes,
  pixelsPerMinute,
  snapInterval = 15,
  minDuration = 15,
  maxEndMinutes = 1440,
  onResize,
  onResizeEnd,
}: UseBlockResizeOptions): UseBlockResizeReturn {
  const [isResizing, setIsResizing] = React.useState(false)
  const [activeEdge, setActiveEdge] = React.useState<"top" | "bottom" | null>(null)
  
  const startY = React.useRef(0)
  const startValues = React.useRef({ start: 0, duration: 0 })

  const snapToInterval = React.useCallback((minutes: number) => {
    return Math.round(minutes / snapInterval) * snapInterval
  }, [snapInterval])

  const handlePointerDown = React.useCallback((
    e: React.PointerEvent, 
    edge: "top" | "bottom"
  ) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    
    setIsResizing(true)
    setActiveEdge(edge)
    startY.current = e.clientY
    startValues.current = { 
      start: startMinutes, 
      duration: durationMinutes 
    }
  }, [startMinutes, durationMinutes])

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!isResizing || !activeEdge) return
    
    const deltaY = e.clientY - startY.current
    const deltaMinutes = deltaY / pixelsPerMinute
    
    let newStart = startValues.current.start
    let newDuration = startValues.current.duration
    
    if (activeEdge === "top") {
      // Dragging top edge: adjust start time, inverse duration change
      const proposedStart = startValues.current.start + deltaMinutes
      const snappedStart = snapToInterval(proposedStart)
      const maxStart = startValues.current.start + startValues.current.duration - minDuration
      newStart = Math.max(0, Math.min(snappedStart, snapToInterval(maxStart)))
      newDuration = startValues.current.duration - (newStart - startValues.current.start)
    } else {
      // Dragging bottom edge: adjust duration only
      const proposedDuration = startValues.current.duration + deltaMinutes
      newDuration = Math.max(minDuration, snapToInterval(proposedDuration))
      // Ensure we don't exceed day boundary
      if (newStart + newDuration > maxEndMinutes) {
        newDuration = snapToInterval(maxEndMinutes - newStart)
      }
    }
    
    onResize?.(newStart, newDuration)
  }, [isResizing, activeEdge, pixelsPerMinute, snapToInterval, minDuration, maxEndMinutes, onResize])

  const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
    if (!isResizing) return
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    setIsResizing(false)
    setActiveEdge(null)
    onResizeEnd?.()
  }, [isResizing, onResizeEnd])

  return {
    isResizing,
    activeEdge,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}

export type { UseBlockResizeOptions, UseBlockResizeReturn }
