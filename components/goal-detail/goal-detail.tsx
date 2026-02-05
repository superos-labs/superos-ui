"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMoreFill,
  RiCloseLine,
  RiCheckLine,
} from "@remixicon/react";
import type {
  ScheduleGoal,
  ScheduleTask,
  TaskScheduleInfo,
  TaskDeadlineInfo,
  GoalSyncSettings,
} from "@/lib/unified-schedule";
import type { AppearanceOverride } from "@/lib/calendar-sync";
import type { LifeArea, GoalIconOption, IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import type { BacklogItem } from "@/components/backlog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui";
import { GoalDetailHeader } from "./goal-detail-header";
import { GoalDetailMilestones } from "./goal-detail-milestones";
import { GoalDetailTasks } from "./goal-detail-tasks";

// =============================================================================
// Collapsible Section
// =============================================================================

interface CollapsibleSectionProps {
  label: string;
  count?: { completed: number; total: number };
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  label,
  count,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-1.5 text-left transition-colors hover:text-foreground"
      >
        <RiArrowRightSLine
          className={cn(
            "size-4 text-muted-foreground/50 transition-transform",
            isOpen && "rotate-90"
          )}
        />
        <span className="text-xs text-muted-foreground/70">{label}</span>
        {count && count.total > 0 && (
          <span className="text-xs text-muted-foreground/40">
            {count.completed}/{count.total}
          </span>
        )}
      </button>
      {isOpen && <div className="flex flex-col">{children}</div>}
    </div>
  );
}

// =============================================================================
// Notes Section (borderless, auto-expanding)
// =============================================================================

interface GoalDetailNotesProps {
  notes: string;
  onChange?: (notes: string) => void;
  className?: string;
}

function GoalDetailNotes({ notes, onChange, className }: GoalDetailNotesProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      // Minimum height of one line (~20px), grows with content
      textarea.style.height = `${Math.max(textarea.scrollHeight, 20)}px`;
    }
  }, [notes]);

  return (
    <div className={cn("flex flex-col", className)}>
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Add notes..."
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent text-sm text-muted-foreground leading-relaxed",
          "placeholder:text-muted-foreground/40",
          "focus:outline-none",
          !onChange && "cursor-default"
        )}
        readOnly={!onChange}
      />
    </div>
  );
}

// =============================================================================
// Goal Sync Settings Dialog
// =============================================================================

/** Appearance options for goal sync */
const APPEARANCE_OPTIONS: {
  value: AppearanceOverride;
  label: string;
  description: string;
}[] = [
  {
    value: "use_default",
    label: "Use default",
    description: "Follow the global setting",
  },
  {
    value: "blocked_superos",
    label: "Blocked with SuperOS",
    description: "Show as 'Blocked with SuperOS'",
  },
  { value: "busy", label: "Busy", description: "Show as 'Busy'" },
  { value: "goal_title", label: "Goal name", description: "Show goal name" },
  {
    value: "block_title",
    label: "Block title",
    description: "Show block title",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Use a custom label",
  },
];

interface GoalSyncSettingsDialogProps {
  open: boolean;
  syncSettings?: GoalSyncSettings;
  onClose: () => void;
  onSyncSettingsChange?: (settings: Partial<GoalSyncSettings>) => void;
}

