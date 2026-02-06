/**
 * =============================================================================
 * File: time-column.tsx
 * =============================================================================
 *
 * Shared day column renderer for both DayView and WeekView.
 *
 * Renders:
 * - Hour grid cells.
 * - Event segments.
 * - Drag-to-create previews.
 * - External drag previews.
 *
 * Acts as the primary interaction surface for time-based placement.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render hour cells and handle empty-space interactions.
 * - Render TimeColumnBlock instances for event segments.
 * - Coordinate drag-to-create behavior.
 * - Integrate external drag-and-drop.
 * - Forward hover and click signals upward.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Computing event segments.
 * - Computing overlap layout.
 * - Persisting changes.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses absolute positioning with percentage-based layout.
 * - Preview blocks use pointer-events-none.
 * - Day boundaries can visually dim hours.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - TimeColumn
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Block } from "@/components/block";
import {
  HOURS,
  COMPACT_LAYOUT_THRESHOLD_PX,
  type TimeColumnProps,
} from "./calendar-types";
import { formatTimeFromMinutes, snapToGrid } from "./calendar-utils";
import { EmptySpaceContextMenu } from "./calendar-context-menu";
import { TimeColumnBlock } from "./time-column-block";
import { useExternalDrag } from "./use-external-drag";

/**
 * TimeColumn renders a single day column with hour cells and event segments.
 * This component is shared between DayView and WeekView to eliminate duplication.
 */
