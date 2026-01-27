"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Block,
  ResizableBlockWrapper,
  DraggableBlockWrapper,
} from "@/components/block";
import {
  HOURS,
  COMPACT_LAYOUT_THRESHOLD_PX,
  BLOCK_MARGIN_PX,
  BLOCK_GAP_PX,
  blockStyleToStatus,
  canMarkComplete,
  isOvernightEvent,
  type TimeColumnProps,
  type OverlapLayout,
} from "./calendar-types";
import {
  formatTimeFromMinutes,
  snapToGrid,
  blockAnimations,
} from "./calendar-utils";
import { useDragContextOptional } from "@/components/drag";

/**
 * Default layout for segments without overlap calculation.
 */
const DEFAULT_LAYOUT: OverlapLayout = {
  column: 0,
  totalColumns: 1,
  leftPercent: 0,
  widthPercent: 100,
};

/**
 * Calculate the CSS style for block positioning based on overlap layout.
 * Uses calc() to combine percentage-based layout with pixel margins and gaps.
 *
 * Applies consistent gaps:
 * - Horizontal: outer margins on first/last columns, small gap between adjacent blocks
 * - Vertical: between sequential blocks (bottom gap)
 */
function getBlockPositionStyle(
  layout: OverlapLayout | undefined,
  topPercent: number,
  heightPercent: number,
): React.CSSProperties {
  const { leftPercent, widthPercent, column, totalColumns } =
    layout ?? DEFAULT_LAYOUT;

  // For overlapping blocks, use smarter margin distribution:
  // - First column: full left margin, half gap on right
  // - Middle columns: half gap on each side
  // - Last column: half gap on left, full right margin
  // - Single column (no overlap): full margins on both sides
  const isFirstColumn = column === 0;
  const isLastColumn = column === totalColumns - 1;
  const isSingleColumn = totalColumns === 1;

  let leftOffset: number;
  let widthReduction: number;

  if (isSingleColumn) {
    // No overlap - standard margins
    leftOffset = BLOCK_MARGIN_PX;
    widthReduction = BLOCK_MARGIN_PX * 2;
  } else {
    // Overlapping blocks - distribute gaps evenly
    const halfGap = BLOCK_GAP_PX / 2;
    leftOffset = isFirstColumn ? BLOCK_MARGIN_PX : halfGap;
    const rightReduction = isLastColumn ? BLOCK_MARGIN_PX : halfGap;
    widthReduction = leftOffset + rightReduction;
  }

  return {
    position: "absolute" as const,
    top: `${topPercent}%`,
    // Reduce height by gap to create vertical spacing between sequential blocks
    height: `calc(${heightPercent}% - ${BLOCK_GAP_PX}px)`,
    left: `calc(${leftPercent}% + ${leftOffset}px)`,
    width: `calc(${widthPercent}% - ${widthReduction}px)`,
  };
}
import { BlockContextMenu, EmptySpaceContextMenu } from "./calendar-context-menu";

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
  mode: _mode = "schedule",
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
}: TimeColumnProps) {
  const columnRef = React.useRef<HTMLDivElement>(null);
  const dragContext = useDragContextOptional();
  
  // Track block element refs for hit detection
  const blockRefsMap = React.useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Register a block element ref
  const registerBlockRef = React.useCallback((blockId: string, el: HTMLDivElement | null) => {
    if (el) {
      blockRefsMap.current.set(blockId, el);
    } else {
      blockRefsMap.current.delete(blockId);
    }
  }, []);
  
  // Check if a point is inside a block's bounding rect
  const getBlockAtPoint = React.useCallback(
    (clientX: number, clientY: number): { blockId: string; event: typeof segments[0]["event"] } | null => {
      const dragItem = dragContext?.state.item;
      // Only check for task drags
      if (!dragItem || dragItem.type !== "task") return null;
      
      for (const segment of segments) {
        const event = segment.event;
        // Skip commitments - they don't accept drops
        if (event.blockType === "commitment") continue;
        // Skip if goal doesn't match
        if (event.sourceGoalId !== dragItem.goalId) continue;
        // Only goal and task blocks can accept task drops
        if (event.blockType !== "goal" && event.blockType !== "task") continue;
        
        const blockEl = blockRefsMap.current.get(event.id);
        if (!blockEl) continue;
        
        const rect = blockEl.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return { blockId: event.id, event };
        }
      }
      return null;
    },
    [dragContext?.state.item, segments]
  );
  
  // Calculate minutes from Y position for external drops
  const getMinutesFromY = React.useCallback(
    (clientY: number): number => {
      if (!columnRef.current) return 0;
      const rect = columnRef.current.getBoundingClientRect();
      const scrollParent = columnRef.current.closest('[data-calendar-scroll]');
      const scrollTop = scrollParent?.scrollTop ?? 0;
      const y = clientY - rect.top + scrollTop;
      const rawMinutes = y / pixelsPerMinute;
      return snapToGrid(Math.max(0, Math.min(1440 - 15, rawMinutes)));
    },
    [pixelsPerMinute]
  );
  
  // Handle pointer move for external drag preview
  const handleExternalDragMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enableExternalDrop || !dragContext?.state.isDragging) return;
      
      // Check if pointer is over a valid block drop target
      const blockHit = getBlockAtPoint(e.clientX, e.clientY);
      if (blockHit) {
        dragContext.setPreviewPosition({
          dayIndex,
          dropTarget: "existing-block",
          targetBlockId: blockHit.blockId,
        });
        return;
      }
      
      // Fall back to grid drop
      const startMinutes = getMinutesFromY(e.clientY);
      dragContext.setPreviewPosition({ dayIndex, startMinutes, dropTarget: "time-grid" });
    },
    [enableExternalDrop, dragContext, dayIndex, getMinutesFromY, getBlockAtPoint]
  );
  
  // Handle pointer up for external drop
  const handleExternalDrop = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enableExternalDrop || !dragContext?.state.isDragging || !dragContext.state.item) return;
      
      // Check if dropping on a block
      const blockHit = getBlockAtPoint(e.clientX, e.clientY);
      if (blockHit) {
        // The drop will be handled by the parent via handleDrop with existing-block target
        onExternalDrop?.(dayIndex, 0); // startMinutes not used for block drops
        dragContext.endDrag();
        return;
      }
      
      // Grid drop
      const startMinutes = getMinutesFromY(e.clientY);
      onExternalDrop?.(dayIndex, startMinutes);
      dragContext.endDrag();
    },
    [enableExternalDrop, dragContext, dayIndex, getMinutesFromY, onExternalDrop, getBlockAtPoint]
  );
  
  // Handle pointer leave - clear preview if leaving this column
  const handlePointerLeave = React.useCallback(() => {
    if (!dragContext?.state.isDragging) return;
    if (dragContext.state.previewPosition?.dayIndex === dayIndex) {
      dragContext.setPreviewPosition(null);
    }
  }, [dragContext, dayIndex]);
  
  // Check if external drag is over this column (time-grid only, not header)
  const isExternalDragOver = enableExternalDrop && 
    dragContext?.state.isDragging && 
    dragContext?.state.previewPosition?.dayIndex === dayIndex &&
    dragContext?.state.previewPosition?.dropTarget === "time-grid";

  return (
    <div
      ref={columnRef}
      className={cn(
        "border-border/40 relative border-r last:border-r-0",
        isToday && "bg-primary/[0.02]",
        isExternalDragOver && "bg-primary/[0.05]",
      )}
      onPointerMove={enableExternalDrop ? handleExternalDragMove : undefined}
      onPointerUp={enableExternalDrop ? handleExternalDrop : undefined}
      onPointerLeave={enableExternalDrop ? handlePointerLeave : undefined}
    >
      {/* Hour Cells */}
      {HOURS.map((hour) => {
        const hourStartMinutes = hour * 60;
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
              )}
              style={{
                top: `${(hour / 24) * 100}%`,
                height: `${100 / 24}%`,
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
          const { event, startMinutes, endMinutes, position, layout } = segment;
          const segmentKey = `${event.id}-${position}`;
          const segmentDuration = endMinutes - startMinutes;

          const topPercent = (startMinutes / 1440) * 100;
          const heightPercent = (segmentDuration / 1440) * 100;

          // Get positioning style based on overlap layout
          const positionStyle = getBlockPositionStyle(
            layout,
            topPercent,
            heightPercent,
          );

          // Compute actual pixel height to determine layout mode
          const segmentHeightPx = segmentDuration * pixelsPerMinute;
          const useCompactLayout = segmentHeightPx < COMPACT_LAYOUT_THRESHOLD_PX;

          // Compute drop target state for this block
          const dragItem = dragContext?.state.item;
          const previewPos = dragContext?.state.previewPosition;
          
          // A block is a valid drop target if:
          // 1. We're dragging a task
          // 2. Block type is goal or task (not commitment)
          // 3. The dragged task's goalId matches this block's sourceGoalId
          const isValidDropTarget = Boolean(
            dragContext?.state.isDragging &&
            dragItem?.type === "task" &&
            (event.blockType === "goal" || event.blockType === "task") &&
            event.sourceGoalId &&
            dragItem.goalId === event.sourceGoalId
          );
          
          // Check if drag is currently over this specific block
          const isDragOver = Boolean(
            isValidDropTarget &&
            previewPos?.dropTarget === "existing-block" &&
            previewPos?.targetBlockId === event.id
          );

          // Helper to get display times for the segment
          const getDisplayTimes = (previewStartMinutes?: number) => {
            const isOvernight = isOvernightEvent(event);

            if (isOvernight) {
              const eventStart = previewStartMinutes ?? event.startMinutes;
              const eventEnd = eventStart + event.durationMinutes;
              return {
                startTime: formatTimeFromMinutes(eventStart),
                endTime: formatTimeFromMinutes(eventEnd),
              };
            }

            const displayStart = previewStartMinutes ?? startMinutes;
            const displayEnd = displayStart + segmentDuration;
            return {
              startTime: formatTimeFromMinutes(displayStart),
              endTime: formatTimeFromMinutes(displayEnd),
            };
          };

          // Helper to create block content with optional preview times
          const createBlockContent = (previewStartMinutes?: number) => {
            const times = getDisplayTimes(previewStartMinutes);

            return (
              <Block
                title={event.title}
                startTime={times.startTime}
                endTime={times.endTime}
                color={event.color}
                status={
                  setBlockStyle
                    ? blockStyleToStatus(setBlockStyle)
                    : (event.status ?? "planned")
                }
                duration={segmentDuration as 30 | 60 | 240}
                pendingTaskCount={
                  position === "start" || position === "only"
                    ? event.pendingTaskCount
                    : undefined
                }
                completedTaskCount={
                  position === "start" || position === "only"
                    ? event.completedTaskCount
                    : undefined
                }
                segmentPosition={position}
                compactLayout={useCompactLayout}
                fillContainer
                isDropTarget={isValidDropTarget}
                isDragOver={isDragOver}
              />
            );
          };

          // Helper to wrap with resize if needed
          const wrapWithResize = (blockContent: React.ReactNode) => {
            if (onEventResize) {
              const canResizeTop = position === "only" || position === "start";
              const canResizeBottom = position === "only" || position === "end";

              return (
                <ResizableBlockWrapper
                  className="h-full"
                  startMinutes={event.startMinutes}
                  durationMinutes={event.durationMinutes}
                  pixelsPerMinute={pixelsPerMinute}
                  enableTopResize={canResizeTop}
                  enableBottomResize={canResizeBottom}
                  onResize={(newStart, newDuration) =>
                    onEventResize(event.id, newStart, newDuration)
                  }
                  onResizeEnd={() => onEventResizeEnd?.(event.id)}
                >
                  {blockContent}
                </ResizableBlockWrapper>
              );
            }
            return blockContent;
          };

          // Helper to wrap content with context menu
          const wrapWithContextMenu = (content: React.ReactNode, key: string) => {
            if (!onEventCopy && !onEventDelete && !onEventStatusChange) {
              return content;
            }
            return (
              <BlockContextMenu
                key={key}
                event={event}
                onCopy={() => onEventCopy?.(event)}
                onDuplicate={() => {
                  const nextDay = (event.dayIndex + 1) % 7;
                  onEventDuplicate?.(event.id, nextDay, event.startMinutes);
                }}
                onDelete={() => onEventDelete?.(event.id)}
                onToggleComplete={
                  canMarkComplete(event.status) && onEventStatusChange
                    ? () => {
                        const newStatus =
                          event.status === "completed" ? "planned" : "completed";
                        onEventStatusChange(event.id, newStatus);
                      }
                    : undefined
                }
              >
                {content}
              </BlockContextMenu>
            );
          };

          // Add drag capability if callbacks provided
          // Only allow dragging from the 'start' or 'only' segment
          if (
            (onEventDragEnd || onEventDuplicate) &&
            dayColumnWidth > 0 &&
            (position === "only" || position === "start")
          ) {
            return wrapWithContextMenu(
              <motion.div
                ref={(el) => registerBlockRef(event.id, el)}
                style={positionStyle}
                onMouseEnter={() => onEventHover?.(event)}
                onMouseLeave={() => onEventHover?.(null)}
                {...blockAnimations}
              >
                <DraggableBlockWrapper
                  className="h-full"
                  startMinutes={event.startMinutes}
                  dayIndex={dayIndex}
                  durationMinutes={event.durationMinutes}
                  pixelsPerMinute={pixelsPerMinute}
                  dayColumnWidth={dayColumnWidth}
                  minDayIndex={minDayIndex}
                  maxDayIndex={maxDayIndex}
                  onDragEnd={
                    onEventDragEnd
                      ? (newDay, newStart) =>
                          onEventDragEnd(event.id, newDay, newStart)
                      : undefined
                  }
                  onDuplicate={
                    onEventDuplicate
                      ? (newDay, newStart) =>
                          onEventDuplicate(event.id, newDay, newStart)
                      : undefined
                  }
                  onClick={() => onEventClick?.(event)}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  {({ isDragging, previewPosition }) => {
                    const previewStart =
                      isDragging && previewPosition
                        ? previewPosition.startMinutes
                        : undefined;
                    return wrapWithResize(createBlockContent(previewStart));
                  }}
                </DraggableBlockWrapper>
              </motion.div>,
              segmentKey,
            );
          }

          // 'end' segment of overnight blocks - resize only (bottom edge)
          if (position === "end" && onEventResize) {
            return wrapWithContextMenu(
              <motion.div
                ref={(el) => registerBlockRef(event.id, el)}
                className="z-10"
                style={positionStyle}
                onMouseEnter={() => onEventHover?.(event)}
                onMouseLeave={() => onEventHover?.(null)}
                onClick={() => onEventClick?.(event)}
                onDoubleClick={(e) => e.stopPropagation()}
                {...blockAnimations}
              >
                {wrapWithResize(createBlockContent())}
              </motion.div>,
              segmentKey,
            );
          }

          // Resize only (no drag)
          if (onEventResize) {
            return wrapWithContextMenu(
              <motion.div
                ref={(el) => registerBlockRef(event.id, el)}
                className="z-10"
                style={positionStyle}
                onMouseEnter={() => onEventHover?.(event)}
                onMouseLeave={() => onEventHover?.(null)}
                onClick={() => onEventClick?.(event)}
                onDoubleClick={(e) => e.stopPropagation()}
                {...blockAnimations}
              >
                {wrapWithResize(createBlockContent())}
              </motion.div>,
              segmentKey,
            );
          }

          return wrapWithContextMenu(
            <motion.div
              ref={(el) => registerBlockRef(event.id, el)}
              className="z-10"
              style={positionStyle}
              onMouseEnter={() => onEventHover?.(event)}
              onMouseLeave={() => onEventHover?.(null)}
              onClick={() => onEventClick?.(event)}
              onDoubleClick={(e) => e.stopPropagation()}
              {...blockAnimations}
            >
              {createBlockContent()}
            </motion.div>,
            segmentKey,
          );
        })}
      </AnimatePresence>

      {/* Drag-to-create preview */}
      {createPreview && createPreview.dayIndex === dayIndex && (() => {
        const previewHeightPx = createPreview.durationMinutes * pixelsPerMinute;
        const previewCompactLayout = previewHeightPx < COMPACT_LAYOUT_THRESHOLD_PX;
        return (
          <div
            className="pointer-events-none absolute right-1 left-1 z-40"
            style={{
              top: `${(createPreview.startMinutes / 1440) * 100}%`,
              height: `${(createPreview.durationMinutes / 1440) * 100}%`,
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
      
      {/* External drag preview (from backlog) */}
      {externalDragPreview && externalDragPreview.dayIndex === dayIndex && (() => {
        const previewHeightPx = externalDragPreview.durationMinutes * pixelsPerMinute;
        const previewCompactLayout = previewHeightPx < COMPACT_LAYOUT_THRESHOLD_PX;
        return (
          <div
            className="pointer-events-none absolute right-1 left-1 z-40 opacity-70"
            style={{
              top: `${(externalDragPreview.startMinutes / 1440) * 100}%`,
              height: `${(externalDragPreview.durationMinutes / 1440) * 100}%`,
            }}
          >
            <Block
              title={externalDragPreview.title}
              startTime={formatTimeFromMinutes(externalDragPreview.startMinutes)}
              endTime={formatTimeFromMinutes(
                externalDragPreview.startMinutes + externalDragPreview.durationMinutes,
              )}
              color={externalDragPreview.color}
              status="planned"
              duration={externalDragPreview.durationMinutes <= 30 ? 30 : 60}
              compactLayout={previewCompactLayout}
              fillContainer
            />
          </div>
        );
      })()}
    </div>
  );
}
