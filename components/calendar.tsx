"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Block, type BlockColor, type BlockStatus } from "@/components/block"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
const HOURS = Array.from({ length: 24 }, (_, i) => i)

type CalendarView = "week" | "day"
type CalendarMode = "schedule" | "blueprint"
type BlockStyle = "planned" | "completed" | "blueprint"

interface CalendarEvent {
  title: string
  dayIndex: number // 0 = Monday, 6 = Sunday
  startHour: number
  durationMinutes: number
  color: BlockColor
  taskCount?: number
  status?: "base" | "completed" | "outlined"
}

function blockStyleToStatus(style: BlockStyle): BlockStatus {
  return style
}

function modeToStatus(mode: CalendarMode, dayIndex?: number): BlockStatus {
  if (mode === "blueprint") return "blueprint"
  // Monday (0), Tuesday (1), Wednesday (2) show as completed
  if (dayIndex !== undefined && dayIndex <= 2) return "completed"
  return "planned"
}

interface CalendarProps {
  view?: CalendarView
  mode?: CalendarMode
  selectedDate?: Date
  showHourLabels?: boolean
  headerIsVisible?: boolean
  /** Events to display on the calendar */
  events?: CalendarEvent[]
  setBlockStyle?: BlockStyle
}

function getWeekDates(referenceDate: Date = new Date()) {
  const date = new Date(referenceDate)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date)
  monday.setDate(diff)
  
  return DAYS.map((_, index) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    return d
  })
}

function formatHour(hour: number) {
  if (hour === 0) return "12a"
  if (hour === 12) return "12p"
  if (hour < 12) return `${hour}a`
  return `${hour - 12}p`
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

function isToday(date: Date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isCurrentHour(hour: number) {
  return new Date().getHours() === hour
}

interface CalendarDayHeaderProps {
  day: string
  date: number
  isToday?: boolean
  showBorder?: boolean
  className?: string
}

function CalendarDayHeader({ 
  day, 
  date, 
  isToday: today = false, 
  showBorder = true,
  className 
}: CalendarDayHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 py-3",
        showBorder && "border-border/40 border-r last:border-r-0",
        today && "bg-primary/[0.03]",
        className
      )}
    >
      <span className={cn(
        "text-sm font-medium",
        today ? "text-foreground" : "text-muted-foreground"
      )}>
        {day}
      </span>
      <span className={cn(
        "flex size-7 items-center justify-center text-sm tabular-nums",
        today 
          ? "bg-red-500 text-white rounded-lg font-medium" 
          : "text-muted-foreground"
      )}>
        {date}
      </span>
    </div>
  )
}

function CurrentTimeLine({ view = "week", showHourLabels = true }: { view?: CalendarView; showHourLabels?: boolean }) {
  const [now, setNow] = React.useState(new Date())
  
  React.useEffect(() => {
    const updateTime = () => setNow(new Date())
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const minutes = now.getHours() * 60 + now.getMinutes()
  const position = (minutes / (24 * 60)) * 100
  
  const today = now.getDay()
  const dayIndex = today === 0 ? 6 : today - 1
  
  const timeLabel = now.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: false 
  })
  
  const gutterWidth = showHourLabels ? "3rem" : "0px"
  
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
    )
  }
  
  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20"
      style={{ top: `${position}%` }}
    >
      {/* Subtle line across entire calendar */}
      <div className="absolute right-0 h-px bg-red-500/20" style={{ left: gutterWidth }} />
      
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
          width: showHourLabels 
            ? `calc((100% - 3rem) / 7)`
            : `calc(100% / 7)`
        }}
      />
      
      {/* Dot at the start of the line */}
      <div 
        className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-red-500 shadow-sm"
        style={{ 
          left: showHourLabels 
            ? `calc(3rem + (100% - 3rem) * ${dayIndex} / 7 - 6px)`
            : `calc(100% * ${dayIndex} / 7 - 6px)`
        }}
      />
    </div>
  )
}

function formatEventTime(hour: number, minutes: number = 0) {
  const h = hour % 12 || 12
  const m = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""
  const ampm = hour < 12 ? "a" : "p"
  return `${h}${m}${ampm}`
}

