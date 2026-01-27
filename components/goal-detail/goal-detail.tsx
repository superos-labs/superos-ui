"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiArrowRightSLine, RiCloseLine, RiDeleteBinLine } from "@remixicon/react";
import type { ScheduleGoal, ScheduleTask, TaskScheduleInfo, TaskDeadlineInfo, ProgressIndicator } from "@/lib/unified-schedule";
import type { LifeArea, GoalIconOption, IconComponent } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";
import type { BacklogItem } from "@/components/backlog";
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

function GoalDetailNotes({
  notes,
  onChange,
  className,
}: GoalDetailNotesProps) {
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
          !onChange && "cursor-default",
        )}
        readOnly={!onChange}
      />
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
  /** Local notes state (demo only, not persisted) */
  notes?: string;
  /** Callback when notes change */
  onNotesChange?: (notes: string) => void;
  /** Callback when title is edited */
  onTitleChange?: (title: string) => void;
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
  /** Callback when progress indicator is changed */
  onProgressIndicatorChange?: (indicator: ProgressIndicator) => void;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  
  // Task callbacks
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (label: string) => void;
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
  
  // Navigation
  onClose?: () => void;
  /** Callback when goal is deleted */
  onDelete?: () => void;
}

export function GoalDetail({
  goal,
  lifeArea,
  notes = "",
  onNotesChange,
  onTitleChange,
  lifeAreas,
  goalIcons,
  onIconChange,
  onColorChange,
  onLifeAreaChange,
  onProgressIndicatorChange,
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
  onClose,
  onDelete,
  className,
  ...props
}: GoalDetailProps) {
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
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

  // Show milestones section if there are any, or if user can add them
  const showMilestones = milestones.length > 0 || onAddMilestone;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Action buttons - absolute positioned top right */}
      <div className="absolute right-6 top-6 z-10 flex items-center gap-1">
        {/* Delete button with inline confirmation */}
        {onDelete && (
          showDeleteConfirm ? (
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Delete goal"
            >
              <RiDeleteBinLine className="size-5" />
            </button>
          )
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close goal detail"
          >
            <RiCloseLine className="size-5" />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="w-full px-12 py-12">
          {/* Content flows vertically with consistent spacing */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <GoalDetailHeader
              icon={goal.icon}
              title={goal.label}
              color={goal.color}
              lifeArea={lifeArea}
              lifeAreas={lifeAreas}
              goalIcons={goalIcons}
              progressIndicator={goal.progressIndicator ?? "completed-time"}
              onTitleChange={onTitleChange}
              onIconChange={onIconChange}
              onColorChange={onColorChange}
              onLifeAreaChange={onLifeAreaChange}
              onProgressIndicatorChange={onProgressIndicatorChange}
            />

            {/* Notes (inline, borderless) */}
            <GoalDetailNotes
              notes={notes}
              onChange={onNotesChange}
            />

            {/* Milestones (collapsible) */}
            {showMilestones && (
              <CollapsibleSection
                label="Milestones"
                count={milestoneCount}
                defaultOpen={true}
              >
                <GoalDetailMilestones
                  milestones={milestones}
                  onAdd={onAddMilestone}
                  onToggle={onToggleMilestone}
                  onUpdate={onUpdateMilestone}
                  onDelete={onDeleteMilestone}
                />
              </CollapsibleSection>
            )}

            {/* Tasks (collapsible) */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
