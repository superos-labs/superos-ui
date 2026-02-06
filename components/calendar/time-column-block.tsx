/**
 * =============================================================================
 * File: time-column-block.tsx
 * =============================================================================
 *
 * Renders a single calendar block segment inside a TimeColumn.
 *
 * Handles:
 * - Absolute positioning within the column.
 * - Overlap-based horizontal layout.
 * - Dragging, duplicating, and resizing (when enabled).
 * - Context menu actions.
 * - Compact vs full block layout based on height.
 *
 * This component represents the lowest-level interactive unit of the
 * calendar block rendering pipeline.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Compute block positioning styles from overlap layout.
 * - Render Block with correct visual mode and metadata.
 * - Wrap block with drag, resize, and context menu behaviors.
 * - Surface hover and click signals upward.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing global drag state.
 * - Computing overlap layout.
 * - Persisting event mutations.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Only "start" or "only" segments are draggable.
 * - Overnight "end" segments are resize-only.
 * - Zoom and density effects are resolved upstream via pixelsPerMinute.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - TimeColumnBlock
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Block,
  ResizableBlockWrapper,
  DraggableBlockWrapper,
} from "@/components/block";
import {
  COMPACT_LAYOUT_THRESHOLD_PX,
  BLOCK_MARGIN_PX,
  BLOCK_GAP_PX,
  blockStyleToStatus,
  canMarkComplete,
  isOvernightEvent,
  type BlockStyle,
  type BlockStatus,
  type CalendarEvent,
  type OverlapLayout,
  type EventDaySegment,
} from "./calendar-types";
import { formatTimeFromMinutes, blockAnimations } from "./calendar-utils";
import { BlockContextMenu } from "./calendar-context-menu";
import { useDragContextOptional } from "@/components/drag";

// ============================================================================
// Block positioning utilities
// ============================================================================

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

// ============================================================================
// TimeColumnBlock component
// ============================================================================

interface TimeColumnBlockProps {
  segment: EventDaySegment;
  dayIndex: number;
  pixelsPerMinute: number;
  dayColumnWidth: number;
  minDayIndex?: number;
  maxDayIndex?: number;
  setBlockStyle?: BlockStyle;
  registerBlockRef: (blockId: string, el: HTMLDivElement | null) => void;
  onEventResize?: (
    eventId: string,
    newStartMinutes: number,
    newDurationMinutes: number,
  ) => void;
  onEventResizeEnd?: (eventId: string) => void;
  onEventDragEnd?: (
    eventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onEventDuplicate?: (
    sourceEventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
  onEventCopy?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventStatusChange?: (eventId: string, status: BlockStatus) => void;
  onEventHover?: (event: CalendarEvent | null) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

/**
 * Renders a single event segment within a TimeColumn.
 * Handles block display, drag/resize wrappers, and context menus.
 */
export function TimeColumnBlock({
  segment,
  dayIndex,
  pixelsPerMinute,
  dayColumnWidth,
  minDayIndex,
  maxDayIndex,
  setBlockStyle,
  registerBlockRef,
  onEventResize,
  onEventResizeEnd,
  onEventDragEnd,
  onEventDuplicate,
  onEventCopy,
  onEventDelete,
  onEventStatusChange,
  onEventHover,
  onEventClick,
}: TimeColumnBlockProps) {
  const { event, startMinutes, endMinutes, position, layout } = segment;
  const segmentDuration = endMinutes - startMinutes;
  const dragContext = useDragContextOptional();

  // Calculate position percentages
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

  const isValidDropTarget = Boolean(
    dragContext?.state.isDragging &&
    dragItem?.type === "task" &&
    (event.blockType === "goal" || event.blockType === "task") &&
    event.sourceGoalId &&
    dragItem.goalId === event.sourceGoalId,
  );

  const isDragOver = Boolean(
    isValidDropTarget &&
    previewPos?.dropTarget === "existing-block" &&
    previewPos?.targetBlockId === event.id,
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
        blockType={
          position === "start" || position === "only"
            ? event.blockType
            : undefined
        }
        sourceProvider={event.sourceProvider}
        customColor={event.customColor}
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
  const wrapWithContextMenu = (content: React.ReactNode) => {
    if (!onEventCopy && !onEventDelete && !onEventStatusChange) {
      return <>{content}</>;
    }
    return (
      <BlockContextMenu
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

  // Draggable segment (start or only position)
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
              ? (newDay, newStart) => onEventDragEnd(event.id, newDay, newStart)
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
    );
  }

  // End segment of overnight blocks - resize only (bottom edge)
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
    );
  }

  // Static block (no drag, no resize)
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
  );
}
