/**
 * =============================================================================
 * File: backlog.tsx
 * =============================================================================
 *
 * Backlog composition root for Goals and Essentials.
 *
 * This component orchestrates:
 * - Rendering the Next Block Card (execution companion).
 * - Rendering and layout of Essentials and Goals sections.
 * - Onboarding-specific behavior (goals first, then essentials/blueprint).
 * - Wiring of callbacks between higher-level shell state and leaf components.
 * - Optional drag-and-drop enablement.
 *
 * It is intentionally a *composition + wiring* layer.
 * It does not fetch data and does not own domain state.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Compose NextBlockCard, EssentialsSection, and GoalSection.
 * - Gate visibility based on onboarding step and blueprint edit mode.
 * - Forward scheduling, deadline, and mutation callbacks.
 * - Provide animated mount/unmount for major sections.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Computing goal stats.
 * - Persisting data.
 * - Managing domain business rules.
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Layout and interaction coordinator for backlog experience."
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type {
  GoalStats,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  ScheduleTask,
  NextBlockInfo,
  CalendarEvent,
  ScheduleGoal,
} from "@/lib/unified-schedule";
import type { LifeArea, GoalIconOption } from "@/lib/types";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { GoalItem, NewGoalData } from "./goals";
import type { EssentialItem, NewEssentialData } from "./essentials";
import { GoalSection } from "./goals";
import { EssentialsSection } from "./essentials";
import { NextBlockCard } from "./next-block-card";

export interface BacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of essential items to display (should include Sleep) */
  essentials: EssentialItem[];
  /** Array of goal items to display */
  goals: GoalItem[];
  showTasks?: boolean;
  onAddGoal?: () => void;
  onToggleGoalTask?: (goalId: string, taskId: string) => void;
  /** Callback to add a new task to a goal */
  onAddTask?: (goalId: string, label: string) => void;
  /** Callback to update a task's properties */
  onUpdateTask?: (
    goalId: string,
    taskId: string,
    updates: Partial<ScheduleTask>,
  ) => void;
  /** Callback to add a subtask to a task */
  onAddSubtask?: (goalId: string, taskId: string, label: string) => void;
  /** Callback to toggle a subtask's completion */
  onToggleSubtask?: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Callback to update a subtask's label */
  onUpdateSubtask?: (
    goalId: string,
    taskId: string,
    subtaskId: string,
    label: string,
  ) => void;
  /** Callback to delete a subtask */
  onDeleteSubtask?: (goalId: string, taskId: string, subtaskId: string) => void;
  /** Callback to delete a task */
  onDeleteTask?: (goalId: string, taskId: string) => void;
  /** Function to get computed stats for a goal */
  getGoalStats?: (goalId: string) => GoalStats;
  /** Function to get schedule info for a task (enables time pill display) */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task (enables deadline pill display) */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Enable drag-and-drop (requires DragProvider wrapper) */
  draggable?: boolean;

  // Essentials section props
  /** Essential templates (for schedule editing and display) */
  essentialTemplates?: EssentialTemplate[];
  /** Callback when an essential's schedule is saved */
  onSaveEssentialSchedule?: (
    essentialId: string,
    slots: EssentialSlot[],
  ) => void;
  /** Callback when a new essential is created */
  onCreateEssential?: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  /** Callback when an essential is deleted */
  onDeleteEssential?: (essentialId: string) => void;
  /** Sleep wake up time in minutes from midnight */
  wakeUpMinutes?: number;
  /** Sleep wind down time in minutes from midnight */
  windDownMinutes?: number;
  /** Callback when sleep times change */
  onSleepTimesChange?: (wakeUp: number, windDown: number) => void;
  /** Whether sleep visualization is configured/enabled */
  isSleepConfigured?: boolean;
  /** Whether the essentials section is hidden (user clicked Skip) */
  isEssentialsHidden?: boolean;
  /** Callback when user clicks Skip to hide essentials */
  onEssentialsHide?: () => void;
  /** Whether the user is in blueprint edit mode (only show Essentials in this mode) */
  isBlueprintEditMode?: boolean;

  // Goal creation props
  /** Callback for creating a new goal */
  onCreateGoal?: (goal: NewGoalData) => void;
  /** Life areas for goal creation */
  lifeAreas?: LifeArea[];
  /** Available icons for goal/essential creation */
  goalIcons?: GoalIconOption[];
  /** Callback to create a new goal and immediately select it */
  onCreateAndSelectGoal?: () => void;

  // Goal selection props
  /** Currently selected goal ID (for highlighting in list) */
  selectedGoalId?: string | null;
  /** Callback when a goal is selected */
  onSelectGoal?: (goalId: string) => void;
  /** Callback to browse inspiration gallery */
  onBrowseInspiration?: () => void;
  /** Whether the inspiration gallery is currently active */
  isInspirationActive?: boolean;

  // Onboarding props
  /** Current onboarding step (null if not in onboarding) */
  onboardingStep?: "goals" | "blueprint" | null;
  /** Callback when user clicks Continue during goals onboarding step */
  onOnboardingContinue?: () => void;
  /** Callback when onboarding is completed (essentials Continue/Skip clicked) */
  onOnboardingComplete?: () => void;

  // Weekly focus props
  /** Current week start date for sectioning tasks by "This Week" (ISO string, e.g. "2026-01-26") */
  currentWeekStart?: string;

  // Next Block Card props
  /** Derived next block info (null hides the card entirely) */
  nextBlock?: NextBlockInfo | null;
  /** All calendar events for the current week */
  calendarEvents?: CalendarEvent[];
  /** All schedule goals */
  scheduleGoals?: ScheduleGoal[];
  /** Week date objects */
  weekDates?: Date[];
  /** ID of the block currently in a focus session */
  focusedBlockId?: string | null;
  /** Start a focus session for a block */
  onStartBlockFocus?: (blockId: string, title: string, color: string) => void;
  /** Move a block to a new start time (for "Focus now") */
  onUpdateBlockEvent?: (
    eventId: string,
    updates: Partial<CalendarEvent>,
  ) => void;
  /** Open the block detail sidebar */
  onNextBlockClick?: (blockId: string) => void;
}

