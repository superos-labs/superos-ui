"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiFlagLine, RiCheckLine, RiDeleteBinLine, RiPokerDiamondsLine } from "@remixicon/react";
import { getIconColorClass, getIconBgClass } from "@/lib/colors";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ProviderBadge } from "@/components/integrations";
import type { DragItem } from "@/lib/drag-types";
import type { DeadlineTask, DeadlineGoal, DeadlineMilestone } from "@/lib/unified-schedule";
import type { CalendarProvider, ExternalEvent } from "@/lib/calendar-sync";

// ============================================================================
// Types
// ============================================================================

/** All-day event for display in the deadline tray */
export interface AllDayEvent {
  id: string;
  title: string;
  date: string;
  provider: CalendarProvider;
  calendarId: string;
  calendarName: string;
  calendarColor: string;
  completed: boolean;
}

interface DeadlineTrayProps {
  /** The dates for each day of the week */
  weekDates: Date[];
  /** Map of ISO date string to array of deadline tasks for that day */
  deadlines: Map<string, DeadlineTask[]>;
  /** Map of ISO date string to array of goal deadlines for that day */
  goalDeadlines?: Map<string, DeadlineGoal[]>;
  /** Map of ISO date string to array of milestone deadlines for that day */
  milestoneDeadlines?: Map<string, DeadlineMilestone[]>;
  /** Map of ISO date string to array of all-day external events for that day */
  allDayEvents?: Map<string, AllDayEvent[]>;
  /** Called when a deadline is moved (dragged to a different header) */
  onDeadlineMove?: (goalId: string, taskId: string, newDate: string) => void;
  /** Whether this tray should be visible (has any deadlines or all-day events) */
  visible?: boolean;
  /** Whether to show the time gutter (for alignment with week view) */
  showHourLabels?: boolean;
  /** Called when a deadline task's completion status is toggled */
  onToggleComplete?: (goalId: string, taskId: string) => void;
  /** Called when a deadline is removed (unassigned) */
  onUnassign?: (goalId: string, taskId: string) => void;
  /** Called when mouse enters/leaves a deadline pill (for keyboard shortcuts) */
  onDeadlineHover?: (deadline: DeadlineTask | null) => void;
  /** Called when an all-day event's completion status is toggled */
  onToggleAllDayEvent?: (eventId: string) => void;
  /** Called when mouse enters/leaves an all-day event pill */
  onAllDayEventHover?: (event: AllDayEvent | null) => void;
  /** Called when a goal deadline pill is clicked (to open goal detail) */
  onGoalClick?: (goalId: string) => void;
  /** Called when a milestone's completion status is toggled */
  onToggleMilestoneComplete?: (goalId: string, milestoneId: string) => void;
}

interface DeadlinePillProps {
  deadline: DeadlineTask;
  date: string;
  onToggleComplete?: () => void;
  onUnassign?: () => void;
  onHover?: (deadline: DeadlineTask | null) => void;
}

interface AllDayEventPillProps {
  event: AllDayEvent;
  onToggleComplete?: () => void;
  onHover?: (event: AllDayEvent | null) => void;
}

interface GoalDeadlinePillProps {
  goal: DeadlineGoal;
  onClick?: () => void;
}

interface MilestoneDeadlinePillProps {
  milestone: DeadlineMilestone;
  onToggleComplete?: () => void;
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
        "w-full min-w-0",  // Take full width of container
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

/**
 * Goal deadline pill for goals with target completion dates.
 * Shows the goal's icon and label, clicking opens the goal detail.
 */
function GoalDeadlinePill({ goal, onClick }: GoalDeadlinePillProps) {
  const GoalIcon = goal.icon;
  
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all",
        "w-full min-w-0",  // Take full width of container
        getIconBgClass(goal.color),
        "text-white",
        onClick && "cursor-pointer hover:opacity-90",
      )}
      onClick={onClick}
    >
      <GoalIcon className="size-3 shrink-0" />
      <span className="truncate">{goal.label}</span>
    </div>
  );
}

/**
 * Milestone deadline pill for milestones with target completion dates.
 * Shows a star icon and the milestone label, supports marking complete.
 */
