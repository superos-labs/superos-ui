"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Block,
  ResizableBlockWrapper,
  DraggableBlockWrapper,
  type BlockColor,
  type BlockStatus,
} from "@/components/block";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type CalendarView = "week" | "day";
type CalendarMode = "schedule" | "blueprint";
type BlockStyle = "planned" | "completed" | "blueprint";

interface CalendarEvent {
  id: string;
  title: string;
  dayIndex: number; // 0 = Monday, 6 = Sunday
  startMinutes: number; // Minutes from midnight (0-1440)
  durationMinutes: number;
  color: BlockColor;
  taskCount?: number;
  status?: "base" | "completed" | "outlined";
}

function blockStyleToStatus(style: BlockStyle): BlockStatus {
  return style;
}

function modeToStatus(mode: CalendarMode, dayIndex?: number): BlockStatus {
  if (mode === "blueprint") return "blueprint";
  // Monday (0), Tuesday (1), Wednesday (2) show as completed
  if (dayIndex !== undefined && dayIndex <= 2) return "completed";
  return "planned";
}

interface CalendarProps {
  view?: CalendarView;
  mode?: CalendarMode;
  selectedDate?: Date;
  showHourLabels?: boolean;
  headerIsVisible?: boolean;
  /** Events to display on the calendar */
  events?: CalendarEvent[];
  setBlockStyle?: BlockStyle;
  /** Called when an event is being resized */
  onEventResize?: (
    eventId: string,
    newStartMinutes: number,
    newDurationMinutes: number,
  ) => void;
  /** Called when resize operation ends */
  onEventResizeEnd?: (eventId: string) => void;
  /** Called when drag operation ends with the final position */
  onEventDragEnd?: (
    eventId: string,
    newDayIndex: number,
    newStartMinutes: number,
  ) => void;
}

function getWeekDates(referenceDate: Date = new Date()) {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);

  return DAYS.map((_, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return d;
  });
}

function formatHour(hour: number) {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isCurrentHour(hour: number) {
  return new Date().getHours() === hour;
}

interface CalendarDayHeaderProps {
  day: string;
  date: number;
  isToday?: boolean;
  showBorder?: boolean;
  className?: string;
}

function CalendarDayHeader({
  day,
  date,
  isToday: today = false,
  showBorder = true,
  className,
}: CalendarDayHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 py-3",
        showBorder && "border-border/40 border-r last:border-r-0",
        today && "bg-primary/[0.03]",
        className,
      )}
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

function CurrentTimeLine({
  view = "week",
  showHourLabels = true,
}: {
  view?: CalendarView;
  showHourLabels?: boolean;
}) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const minutes = now.getHours() * 60 + now.getMinutes();
  const position = (minutes / (24 * 60)) * 100;

  const today = now.getDay();
  const dayIndex = today === 0 ? 6 : today - 1;

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });

  const gutterWidth = showHourLabels ? "3rem" : "0px";

  if (view === "day") {
    return (
      <div
        className="pointer-events-none absolute right-0 left-0 z-20"
        style={{ top: `${position}%` }}
      >
        {/* Time label in gutter */}
        {showHourLabels && (
          <div className="absolute left-0 flex h-0 w-12 items-center justify-end pr-1.5">
            <span className="rounded bg-red-500 px-1 py-px text-[10px] font-medium tabular-nums text-white">
              {timeLabel}
            </span>
          </div>
        )}

        {/* Line across the day column */}
        <div
          className="absolute right-0 h-[2px] bg-red-500"
          style={{ left: gutterWidth }}
        />

        {/* Dot at the start */}
        <div
          className="absolute top-1/2 size-3 -translate-x-1.5 -translate-y-1/2 rounded-full bg-red-500 shadow-sm"
          style={{ left: gutterWidth }}
        />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20"
      style={{ top: `${position}%` }}
    >
      {/* Subtle line across entire calendar */}
      <div
        className="absolute right-0 h-px bg-red-500/20"
        style={{ left: gutterWidth }}
      />

      {/* Time label in gutter */}
      {showHourLabels && (
        <div className="absolute left-0 flex h-0 w-12 items-center justify-end pr-1.5">
          <span className="rounded bg-red-500 px-1 py-px text-[10px] font-medium tabular-nums text-white">
            {timeLabel}
          </span>
        </div>
      )}

      {/* Vibrant line across today's column */}
      <div
        className="absolute h-[2px] bg-red-500"
        style={{
          left: showHourLabels
            ? `calc(3rem + (100% - 3rem) * ${dayIndex} / 7)`
            : `calc(100% * ${dayIndex} / 7)`,
          width: showHourLabels ? `calc((100% - 3rem) / 7)` : `calc(100% / 7)`,
        }}
      />

      {/* Dot at the start of the line */}
      <div
        className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-red-500 shadow-sm"
        style={{
          left: showHourLabels
            ? `calc(3rem + (100% - 3rem) * ${dayIndex} / 7 - 6px)`
            : `calc(100% * ${dayIndex} / 7 - 6px)`,
        }}
      />
    </div>
  );
}

