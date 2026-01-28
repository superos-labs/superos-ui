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
  onDeadlineToggleComplete,
  onDeadlineUnassign,
  onDeadlineHover,
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
      onDeadlineToggleComplete={onDeadlineToggleComplete}
      onDeadlineUnassign={onDeadlineUnassign}
      onDeadlineHover={onDeadlineHover}
      onDayHeaderHover={onDayHeaderHover}
      onMarkDayComplete={onMarkDayComplete}
      dayStartMinutes={dayStartMinutes}
      dayEndMinutes={dayEndMinutes}
      dayBoundariesEnabled={dayBoundariesEnabled}
      dayBoundariesDisplay={dayBoundariesDisplay}
    />
  );
}
