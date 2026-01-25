"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiFlagLine, RiCheckLine, RiDeleteBinLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { DragItem } from "@/lib/drag-types";
import type { DeadlineTask } from "@/hooks/use-unified-schedule";

// ============================================================================
// Types
// ============================================================================

interface DeadlineTrayProps {
  /** The dates for each day of the week */
  weekDates: Date[];
  /** Map of ISO date string to array of deadline tasks for that day */
  deadlines: Map<string, DeadlineTask[]>;
  /** Called when a deadline is moved (dragged to a different header) */
  onDeadlineMove?: (goalId: string, taskId: string, newDate: string) => void;
  /** Whether this tray should be visible (has any deadlines) */
  visible?: boolean;
  /** Whether to show the time gutter (for alignment with week view) */
  showHourLabels?: boolean;
  /** Called when a deadline task's completion status is toggled */
  onToggleComplete?: (goalId: string, taskId: string) => void;
  /** Called when a deadline is removed (unassigned) */
  onUnassign?: (goalId: string, taskId: string) => void;
  /** Called when mouse enters/leaves a deadline pill (for keyboard shortcuts) */
  onDeadlineHover?: (deadline: DeadlineTask | null) => void;
}

interface DeadlinePillProps {
  deadline: DeadlineTask;
  date: string;
  onToggleComplete?: () => void;
  onUnassign?: () => void;
  onHover?: (deadline: DeadlineTask | null) => void;
}

// ============================================================================
// Components
// ============================================================================

function DeadlinePill({ deadline, date, onToggleComplete, onUnassign, onHover }: DeadlinePillProps) {
  const dragContext = useDragContextOptional();
  const canDrag = !!dragContext && !deadline.completed;
  
  const dragItem: DragItem = {
    type: "task",
    goalId: deadline.goalId,
    goalLabel: deadline.goalLabel,
    goalColor: deadline.goalColor,
    taskId: deadline.taskId,
    taskLabel: deadline.label,
    sourceDeadline: date,
  };
  
  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  const pillContent = (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all",
        "bg-muted/60 hover:bg-muted",
        "min-w-0 max-w-full",  // Allow shrinking, don't exceed container
        deadline.completed && "opacity-50 line-through",
        isDragging && "opacity-30",
        canDrag && "cursor-grab active:cursor-grabbing",
      )}
      onMouseEnter={() => onHover?.(deadline)}
      onMouseLeave={() => onHover?.(null)}
      {...(canDrag ? draggableProps : {})}
    >
      <RiFlagLine 
        className={cn(
          "size-3 shrink-0",
          getIconColorClass(deadline.goalColor)
        )} 
      />
      <span className="truncate">{deadline.label}</span>
    </div>
  );

  // If no callbacks, just return the pill without context menu
  if (!onToggleComplete && !onUnassign) {
    return pillContent;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {pillContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onToggleComplete && (
          <ContextMenuItem onClick={onToggleComplete}>
            <RiCheckLine className="size-4" />
            {deadline.completed ? "Mark incomplete" : "Mark complete"}
            <ContextMenuShortcut>⌘⏎</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        {onToggleComplete && onUnassign && <ContextMenuSeparator />}
        {onUnassign && (
          <ContextMenuItem variant="destructive" onClick={onUnassign}>
            <RiDeleteBinLine className="size-4" />
            Remove deadline
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function DeadlineTray({
  weekDates,
  deadlines,
  visible = true,
  showHourLabels = true,
  onToggleComplete,
  onUnassign,
  onDeadlineHover,
}: DeadlineTrayProps) {
  // Don't render if no deadlines
  if (!visible || deadlines.size === 0) {
    return null;
  }

  const headerCols = showHourLabels
    ? "grid-cols-[3rem_repeat(7,1fr)]"
    : "grid-cols-[repeat(7,1fr)]";

  return (
    <div
      className={cn(
        "border-border/40 grid shrink-0 border-b bg-muted/20",
        headerCols
      )}
    >
      {/* Time gutter spacer */}
      {showHourLabels && <div className="border-border/40 border-r" />}
      
      {/* Day columns */}
      {weekDates.map((date, index) => {
        const isoDate = date.toISOString().split("T")[0];
        const dayDeadlines = deadlines.get(isoDate) ?? [];
        
        return (
          <div
            key={index}
            className={cn(
              "flex flex-wrap gap-1 px-1.5 py-1.5",
              "border-border/40 border-r last:border-r-0",
              "min-h-[28px]", // Minimum height for visual consistency
              "overflow-hidden", // Prevent content from expanding column
            )}
          >
            {dayDeadlines.map((deadline) => (
              <DeadlinePill
                key={deadline.taskId}
                deadline={deadline}
                date={isoDate}
                onToggleComplete={
                  onToggleComplete 
                    ? () => onToggleComplete(deadline.goalId, deadline.taskId)
                    : undefined
                }
                onUnassign={
                  onUnassign
                    ? () => onUnassign(deadline.goalId, deadline.taskId)
                    : undefined
                }
                onHover={onDeadlineHover}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