function GoalSyncSettingsDialog({
  open,
  syncSettings,
  onClose,
  onSyncSettingsChange,
}: GoalSyncSettingsDialogProps) {
  if (!open) return null;

  const syncEnabled = syncSettings?.syncEnabled ?? true;
  const appearanceOverride = syncSettings?.appearanceOverride ?? "use_default";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Sync Settings</h3>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5">
          {/* Sync enabled toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Sync this goal</span>
              <span className="text-xs text-muted-foreground">
                Share blocks from this goal to external calendar
              </span>
            </div>
            <button
              role="switch"
              aria-checked={syncEnabled}
              onClick={() =>
                onSyncSettingsChange?.({ syncEnabled: !syncEnabled })
              }
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                syncEnabled ? "bg-foreground" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0",
                  "transition-transform duration-150",
                  syncEnabled ? "translate-x-[18px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          {/* Appearance override - only when sync is enabled */}
          {syncEnabled && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Show blocks as</span>
              <div className="flex flex-col gap-0.5">
                {APPEARANCE_OPTIONS.map((option) => {
                  const isSelected = appearanceOverride === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() =>
                        onSyncSettingsChange?.({
                          appearanceOverride: option.value,
                        })
                      }
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg py-2 px-3 text-left",
                        "transition-colors duration-150 hover:bg-muted/60",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-150",
                          isSelected
                            ? "bg-foreground"
                            : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20"
                        )}
                      >
                        {isSelected && (
                          <span className="size-2 rounded-full bg-background" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "text-sm transition-colors",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Custom label input - shown when custom is selected */}
              {appearanceOverride === "custom" && (
                <input
                  type="text"
                  value={syncSettings?.customLabel ?? ""}
                  onChange={(e) =>
                    onSyncSettingsChange?.({ customLabel: e.target.value })
                  }
                  placeholder="Enter custom label..."
                  className={cn(
                    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground/60",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  )}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export interface GoalDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The goal to display */
  goal: ScheduleGoal;
  /** Associated life area (looked up from goal's lifeAreaId) */
  lifeArea?: LifeArea;
  /** Optional target completion date (ISO date string) */
  deadline?: string;
  /** Local notes state (demo only, not persisted) */
  notes?: string;
  /** Callback when notes change */
  onNotesChange?: (notes: string) => void;
  /** Callback when title is edited */
  onTitleChange?: (title: string) => void;
  /** Callback when deadline is changed (undefined to clear) */
  onDeadlineChange?: (deadline: string | undefined) => void;
  /** Available life areas for editing */
  lifeAreas?: LifeArea[];
  /** Available icons for editing */
  goalIcons?: GoalIconOption[];
  /** Callback when icon is changed */
  onIconChange?: (icon: IconComponent) => void;
  /** Callback when color is changed */
  onColorChange?: (color: GoalColor) => void;
  /** Callback when life area is changed */
  onLifeAreaChange?: (lifeAreaId: string) => void;
  /** Callback to open the add life area modal */
  onAddLifeArea?: () => void;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;

  // Task callbacks
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (label: string, milestoneId?: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<ScheduleTask>) => void;
  onDeleteTask?: (taskId: string) => void;

  // Subtask callbacks
  onAddSubtask?: (taskId: string, label: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, label: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;

  // Milestone callbacks
  onAddMilestone?: (label: string) => void;
  onToggleMilestone?: (milestoneId: string) => void;
  onUpdateMilestone?: (milestoneId: string, label: string) => void;
  onDeleteMilestone?: (milestoneId: string) => void;
  /** Callback to toggle milestones enabled/disabled */
  onToggleMilestones?: () => void;

  /** Callback when goal is deleted */
  onDelete?: () => void;
  /** Callback to close the goal detail view */
  onBack?: () => void;

  // Sync settings callbacks
  /** Callback to update goal sync settings */
  onSyncSettingsChange?: (settings: Partial<GoalSyncSettings>) => void;
  /** Whether sync settings should be shown (only when calendar integrations are enabled) */
  hasSyncAvailable?: boolean;
}

export function GoalDetail({
  goal,
  lifeArea,
  deadline,
  notes = "",
  onNotesChange,
  onTitleChange,
  onDeadlineChange,
  lifeAreas,
  goalIcons,
  onIconChange,
  onColorChange,
  onLifeAreaChange,
  onAddLifeArea,
  getTaskSchedule,
  getTaskDeadline,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onAddMilestone,
  onToggleMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onToggleMilestones,
  onDelete,
  onBack,
  onSyncSettingsChange,
  hasSyncAvailable = false,
  className,
  ...props
}: GoalDetailProps) {
  // Sync settings dialog state
  const [syncSettingsOpen, setSyncSettingsOpen] = React.useState(false);

  // Convert ScheduleGoal to BacklogItem for task row compatibility
  const goalAsBacklogItem: BacklogItem = {
    id: goal.id,
    label: goal.label,
    icon: goal.icon,
    color: goal.color,
    milestones: goal.milestones,
    milestonesEnabled: goal.milestonesEnabled,
    tasks: goal.tasks,
  };

  // Compute milestone and task counts for collapsible headers
  const milestones = goal.milestones ?? [];
  const tasks = goal.tasks ?? [];
  const milestoneCount = {
    completed: milestones.filter((m) => m.completed).length,
    total: milestones.length,
  };
  const taskCount = {
    completed: tasks.filter((t) => t.completed).length,
    total: tasks.length,
  };

  // Check if milestones are enabled for this goal
  const milestonesEnabled = goal.milestonesEnabled ?? milestones.length > 0;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      {/* Scrollable content */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="w-full px-12 py-12">
          {/* Action buttons row */}
          <div className="mb-6 flex items-center justify-between">
            {/* Back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close goal detail"
              >
                <RiArrowLeftSLine className="size-5" />
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* More options menu */}
            {(onSyncSettingsChange || onToggleMilestones || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="More options"
                  >
                    <RiMoreFill className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {onSyncSettingsChange && hasSyncAvailable && (
                    <DropdownMenuItem onClick={() => setSyncSettingsOpen(true)}>
                      Sync settings
                    </DropdownMenuItem>
                  )}
                  {onSyncSettingsChange && hasSyncAvailable && onToggleMilestones && (
                    <DropdownMenuSeparator />
                  )}
                  {onToggleMilestones && (
                    <DropdownMenuItem onClick={onToggleMilestones}>
                      {milestonesEnabled
                        ? "Disable milestones"
                        : "Enable milestones"}
                    </DropdownMenuItem>
                  )}
                  {((onSyncSettingsChange && hasSyncAvailable) || onToggleMilestones) && onDelete && (
                    <DropdownMenuSeparator />
                  )}
                  {onDelete && (
                    <DropdownMenuItem variant="destructive" onClick={onDelete}>
                      Delete goal
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content flows vertically with consistent spacing */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <GoalDetailHeader
              icon={goal.icon}
              title={goal.label}
              color={goal.color}
              lifeArea={lifeArea}
              deadline={deadline}
              lifeAreas={lifeAreas}
              goalIcons={goalIcons}
              onTitleChange={onTitleChange}
              onDeadlineChange={onDeadlineChange}
              onIconChange={onIconChange}
              onColorChange={onColorChange}
              onLifeAreaChange={onLifeAreaChange}
              onAddLifeArea={onAddLifeArea}
            />

            {/* Notes (inline, borderless) */}
            <GoalDetailNotes notes={notes} onChange={onNotesChange} />

            {/* When milestones are enabled, show hierarchical milestone/task view */}
            {milestonesEnabled ? (
              <GoalDetailMilestones
                milestones={milestones}
                tasks={tasks}
                parentGoal={goalAsBacklogItem}
                getTaskSchedule={getTaskSchedule}
                getTaskDeadline={getTaskDeadline}
                onAddMilestone={onAddMilestone}
                onToggleMilestone={onToggleMilestone}
                onUpdateMilestone={onUpdateMilestone}
                onDeleteMilestone={onDeleteMilestone}
                onToggleTask={onToggleTask}
                onAddTask={onAddTask}
                onUpdateTask={onUpdateTask}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onUpdateSubtask={onUpdateSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onDeleteTask={onDeleteTask}
              />
            ) : (
              /* When milestones disabled, show flat tasks list */
              <CollapsibleSection
                label="Tasks"
                count={taskCount}
                defaultOpen={true}
              >
                <GoalDetailTasks
                  tasks={tasks}
                  parentGoal={goalAsBacklogItem}
                  getTaskSchedule={getTaskSchedule}
                  getTaskDeadline={getTaskDeadline}
                  onToggleTask={onToggleTask}
                  onAddTask={onAddTask}
                  onUpdateTask={onUpdateTask}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onUpdateSubtask={onUpdateSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  onDeleteTask={onDeleteTask}
                />
              </CollapsibleSection>
            )}
          </div>
        </div>
      </div>

      {/* Sync Settings Dialog */}
      <GoalSyncSettingsDialog
        open={syncSettingsOpen}
        syncSettings={goal.syncSettings}
        onClose={() => setSyncSettingsOpen(false)}
        onSyncSettingsChange={onSyncSettingsChange}
      />
    </div>
  );
}
