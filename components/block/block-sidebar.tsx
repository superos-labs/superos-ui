"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCalendarLine,
  RiTimeLine,
  RiFileTextLine,
  RiCheckLine,
  RiCloseLine,
  RiFlagLine,
} from "@remixicon/react";
import type { BlockColor } from "./block-colors";

// Types
type IconComponent = React.ComponentType<{ className?: string }>;

interface BlockSidebarTask {
  id: string;
  label: string;
  completed?: boolean;
}

interface BlockSidebarGoal {
  id: string;
  label: string;
  icon: IconComponent;
  color: string;
}

interface BlockSidebarData {
  id: string;
  title: string;
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Start time in 24h format (HH:MM) */
  startTime: string;
  /** End time in 24h format (HH:MM) */
  endTime: string;
  /** Optional notes for the block */
  notes?: string;
  /** Tasks associated with this block */
  tasks: BlockSidebarTask[];
  /** Color theme for the block */
  color: BlockColor;
  /** Associated goal */
  goal?: BlockSidebarGoal;
}

// Helper to format date for display
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Helper to format time for display
function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Auto-resizing textarea component
interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function AutoResizeTextarea({
  className,
  value,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      className={cn("resize-none overflow-hidden", className)}
      {...props}
    />
  );
}

// Task row component
interface BlockSidebarTaskRowProps {
  task: BlockSidebarTask;
  onToggle?: (id: string) => void;
}

function BlockSidebarTaskRow({ task, onToggle }: BlockSidebarTaskRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg py-2 px-2 transition-all",
        "hover:bg-muted/60",
      )}
    >
      <button
        onClick={() => onToggle?.(task.id)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
          task.completed
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-background hover:bg-muted",
        )}
      >
        {task.completed && <RiCheckLine className="size-3" />}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          task.completed
            ? "text-muted-foreground line-through"
            : "text-foreground",
        )}
      >
        {task.label}
      </span>
    </div>
  );
}

// Section header component
interface BlockSidebarSectionProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}

function BlockSidebarSection({
  icon,
  label,
  children,
  className,
}: BlockSidebarSectionProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

// Main component
interface BlockSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Block data to display */
  block: BlockSidebarData;
  /** Callback when a task is toggled */
  onToggleTask?: (taskId: string) => void;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when title is updated */
  onTitleChange?: (title: string) => void;
  /** Callback when date is updated */
  onDateChange?: (date: string) => void;
  /** Callback when start time is updated */
  onStartTimeChange?: (startTime: string) => void;
  /** Callback when end time is updated */
  onEndTimeChange?: (endTime: string) => void;
  /** Callback when notes are updated */
  onNotesChange?: (notes: string) => void;
}

function BlockSidebar({
  block,
  onToggleTask,
  onClose,
  onTitleChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onNotesChange,
  className,
  ...props
}: BlockSidebarProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
        {/* Close button row */}
        {onClose && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RiCloseLine className="size-4" />
            </button>
          </div>
        )}

        {/* Title row */}
        {onTitleChange ? (
          <input
            type="text"
            value={block.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={cn(
              "w-full bg-transparent text-lg font-semibold text-foreground leading-tight",
              "outline-none placeholder:text-muted-foreground/60",
              "focus:outline-none",
            )}
            placeholder="Block title..."
          />
        ) : (
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            {block.title}
          </h2>
        )}

        {/* Associated goal */}
        {block.goal && (
          <div className="flex items-center gap-2">
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
              <block.goal.icon className={cn("size-3", block.goal.color)} />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <RiFlagLine className="size-3" />
              <span>{block.goal.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 p-4">
        {/* Date & Time */}
        <BlockSidebarSection
          icon={<RiCalendarLine className="size-3.5" />}
          label="Date & Time"
        >
          <div className="flex flex-col gap-2">
            {onDateChange ? (
              <input
                type="date"
                value={block.date}
                onChange={(e) => onDateChange(e.target.value)}
                className={cn(
                  "w-full rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                  "outline-none focus:bg-muted",
                )}
              />
            ) : (
              <span className="text-sm font-medium text-foreground">
                {formatDateDisplay(block.date)}
              </span>
            )}
            <div className="flex items-center gap-2">
              {onStartTimeChange && onEndTimeChange ? (
                <>
                  <input
                    type="time"
                    value={block.startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className={cn(
                      "flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                      "outline-none focus:bg-muted",
                    )}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={block.endTime}
                    onChange={(e) => onEndTimeChange(e.target.value)}
                    className={cn(
                      "flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground",
                      "outline-none focus:bg-muted",
                    )}
                  />
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <RiTimeLine className="size-3.5" />
                  <span>
                    {formatTimeDisplay(block.startTime)} –{" "}
                    {formatTimeDisplay(block.endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </BlockSidebarSection>

        {/* Notes */}
        <BlockSidebarSection
          icon={<RiFileTextLine className="size-3.5" />}
          label="Notes"
        >
          {onNotesChange ? (
            <AutoResizeTextarea
              value={block.notes || ""}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes..."
              className={cn(
                "w-full min-h-[24px] bg-transparent text-sm text-foreground leading-relaxed",
                "outline-none placeholder:text-muted-foreground/60",
              )}
            />
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              {block.notes || "No notes"}
            </p>
          )}
        </BlockSidebarSection>

        {/* Tasks */}
        <BlockSidebarSection
          icon={<RiCheckLine className="size-3.5" />}
          label="Tasks"
        >
          <div className="flex flex-col">
            {block.tasks.length > 0 ? (
              block.tasks.map((task) => (
                <BlockSidebarTaskRow
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                />
              ))
            ) : (
              <p className="pl-5 text-sm text-muted-foreground">No tasks</p>
            )}
          </div>
        </BlockSidebarSection>
      </div>
    </div>
  );
}

export { BlockSidebar, BlockSidebarTaskRow, BlockSidebarSection };
export type {
  BlockSidebarProps,
  BlockSidebarData,
  BlockSidebarTask,
  BlockSidebarGoal,
};
