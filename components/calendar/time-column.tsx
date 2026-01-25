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
  blockStyleToStatus,
  canMarkComplete,
  isOvernightEvent,
  type TimeColumnProps,
} from "./calendar-types";
import { formatTimeFromMinutes, snapToGrid, blockAnimations } from "./calendar-utils";
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
  mode = "schedule",
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
}: TimeColumnProps) {
  return (
    <div
      className={cn(
        "border-border/40 relative border-r last:border-r-0",
        isToday && "bg-primary/[0.02]",
      )}
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
          const { event, startMinutes, endMinutes, position } = segment;
          const segmentKey = `${event.id}-${position}`;
          const segmentDuration = endMinutes - startMinutes;

          const topPercent = (startMinutes / 1440) * 100;
          const heightPercent = (segmentDuration / 1440) * 100;

          // Compute actual pixel height to determine layout mode
          const segmentHeightPx = segmentDuration * pixelsPerMinute;
          const useCompactLayout = segmentHeightPx < COMPACT_LAYOUT_THRESHOLD_PX;

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
                taskCount={
                  position === "start" || position === "only"
                    ? event.taskCount
                    : undefined
                }
                segmentPosition={position}
                compactLayout={useCompactLayout}
                fillContainer
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
                className="absolute right-1 left-1"
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                }}
                onMouseEnter={() => onEventHover?.(event)}
                onMouseLeave={() => onEventHover?.(null)}
                {...blockAnimations}
              >
                <DraggableBlockWrapper
                  className="h-full"
                  startMinutes={event.startMinutes}
                  dayIndex={event.dayIndex}
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
                className="absolute right-1 left-1 z-10"
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                }}
                onMouseEnter={() => onEventHover?.(event)}
                onMouseLeave={() => onEventHover?.(null)}
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
                className="absolute right-1 left-1 z-10"
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                }}
                onMouseEnter={() => onEventHover?.(event)}
                onMouseLeave={() => onEventHover?.(null)}
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
              className="absolute right-1 left-1 z-10"
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
              }}
              onMouseEnter={() => onEventHover?.(event)}
              onMouseLeave={() => onEventHover?.(null)}
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
    </div>
  );
}
