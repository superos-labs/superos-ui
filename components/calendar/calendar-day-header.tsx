/**
 * =============================================================================
 * File: calendar-day-header.tsx
 * =============================================================================
 *
 * Interactive day header for calendar views.
 *
 * Displays the day label and date, and participates in drag-and-drop
 * interactions for assigning task deadlines by dropping onto a day header.
 *
 * Also reports hover state upward for keyboard-driven bulk actions.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render day label and numeric date.
 * - Highlight "today" and drag-over states.
 * - Act as a drop target for tasks to set deadlines.
 * - Report day hover state for keyboard shortcut context.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Performing task updates or persistence.
 * - Managing drag state.
 * - Computing calendar ranges or dates.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Only tasks can be dropped onto day headers.
 * - Uses optional drag context to remain usable without drag enabled.
 * - Preview positioning is coordinated with a global drag controller.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - CalendarDayHeader
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDragContextOptional } from "@/components/drag";
import type { CalendarDayHeaderProps } from "./calendar-types";

export function CalendarDayHeader({
  day,
  date,
  isToday: today = false,
  showBorder = true,
  className,
  dayIndex,
  fullDate,
  isDropTarget: _isDropTarget = false,
  onDeadlineDrop,
  onDayHeaderHover,
}: CalendarDayHeaderProps) {
  // Note: _isDropTarget is available for styling drop targets in the future
  const dragContext = useDragContextOptional();

  // Check if we're actively dragging a task (only tasks can have deadlines)
  const isDraggingTask =
    dragContext?.state.isDragging && dragContext?.state.item?.type === "task";

  // Check if this header is being hovered during a drag
  const isBeingDraggedOver =
    isDraggingTask &&
    dragContext?.state.previewPosition?.dayIndex === dayIndex &&
    dragContext?.state.previewPosition?.dropTarget === "day-header";

  // Handle pointer move - set preview position for this header
  // Note: Don't stopPropagation - let global handler update ghost position
  const handlePointerMove = React.useCallback(() => {
    if (!isDraggingTask || dayIndex === undefined) return;
    dragContext?.setPreviewPosition({
      dayIndex,
      dropTarget: "day-header",
    });
  }, [isDraggingTask, dayIndex, dragContext]);

  // Handle pointer up - complete the drop
  const handlePointerUp = React.useCallback(() => {
    if (!isDraggingTask || dayIndex === undefined || !fullDate) return;

    const isoDate = fullDate.toISOString().split("T")[0];
    onDeadlineDrop?.(dayIndex, isoDate);
    dragContext?.endDrag();
  }, [isDraggingTask, dayIndex, fullDate, onDeadlineDrop, dragContext]);

  // Handle pointer leave - clear preview if leaving this header
  const handlePointerLeave = React.useCallback(() => {
    if (!dragContext?.state.isDragging) return;
    if (
      dragContext.state.previewPosition?.dayIndex === dayIndex &&
      dragContext.state.previewPosition?.dropTarget === "day-header"
    ) {
      dragContext.setPreviewPosition(null);
    }
  }, [dragContext, dayIndex]);

  // Handle mouse enter/leave for keyboard shortcuts (⌘Enter to mark all complete)
  const handleMouseEnter = React.useCallback(() => {
    if (dayIndex !== undefined) {
      onDayHeaderHover?.(dayIndex);
    }
  }, [dayIndex, onDayHeaderHover]);

  const handleMouseLeave = React.useCallback(() => {
    onDayHeaderHover?.(null);
  }, [onDayHeaderHover]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 py-3 transition-colors",
        showBorder && "border-border/40 border-r last:border-r-0",
        today && "bg-primary/[0.03]",
        // Highlight when dragging a task over this header
        isBeingDraggedOver &&
          "bg-primary/[0.08] ring-1 ring-inset ring-primary/20",
        // Show as potential drop target when dragging a task
        isDraggingTask && !isBeingDraggedOver && "hover:bg-primary/[0.05]",
        className,
      )}
      onPointerMove={isDraggingTask ? handlePointerMove : undefined}
      onPointerUp={isDraggingTask ? handlePointerUp : undefined}
      onPointerLeave={isDraggingTask ? handlePointerLeave : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className={cn(
          "text-sm font-medium",
          today ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {day}
      </span>
      <span
        className={cn(
          "flex size-7 items-center justify-center text-sm tabular-nums",
          today
            ? "bg-red-500 text-white rounded-lg font-medium"
            : "text-muted-foreground",
        )}
      >
        {date}
      </span>
    </div>
  );
}
