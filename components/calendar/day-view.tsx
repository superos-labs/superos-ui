"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Block,
  ResizableBlockWrapper,
  DraggableBlockWrapper,
  useGridDragCreate,
} from "@/components/block";
import { CalendarDayHeader } from "./calendar-day-header";
import { CurrentTimeLine } from "./current-time-line";
import {
  HOURS,
  PIXELS_PER_MINUTE,
  blockStyleToStatus,
  canMarkComplete,
  getSegmentsForDay,
  isOvernightEvent,
  type DayViewProps,
} from "./calendar-types";
import {
  formatHour,
  formatTimeFromMinutes,
  isToday,
  isCurrentHour,
  snapToGrid,
} from "./calendar-utils";
import {
  BlockContextMenu,
  EmptySpaceContextMenu,
} from "./calendar-context-menu";

// Subtle scale animation for block enter/exit
const blockAnimations = {
  initial: { scale: 0.96, opacity: 0.8 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 },
  transition: { duration: 0.12, ease: "easeOut" as const },
};

export function DayView({
  selectedDate,
  showHourLabels = true,
  headerIsVisible = true,
  events = [],
  mode = "schedule",
  setBlockStyle,
  onEventResize,
  onEventResizeEnd,
  onEventDragEnd,
  onEventDuplicate,
  onGridDoubleClick,
  onGridDragCreate,
  onEventCopy,
  onEventDelete,
  onEventStatusChange,
  onEventPaste,
  hasClipboardContent = false,
  onEventHover,
  onGridPositionHover,
}: DayViewProps) {
  const today = isToday(selectedDate);
  const dayName = selectedDate
    .toLocaleDateString("en-US", { weekday: "short" })
    .slice(0, 3);

  const headerCols = showHourLabels ? "grid-cols-[3rem_1fr]" : "grid-cols-1";
  const gridCols = showHourLabels ? "grid-cols-[3rem_1fr]" : "grid-cols-1";

  // Get the day index for the selected date (0 = Monday)
  const selectedDayOfWeek = selectedDate.getDay();
  const selectedDayIndex = selectedDayOfWeek === 0 ? 6 : selectedDayOfWeek - 1;

  // Get segments for this day (handles overnight events automatically)
  const daySegments = getSegmentsForDay(events, selectedDayIndex, mode);

  // Measure day column width for drag calculations
  const dayColumnRef = React.useRef<HTMLDivElement>(null);
  const [dayColumnWidth, setDayColumnWidth] = React.useState(0);

  React.useEffect(() => {
    if (!dayColumnRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setDayColumnWidth(width);
    });
    observer.observe(dayColumnRef.current);
    return () => observer.disconnect();
  }, []);

  // Hook for drag-to-create blocks
  const {
    isDragging: isCreatingBlock,
    preview: createPreview,
    handlePointerDown: handleGridPointerDown,
    handlePointerMove: handleGridPointerMove,
    handlePointerUp: handleGridPointerUp,
  } = useGridDragCreate({
    pixelsPerMinute: PIXELS_PER_MINUTE,
    onCreate: onGridDragCreate,
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Day Header - matches week view style */}
      {headerIsVisible && (
        <div
          className={cn("border-border/40 grid shrink-0 border-b", headerCols)}
        >
          {showHourLabels && <div className="border-border/40 border-r" />}
          <CalendarDayHeader
            day={dayName}
            date={selectedDate.getDate()}
            isToday={today}
            showBorder={false}
            className="bg-white dark:bg-zinc-950"
          />
        </div>
      )}

      {/* Time Grid */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
        <div className={cn("relative grid min-h-[1536px]", gridCols)}>
          {/* Hour Labels */}
          {showHourLabels && (
            <div className="border-border/40 relative border-r">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-0 left-0"
                  style={{
                    top: `${(hour / 24) * 100}%`,
                    height: `${100 / 24}%`,
                  }}
                >
                  <span
                    className={cn(
                      "absolute -top-2.5 right-2 text-[10px] font-medium tabular-nums",
                      isCurrentHour(hour)
                        ? "text-primary"
                        : "text-muted-foreground/50",
                    )}
                  >
                    {hour === 0 ? "" : formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Day Column */}
          <div
            ref={dayColumnRef}
            className="relative"
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
            onPointerCancel={handleGridPointerUp}
          >
            {HOURS.map((hour) => {
              const hourStartMinutes = hour * 60;
              return (
                <EmptySpaceContextMenu
                  key={hour}
                  canPaste={hasClipboardContent}
                  onPaste={() => {
                    onEventPaste?.(selectedDayIndex, hourStartMinutes);
                  }}
                  onCreate={() => {
                    onGridDoubleClick?.(selectedDayIndex, hourStartMinutes);
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
                    onPointerDown={(e) =>
                      handleGridPointerDown(e, selectedDayIndex, hour * 60)
                    }
                    onMouseEnter={() =>
                      onGridPositionHover?.({
                        dayIndex: selectedDayIndex,
                        startMinutes: hourStartMinutes,
                      })
                    }
                    onMouseLeave={() => onGridPositionHover?.(null)}
                    onDoubleClick={(e) => {
                      if (isCreatingBlock || !onGridDoubleClick) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relativeY = e.clientY - rect.top;
                      const minutesIntoHour = (relativeY / rect.height) * 60;
                      const startMinutes = snapToGrid(
                        hour * 60 + minutesIntoHour,
                      );
                      onGridDoubleClick(selectedDayIndex, startMinutes);
                    }}
                  />
                </EmptySpaceContextMenu>
              );
            })}

            {/* Event Segments */}
            <AnimatePresence>
              {daySegments.map((segment) => {
                const { event, startMinutes, endMinutes, position } = segment;
                const segmentKey = `${event.id}-${position}`;
                const segmentDuration = endMinutes - startMinutes;
                
                const topPercent = (startMinutes / 1440) * 100;
                const heightPercent = (segmentDuration / 1440) * 100;

                // Helper to get display times for the segment
                const getDisplayTimes = (previewStartMinutes?: number) => {
                  const isOvernight = isOvernightEvent(event);
                  
                  if (isOvernight) {
                    // Calculate end time from preview start + duration (both update during drag)
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
                      taskCount={position === "start" || position === "only" ? event.taskCount : undefined}
                      segmentPosition={position}
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
                        pixelsPerMinute={PIXELS_PER_MINUTE}
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
                const wrapWithContextMenu = (
                  content: React.ReactNode,
                  key: string,
                ) => {
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
                                event.status === "completed"
                                  ? "planned"
                                  : "completed";
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
                        pixelsPerMinute={PIXELS_PER_MINUTE}
                        dayColumnWidth={dayColumnWidth}
                        minDayIndex={selectedDayIndex}
                        maxDayIndex={selectedDayIndex}
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

                // 'end' segment of overnight blocks - resize only
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
            {createPreview && createPreview.dayIndex === selectedDayIndex && (
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
                  fillContainer
                />
              </div>
            )}
          </div>

          {/* Current Time Indicator */}
          {today && (
            <CurrentTimeLine view="day" showHourLabels={showHourLabels} />
          )}
        </div>
      </div>
    </div>
  );
}
