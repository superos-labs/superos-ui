"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useGridDragCreate } from "@/components/block";
import { CalendarDayHeader } from "./calendar-day-header";
import { CurrentTimeLine } from "./current-time-line";
import { TimeColumn } from "./time-column";
import {
  HOURS,
  getSegmentsForDay,
  getGridHeight,
  getPixelsPerMinute,
  getGridHeightFromZoom,
  getPixelsPerMinuteFromZoom,
  type DayViewProps,
} from "./calendar-types";
import { useScrollToCurrentTime } from "./use-scroll-to-current-time";
import {
  formatHour,
  isToday,
  isCurrentHour,
  calculateOverlapLayout,
} from "./calendar-utils";

export function DayView({
  selectedDate,
  showHourLabels = true,
  headerIsVisible = true,
  events,
  density,
  zoom,
  setBlockStyle,
  scrollToCurrentTimeKey,
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
  onEventClick,
  enableExternalDrop = false,
  onExternalDrop,
  externalDragPreview,
  onDayHeaderHover,
  onMarkDayComplete,
  dayStartMinutes,
  dayEndMinutes,
  dayBoundariesEnabled,
  dayBoundariesDisplay,
}: DayViewProps) {
  const today = isToday(selectedDate);
  const dayName = selectedDate
    .toLocaleDateString("en-US", { weekday: "short" })
    .slice(0, 3);

  // Calculate visible hour range for hidden mode
  const visibleStartHour =
    dayBoundariesEnabled &&
    dayBoundariesDisplay === "hidden" &&
    dayStartMinutes !== undefined
      ? Math.floor(dayStartMinutes / 60)
      : 0;
  const visibleEndHour =
    dayBoundariesEnabled &&
    dayBoundariesDisplay === "hidden" &&
    dayEndMinutes !== undefined
      ? Math.ceil(dayEndMinutes / 60)
      : 24;
  const visibleHours = HOURS.filter(
    (h) => h >= visibleStartHour && h < visibleEndHour,
  );
  const visibleHoursCount = visibleHours.length;

  // Compute grid dimensions based on zoom (preferred) or density (legacy)
  // Adjust for visible hours when in hidden mode
  const fullGridHeight =
    zoom !== undefined ? getGridHeightFromZoom(zoom) : getGridHeight(density);
  const gridHeight =
    dayBoundariesEnabled && dayBoundariesDisplay === "hidden"
      ? (fullGridHeight / 24) * visibleHoursCount
      : fullGridHeight;
  const pixelsPerMinute =
    zoom !== undefined
      ? getPixelsPerMinuteFromZoom(zoom)
      : getPixelsPerMinute(density);

  // Scroll to current time on mount and when "Today" is clicked
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  useScrollToCurrentTime(scrollContainerRef, {
    zoom,
    triggerKey: scrollToCurrentTimeKey,
    enabled: today,
  });

  const headerCols = showHourLabels ? "grid-cols-[3rem_1fr]" : "grid-cols-1";
  const gridCols = showHourLabels ? "grid-cols-[3rem_1fr]" : "grid-cols-1";

  // Get the day index for the selected date (0 = Monday)
  const selectedDayOfWeek = selectedDate.getDay();
  const selectedDayIndex = selectedDayOfWeek === 0 ? 6 : selectedDayOfWeek - 1;

  // Get ISO date string for segment matching
  const selectedDateString = selectedDate.toISOString().split("T")[0];

  // Get segments for this day (handles overnight events automatically)
  const rawSegments = getSegmentsForDay(events, selectedDateString);
  const daySegments = calculateOverlapLayout(rawSegments);

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
    pixelsPerMinute,
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
            dayIndex={selectedDayIndex}
            fullDate={selectedDate}
            onDayHeaderHover={onDayHeaderHover}
          />
        </div>
      )}

      {/* Time Grid */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div
          ref={dayColumnRef}
          className={cn("relative grid", gridCols)}
          style={{ minHeight: gridHeight }}
          onPointerMove={handleGridPointerMove}
          onPointerUp={handleGridPointerUp}
          onPointerCancel={handleGridPointerUp}
        >
          {/* Hour Labels */}
          {showHourLabels && (
            <div className="border-border/40 relative border-r">
              {(dayBoundariesEnabled && dayBoundariesDisplay === "hidden"
                ? visibleHours
                : HOURS
              ).map((hour, hourIndex) => {
                const topPercent =
                  dayBoundariesEnabled && dayBoundariesDisplay === "hidden"
                    ? (hourIndex / visibleHoursCount) * 100
                    : (hour / 24) * 100;
                const heightPercent =
                  dayBoundariesEnabled && dayBoundariesDisplay === "hidden"
                    ? 100 / visibleHoursCount
                    : 100 / 24;

                return (
                  <div
                    key={hour}
                    className="absolute right-0 left-0"
                    style={{
                      top: `${topPercent}%`,
                      height: `${heightPercent}%`,
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
                );
              })}
            </div>
          )}

          {/* Day Column */}
          <TimeColumn
            dayIndex={selectedDayIndex}
            isToday={today}
            segments={daySegments}
            dayColumnWidth={dayColumnWidth}
            pixelsPerMinute={pixelsPerMinute}
            setBlockStyle={setBlockStyle}
            isCreatingBlock={isCreatingBlock}
            createPreview={createPreview}
            minDayIndex={selectedDayIndex}
            maxDayIndex={selectedDayIndex}
            hasClipboardContent={hasClipboardContent}
            onPointerDown={handleGridPointerDown}
            onEventResize={onEventResize}
            onEventResizeEnd={onEventResizeEnd}
            onEventDragEnd={onEventDragEnd}
            onEventDuplicate={onEventDuplicate}
            onGridDoubleClick={onGridDoubleClick}
            onEventCopy={onEventCopy}
            onEventDelete={onEventDelete}
            onEventStatusChange={onEventStatusChange}
            onEventPaste={onEventPaste}
            onEventHover={onEventHover}
            onGridPositionHover={onGridPositionHover}
            onEventClick={onEventClick}
            enableExternalDrop={enableExternalDrop}
            onExternalDrop={onExternalDrop}
            externalDragPreview={externalDragPreview}
            dayStartMinutes={dayStartMinutes}
            dayEndMinutes={dayEndMinutes}
            dayBoundariesEnabled={dayBoundariesEnabled}
            dayBoundariesDisplay={dayBoundariesDisplay}
          />

          {/* Current Time Indicator */}
          {today && (
            <CurrentTimeLine view="day" showHourLabels={showHourLabels} />
          )}
        </div>
      </div>
    </div>
  );
}
