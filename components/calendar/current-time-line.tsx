"use client";

import * as React from "react";
import type { CalendarView } from "./calendar-types";

interface CurrentTimeLineProps {
  view?: CalendarView;
  showHourLabels?: boolean;
}

export function CurrentTimeLine({
  view = "week",
  showHourLabels = true,
}: CurrentTimeLineProps) {
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
