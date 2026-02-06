"use client";

import * as React from "react";
import { ShellContent as ShellContentPrimitive } from "@/components/ui/shell";
import { BottomSheet, FullScreenOverlay } from "@/components/ui";
import { Calendar } from "@/components/calendar";
import { Backlog, type BacklogItem } from "@/components/backlog";
import { BlockSidebar } from "@/components/block";
import type { ShellContentProps } from "./shell-types";
import type { ShellWiring } from "./use-shell-wiring";
import { FeedbackButton } from "./feedback-button";

// =============================================================================
// Props
// =============================================================================

export interface ShellMobileLayoutProps {
  /** Original shell props (data & handlers) */
  shellProps: ShellContentProps;
  /** Wiring hook return (computed state & enhanced handlers) */
  wiring: ShellWiring;
  /** Whether to show the week view (tablet landscape) */
  shouldShowWeekView: boolean;
  /** Whether the backlog overlay is open */
  showBacklogOverlay: boolean;
  /** Close the backlog overlay */
  onCloseBacklogOverlay: () => void;
  /** Whether essentials section is hidden */
  isEssentialsHidden: boolean;
  /** Hide essentials */
  onEssentialsHide: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function ShellMobileLayout({
  shellProps,
  wiring,
  shouldShowWeekView,
  showBacklogOverlay,
  onCloseBacklogOverlay,
  isEssentialsHidden,
  onEssentialsHide,
}: ShellMobileLayoutProps) {
  const {
    goals,
    essentials,
    events,
    weekDeadlines,
    weekGoalDeadlines,
    weekMilestoneDeadlines,
    selectedDate,
    weekStartsOn,
    calendarZoom,
    onToggleTaskComplete,
    onClearTaskDeadline,
    onAddTask,
    onUpdateTask,
    onAddSubtask,
    onToggleSubtaskComplete,
    onUpdateSubtask,
    onDeleteSubtask,
    onDeleteTask,
    getGoalStats,
    getTaskSchedule,
    getTaskDeadline,
    essentialTemplates,
    onSaveEssentialSchedule,
    onCreateEssential,
    onDeleteEssential,
    dayStartMinutes,
    dayEndMinutes,
    dayBoundariesEnabled,
    dayBoundariesDisplay,
    focusSession,
    focusIsRunning,
    focusElapsedMs,
    onPauseFocus,
    onResumeFocus,
    onEndFocus,
    goalIcons,
    allDayEvents,
    onToggleMilestoneComplete,
  } = shellProps;

  const {
    layout,
    mobileNav,
    scrollToCurrentTimeKey,
    goalHandlers,
    planningIntegration,
    blueprintHandlers,
    sidebarDataToRender,
    sidebarHandlers,
    availableGoals,
    syncState,
    blockSyncSettings,
    handleZoomIn,
    handleZoomOut,
    handleMobileEventClick,
    handleCloseBottomSheet,
    handleSleepTimesChange,
    handleToggleAllDayEvent,
    focus,
    selectedEvent,
  } = wiring;

  const { isBlueprintEditMode, selectedEventId } = layout;

  return (
    <>
      {/* Calendar View */}
      <ShellContentPrimitive className="overflow-hidden">
        <div className="relative h-full">
          <Calendar
            view={shouldShowWeekView ? "week" : "day"}
            selectedDate={
              shouldShowWeekView ? selectedDate : mobileNav.mobileSelectedDate
            }
            events={events}
            weekStartsOn={weekStartsOn}
            zoom={calendarZoom}
            scrollToCurrentTimeKey={scrollToCurrentTimeKey}
            onEventClick={handleMobileEventClick}
            enableExternalDrop={false}
            onDeadlineToggleComplete={onToggleTaskComplete}
            onDeadlineUnassign={onClearTaskDeadline}
            deadlines={weekDeadlines}
            goalDeadlines={weekGoalDeadlines}
            milestoneDeadlines={weekMilestoneDeadlines}
            allDayEvents={allDayEvents}
            onToggleAllDayEvent={handleToggleAllDayEvent}
            onGoalDeadlineClick={goalHandlers.handleGoalDeadlineClick}
            onToggleMilestoneComplete={onToggleMilestoneComplete}
            dayStartMinutes={dayStartMinutes}
            dayEndMinutes={dayEndMinutes}
            dayBoundariesEnabled={dayBoundariesEnabled}
            dayBoundariesDisplay={dayBoundariesDisplay}
          />
          <FeedbackButton
            calendarZoom={calendarZoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        </div>
      </ShellContentPrimitive>

      {/* Full-Screen Backlog Overlay */}
      <FullScreenOverlay
        key="backlog-overlay"
        open={showBacklogOverlay}
        onClose={onCloseBacklogOverlay}
        title="Backlog"
        closeStyle="close"
      >
        <Backlog
          essentials={essentials as BacklogItem[]}
          goals={goals as BacklogItem[]}
          className="h-full max-w-none border-0 rounded-none shadow-none"
          showTasks={true}
          onToggleGoalTask={onToggleTaskComplete}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtaskComplete}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onDeleteTask={onDeleteTask}
          getGoalStats={getGoalStats}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
          draggable={false}
          essentialTemplates={essentialTemplates}
          onSaveEssentialSchedule={
            isBlueprintEditMode
              ? blueprintHandlers.handleSaveEssentialScheduleWithSync
              : onSaveEssentialSchedule
          }
          onCreateEssential={
            isBlueprintEditMode
              ? blueprintHandlers.handleAddEssentialWithImport
              : onCreateEssential
          }
          onDeleteEssential={
            isBlueprintEditMode
              ? blueprintHandlers.handleDeleteEssentialWithCleanup
              : onDeleteEssential
          }
          wakeUpMinutes={dayStartMinutes}
          windDownMinutes={dayEndMinutes}
          onSleepTimesChange={handleSleepTimesChange}
          isSleepConfigured={dayBoundariesEnabled}
          isEssentialsHidden={isEssentialsHidden}
          onEssentialsHide={onEssentialsHide}
          isBlueprintEditMode={isBlueprintEditMode}
          goalIcons={goalIcons}
          currentWeekStart={planningIntegration.weekStartDate}
        />
      </FullScreenOverlay>

      {/* Block Details Bottom Sheet */}
      {sidebarDataToRender && (
        <BottomSheet
          key="block-sheet"
          open={selectedEventId !== null}
          onClose={handleCloseBottomSheet}
          title={sidebarDataToRender.block.title}
          showCloseButton={true}
          showDragHandle={true}
        >
          <BlockSidebar
            block={sidebarDataToRender.block}
            availableGoalTasks={sidebarDataToRender.availableGoalTasks}
            availableGoals={availableGoals}
            onClose={handleCloseBottomSheet}
            onToggleGoalTask={sidebarHandlers.onToggleGoalTask}
            isFocused={focus.isSidebarBlockFocused}
            focusIsRunning={focusIsRunning}
            focusElapsedMs={focusElapsedMs}
            onStartFocus={focus.handleStartFocus}
            onPauseFocus={onPauseFocus}
            onResumeFocus={onResumeFocus}
            onEndFocus={onEndFocus}
            focusDisabled={
              focusSession !== null && !focus.isSidebarBlockFocused
            }
            totalFocusedMinutes={
              selectedEvent?.blockType !== "essential"
                ? (selectedEvent?.focusedMinutes ?? 0)
                : undefined
            }
            syncState={syncState}
            blockSyncSettings={blockSyncSettings}
            onSyncAppearanceChange={sidebarHandlers.onSyncAppearanceChange}
            className="border-0 rounded-none shadow-none max-w-none w-full"
          />
        </BottomSheet>
      )}
    </>
  );
}
