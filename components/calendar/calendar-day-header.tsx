"use client";

import { cn } from "@/lib/utils";
import type { CalendarDayHeaderProps } from "./calendar-types";

export function CalendarDayHeader({
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