function DayView({ selectedDate, showHourLabels = true, headerIsVisible = true, events = [], mode = "schedule", setBlockStyle }: { selectedDate: Date; showHourLabels?: boolean; headerIsVisible?: boolean; events?: CalendarEvent[]; mode?: CalendarMode; setBlockStyle?: BlockStyle }) {
  const today = isToday(selectedDate)
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)
  
  const headerCols = showHourLabels ? "grid-cols-[3rem_1fr]" : "grid-cols-1"
  const gridCols = showHourLabels ? "grid-cols-[3rem_1fr]" : "grid-cols-1"
  
  // Get the day index for the selected date (0 = Monday)
  const selectedDayOfWeek = selectedDate.getDay()
  const selectedDayIndex = selectedDayOfWeek === 0 ? 6 : selectedDayOfWeek - 1
  
  // Filter events for this day
  const dayEvents = events.filter(e => e.dayIndex === selectedDayIndex)
  
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Day Header - matches week view style */}
      {headerIsVisible && (
        <div className={cn("border-border/40 grid shrink-0 border-b", headerCols)}>
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
                    height: `${100 / 24}%`
                  }}
                >
                  <span className={cn(
                    "absolute -top-2.5 right-2 text-[10px] font-medium tabular-nums",
                    isCurrentHour(hour) ? "text-primary" : "text-muted-foreground/50"
                  )}>
                    {hour === 0 ? "" : formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Day Column */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "border-border/40 absolute right-0 left-0 border-b transition-colors",
                  "hover:bg-muted/30"
                )}
                style={{ 
                  top: `${(hour / 24) * 100}%`,
                  height: `${100 / 24}%`
                }}
              />
            ))}
            
            {/* Sample Events */}
            {dayEvents.map((event, idx) => {
              const topPercent = (event.startHour / 24) * 100
              const heightPercent = (event.durationMinutes / (24 * 60)) * 100
              const endHour = event.startHour + Math.floor(event.durationMinutes / 60)
              const endMinutes = event.durationMinutes % 60
              
              return (
                <div
                  key={idx}
                  className="absolute right-1 left-1 z-10"
                  style={{
                    top: `${topPercent}%`,
                    height: `${heightPercent}%`,
                  }}
                >
                  <Block
                    title={event.title}
                    startTime={formatEventTime(event.startHour)}
                    endTime={formatEventTime(endHour, endMinutes)}
                    color={event.color}
                    status={setBlockStyle ? blockStyleToStatus(setBlockStyle) : modeToStatus(mode, selectedDayIndex)}
                    duration={event.durationMinutes as 30 | 60 | 240}
                    taskCount={event.taskCount}
                    fillContainer
                  />
                </div>
              )
            })}
          </div>
          
          {/* Current Time Indicator */}
          {today && <CurrentTimeLine view="day" showHourLabels={showHourLabels} />}
        </div>
      </div>
    </div>
  )
}

function WeekView({ weekDates, showHourLabels = true, events = [], mode = "schedule", setBlockStyle }: { weekDates: Date[]; showHourLabels?: boolean; events?: CalendarEvent[]; mode?: CalendarMode; setBlockStyle?: BlockStyle }) {
  const headerCols = showHourLabels ? "grid-cols-[3rem_repeat(7,1fr)]" : "grid-cols-[repeat(7,1fr)]"
  const gridCols = showHourLabels ? "grid-cols-[3rem_repeat(7,1fr)]" : "grid-cols-[repeat(7,1fr)]"
  
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Day Headers */}
      <div className={cn("border-border/40 grid shrink-0 border-b", headerCols)}>
        {showHourLabels && <div className="border-border/40 border-r" />}
        {DAYS.map((day, index) => {
          const date = weekDates[index]
          
          return (
            <CalendarDayHeader
              key={day}
              day={day}
              date={date.getDate()}
              isToday={isToday(date)}
            />
          )
        })}
      </div>
      
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
                    height: `${100 / 24}%`
                  }}
                >
                  <span className={cn(
                    "absolute -top-2.5 right-2 text-[10px] font-medium tabular-nums",
                    isCurrentHour(hour) ? "text-primary" : "text-muted-foreground/50"
                  )}>
                    {hour === 0 ? "" : formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Day Columns */}
          {DAYS.map((day, dayIndex) => {
            const date = weekDates[dayIndex]
            const today = isToday(date)
            const dayEvents = events.filter(e => e.dayIndex === dayIndex)
            
            return (
              <div
                key={day}
                className={cn(
                  "border-border/40 relative border-r last:border-r-0",
                  today && "bg-primary/[0.02]"
                )}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "border-border/40 absolute right-0 left-0 border-b transition-colors",
                      "hover:bg-muted/30"
                    )}
                    style={{ 
                      top: `${(hour / 24) * 100}%`,
                      height: `${100 / 24}%`
                    }}
                  />
                ))}
                
                {/* Sample Events */}
                {dayEvents.map((event, idx) => {
                  const topPercent = (event.startHour / 24) * 100
                  const heightPercent = (event.durationMinutes / (24 * 60)) * 100
                  const endHour = event.startHour + Math.floor(event.durationMinutes / 60)
                  const endMinutes = event.durationMinutes % 60
                  
                  return (
                    <div
                      key={idx}
                      className="absolute right-1 left-1 z-10"
                      style={{
                        top: `${topPercent}%`,
                        height: `${heightPercent}%`,
                      }}
                    >
                      <Block
                        title={event.title}
                        startTime={formatEventTime(event.startHour)}
                        endTime={formatEventTime(endHour, endMinutes)}
                        color={event.color}
                        status={setBlockStyle ? blockStyleToStatus(setBlockStyle) : modeToStatus(mode, dayIndex)}
                        duration={event.durationMinutes as 30 | 60 | 240}
                        taskCount={event.taskCount}
                        fillContainer
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
          
          {/* Current Time Indicator */}
          <CurrentTimeLine view="week" showHourLabels={showHourLabels} />
        </div>
      </div>
    </div>
  )
}

export function Calendar({ 
  view = "week", 
  mode = "schedule",
  selectedDate, 
  showHourLabels = true, 
  headerIsVisible = true, 
  events = [], 
  setBlockStyle
}: CalendarProps) {
  const today = React.useMemo(() => new Date(), [])
  const dateToUse = selectedDate ?? today
  const weekDates = React.useMemo(() => getWeekDates(dateToUse), [dateToUse])
  
  if (view === "day") {
    return <DayView selectedDate={dateToUse} showHourLabels={showHourLabels} headerIsVisible={headerIsVisible} events={events} mode={mode} setBlockStyle={setBlockStyle} />
  }
  
  return <WeekView weekDates={weekDates} showHourLabels={showHourLabels} events={events} mode={mode} setBlockStyle={setBlockStyle} />
}

export { CalendarDayHeader }
export type { CalendarView, CalendarMode, CalendarProps, CalendarDayHeaderProps, CalendarEvent, BlockStyle }
