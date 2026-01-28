"use client";

import * as React from "react";
import type { DragItem, DropPosition } from "@/lib/drag-types";

// ============================================================================
// Types
// ============================================================================

export interface DragState {
  /** The item currently being dragged, or null if not dragging */
  item: DragItem | null;
  /** Current pointer position (for ghost positioning) */
  position: { x: number; y: number };
  /** Preview position on the calendar grid (snapped) */
  previewPosition: DropPosition | null;
  /** Starting position of the drag (for threshold detection) */
  startPosition: { x: number; y: number } | null;
  /** Whether the drag threshold has been exceeded */
  isDragging: boolean;
  /** Whether shift key is held (enables overlap placement instead of gap-filling) */
  isOverlapModeEnabled: boolean;
}

export interface DragContextValue {
  state: DragState;
  startDrag: (item: DragItem, e: React.PointerEvent) => void;
  endDrag: () => void;
  cancelDrag: () => void;
  setPreviewPosition: (position: DropPosition | null) => void;
}

// ============================================================================
// Context
// ============================================================================

const DragContext = React.createContext<DragContextValue | null>(null);

/** Pixel distance pointer must move before drag activates */
const DRAG_THRESHOLD = 4;

// ============================================================================
// Provider
// ============================================================================

interface DragProviderProps {
  children: React.ReactNode;
}

export function DragProvider({ children }: DragProviderProps) {
  const [state, setState] = React.useState<DragState>({
    item: null,
    position: { x: 0, y: 0 },
    previewPosition: null,
    startPosition: null,
    isDragging: false,
    isOverlapModeEnabled: false,
  });

  // Track whether we're in a pending drag state (pointer down but threshold not met)
  const pendingDragRef = React.useRef<{
    item: DragItem;
    startX: number;
    startY: number;
  } | null>(null);

  // Track initial shift state when drag starts
  const initialShiftRef = React.useRef(false);

  const startDrag = React.useCallback((item: DragItem, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Capture initial shift state
    initialShiftRef.current = e.shiftKey;

    // Enter pending state
    pendingDragRef.current = {
      item,
      startX: e.clientX,
      startY: e.clientY,
    };

    setState({
      item: null,
      position: { x: e.clientX, y: e.clientY },
      previewPosition: null,
      startPosition: { x: e.clientX, y: e.clientY },
      isDragging: false,
      isOverlapModeEnabled: e.shiftKey,
    });
  }, []);

  const endDrag = React.useCallback(() => {
    pendingDragRef.current = null;
    initialShiftRef.current = false;
    setState({
      item: null,
      position: { x: 0, y: 0 },
      previewPosition: null,
      startPosition: null,
      isDragging: false,
      isOverlapModeEnabled: false,
    });
  }, []);

  const cancelDrag = React.useCallback(() => {
    pendingDragRef.current = null;
    initialShiftRef.current = false;
    setState({
      item: null,
      position: { x: 0, y: 0 },
      previewPosition: null,
      startPosition: null,
      isDragging: false,
      isOverlapModeEnabled: false,
    });
  }, []);

  const setPreviewPosition = React.useCallback((position: DropPosition | null) => {
    setState((prev) => ({ ...prev, previewPosition: position }));
  }, []);

  // Global pointer move handler
  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Check if we're in pending state
      if (pendingDragRef.current && !state.isDragging) {
        const dx = e.clientX - pendingDragRef.current.startX;
        const dy = e.clientY - pendingDragRef.current.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= DRAG_THRESHOLD) {
          // Activate drag - preserve shift state from when drag started
          setState({
            item: pendingDragRef.current.item,
            position: { x: e.clientX, y: e.clientY },
            previewPosition: null,
            startPosition: {
              x: pendingDragRef.current.startX,
              y: pendingDragRef.current.startY,
            },
            isDragging: true,
            isOverlapModeEnabled: initialShiftRef.current,
          });
        }
        return;
      }

      // Update position if actively dragging
      if (state.isDragging) {
        setState((prev) => ({
          ...prev,
          position: { x: e.clientX, y: e.clientY },
        }));
      }
    };

    const handlePointerUp = () => {
      // If we were in pending state but never activated, just cancel
      if (pendingDragRef.current && !state.isDragging) {
        cancelDrag();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (state.isDragging || pendingDragRef.current)) {
        cancelDrag();
      }
      // Track shift key for overlap mode
      if (e.key === "Shift" && state.isDragging) {
        initialShiftRef.current = true;
        setState((prev) => ({ ...prev, isOverlapModeEnabled: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Track shift key release for overlap mode
      if (e.key === "Shift" && state.isDragging) {
        initialShiftRef.current = false;
        setState((prev) => ({ ...prev, isOverlapModeEnabled: false }));
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state.isDragging, cancelDrag]);

  const value = React.useMemo(
    () => ({
      state,
      startDrag,
      endDrag,
      cancelDrag,
      setPreviewPosition,
    }),
    [state, startDrag, endDrag, cancelDrag, setPreviewPosition]
  );

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useDragContext() {
  const ctx = React.useContext(DragContext);
  if (!ctx) {
    throw new Error("useDragContext must be used within a DragProvider");
  }
  return ctx;
}

/**
 * Hook to check if drag context is available (for optional usage).
 * Returns null if not within a DragProvider.
 */
export function useDragContextOptional() {
  return React.useContext(DragContext);
}
