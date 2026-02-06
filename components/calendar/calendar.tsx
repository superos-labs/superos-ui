/**
 * =============================================================================
 * File: calendar.tsx
 * =============================================================================
 *
 * Calendar view router and composition root.
 *
 * Selects between DayView and WeekView based on the requested view
 * and forwards all configuration, data, and interaction callbacks.
 *
 * This component contains no calendar logic itself.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Resolve active date and week range.
 * - Choose the correct view (day or week).
 * - Pass through all props to the active view.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Rendering individual blocks.
 * - Managing interactions.
 * - Mutating events.
 * - Computing layout.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - selectedDate falls back to today.
 * - Week ranges are derived via getWeekDates.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - Calendar
 */

"use client";

import * as React from "react";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { getWeekDates } from "./calendar-utils";
import type { CalendarProps } from "./calendar-types";

export function Calendar({
  view = "week",
  selectedDate,
  showHourLabels = true,
  headerIsVisible = true,
  events,
  density,
  zoom,
  weekStartsOn = 1,
  scrollToCurrentTimeKey,
  setBlockStyle,
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
  hasClipboardContent,
  onEventHover,
  onGridPositionHover,
  onEventClick,
  enableExternalDrop,
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
}: CalendarProps) {
  const today = React.useMemo(() => new Date(), []);
  const dateToUse = selectedDate ?? today;
  const weekDates = React.useMemo(
    () => getWeekDates(dateToUse, weekStartsOn),
    [dateToUse, weekStartsOn],
  );

  if (view === "day") {
    return (
      <DayView
        selectedDate={dateToUse}
        showHourLabels={showHourLabels}
        headerIsVisible={headerIsVisible}
        events={events}
        density={density}
        zoom={zoom}
        scrollToCurrentTimeKey={scrollToCurrentTimeKey}
        setBlockStyle={setBlockStyle}
        onEventResize={onEventResize}
        onEventResizeEnd={onEventResizeEnd}
        onEventDragEnd={onEventDragEnd}
        onEventDuplicate={onEventDuplicate}
        onGridDoubleClick={onGridDoubleClick}
        onGridDragCreate={onGridDragCreate}
        onEventCopy={onEventCopy}
        onEventDelete={onEventDelete}
        onEventStatusChange={onEventStatusChange}
        onEventPaste={onEventPaste}
        hasClipboardContent={hasClipboardContent}
        onEventHover={onEventHover}
        onGridPositionHover={onGridPositionHover}
        onEventClick={onEventClick}
        enableExternalDrop={enableExternalDrop}
        onExternalDrop={onExternalDrop}
        externalDragPreview={externalDragPreview}
        onDayHeaderHover={onDayHeaderHover}
        onMarkDayComplete={onMarkDayComplete}
        dayStartMinutes={dayStartMinutes}
        dayEndMinutes={dayEndMinutes}
        dayBoundariesEnabled={dayBoundariesEnabled}
        dayBoundariesDisplay={dayBoundariesDisplay}
      />
    );
  }

  return (
    <WeekView
      weekDates={weekDates}
      showHourLabels={showHourLabels}
      events={events}
      density={density}
      zoom={zoom}
      weekStartsOn={weekStartsOn}
      scrollToCurrentTimeKey={scrollToCurrentTimeKey}
      setBlockStyle={setBlockStyle}
      onEventResize={onEventResize}
      onEventResizeEnd={onEventResizeEnd}
      onEventDragEnd={onEventDragEnd}
      onEventDuplicate={onEventDuplicate}
      onGridDoubleClick={onGridDoubleClick}
      onGridDragCreate={onGridDragCreate}
      onEventCopy={onEventCopy}
      onEventDelete={onEventDelete}
      onEventStatusChange={onEventStatusChange}
      onEventPaste={onEventPaste}
      hasClipboardContent={hasClipboardContent}
      onEventHover={onEventHover}
      onGridPositionHover={onGridPositionHover}
      onEventClick={onEventClick}
      enableExternalDrop={enableExternalDrop}
      onExternalDrop={onExternalDrop}
      externalDragPreview={externalDragPreview}
      onDeadlineDrop={onDeadlineDrop}
      deadlines={deadlines}
      goalDeadlines={goalDeadlines}
      milestoneDeadlines={milestoneDeadlines}
      allDayEvents={allDayEvents}
      onDeadlineToggleComplete={onDeadlineToggleComplete}
      onDeadlineUnassign={onDeadlineUnassign}
      onDeadlineHover={onDeadlineHover}
      onToggleAllDayEvent={onToggleAllDayEvent}
      onAllDayEventHover={onAllDayEventHover}
      onGoalDeadlineClick={onGoalDeadlineClick}
      onToggleMilestoneComplete={onToggleMilestoneComplete}
      onDayHeaderHover={onDayHeaderHover}
      onMarkDayComplete={onMarkDayComplete}
      dayStartMinutes={dayStartMinutes}
      dayEndMinutes={dayEndMinutes}
      dayBoundariesEnabled={dayBoundariesEnabled}
      dayBoundariesDisplay={dayBoundariesDisplay}
    />
  );
}
