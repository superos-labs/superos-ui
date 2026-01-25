"use client";

import * as React from "react";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { getWeekDates } from "./calendar-utils";
import type { CalendarProps } from "./calendar-types";

export function Calendar({
  view = "week",
  mode = "schedule",
  selectedDate,
  showHourLabels = true,
  headerIsVisible = true,
  events,
  density,
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
  enableExternalDrop,
  onExternalDrop,
  externalDragPreview,
  onDeadlineDrop,
  deadlines,
  onDeadlineToggleComplete,
  onDeadlineUnassign,
  onDeadlineHover,
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
        density={density}
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
        enableExternalDrop={enableExternalDrop}
        onExternalDrop={onExternalDrop}
        externalDragPreview={externalDragPreview}
      />
    );
  }

  return (
    <WeekView
      weekDates={weekDates}
      showHourLabels={showHourLabels}
      events={events}
      mode={mode}
      density={density}
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
      enableExternalDrop={enableExternalDrop}
      onExternalDrop={onExternalDrop}
      externalDragPreview={externalDragPreview}
      onDeadlineDrop={onDeadlineDrop}
      deadlines={deadlines}
      onDeadlineToggleComplete={onDeadlineToggleComplete}
      onDeadlineUnassign={onDeadlineUnassign}
      onDeadlineHover={onDeadlineHover}
    />
  );
}
