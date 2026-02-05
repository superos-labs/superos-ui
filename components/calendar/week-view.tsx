"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useGridDragCreate } from "@/components/block";
import { CalendarDayHeader } from "./calendar-day-header";
import { CurrentTimeLine } from "./current-time-line";
import { TimeColumn } from "./time-column";
import { DeadlineTray } from "./deadline-tray";
import {
  HOURS,
  getSegmentsForDay,
  getGridHeight,
  getPixelsPerMinute,
  getGridHeightFromZoom,
  getPixelsPerMinuteFromZoom,
  getDayLabels,
  type WeekViewProps,
} from "./calendar-types";
import { useScrollToCurrentTime } from "./use-scroll-to-current-time";
import {
  formatHour,
  isToday,
  isCurrentHour,
  calculateOverlapLayout,
} from "./calendar-utils";

export function WeekView({
  weekDates,
  showHourLabels = true,
  events,
  density,
  zoom,
  setBlockStyle,
  weekStartsOn = 1,
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
  onDeadlineDrop,
  deadlines,
  goalDeadlines,
  milestoneDeadlines,
  allDayEvents,
  onDeadlineToggleComplete,
  onDeadlineUnassign,
  onDeadlineHover,
  onToggleAllDayEvent,
  onAllDayEventHover,
  onGoalDeadlineClick,
  onToggleMilestoneComplete,
  onDayHeaderHover,
  onMarkDayComplete,
  dayStartMinutes,
  dayEndMinutes,
  dayBoundariesEnabled,
  dayBoundariesDisplay,
}: WeekViewProps) {
  // Get day labels based on week start preference
  const dayLabels = getDayLabels(weekStartsOn);

  // Compute grid dimensions based on zoom (preferred) or density (legacy)
  const gridHeight =
    zoom !== undefined ? getGridHeightFromZoom(zoom) : getGridHeight(density);
  const pixelsPerMinute =
    zoom !== undefined
      ? getPixelsPerMinuteFromZoom(zoom)
      : getPixelsPerMinute(density);

  // Scroll to current time on mount and when "Today" is clicked
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isCurrentWeek = weekDates.some((date) => isToday(date));
  useScrollToCurrentTime(scrollContainerRef, {
    zoom,
    triggerKey: scrollToCurrentTimeKey,
    enabled: isCurrentWeek,
  });
  const headerCols = showHourLabels
    ? "grid-cols-[3rem_repeat(7,1fr)]"
    : "grid-cols-[repeat(7,1fr)]";
  const gridCols = showHourLabels
    ? "grid-cols-[3rem_repeat(7,1fr)]"
    : "grid-cols-[repeat(7,1fr)]";

  // Measure day column width for drag calculations
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [dayColumnWidth, setDayColumnWidth] = React.useState(0);

  React.useEffect(() => {
    if (!gridRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const gridWidth = entries[0]?.contentRect.width ?? 0;
      const gutterWidth = showHourLabels ? 48 : 0; // 3rem = 48px
      setDayColumnWidth((gridWidth - gutterWidth) / 7);
    });
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [showHourLabels]);

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
      {/* Day Headers */}
      <div
        className={cn("border-border/40 grid shrink-0 border-b", headerCols)}
      >
        {showHourLabels && <div className="border-border/40 border-r" />}
        {dayLabels.map((day, index) => {
          const date = weekDates[index];

          return (
            <CalendarDayHeader
              key={day}
              day={day}
              date={date.getDate()}
              isToday={isToday(date)}
              dayIndex={index}
              fullDate={date}
              onDeadlineDrop={onDeadlineDrop}
              onDayHeaderHover={onDayHeaderHover}
            />
          );
        })}
      </div>

      {/* Deadline Tray - only visible when there are deadlines or all-day events */}
      <DeadlineTray
        weekDates={weekDates}
        deadlines={deadlines ?? new Map()}
        goalDeadlines={goalDeadlines}
        milestoneDeadlines={milestoneDeadlines}
        allDayEvents={allDayEvents}
        showHourLabels={showHourLabels}
        onToggleComplete={onDeadlineToggleComplete}
        onUnassign={onDeadlineUnassign}
        onDeadlineHover={onDeadlineHover}
        onToggleAllDayEvent={onToggleAllDayEvent}
        onAllDayEventHover={onAllDayEventHover}
        onGoalClick={onGoalDeadlineClick}
        onToggleMilestoneComplete={onToggleMilestoneComplete}
      />

      {/* Time Grid */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div
          ref={gridRef}
          className={cn("relative grid", gridCols)}
          style={{ minHeight: gridHeight }}
          onPointerMove={handleGridPointerMove}
          onPointerUp={handleGridPointerUp}
          onPointerCancel={handleGridPointerUp}
        >
          {/* Hour Labels */}
          {showHourLabels && (
            <div className="border-border/40 relative border-r">
              {HOURS.map((hour) => {
                const topPercent = (hour / 24) * 100;
                const heightPercent = 100 / 24;

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

          {/* Day Columns */}
          {dayLabels.map((day, dayIndex) => {
            const date = weekDates[dayIndex];
            const dateString = date.toISOString().split("T")[0];
            const rawSegments = getSegmentsForDay(events, dateString);
            const daySegments = calculateOverlapLayout(rawSegments);

            return (
              <TimeColumn
                key={day}
                dayIndex={dayIndex}
                isToday={isToday(date)}
                segments={daySegments}
                dayColumnWidth={dayColumnWidth}
                pixelsPerMinute={pixelsPerMinute}
                setBlockStyle={setBlockStyle}
                isCreatingBlock={isCreatingBlock}
                createPreview={createPreview}
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
            );
          })}

          {/* Current Time Indicator */}
          <CurrentTimeLine
            view="week"
            showHourLabels={showHourLabels}
            weekStartsOn={weekStartsOn}
          />
        </div>
      </div>
    </div>
  );
}
