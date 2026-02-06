"use client";

/**
 * ShellDesktopLayout - Desktop three-panel layout rendering.
 *
 * Handles the left sidebar (backlog/planning/blueprint), main content area
 * (calendar/goal detail/inspiration gallery), and right sidebar
 * (block details/analytics/integrations).
 *
 * Also renders the onboarding centered goals view when applicable.
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShellContent as ShellContentPrimitive } from "@/components/ui/shell";
import { Calendar } from "@/components/calendar";
import {
  Backlog,
  GoalInspirationGallery,
  OnboardingGoalsCard,
  type BacklogItem,
  type InspirationCategory,
} from "@/components/backlog";
import { ONBOARDING_GOAL_SUGGESTIONS } from "@/lib/fixtures/onboarding-goals";
import { GoalDetail } from "@/components/goal-detail";
import {
  PlanningPanel,
  BlueprintBacklog,
  PlanWeekPromptCard,
} from "@/components/weekly-planning";
import { cn } from "@/lib/utils";
import type { ShellContentProps } from "./shell-types";
import type { ShellWiring } from "./use-shell-wiring";
import { FeedbackButton } from "./feedback-button";
import { ShellRightPanel } from "./shell-right-panel";

// =============================================================================
// Props
// =============================================================================

export interface ShellDesktopLayoutProps {
  /** Original shell props (data & handlers) */
  shellProps: ShellContentProps;
  /** Wiring hook return (computed state & enhanced handlers) */
  wiring: ShellWiring;
  /** Whether essentials section is hidden in backlog */
  isEssentialsHidden: boolean;
  /** Hide essentials */
  onEssentialsHide: () => void;
  /** Open life area creator (optionally linked to a goal) */
  onOpenLifeAreaCreator: (goalId?: string) => void;
  /** Inspiration category data */
  inspirationCategories?: InspirationCategory[];
}

// =============================================================================
// Component
// =============================================================================

