"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { RiCheckLine, RiCloseLine } from "@remixicon/react"

const BLOCK_COLORS = {
  violet: {
    border: "border-l-violet-500",
    bg: "bg-violet-200",
    bgHover: "hover:bg-violet-300",
    text: "text-violet-600",
    outlinedBorder: "border-violet-200",
    outlinedBg: "bg-violet-50",
    outlinedBgHover: "hover:bg-violet-100",
    completedBorder: "border-l-violet-300",
    completedBg: "bg-violet-100",
    completedBgHover: "hover:bg-violet-200",
    completedText: "text-violet-400",
  },
  indigo: {
    border: "border-l-indigo-500",
    bg: "bg-indigo-200",
    bgHover: "hover:bg-indigo-300",
    text: "text-indigo-600",
    outlinedBorder: "border-indigo-200",
    outlinedBg: "bg-indigo-50",
    outlinedBgHover: "hover:bg-indigo-100",
    completedBorder: "border-l-indigo-300",
    completedBg: "bg-indigo-100",
    completedBgHover: "hover:bg-indigo-200",
    completedText: "text-indigo-400",
  },
  blue: {
    border: "border-l-blue-500",
    bg: "bg-blue-200",
    bgHover: "hover:bg-blue-300",
    text: "text-blue-600",
    outlinedBorder: "border-blue-200",
    outlinedBg: "bg-blue-50",
    outlinedBgHover: "hover:bg-blue-100",
    completedBorder: "border-l-blue-300",
    completedBg: "bg-blue-100",
    completedBgHover: "hover:bg-blue-200",
    completedText: "text-blue-400",
  },
  sky: {
    border: "border-l-sky-500",
    bg: "bg-sky-200",
    bgHover: "hover:bg-sky-300",
    text: "text-sky-600",
    outlinedBorder: "border-sky-200",
    outlinedBg: "bg-sky-50",
    outlinedBgHover: "hover:bg-sky-100",
    completedBorder: "border-l-sky-300",
    completedBg: "bg-sky-100",
    completedBgHover: "hover:bg-sky-200",
    completedText: "text-sky-400",
  },
  cyan: {
    border: "border-l-cyan-500",
    bg: "bg-cyan-200",
    bgHover: "hover:bg-cyan-300",
    text: "text-cyan-600",
    outlinedBorder: "border-cyan-200",
    outlinedBg: "bg-cyan-50",
    outlinedBgHover: "hover:bg-cyan-100",
    completedBorder: "border-l-cyan-300",
    completedBg: "bg-cyan-100",
    completedBgHover: "hover:bg-cyan-200",
    completedText: "text-cyan-400",
  },
  teal: {
    border: "border-l-teal-500",
    bg: "bg-teal-200",
    bgHover: "hover:bg-teal-300",
    text: "text-teal-600",
    outlinedBorder: "border-teal-200",
    outlinedBg: "bg-teal-50",
    outlinedBgHover: "hover:bg-teal-100",
    completedBorder: "border-l-teal-300",
    completedBg: "bg-teal-100",
    completedBgHover: "hover:bg-teal-200",
    completedText: "text-teal-400",
  },
  emerald: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-200",
    bgHover: "hover:bg-emerald-300",
    text: "text-emerald-600",
    outlinedBorder: "border-emerald-200",
    outlinedBg: "bg-emerald-50",
    outlinedBgHover: "hover:bg-emerald-100",
    completedBorder: "border-l-emerald-300",
    completedBg: "bg-emerald-100",
    completedBgHover: "hover:bg-emerald-200",
    completedText: "text-emerald-400",
  },
  green: {
    border: "border-l-green-500",
    bg: "bg-green-200",
    bgHover: "hover:bg-green-300",
    text: "text-green-600",
    outlinedBorder: "border-green-200",
    outlinedBg: "bg-green-50",
    outlinedBgHover: "hover:bg-green-100",
    completedBorder: "border-l-green-300",
    completedBg: "bg-green-100",
    completedBgHover: "hover:bg-green-200",
    completedText: "text-green-400",
  },
  lime: {
    border: "border-l-lime-500",
    bg: "bg-lime-200",
    bgHover: "hover:bg-lime-300",
    text: "text-lime-600",
    outlinedBorder: "border-lime-200",
    outlinedBg: "bg-lime-50",
    outlinedBgHover: "hover:bg-lime-100",
    completedBorder: "border-l-lime-300",
    completedBg: "bg-lime-100",
    completedBgHover: "hover:bg-lime-200",
    completedText: "text-lime-400",
  },
  yellow: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-200",
    bgHover: "hover:bg-yellow-300",
    text: "text-yellow-600",
    outlinedBorder: "border-yellow-200",
    outlinedBg: "bg-yellow-50",
    outlinedBgHover: "hover:bg-yellow-100",
    completedBorder: "border-l-yellow-300",
    completedBg: "bg-yellow-100",
    completedBgHover: "hover:bg-yellow-200",
    completedText: "text-yellow-400",
  },
  amber: {
    border: "border-l-amber-500",
    bg: "bg-amber-200",
    bgHover: "hover:bg-amber-300",
    text: "text-amber-600",
    outlinedBorder: "border-amber-200",
    outlinedBg: "bg-amber-50",
    outlinedBgHover: "hover:bg-amber-100",
    completedBorder: "border-l-amber-300",
    completedBg: "bg-amber-100",
    completedBgHover: "hover:bg-amber-200",
    completedText: "text-amber-400",
  },
  orange: {
    border: "border-l-orange-500",
    bg: "bg-orange-200",
    bgHover: "hover:bg-orange-300",
    text: "text-orange-600",
    outlinedBorder: "border-orange-200",
    outlinedBg: "bg-orange-50",
    outlinedBgHover: "hover:bg-orange-100",
    completedBorder: "border-l-orange-300",
    completedBg: "bg-orange-100",
    completedBgHover: "hover:bg-orange-200",
    completedText: "text-orange-400",
  },
  red: {
    border: "border-l-red-500",
    bg: "bg-red-200",
    bgHover: "hover:bg-red-300",
    text: "text-red-600",
    outlinedBorder: "border-red-200",
    outlinedBg: "bg-red-50",
    outlinedBgHover: "hover:bg-red-100",
    completedBorder: "border-l-red-300",
    completedBg: "bg-red-100",
    completedBgHover: "hover:bg-red-200",
    completedText: "text-red-400",
  },
  rose: {
    border: "border-l-rose-500",
    bg: "bg-rose-200",
    bgHover: "hover:bg-rose-300",
    text: "text-rose-600",
    outlinedBorder: "border-rose-200",
    outlinedBg: "bg-rose-50",
    outlinedBgHover: "hover:bg-rose-100",
    completedBorder: "border-l-rose-300",
    completedBg: "bg-rose-100",
    completedBgHover: "hover:bg-rose-200",
    completedText: "text-rose-400",
  },
  pink: {
    border: "border-l-pink-500",
    bg: "bg-pink-200",
    bgHover: "hover:bg-pink-300",
    text: "text-pink-600",
    outlinedBorder: "border-pink-200",
    outlinedBg: "bg-pink-50",
    outlinedBgHover: "hover:bg-pink-100",
    completedBorder: "border-l-pink-300",
    completedBg: "bg-pink-100",
    completedBgHover: "hover:bg-pink-200",
    completedText: "text-pink-400",
  },
  fuchsia: {
    border: "border-l-fuchsia-500",
    bg: "bg-fuchsia-200",
    bgHover: "hover:bg-fuchsia-300",
    text: "text-fuchsia-600",
    outlinedBorder: "border-fuchsia-200",
    outlinedBg: "bg-fuchsia-50",
    outlinedBgHover: "hover:bg-fuchsia-100",
    completedBorder: "border-l-fuchsia-300",
    completedBg: "bg-fuchsia-100",
    completedBgHover: "hover:bg-fuchsia-200",
    completedText: "text-fuchsia-400",
  },
  slate: {
    border: "border-l-slate-400",
    bg: "bg-slate-200",
    bgHover: "hover:bg-slate-300",
    text: "text-slate-600",
    outlinedBorder: "border-slate-200",
    outlinedBg: "bg-slate-50",
    outlinedBgHover: "hover:bg-slate-100",
    completedBorder: "border-l-slate-300",
    completedBg: "bg-slate-100",
    completedBgHover: "hover:bg-slate-200",
    completedText: "text-slate-400",
  },
} as const

