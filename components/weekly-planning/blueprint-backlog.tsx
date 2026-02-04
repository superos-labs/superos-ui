"use client";

/**
 * BlueprintBacklog - Backlog panel for blueprint creation during onboarding.
 *
 * Shows essentials creation and goals that can be dragged to the calendar to build
 * the user's ideal typical week template. Essentials are created directly here
 * and auto-imported to the calendar.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCalendarLine } from "@remixicon/react";
import { RiMoonLine } from "@remixicon/react";
import { BlueprintEssentialsSection } from "./blueprint-essentials-section";
import { PlanningScheduleView } from "./planning-schedule-view";
import { InlineVideoTutorial } from "./inline-video-tutorial";
import type {
  ScheduleGoal,
  ScheduleEssential,
  TaskScheduleInfo,
  TaskDeadlineInfo,
} from "@/lib/unified-schedule";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { NewEssentialData } from "@/components/backlog/essentials";
import type { GoalIconOption } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface BlueprintBacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Goals available for scheduling */
  goals: ScheduleGoal[];
  /** Essentials for scheduling */
  essentials: ScheduleEssential[];
  /** Callback to save blueprint and continue */
  onSave: () => void;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;

  // Essentials creation props
  /** Sleep wake up time in minutes */
  wakeUpMinutes?: number;
  /** Sleep wind down time in minutes */
  windDownMinutes?: number;
  /** Handler for sleep times change */
  onSleepTimesChange?: (wakeUp: number, windDown: number) => void;
  /** Whether sleep is configured */
  isSleepConfigured?: boolean;
  /** Handler for adding a new essential (should auto-import to calendar) */
  onAddEssential?: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  /** Essential templates for schedule display */
  essentialTemplates?: EssentialTemplate[];
  /** Handler to save schedule for an essential */
  onSaveSchedule?: (essentialId: string, slots: EssentialSlot[]) => void;
  /** Handler to delete an essential (should also delete calendar events) */
  onDeleteEssential?: (essentialId: string) => void;
  /** Available icons for custom essential creation */
  essentialIcons?: GoalIconOption[];
}

// =============================================================================
// Component
// =============================================================================

export function BlueprintBacklog({
  goals,
  essentials,
  onSave,
  getTaskSchedule,
  getTaskDeadline,
  // Essentials creation props
  wakeUpMinutes = 420, // 7:00 AM default
  windDownMinutes = 1380, // 11:00 PM default
  onSleepTimesChange,
  isSleepConfigured = false,
  onAddEssential,
  essentialTemplates = [],
  onSaveSchedule,
  onDeleteEssential,
  essentialIcons = [],
  className,
  ...props
}: BlueprintBacklogProps) {
  // State for sleep row expansion
  const [isSleepExpanded, setIsSleepExpanded] = React.useState(false);

  // Create sleep essential item for display
  const sleepEssential = {
    id: "sleep",
    label: "Sleep",
    icon: RiMoonLine,
    color: "indigo" as const,
  };

  // Handler for sleep times that also collapses the row
  const handleSleepTimesChange = (wakeUp: number, windDown: number) => {
    onSleepTimesChange?.(wakeUp, windDown);
  };

  // Check if essentials creation is available (all required props provided)
  const hasEssentialsCreation = onAddEssential && onSaveSchedule && onDeleteEssential;

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-5">
        <div className="flex flex-col gap-3">
          {/* Icon container */}
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <RiCalendarLine className="size-4 text-muted-foreground" />
          </div>
          {/* Title and description */}
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">
              Create your blueprint
            </h2>
            <p className="text-sm text-muted-foreground">
              Define your routine essentials and drag goals to design your ideal typical week.
            </p>
          </div>

          {/* Inline Video Tutorial */}
          <InlineVideoTutorial
            videoUrl="https://www.loom.com/share/e3d7b59cb4ac4642b34eb35df5e88db4"
            thumbnailSrc="/onboarding-thumbnail.png"
            caption="Here's how Ali uses SuperOS"
            thumbnailAlt="SuperOS tutorial video"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex flex-col gap-4 py-3">
          {/* Essentials Section - with inline creation */}
          {hasEssentialsCreation ? (
            <BlueprintEssentialsSection
              sleepEssential={sleepEssential}
              isSleepExpanded={isSleepExpanded}
              onToggleSleepExpand={() => setIsSleepExpanded(!isSleepExpanded)}
              wakeUpMinutes={wakeUpMinutes}
              windDownMinutes={windDownMinutes}
              onSleepTimesChange={handleSleepTimesChange}
              isSleepConfigured={isSleepConfigured}
              essentials={essentials}
              essentialTemplates={essentialTemplates}
              onAddEssential={onAddEssential}
              onSaveSchedule={onSaveSchedule}
              onDeleteEssential={onDeleteEssential}
              essentialIcons={essentialIcons}
            />
          ) : (
            /* Fallback to simple essentials display if creation props not provided */
            <PlanningScheduleView
              essentials={essentials}
              goals={[]}
              draggable={true}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
            />
          )}

          {/* Goals Section */}
          {goals.length > 0 && (
            <PlanningScheduleView
              essentials={[]}
              goals={goals}
              draggable={true}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
            />
          )}
        </div>

        {/* Action Button - Full width, inside the scrollable content area */}
        <div className="sticky bottom-0 flex flex-col gap-3 bg-background px-4 py-4">
          {/* Info callout */}
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              Your starting point
            </span>
            <span className="text-xs text-muted-foreground">
              This blueprint will be used as a starting point when planning future weeks.
            </span>
          </div>

          <button
            onClick={onSave}
            className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Save & continue
          </button>
        </div>
      </div>
    </div>
  );
}