function MilestoneDeadlinePill({ milestone, onToggleComplete }: MilestoneDeadlinePillProps) {
  const pillContent = (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all",
        "bg-muted/60 hover:bg-muted",
        "w-full min-w-0",  // Take full width of container
        milestone.completed && "opacity-50 line-through",
      )}
    >
      <RiPokerDiamondsLine
        className={cn(
          "size-3 shrink-0",
          getIconColorClass(milestone.goalColor)
        )}
      />
      <span className="truncate">{milestone.label}</span>
    </div>
  );

  // If no toggle callback, just return the pill without context menu
  if (!onToggleComplete) {
    return pillContent;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {pillContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onToggleComplete}>
          <RiCheckLine className="size-4" />
          {milestone.completed ? "Mark incomplete" : "Mark complete"}
          <ContextMenuShortcut>⌘⏎</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/**
 * All-day event pill for external calendar events.
 * Shows provider badge, title, and supports dragging to create timed blocks.
 */
function AllDayEventPill({ event, onToggleComplete, onHover }: AllDayEventPillProps) {
  const dragContext = useDragContextOptional();
  const canDrag = !!dragContext && !event.completed;

  const dragItem: DragItem = {
    type: "external-all-day",
    externalEventId: event.id,
    externalEventTitle: event.title,
    externalProvider: event.provider,
    externalCalendarId: event.calendarId,
    externalCalendarName: event.calendarName,
    externalCalendarColor: event.calendarColor,
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
        "min-w-0 max-w-full",
        event.completed && "opacity-50 line-through",
        isDragging && "opacity-30",
        canDrag && "cursor-grab active:cursor-grabbing",
      )}
      onMouseEnter={() => onHover?.(event)}
      onMouseLeave={() => onHover?.(null)}
      {...(canDrag ? draggableProps : {})}
    >
      <ProviderBadge provider={event.provider} size="sm" className="shrink-0" />
      <span className="truncate">{event.title}</span>
    </div>
  );

  // If no toggle callback, just return the pill without context menu
  if (!onToggleComplete) {
    return pillContent;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {pillContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onToggleComplete}>
          <RiCheckLine className="size-4" />
          {event.completed ? "Mark incomplete" : "Mark complete"}
          <ContextMenuShortcut>⌘⏎</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function DeadlineTray({
  weekDates,
  deadlines,
  goalDeadlines,
  milestoneDeadlines,
  allDayEvents,
  visible = true,
  showHourLabels = true,
  onToggleComplete,
  onUnassign,
  onDeadlineHover,
  onToggleAllDayEvent,
  onAllDayEventHover,
  onGoalClick,
  onToggleMilestoneComplete,
}: DeadlineTrayProps) {
  // Don't render if no deadlines, goal deadlines, milestone deadlines, or all-day events
  const hasContent = 
    deadlines.size > 0 || 
    (goalDeadlines?.size ?? 0) > 0 ||
    (milestoneDeadlines?.size ?? 0) > 0 ||
    (allDayEvents?.size ?? 0) > 0;
  if (!visible || !hasContent) {
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
        const dayGoalDeadlines = goalDeadlines?.get(isoDate) ?? [];
        const dayMilestoneDeadlines = milestoneDeadlines?.get(isoDate) ?? [];
        const dayAllDayEvents = allDayEvents?.get(isoDate) ?? [];
        
        return (
          <div
            key={index}
            className={cn(
              "flex flex-col gap-1 px-1.5 py-1.5",
              "border-border/40 border-r last:border-r-0",
              "min-h-[28px]", // Minimum height for visual consistency
              "overflow-hidden", // Prevent content from expanding column
            )}
          >
            {/* All-day external events first */}
            {dayAllDayEvents.map((event) => (
              <AllDayEventPill
                key={event.id}
                event={event}
                onToggleComplete={
                  onToggleAllDayEvent
                    ? () => onToggleAllDayEvent(event.id)
                    : undefined
                }
                onHover={onAllDayEventHover}
              />
            ))}
            {/* Goal deadlines */}
            {dayGoalDeadlines.map((goal) => (
              <GoalDeadlinePill
                key={goal.goalId}
                goal={goal}
                onClick={onGoalClick ? () => onGoalClick(goal.goalId) : undefined}
              />
            ))}
            {/* Milestone deadlines */}
            {dayMilestoneDeadlines.map((milestone) => (
              <MilestoneDeadlinePill
                key={milestone.milestoneId}
                milestone={milestone}
                onToggleComplete={
                  onToggleMilestoneComplete
                    ? () => onToggleMilestoneComplete(milestone.goalId, milestone.milestoneId)
                    : undefined
                }
              />
            ))}
            {/* Deadline tasks */}
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