type BlockColor = keyof typeof BLOCK_COLORS
type BlockStatus = "planned" | "completed" | "blueprint"
type BlockDuration = 30 | 60 | 240

// Height in pixels per 30 minutes
const HEIGHT_PER_30_MIN = 40

interface BlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  startTime?: string
  endTime?: string
  color?: BlockColor
  status?: BlockStatus
  duration?: BlockDuration
  taskCount?: number
  /** Show action buttons on hover for outlined variant (default: true) */
  showOutlinedActions?: boolean
}

function Block({
  title,
  startTime,
  endTime,
  color = "indigo",
  status = "planned",
  duration = 30,
  taskCount,
  showOutlinedActions = true,
  className,
  style,
  ...props
}: BlockProps) {
  const timeDisplay = startTime && endTime 
    ? `${startTime} – ${endTime}` 
    : startTime || endTime

  const colorStyles = BLOCK_COLORS[color]
  const isCompleted = status === "completed"
  const isOutlined = status === "blueprint"
  
  const height = (duration / 30) * HEIGHT_PER_30_MIN

  const isCompact = duration <= 30

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md px-2.5 text-sm",
        isCompact ? "justify-center py-1" : "py-2",
        "cursor-pointer transition-all",
        isOutlined ? [
          "border border-dashed",
          colorStyles.outlinedBorder,
          colorStyles.outlinedBg,
          colorStyles.outlinedBgHover,
          colorStyles.text,
        ] : isCompleted ? [
          "border-l-[3px]",
          colorStyles.completedBorder,
          colorStyles.completedBg,
          colorStyles.completedBgHover,
          colorStyles.completedText,
          "opacity-60",
        ] : [
          "border-l-[3px]",
          colorStyles.border,
          colorStyles.bg,
          colorStyles.bgHover,
          colorStyles.text,
        ],
        className
      )}
      style={{ height, ...style }}
      {...props}
    >
      <span className="truncate font-medium leading-tight">
        {title}
      </span>
      {timeDisplay && !isCompact && (
        <span className="mt-0.5 truncate text-[11px]">
          {timeDisplay}
        </span>
      )}
      {taskCount !== undefined && taskCount > 0 && !isOutlined && (
        <div
          className={cn(
            "flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
            isCompact 
              ? "absolute bottom-1 left-1/2 -translate-x-1/2" 
              : "absolute bottom-1.5 right-1.5"
          )}
        >
          <RiCheckLine className="size-3" />
          <span>{taskCount}</span>
        </div>
      )}
      {isOutlined && showOutlinedActions && (
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            isCompact 
              ? "absolute top-1/2 right-1.5 -translate-y-1/2" 
              : "absolute top-1.5 right-1.5"
          )}
        >
          <button
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors",
              "bg-white shadow-sm hover:text-green-600",
              colorStyles.text
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <RiCheckLine className="size-3.5" />
          </button>
          <button
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors",
              "bg-white text-muted-foreground shadow-sm hover:text-foreground"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <RiCloseLine className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export { Block, BLOCK_COLORS }
export type { BlockProps, BlockColor, BlockStatus, BlockDuration }