export function TimeColumn({
  dayIndex,
  isToday = false,
  segments,
  dayColumnWidth,
  pixelsPerMinute,
  setBlockStyle,
  isCreatingBlock = false,
  createPreview,
  minDayIndex,
  maxDayIndex,
  hasClipboardContent = false,
  onPointerDown,
  onEventResize,
  onEventResizeEnd,
  onEventDragEnd,
  onEventDuplicate,
  onGridDoubleClick,
  onEventCopy,
  onEventDelete,
  onEventStatusChange,
  onEventPaste,
  onEventHover,
  onGridPositionHover,
  onEventClick,
  enableExternalDrop = false,
  onExternalDrop,
  externalDragPreview,
  dayStartMinutes,
  dayEndMinutes,
  dayBoundariesEnabled = false,
  dayBoundariesDisplay = "dimmed",
}: TimeColumnProps) {
  // Helper to calculate position percentage
  const getTopPercent = (minutes: number): number => {
    return (minutes / 1440) * 100;
  };

  const getHeightPercent = (durationMinutes: number): number => {
    return (durationMinutes / 1440) * 100;
  };

  const columnRef = React.useRef<HTMLDivElement>(null);

  // Track block element refs for hit detection (shared with external drag hook)
  const blockRefsMap = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // Register a block element ref
  const registerBlockRef = React.useCallback(
    (blockId: string, el: HTMLDivElement | null) => {
      if (el) {
        blockRefsMap.current.set(blockId, el);
      } else {
        blockRefsMap.current.delete(blockId);
      }
    },
    [],
  );

  // External drag handling
  const {
    handleExternalDragMove,
    handleExternalDrop: handleExternalDropEvent,
    handlePointerLeave,
    isExternalDragOver,
  } = useExternalDrag({
    columnRef,
    pixelsPerMinute,
    enableExternalDrop,
    dayIndex,
    segments,
    onExternalDrop,
    blockRefsMap,
  });

  return (
    <div
      ref={columnRef}
      className={cn(
        "border-border/40 relative border-r last:border-r-0",
        isToday && "bg-primary/[0.02]",
        isExternalDragOver && "bg-primary/[0.05]",
      )}
      onPointerMove={enableExternalDrop ? handleExternalDragMove : undefined}
      onPointerUp={enableExternalDrop ? handleExternalDropEvent : undefined}
      onPointerLeave={enableExternalDrop ? handlePointerLeave : undefined}
    >
      {/* Hour Cells */}
      {HOURS.map((hour) => {
        const hourStartMinutes = hour * 60;
        const hourEndMinutes = hourStartMinutes + 60;

        // Check if this hour is outside the day boundaries (for dimming)
        const isOutsideDayBoundaries =
          dayBoundariesEnabled &&
          ((dayStartMinutes !== undefined &&
            hourEndMinutes <= dayStartMinutes) ||
            (dayEndMinutes !== undefined && hourStartMinutes >= dayEndMinutes));

        const topPercent = (hour / 24) * 100;
        const heightPercent = 100 / 24;

        return (
          <EmptySpaceContextMenu
            key={hour}
            canPaste={hasClipboardContent}
            onPaste={() => {
              onEventPaste?.(dayIndex, hourStartMinutes);
            }}
            onCreate={() => {
              onGridDoubleClick?.(dayIndex, hourStartMinutes);
            }}
          >
            <div
              className={cn(
                "border-border/40 absolute right-0 left-0 border-b transition-colors touch-none",
                "hover:bg-muted/30",
                // Dim hours outside day boundaries
                isOutsideDayBoundaries && "bg-muted/40",
              )}
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
              }}
              onPointerDown={(e) => onPointerDown?.(e, dayIndex, hour * 60)}
              onMouseEnter={() =>
                onGridPositionHover?.({
                  dayIndex,
                  startMinutes: hourStartMinutes,
                })
              }
              onMouseLeave={() => onGridPositionHover?.(null)}
              onDoubleClick={(e) => {
                if (isCreatingBlock || !onGridDoubleClick) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const relativeY = e.clientY - rect.top;
                const minutesIntoHour = (relativeY / rect.height) * 60;
                const startMinutes = snapToGrid(hour * 60 + minutesIntoHour);
                onGridDoubleClick(dayIndex, startMinutes);
              }}
            />
          </EmptySpaceContextMenu>
        );
      })}

      {/* Event Segments */}
      <AnimatePresence>
        {segments.map((segment) => {
          const segmentKey = `${segment.event.id}-${segment.position}`;
          return (
            <TimeColumnBlock
              key={segmentKey}
              segment={segment}
              dayIndex={dayIndex}
              pixelsPerMinute={pixelsPerMinute}
              dayColumnWidth={dayColumnWidth}
              minDayIndex={minDayIndex}
              maxDayIndex={maxDayIndex}
              setBlockStyle={setBlockStyle}
              registerBlockRef={registerBlockRef}
              onEventResize={onEventResize}
              onEventResizeEnd={onEventResizeEnd}
              onEventDragEnd={onEventDragEnd}
              onEventDuplicate={onEventDuplicate}
              onEventCopy={onEventCopy}
              onEventDelete={onEventDelete}
              onEventStatusChange={onEventStatusChange}
              onEventHover={onEventHover}
              onEventClick={onEventClick}
            />
          );
        })}
      </AnimatePresence>

      {/* Drag-to-create preview */}
      {createPreview &&
        createPreview.dayIndex === dayIndex &&
        (() => {
          const previewHeightPx =
            createPreview.durationMinutes * pixelsPerMinute;
          const previewCompactLayout =
            previewHeightPx < COMPACT_LAYOUT_THRESHOLD_PX;
          return (
            <div
              className="pointer-events-none absolute right-1 left-1 z-40"
              style={{
                top: `${getTopPercent(createPreview.startMinutes)}%`,
                height: `${getHeightPercent(createPreview.durationMinutes)}%`,
              }}
            >
              <Block
                title="New Block"
                startTime={formatTimeFromMinutes(createPreview.startMinutes)}
                endTime={formatTimeFromMinutes(
                  createPreview.startMinutes + createPreview.durationMinutes,
                )}
                color="indigo"
                status="planned"
                duration={createPreview.durationMinutes <= 30 ? 30 : 60}
                compactLayout={previewCompactLayout}
                fillContainer
              />
            </div>
          );
        })()}

      {/* External drag preview (from backlog) - animated for smooth snapping */}
      {externalDragPreview &&
        externalDragPreview.dayIndex === dayIndex &&
        (() => {
          const previewHeightPx =
            externalDragPreview.durationMinutes * pixelsPerMinute;
          const previewCompactLayout =
            previewHeightPx < COMPACT_LAYOUT_THRESHOLD_PX;
          return (
            <motion.div
              className="pointer-events-none absolute right-1 left-1 z-40 opacity-70"
              initial={false}
              animate={{
                top: `${getTopPercent(externalDragPreview.startMinutes)}%`,
                height: `${getHeightPercent(externalDragPreview.durationMinutes)}%`,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Block
                title={externalDragPreview.title}
                startTime={formatTimeFromMinutes(
                  externalDragPreview.startMinutes,
                )}
                endTime={formatTimeFromMinutes(
                  externalDragPreview.startMinutes +
                    externalDragPreview.durationMinutes,
                )}
                color={externalDragPreview.color}
                status="planned"
                duration={externalDragPreview.durationMinutes <= 30 ? 30 : 60}
                compactLayout={previewCompactLayout}
                fillContainer
              />
            </motion.div>
          );
        })()}
    </div>
  );
}