function formatEventTime(hour: number, minutes: number = 0) {
  const h = hour % 12 || 12;
  const m = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : "";
  const ampm = hour < 12 ? "a" : "p";
  return `${h}${m}${ampm}`;
}

function formatTimeFromMinutes(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return formatEventTime(hour, minutes);
}

// Fixed grid height in pixels (min-h-[1536px] = 1536px for 24 hours)
const GRID_HEIGHT_PX = 1536;
const PIXELS_PER_MINUTE = GRID_HEIGHT_PX / (24 * 60);

interface DayViewProps {
  selectedDate: Date;
  showHourLabels?: boolean;
  headerIsVisible?: boolean;
  events?: CalendarEvent[];
  mode?: CalendarMode;
  setBlockStyle?: BlockStyle;
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
}

function DayView({
  selectedDate,
  showHourLabels = true,
  headerIsVisible = true,
  events = [],
  mode = "schedule",
  setBlockStyle,
  onEventResize,
  onEventResizeEnd,
  onEventDragEnd,
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

  // Filter events for this day
  const dayEvents = events.filter((e) => e.dayIndex === selectedDayIndex);

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
          <div ref={dayColumnRef} className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "border-border/40 absolute right-0 left-0 border-b transition-colors",
                  "hover:bg-muted/30",
                )}
                style={{
                  top: `${(hour / 24) * 100}%`,
                  height: `${100 / 24}%`,
                }}
              />
            ))}

            {/* Events */}
            {dayEvents.map((event) => {
              const topPercent = (event.startMinutes / (24 * 60)) * 100;
              const heightPercent = (event.durationMinutes / (24 * 60)) * 100;

              // Helper to create block content with optional preview times
              const createBlockContent = (previewStartMinutes?: number) => {
                const displayStart = previewStartMinutes ?? event.startMinutes;
                const displayEnd = displayStart + event.durationMinutes;

                return (
                  <Block
                    title={event.title}
                    startTime={formatTimeFromMinutes(displayStart)}
                    endTime={formatTimeFromMinutes(displayEnd)}
                    color={event.color}
                    status={
                      setBlockStyle
                        ? blockStyleToStatus(setBlockStyle)
                        : modeToStatus(mode, selectedDayIndex)
                    }
                    duration={event.durationMinutes as 30 | 60 | 240}
                    taskCount={event.taskCount}
                    fillContainer
                  />
                );
              };

              // Helper to wrap with resize if needed
              const wrapWithResize = (blockContent: React.ReactNode) => {
                if (onEventResize) {
                  return (
                    <ResizableBlockWrapper
                      className="h-full"
                      startMinutes={event.startMinutes}
                      durationMinutes={event.durationMinutes}
                      pixelsPerMinute={PIXELS_PER_MINUTE}
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

              // Add drag capability if callbacks provided
              // In day view, drag only changes time (vertical), not day
              if (onEventDragEnd && dayColumnWidth > 0) {
                return (
                  <DraggableBlockWrapper
                    key={event.id}
                    className="absolute right-1 left-1"
                    style={{
                      top: `${topPercent}%`,
                      height: `${heightPercent}%`,
                    }}
                    startMinutes={event.startMinutes}
                    dayIndex={selectedDayIndex}
                    durationMinutes={event.durationMinutes}
                    pixelsPerMinute={PIXELS_PER_MINUTE}
                    dayColumnWidth={dayColumnWidth}
                    minDayIndex={selectedDayIndex}
                    maxDayIndex={selectedDayIndex}
                    onDragEnd={(newDay, newStart) =>
                      onEventDragEnd(event.id, newDay, newStart)
                    }
                  >
                    {({ isDragging, previewPosition }) => {
                      const previewStart = isDragging && previewPosition 
                        ? previewPosition.startMinutes 
                        : undefined;
                      return wrapWithResize(createBlockContent(previewStart));
                    }}
                  </DraggableBlockWrapper>
                );
              }

              // Resize only (no drag)
              if (onEventResize) {
                return (
                  <div
                    key={event.id}
                    className="absolute right-1 left-1 z-10"
                    style={{
                      top: `${topPercent}%`,
                      height: `${heightPercent}%`,
                    }}
                  >
                    {wrapWithResize(createBlockContent())}
                  </div>
                );
              }

              return (
                <div
                  key={event.id}
                  className="absolute right-1 left-1 z-10"
                  style={{
                    top: `${topPercent}%`,
                    height: `${heightPercent}%`,
                  }}
                >
                  {createBlockContent()}
                </div>
              );
            })}
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

interface WeekViewProps {
  weekDates: Date[];
  showHourLabels?: boolean;
  events?: CalendarEvent[];
  mode?: CalendarMode;
  setBlockStyle?: BlockStyle;
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
}

function WeekView({
  weekDates,
  showHourLabels = true,
  events = [],
  mode = "schedule",
  setBlockStyle,
  onEventResize,
  onEventResizeEnd,
  onEventDragEnd,
}: WeekViewProps) {
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Day Headers */}
      <div
        className={cn("border-border/40 grid shrink-0 border-b", headerCols)}
      >
        {showHourLabels && <div className="border-border/40 border-r" />}
        {DAYS.map((day, index) => {
          const date = weekDates[index];

          return (
            <CalendarDayHeader
              key={day}
              day={day}
              date={date.getDate()}
              isToday={isToday(date)}
            />
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
        <div ref={gridRef} className={cn("relative grid min-h-[1536px]", gridCols)}>
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

          {/* Day Columns */}
          {DAYS.map((day, dayIndex) => {
            const date = weekDates[dayIndex];
            const today = isToday(date);
            const dayEvents = events.filter((e) => e.dayIndex === dayIndex);

            return (
              <div
                key={day}
                className={cn(
                  "border-border/40 relative border-r last:border-r-0",
                  today && "bg-primary/[0.02]",
                )}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "border-border/40 absolute right-0 left-0 border-b transition-colors",
                      "hover:bg-muted/30",
                    )}
                    style={{
                      top: `${(hour / 24) * 100}%`,
                      height: `${100 / 24}%`,
                    }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const topPercent = (event.startMinutes / (24 * 60)) * 100;
                  const heightPercent =
                    (event.durationMinutes / (24 * 60)) * 100;

                  // Helper to create block content with optional preview times
                  const createBlockContent = (previewStartMinutes?: number) => {
                    const displayStart = previewStartMinutes ?? event.startMinutes;
                    const displayEnd = displayStart + event.durationMinutes;

                    return (
                      <Block
                        title={event.title}
                        startTime={formatTimeFromMinutes(displayStart)}
                        endTime={formatTimeFromMinutes(displayEnd)}
                        color={event.color}
                        status={
                          setBlockStyle
                            ? blockStyleToStatus(setBlockStyle)
                            : modeToStatus(mode, dayIndex)
                        }
                        duration={event.durationMinutes as 30 | 60 | 240}
                        taskCount={event.taskCount}
                        fillContainer
                      />
                    );
                  };

                  // Helper to wrap with resize if needed
                  const wrapWithResize = (blockContent: React.ReactNode) => {
                    if (onEventResize) {
                      return (
                        <ResizableBlockWrapper
                          className="h-full"
                          startMinutes={event.startMinutes}
                          durationMinutes={event.durationMinutes}
                          pixelsPerMinute={PIXELS_PER_MINUTE}
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

                  // Add drag capability if callbacks provided
                  if (onEventDragEnd && dayColumnWidth > 0) {
                    return (
                      <DraggableBlockWrapper
                        key={event.id}
                        className="absolute right-1 left-1"
                        style={{
                          top: `${topPercent}%`,
                          height: `${heightPercent}%`,
                        }}
                        startMinutes={event.startMinutes}
                        dayIndex={dayIndex}
                        durationMinutes={event.durationMinutes}
                        pixelsPerMinute={PIXELS_PER_MINUTE}
                        dayColumnWidth={dayColumnWidth}
                        onDragEnd={(newDay, newStart) =>
                          onEventDragEnd(event.id, newDay, newStart)
                        }
                      >
                        {({ isDragging, previewPosition }) => {
                          const previewStart = isDragging && previewPosition 
                            ? previewPosition.startMinutes 
                            : undefined;
                          return wrapWithResize(createBlockContent(previewStart));
                        }}
                      </DraggableBlockWrapper>
                    );
                  }

                  // Resize only (no drag)
                  if (onEventResize) {
                    return (
                      <div
                        key={event.id}
                        className="absolute right-1 left-1 z-10"
                        style={{
                          top: `${topPercent}%`,
                          height: `${heightPercent}%`,
                        }}
                      >
                        {wrapWithResize(createBlockContent())}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={event.id}
                      className="absolute right-1 left-1 z-10"
                      style={{
                        top: `${topPercent}%`,
                        height: `${heightPercent}%`,
                      }}
                    >
                      {createBlockContent()}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Current Time Indicator */}
          <CurrentTimeLine view="week" showHourLabels={showHourLabels} />
        </div>
      </div>
    </div>
  );
}

export function Calendar({
  view = "week",
  mode = "schedule",
  selectedDate,
  showHourLabels = true,
  headerIsVisible = true,
  events = [],
  setBlockStyle,
  onEventResize,
  onEventResizeEnd,
  onEventDragEnd,
}: CalendarProps) {
  const today = React.useMemo(() => new Date(), []);
  const dateToUse = selectedDate ?? today;
  const weekDates = React.useMemo(() => getWeekDates(dateToUse), [dateToUse]);

  if (view === "day") {
    return (
      <DayView
        selectedDate={dateToUse}
        showHourLabels={showHourLabels}
        headerIsVisible={headerIsVisible}
        events={events}
        mode={mode}
        setBlockStyle={setBlockStyle}
        onEventResize={onEventResize}
        onEventResizeEnd={onEventResizeEnd}
        onEventDragEnd={onEventDragEnd}
      />
    );
  }

  return (
    <WeekView
      weekDates={weekDates}
      showHourLabels={showHourLabels}
      events={events}
      mode={mode}
      setBlockStyle={setBlockStyle}
      onEventResize={onEventResize}
      onEventResizeEnd={onEventResizeEnd}
      onEventDragEnd={onEventDragEnd}
    />
  );
}

export { CalendarDayHeader };
export type {
  CalendarView,
  CalendarMode,
  CalendarProps,
  CalendarDayHeaderProps,
  CalendarEvent,
  BlockStyle,
};