export function Backlog({
  essentials,
  goals,
  showTasks = true,
  onAddGoal,
  onToggleGoalTask,
  onAddTask,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onDeleteTask,
  getGoalStats,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  // Essentials section props
  essentialTemplates,
  onSaveEssentialSchedule,
  onCreateEssential,
  onDeleteEssential,
  wakeUpMinutes = 420, // 7:00 AM default
  windDownMinutes = 1380, // 11:00 PM default
  onSleepTimesChange,
  isSleepConfigured = false,
  isEssentialsHidden = false,
  onEssentialsHide,
  isBlueprintEditMode = false,
  // Goal creation props
  onCreateGoal,
  lifeAreas,
  goalIcons,
  onCreateAndSelectGoal,
  // Goal selection props
  selectedGoalId,
  onSelectGoal,
  onBrowseInspiration,
  isInspirationActive,
  // Onboarding props
  onboardingStep,
  onOnboardingContinue,
  onOnboardingComplete,
  // Weekly focus props
  currentWeekStart,
  // Next Block Card props
  nextBlock,
  calendarEvents,
  scheduleGoals,
  weekDates,
  focusedBlockId,
  onStartBlockFocus,
  onUpdateBlockEvent,
  onNextBlockClick,
  className,
  ...props
}: BacklogProps) {
  // State for collapsing essentials card
  const [isEssentialsCollapsed, setIsEssentialsCollapsed] =
    React.useState(false);

  // Onboarding: hide essentials during goals step
  const isOnboardingGoalsStep = onboardingStep === "goals";
  // Only show essentials card when in blueprint edit mode (and not hidden/in goals onboarding)
  const showEssentialsCard =
    isBlueprintEditMode && !isEssentialsHidden && onboardingStep !== "goals";

  // Wrap essentials Done/Skip to also trigger onboarding completion
  const handleEssentialsHide = () => {
    onEssentialsHide?.();
    onOnboardingComplete?.();
  };

  return (
    <div
      className={cn("flex w-full max-w-sm flex-col gap-3", className)}
      {...props}
    >
      {/* Next Block Card - shown when there are blocks today and not in onboarding */}
      {nextBlock && nextBlock.totalBlocksToday > 0 && !onboardingStep && (
        <AnimatePresence mode="sync">
          <motion.div
            key="next-block-card"
            initial={{ opacity: 0, height: 0, marginBottom: -12 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: -12 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0"
          >
            <NextBlockCard
              nextBlock={nextBlock}
              events={calendarEvents ?? []}
              goals={scheduleGoals ?? []}
              weekDates={weekDates ?? []}
              focusedBlockId={focusedBlockId}
              onStartFocus={onStartBlockFocus}
              onUpdateEvent={onUpdateBlockEvent}
              onClick={onNextBlockClick}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Essentials Card - hidden during goals onboarding step, animates in/out */}
      <AnimatePresence mode="sync">
        {showEssentialsCard && (
          <motion.div
            key="essentials-card"
            initial={{ opacity: 0, scale: 0.97, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: "auto" }}
            exit={{ opacity: 0, scale: 0.97, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden rounded-xl border border-border bg-background shadow-sm"
          >
            <EssentialsSection
              essentials={essentials}
              templates={essentialTemplates ?? []}
              onSaveSchedule={onSaveEssentialSchedule ?? (() => {})}
              onCreateEssential={onCreateEssential ?? (() => {})}
              onDeleteEssential={onDeleteEssential ?? (() => {})}
              wakeUpMinutes={wakeUpMinutes}
              windDownMinutes={windDownMinutes}
              onSleepTimesChange={onSleepTimesChange ?? (() => {})}
              isSleepConfigured={isSleepConfigured}
              essentialIcons={goalIcons ?? []}
              isCollapsed={isEssentialsCollapsed}
              onToggleCollapse={() => setIsEssentialsCollapsed((prev) => !prev)}
              isHidden={isEssentialsHidden}
              onHide={onEssentialsHide}
              onOnboardingComplete={handleEssentialsHide}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Card */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="scrollbar-hidden flex-1 overflow-y-auto">
          <GoalSection
            title="Goals"
            description="Things you intentionally want to do"
            items={goals}
            selectedGoalId={selectedGoalId}
            showTasks={showTasks}
            onAddItem={onAddGoal}
            onItemClick={onSelectGoal}
            onToggleTask={onToggleGoalTask}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onUpdateSubtask={onUpdateSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onDeleteTask={onDeleteTask}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            draggable={draggable}
            onCreateAndSelectGoal={onCreateAndSelectGoal}
            onBrowseInspiration={onBrowseInspiration}
            isInspirationActive={isInspirationActive}
            isOnboardingGoalsStep={isOnboardingGoalsStep}
            onOnboardingContinue={onOnboardingContinue}
            currentWeekStart={currentWeekStart}
            className="py-2"
          />
        </div>

        {/* Footer - hide during onboarding goals step to make room for Continue button */}
        {!isOnboardingGoalsStep && (
          <div className="shrink-0 border-t border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">168 hours in a week</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