export function ShellDesktopLayout({
  shellProps,
  wiring,
  isEssentialsHidden,
  onEssentialsHide,
  onOpenLifeAreaCreator,
  inspirationCategories,
}: ShellDesktopLayoutProps) {
  const {
    goals,
    essentials,
    events,
    weekDates,
    weekDeadlines,
    weekGoalDeadlines,
    weekMilestoneDeadlines,
    calendarHandlers,
    selectedDate,
    weekStartsOn,
    calendarZoom,
    onAddTask,
    onUpdateTask,
    onAddSubtask,
    onToggleSubtaskComplete,
    onUpdateSubtask,
    onDeleteSubtask,
    onToggleTaskComplete,
    onClearTaskDeadline,
    onUpdateGoal,
    onAddMilestone,
    onToggleMilestoneComplete,
    onUpdateMilestone,
    onUpdateMilestoneDeadline,
    onDeleteMilestone,
    onToggleMilestonesEnabled,
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
    lifeAreas,
    goalIcons,
    blueprint,
    allDayEvents,
    onUpdateGoalSyncSettings,
    hasBlueprint,
  } = shellProps;

  const {
    layout,
    scrollToCurrentTimeKey,
    goalHandlers,
    planningIntegration,
    blueprintHandlers,
    enhancedCalendarHandlers,
    enhancedToggleTaskComplete,
    enhancedDeleteTask,
    focus,
    externalDragPreview,
    handleExternalDrop,
    handleDeadlineDrop,
    handleZoomIn,
    handleZoomOut,
    setHoveredDeadline,
    showIntegrationsSidebar,
    handleSleepTimesChange,
    handleToggleAllDayEvent,
    selectedGoal,
    selectedGoalLifeArea,
  } = wiring;

  const {
    showSidebar,
    showCalendar,
    showInspirationGallery,
    showTasks,
    isRightSidebarOpen,
    isPlanning,
    isBlueprintEditMode,
    isOnboardingBlueprint,
    isOnboarding,
    isGoalDetailMode,
    selectedGoalId,
    goalNotes,
    handleEventClick,
    handleSelectGoal,
    handleCloseGoalDetail,
    handleCloseInspiration,
    handleBrowseInspiration,
    handleGoalNotesChange,
    showPlanWeekPrompt,
    onDismissPlanWeekPrompt,
    onStartPlanningFromPrompt,
    onContinueFromGoals,
    isOnboardingGoalsCentered,
    onboardingStep,
  } = layout;

  // Onboarding centered goals view
  if (isOnboardingGoalsCentered) {
    return (
      <ShellContentPrimitive className="flex items-center justify-center bg-muted shadow-none ring-0">
        <AnimatePresence mode="wait">
          <motion.div
            key="onboarding-goals"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <OnboardingGoalsCard
              goals={goalHandlers.onboardingGoals}
              onAddGoal={goalHandlers.handleOnboardingAddGoal}
              onUpdateGoal={goalHandlers.handleOnboardingUpdateGoal}
              onRemoveGoal={goalHandlers.handleOnboardingRemoveGoal}
              onContinue={onContinueFromGoals}
              suggestions={ONBOARDING_GOAL_SUGGESTIONS}
              lifeAreas={lifeAreas}
              goalIcons={goalIcons}
            />
          </motion.div>
        </AnimatePresence>
      </ShellContentPrimitive>
    );
  }

  // Three-panel desktop layout
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="main-layout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`flex min-h-0 flex-1 ${
          showSidebar ||
          isRightSidebarOpen ||
          showIntegrationsSidebar ||
          isPlanning ||
          isBlueprintEditMode ||
          isOnboardingBlueprint
            ? "gap-4"
            : "gap-0"
        }`}
      >
        {/* Left Sidebar - Backlog, Planning Panel, or Blueprint Backlog */}
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-all duration-300 ease-out",
            isPlanning
              ? "w-[420px] opacity-100"
              : showSidebar || isBlueprintEditMode || isOnboardingBlueprint
              ? "w-[360px] opacity-100"
              : "w-0 opacity-0"
          )}
        >
          {isOnboardingBlueprint ? (
            <BlueprintBacklog
              goals={goals}
              essentials={essentials}
              onSave={blueprintHandlers.handleSaveOnboardingBlueprint}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              wakeUpMinutes={dayStartMinutes}
              windDownMinutes={dayEndMinutes}
              onSleepTimesChange={handleSleepTimesChange}
              isSleepConfigured={dayBoundariesEnabled}
              onAddEssential={blueprintHandlers.handleAddEssentialWithImport}
              essentialTemplates={essentialTemplates}
              onSaveSchedule={onSaveEssentialSchedule}
              onDeleteEssential={
                blueprintHandlers.handleDeleteEssentialWithCleanup
              }
              essentialIcons={goalIcons}
              className="h-full w-[360px] max-w-none"
            />
          ) : isPlanning ? (
            <PlanningPanel
              goals={goals}
              essentials={essentials}
              blueprint={blueprint}
              weekDates={weekDates}
              onDuplicateLastWeek={
                hasBlueprint
                  ? planningIntegration.handleDuplicateLastWeek
                  : undefined
              }
              onCancel={planningIntegration.planningFlow.cancel}
              isFirstPlan={!hasBlueprint}
              step={planningIntegration.planningFlow.step}
              onNextStep={planningIntegration.planningFlow.nextStep}
              onConfirm={planningIntegration.planningFlow.confirm}
              weeklyFocusTaskIds={
                planningIntegration.planningFlow.weeklyFocusTaskIds
              }
              onAddToFocus={
                planningIntegration.planningFlow.addToWeeklyFocus
              }
              onRemoveFromFocus={
                planningIntegration.planningFlow.removeFromWeeklyFocus
              }
              onAddTask={onAddTask}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              showAddEssentialsButton={
                !hasBlueprint &&
                !planningIntegration.hasAddedEssentialsThisSession
              }
              onAddEssentialsToCalendar={
                planningIntegration.handleAddEssentialsToCalendar
              }
              className="h-full w-[420px] max-w-none"
            />
          ) : (
            <Backlog
              essentials={essentials as BacklogItem[]}
              goals={goals as BacklogItem[]}
              className="h-full w-[360px] max-w-none"
              showTasks={showTasks && !isBlueprintEditMode}
              onToggleGoalTask={enhancedToggleTaskComplete}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtaskComplete}
              onUpdateSubtask={onUpdateSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onDeleteTask={enhancedDeleteTask}
              getGoalStats={getGoalStats}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              draggable={!isOnboarding}
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
              onCreateGoal={goalHandlers.handleCreateGoal}
              lifeAreas={lifeAreas}
              goalIcons={goalIcons}
              onCreateAndSelectGoal={goalHandlers.handleCreateAndSelectGoal}
              selectedGoalId={selectedGoalId}
              onSelectGoal={handleSelectGoal}
              onBrowseInspiration={handleBrowseInspiration}
              isInspirationActive={showInspirationGallery}
              onboardingStep={onboardingStep}
              onOnboardingContinue={onContinueFromGoals}
              currentWeekStart={planningIntegration.weekStartDate}
            />
          )}
        </div>

        {/* Main Content - Calendar, Goal Detail, or Inspiration Gallery */}
        <ShellContentPrimitive className="overflow-hidden">
          {showInspirationGallery && inspirationCategories ? (
            <GoalInspirationGallery
              categories={inspirationCategories}
              onAddGoal={goalHandlers.handleCreateGoal}
              onClose={handleCloseInspiration}
              className="h-full"
            />
          ) : isGoalDetailMode && selectedGoal ? (
            <GoalDetail
              goal={selectedGoal}
              lifeArea={selectedGoalLifeArea}
              deadline={selectedGoal.deadline}
              notes={goalNotes[selectedGoal.id] ?? ""}
              onNotesChange={handleGoalNotesChange}
              onTitleChange={(title) =>
                onUpdateGoal(selectedGoal.id, { label: title })
              }
              onDeadlineChange={(deadline) =>
                onUpdateGoal(selectedGoal.id, { deadline })
              }
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              onToggleTask={(taskId) =>
                enhancedToggleTaskComplete(selectedGoal.id, taskId)
              }
              onAddTask={(label, milestoneId) =>
                onAddTask(selectedGoal.id, label, milestoneId)
              }
              onUpdateTask={(taskId, updates) =>
                onUpdateTask(selectedGoal.id, taskId, updates)
              }
              onDeleteTask={(taskId) =>
                enhancedDeleteTask(selectedGoal.id, taskId)
              }
              onAddSubtask={(taskId, label) =>
                onAddSubtask(selectedGoal.id, taskId, label)
              }
              onToggleSubtask={(taskId, subtaskId) =>
                onToggleSubtaskComplete(selectedGoal.id, taskId, subtaskId)
              }
              onUpdateSubtask={(taskId, subtaskId, label) =>
                onUpdateSubtask(selectedGoal.id, taskId, subtaskId, label)
              }
              onDeleteSubtask={(taskId, subtaskId) =>
                onDeleteSubtask(selectedGoal.id, taskId, subtaskId)
              }
              onAddMilestone={(label) =>
                onAddMilestone(selectedGoal.id, label)
              }
              onToggleMilestone={(milestoneId) =>
                onToggleMilestoneComplete(selectedGoal.id, milestoneId)
              }
              onUpdateMilestone={(milestoneId, label) =>
                onUpdateMilestone(selectedGoal.id, milestoneId, label)
              }
              onUpdateMilestoneDeadline={(milestoneId, deadline) =>
                onUpdateMilestoneDeadline(
                  selectedGoal.id,
                  milestoneId,
                  deadline
                )
              }
              onDeleteMilestone={(milestoneId) =>
                onDeleteMilestone(selectedGoal.id, milestoneId)
              }
              onToggleMilestones={() =>
                onToggleMilestonesEnabled(selectedGoal.id)
              }
              onDelete={goalHandlers.handleDeleteGoal}
              onBack={handleCloseGoalDetail}
              lifeAreas={lifeAreas}
              goalIcons={goalIcons}
              onIconChange={(icon) =>
                onUpdateGoal(selectedGoal.id, { icon })
              }
              onColorChange={(color) =>
                onUpdateGoal(selectedGoal.id, { color })
              }
              onLifeAreaChange={(lifeAreaId) =>
                onUpdateGoal(selectedGoal.id, { lifeAreaId })
              }
              onAddLifeArea={() => onOpenLifeAreaCreator(selectedGoal.id)}
              onSyncSettingsChange={(settings) =>
                onUpdateGoalSyncSettings(selectedGoal.id, settings)
              }
              hasSyncAvailable={planningIntegration.hasSyncAvailable}
              className="h-full"
            />
          ) : showCalendar ? (
            <div className="relative h-full">
              <Calendar
                selectedDate={selectedDate}
                events={events}
                weekStartsOn={weekStartsOn}
                zoom={calendarZoom}
                scrollToCurrentTimeKey={scrollToCurrentTimeKey}
                {...calendarHandlers}
                onEventClick={handleEventClick}
                enableExternalDrop={!isOnboarding || isOnboardingBlueprint}
                onExternalDrop={handleExternalDrop}
                externalDragPreview={externalDragPreview}
                onDeadlineDrop={handleDeadlineDrop}
                deadlines={weekDeadlines}
                goalDeadlines={weekGoalDeadlines}
                milestoneDeadlines={weekMilestoneDeadlines}
                allDayEvents={allDayEvents}
                onDeadlineToggleComplete={onToggleTaskComplete}
                onDeadlineUnassign={onClearTaskDeadline}
                onDeadlineHover={setHoveredDeadline}
                onToggleAllDayEvent={handleToggleAllDayEvent}
                onGoalDeadlineClick={goalHandlers.handleGoalDeadlineClick}
                onToggleMilestoneComplete={onToggleMilestoneComplete}
                dayStartMinutes={dayStartMinutes}
                dayEndMinutes={dayEndMinutes}
                dayBoundariesEnabled={dayBoundariesEnabled}
                dayBoundariesDisplay={dayBoundariesDisplay}
              />
              {/* Dimming overlay */}
              {((isOnboarding && !isOnboardingBlueprint) ||
                showPlanWeekPrompt ||
                (isPlanning &&
                  planningIntegration.planningFlow.step ===
                    "prioritize")) && (
                <div className="absolute inset-0 bg-background/60 pointer-events-none z-10" />
              )}

              {/* Plan week prompt card */}
              {showPlanWeekPrompt && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <PlanWeekPromptCard
                    onStartPlanning={onStartPlanningFromPrompt}
                    onDismiss={onDismissPlanWeekPrompt}
                  />
                </div>
              )}

              <FeedbackButton
                calendarZoom={calendarZoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
              />
            </div>
          ) : null}
        </ShellContentPrimitive>

        {/* Right Sidebar - Block Details / Analytics / Integrations */}
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-all duration-300 ease-out",
            isRightSidebarOpen || showIntegrationsSidebar
              ? "w-[380px] opacity-100"
              : "w-0 opacity-0"
          )}
        >
          <ShellRightPanel shellProps={shellProps} wiring={wiring} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
