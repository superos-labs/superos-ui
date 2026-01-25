"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiMoreLine,
  RiShiningLine,
  RiFlagLine,
  RiCheckLine,
  RiTimeLine,
  RiPencilLine,
  RiCloseLine,
  RiLockLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass, GOAL_COLORS } from "@/lib/colors";
import type { IconComponent } from "@/lib/types";
import { useDraggable, useDragContextOptional } from "@/components/drag";
import type { DragItem } from "@/lib/drag-types";
import type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo, ScheduleTask } from "@/hooks/use-unified-schedule";

// =============================================================================
// Types
// =============================================================================

/**
 * BacklogTask is a re-export of ScheduleTask for backward compatibility.
 * Use ScheduleTask from @/hooks/use-unified-schedule for new code.
 */
type BacklogTask = ScheduleTask;

/**
 * BacklogItem represents a goal or commitment in the backlog.
 * For goals with tasks, use ScheduleGoal from @/hooks/use-unified-schedule.
 */
interface BacklogItem {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  plannedHours?: number;
  /** @deprecated Use getGoalStats instead - hours are now computed from calendar blocks */
  completedHours?: number;
  /** Current milestone - the next concrete step toward this goal */
  milestone?: string;
  /** Tasks associated with this item */
  tasks?: BacklogTask[];
  /** If true, commitment cannot be disabled (only for commitments) */
  mandatory?: boolean;
}

/** Mode for the backlog display */
type BacklogMode = "view" | "edit-commitments";

interface BacklogGroup {
  id: string;
  title: string;
  description: string;
  items: BacklogItem[];
}

/** Life area for categorizing goals */
interface LifeArea {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
}

/** Data for creating a new goal */
interface NewGoalData {
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
}

/** Icon option for the goal icon picker */
interface GoalIconOption {
  icon: IconComponent;
  label: string;
}

// Helpers
function formatScheduledTime(schedule: TaskScheduleInfo): string {
  const hours = Math.floor(schedule.startMinutes / 60);
  const minutes = schedule.startMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const timeStr = minutes > 0 
    ? `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
    : `${displayHours} ${period}`;
  
  // Get day name (assuming dayIndex 0 = Monday)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to our Monday=0 format
  
  if (schedule.dayIndex === todayIndex) {
    return timeStr; // Just show time for today
  }
  
  return `${days[schedule.dayIndex]} ${timeStr}`;
}

function formatDeadlineDate(deadline: TaskDeadlineInfo): string {
  const date = new Date(deadline.date + "T00:00:00"); // Parse as local date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const deadlineTime = date.getTime();
  const todayTime = today.getTime();
  const tomorrowTime = tomorrow.getTime();
  
  if (deadlineTime === todayTime) {
    return "Today";
  }
  if (deadlineTime === tomorrowTime) {
    return "Tomorrow";
  }
  
  // Check if within this week (next 7 days)
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  
  if (deadlineTime < weekFromNow.getTime() && deadlineTime > todayTime) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }
  
  // Otherwise show date
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Components
type GoalDisplayMode = "goal" | "milestone";

interface TaskRowProps {
  task: BacklogTask;
  /** Parent goal (needed for drag context and color inheritance) */
  parentGoal: BacklogItem;
  /** Schedule info if this task is on the calendar */
  scheduleInfo?: TaskScheduleInfo | null;
  /** Deadline info if this task has a deadline */
  deadlineInfo?: TaskDeadlineInfo | null;
  onToggle?: (id: string) => void;
  /** Whether drag is enabled (requires DragProvider) */
  draggable?: boolean;
}

function TaskRow({ 
  task, 
  parentGoal, 
  scheduleInfo, 
  deadlineInfo,
  onToggle, 
  draggable = false 
}: TaskRowProps) {
  // Drag context is optional - only use if within DragProvider
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext && !task.completed;
  
  const dragItem: DragItem = {
    type: "task",
    goalId: parentGoal.id,
    goalLabel: parentGoal.label,
    goalColor: parentGoal.color,
    taskId: task.id,
    taskLabel: task.label,
    // Include source deadline if this task has one (for dragging from tray)
    sourceDeadline: task.deadline,
  };
  
  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 transition-all",
        "hover:bg-muted/60",
        isDragging && "opacity-50",
      )}
      {...(canDrag ? draggableProps : {})}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(task.id);
        }}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
          task.completed
            ? "bg-muted text-muted-foreground"
            : "bg-muted/60 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground",
        )}
      >
        {task.completed && <RiCheckLine className="size-3" />}
      </button>
      <span
        className={cn(
          "flex-1 truncate text-xs",
          task.completed
            ? "text-muted-foreground line-through"
            : "text-foreground/80",
        )}
      >
        {task.label}
      </span>
      
      {/* Scheduled time pill (mutually exclusive with deadline) */}
      {scheduleInfo && (
        <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
          <RiTimeLine className="size-3" />
          {formatScheduledTime(scheduleInfo)}
        </span>
      )}
      
      {/* Deadline pill (shown when no schedule, but has deadline) */}
      {!scheduleInfo && deadlineInfo && (
        <span 
          className={cn(
            "flex shrink-0 items-center gap-1 text-[10px] tabular-nums",
            deadlineInfo.isOverdue 
              ? "text-amber-600 dark:text-amber-500" 
              : "text-muted-foreground"
          )}
        >
          <RiFlagLine className="size-3" />
          {formatDeadlineDate(deadlineInfo)}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// Inline Goal Creator
// =============================================================================

interface InlineGoalCreatorProps {
  lifeAreas: LifeArea[];
  goalIcons: GoalIconOption[];
  onSave: (goal: NewGoalData) => void;
  onCancel: () => void;
}

function InlineGoalCreator({
  lifeAreas,
  goalIcons,
  onSave,
  onCancel,
}: InlineGoalCreatorProps) {
  const [label, setLabel] = React.useState("");
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<GoalColor>("violet");
  const [selectedAreaId, setSelectedAreaId] = React.useState(lifeAreas[0]?.id ?? "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedIcon = goalIcons[selectedIconIndex]?.icon ?? RiFlagLine;
  const selectedArea = lifeAreas.find((a) => a.id === selectedAreaId) ?? lifeAreas[0];
  const SelectedAreaIcon = selectedArea?.icon;

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      label: label.trim(),
      icon: selectedIcon,
      color: selectedColor,
      lifeAreaId: selectedAreaId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  // Subset of colors for the picker (most distinct/common)
  const pickerColors: GoalColor[] = [
    "slate", "red", "orange", "amber", "green", "teal", 
    "cyan", "blue", "indigo", "violet", "purple", "pink", "rose"
  ];

  return (
    <div className="mx-3 mb-2 flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
      {/* Header row: Title + Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">New goal</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className={cn(
              "flex size-6 items-center justify-center rounded-md transition-colors",
              label.trim()
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
            title="Save goal"
          >
            <RiCheckLine className="size-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main row: Icon picker + Input + Life Area */}
      <div className="flex items-center gap-2">
        {/* Icon/Color Picker Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 transition-colors hover:bg-muted"
              title="Choose icon and color"
            >
              {React.createElement(selectedIcon, { className: cn("size-4", getIconColorClass(selectedColor)) })}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-2">
            <DropdownMenuLabel className="px-1 py-1">Icon</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              {goalIcons.map((iconOption, index) => {
                const IconComp = iconOption.icon;
                const isSelected = selectedIconIndex === index;
                return (
                  <button
                    key={iconOption.label}
                    onClick={() => setSelectedIconIndex(index)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md transition-colors",
                      isSelected
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={iconOption.label}
                  >
                    <IconComp className="size-3.5" />
                  </button>
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-1 py-1">Color</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-1 pb-1">
              {pickerColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md transition-all",
                    selectedColor === color && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                  )}
                  title={color}
                >
                  <div className={cn("size-4 rounded-full", getIconColorClass(color).replace("text-", "bg-"))} />
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Goal Name Input */}
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Goal name..."
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />

        {/* Life Area Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              {SelectedAreaIcon && <SelectedAreaIcon className="size-3" />}
              <span>{selectedArea?.label}</span>
              <RiArrowDownSLine className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {lifeAreas.map((area) => {
              const AreaIcon = area.icon;
              return (
                <DropdownMenuItem
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={cn(
                    "gap-2",
                    selectedAreaId === area.id && "bg-accent"
                  )}
                >
                  <AreaIcon className={cn("size-3.5", getIconColorClass(area.color))} />
                  {area.label}
                  {selectedAreaId === area.id && (
                    <RiCheckLine className="ml-auto size-3.5" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface BacklogItemRowProps {
  item: BacklogItem;
  /** Computed stats from calendar (optional, uses item.plannedHours/completedHours as fallback) */
  stats?: GoalStats;
  showHours?: boolean;
  showTasks?: boolean;
  /** For goals with milestones, which should be the primary title */
  goalDisplayMode?: GoalDisplayMode;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Whether drag is enabled (requires DragProvider) */
  draggable?: boolean;
  /** Type of drag item to create ("goal" for goals, "commitment" for commitments) */
  dragType?: "goal" | "commitment";
  className?: string;
}

function BacklogItemRow({
  item,
  stats,
  showHours = true,
  showTasks = true,
  goalDisplayMode = "goal",
  onToggleTask,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  dragType = "goal",
  className,
}: BacklogItemRowProps) {
  const IconComponent = item.icon;

  // Use computed stats if provided, otherwise fall back to legacy props
  const plannedHours = stats?.plannedHours ?? item.plannedHours ?? 0;
  const completedHours = stats?.completedHours ?? item.completedHours ?? 0;
  const hasHoursData = stats ? (plannedHours > 0 || completedHours > 0) : item.plannedHours !== undefined;

  // Drag context is optional - only use if within DragProvider
  const dragContext = useDragContextOptional();
  const canDrag = draggable && dragContext;
  
  // Create the appropriate drag item based on dragType
  const dragItem: DragItem = dragType === "commitment"
    ? {
        type: "commitment",
        commitmentId: item.id,
        commitmentLabel: item.label,
        commitmentColor: item.color,
      }
    : {
        type: "goal",
        goalId: item.id,
        goalLabel: item.label,
        goalColor: item.color,
      };
  
  const { draggableProps, isDragging } = useDraggable({
    item: dragItem,
    disabled: !canDrag,
  });

  // Determine what to show as primary vs secondary based on display mode
  const hasMilestone = !!item.milestone;
  const showMilestoneAsPrimary =
    goalDisplayMode === "milestone" && hasMilestone;
  const primaryText = showMilestoneAsPrimary ? item.milestone : item.label;
  const secondaryText = showMilestoneAsPrimary ? item.label : item.milestone;

  const hasTasks = showTasks && item.tasks && item.tasks.length > 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
          "hover:bg-muted/60",
          isDragging && "opacity-50",
        )}
        {...(canDrag ? draggableProps : {})}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <IconComponent className={cn("size-4", getIconColorClass(item.color))} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {primaryText}
          </span>
          {secondaryText && (
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              {showMilestoneAsPrimary ? (
                <RiFlagLine className="size-3 shrink-0" />
              ) : (
                <RiShiningLine className="size-3 shrink-0" />
              )}
              <span className="truncate">{secondaryText}</span>
            </span>
          )}
        </div>

        {showHours && hasHoursData && (
          <div className="flex shrink-0 items-center gap-1.5 text-xs">
            <span className="tabular-nums text-foreground">
              {completedHours}h
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span className="tabular-nums text-muted-foreground">
              {plannedHours}h
            </span>
          </div>
        )}

        <button className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg bg-background text-muted-foreground opacity-0 shadow-sm ring-1 ring-border/50 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
          <RiMoreLine className="size-4" />
        </button>
      </div>

      {hasTasks && (
        <div className="flex flex-col gap-0.5">
          {item.tasks!.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              parentGoal={item}
              scheduleInfo={getTaskSchedule?.(task.id)}
              deadlineInfo={getTaskDeadline?.(task.id)}
              onToggle={(taskId) => onToggleTask?.(item.id, taskId)}
              draggable={draggable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BacklogSectionProps {
  title: string;
  description?: string;
  items: BacklogItem[];
  showHours?: boolean;
  showTasks?: boolean;
  goalDisplayMode?: GoalDisplayMode;
  onAddItem?: () => void;
  onToggleTask?: (itemId: string, taskId: string) => void;
  /** Function to get computed stats for a goal/commitment */
  getItemStats?: (itemId: string) => GoalStats;
  /** Function to get schedule info for a task */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Whether drag is enabled */
  draggable?: boolean;
  /** Type of drag item to create ("goal" for goals, "commitment" for commitments) */
  dragType?: "goal" | "commitment";
  /** Callback to enter edit mode (only for commitments section) */
  onEdit?: () => void;
  /** Callback for inline goal creation (shows + button in header) */
  onCreateGoal?: (goal: NewGoalData) => void;
  /** Life areas for goal creation dropdown */
  lifeAreas?: LifeArea[];
  /** Available icons for goal creation */
  goalIcons?: GoalIconOption[];
  className?: string;
}

function BacklogSection({
  title,
  description,
  items,
  showHours = true,
  showTasks = true,
  goalDisplayMode = "goal",
  onAddItem,
  onToggleTask,
  getItemStats,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  dragType = "goal",
  onEdit,
  onCreateGoal,
  lifeAreas,
  goalIcons,
  className,
}: BacklogSectionProps) {
  // State for inline goal creation
  const [isCreating, setIsCreating] = React.useState(false);

  // Calculate totals from stats if available, otherwise use legacy props
  const totals = React.useMemo(() => {
    if (getItemStats) {
      return items.reduce(
        (acc, item) => {
          const stats = getItemStats(item.id);
          return {
            planned: acc.planned + stats.plannedHours,
            completed: acc.completed + stats.completedHours,
          };
        },
        { planned: 0, completed: 0 }
      );
    }
    return {
      planned: items.reduce((sum, item) => sum + (item.plannedHours || 0), 0),
      completed: items.reduce((sum, item) => sum + (item.completedHours || 0), 0),
    };
  }, [items, getItemStats]);

  return (
    <div className={cn("flex flex-col px-3", className)}>
      <div className="group/section flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showHours && totals.planned > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              <span className="tabular-nums text-foreground">
                {totals.completed}h
              </span>
              <span className="text-muted-foreground/50">/</span>
              <span className="tabular-nums text-muted-foreground">
                {totals.planned}h
              </span>
            </div>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex h-6 w-0 items-center justify-center overflow-hidden rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground group-hover/section:w-6"
              title="Edit commitments"
            >
              <RiPencilLine className="size-3.5 shrink-0" />
            </button>
          )}
          {onCreateGoal && lifeAreas && goalIcons && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex h-6 w-0 items-center justify-center overflow-hidden rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground group-hover/section:w-6"
              title="Add goal"
            >
              <RiAddLine className="size-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Goal Creator */}
      {isCreating && onCreateGoal && lifeAreas && goalIcons && (
        <InlineGoalCreator
          lifeAreas={lifeAreas}
          goalIcons={goalIcons}
          onSave={(goal) => {
            onCreateGoal(goal);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <BacklogItemRow
            key={item.id}
            item={item}
            stats={getItemStats?.(item.id)}
            showHours={showHours}
            showTasks={showTasks}
            goalDisplayMode={goalDisplayMode}
            onToggleTask={onToggleTask}
            getTaskSchedule={getTaskSchedule}
            getTaskDeadline={getTaskDeadline}
            draggable={draggable}
            dragType={dragType}
          />
        ))}
      </div>

      {onAddItem && (
        <button
          onClick={onAddItem}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            <RiAddLine className="size-4" />
          </div>
          <span>Add item</span>
        </button>
      )}
    </div>
  );
}

// =============================================================================
// Edit Commitments View
// =============================================================================

interface EditCommitmentsViewProps {
  allCommitments: BacklogItem[];
  enabledIds: Set<string>;
  mandatoryIds: Set<string>;
  onToggle: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditCommitmentsView({
  allCommitments,
  enabledIds,
  mandatoryIds,
  onToggle,
  onSave,
  onCancel,
}: EditCommitmentsViewProps) {
  return (
    <div className="flex flex-col px-3 py-2">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">Edit Commitments</h3>
          <p className="text-xs text-muted-foreground">Choose which to track</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-600"
            title="Save changes"
          >
            <RiCheckLine className="size-4" />
          </button>
          <button
            onClick={onCancel}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {allCommitments.map((commitment) => {
          const isMandatory = mandatoryIds.has(commitment.id);
          const isEnabled = enabledIds.has(commitment.id);
          const IconComponent = commitment.icon;

          return (
            <button
              key={commitment.id}
              onClick={() => !isMandatory && onToggle(commitment.id)}
              disabled={isMandatory}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                isMandatory
                  ? "cursor-default"
                  : "cursor-pointer hover:bg-muted/60",
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
                  isMandatory
                    ? "bg-muted text-muted-foreground"
                    : isEnabled
                      ? "bg-foreground text-background"
                      : "bg-muted/60 text-transparent",
                )}
              >
                {isMandatory ? (
                  <RiLockLine className="size-3" />
                ) : (
                  <RiCheckLine className="size-3" />
                )}
              </div>

              {/* Icon */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <IconComponent
                  className={cn(
                    "size-4",
                    isEnabled
                      ? getIconColorClass(commitment.color)
                      : "text-muted-foreground",
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "flex-1 text-left text-sm font-medium",
                  isEnabled ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {commitment.label}
              </span>

              {/* Required badge */}
              {isMandatory && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Required
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Backlog Component
// =============================================================================

interface BacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of commitment items to display (filtered by enabled state) */
  commitments: BacklogItem[];
  /** Array of goal items to display */
  goals: BacklogItem[];
  showHours?: boolean;
  showTasks?: boolean;
  showCommitments?: boolean;
  /** Whether to display goal or milestone as primary title for goals */
  goalDisplayMode?: GoalDisplayMode;
  onAddCommitment?: () => void;
  onAddGoal?: () => void;
  onToggleGoalTask?: (goalId: string, taskId: string) => void;
  /** Function to get computed stats for a goal (enables computed hours display) */
  getGoalStats?: (goalId: string) => GoalStats;
  /** Function to get computed stats for a commitment (enables computed hours display) */
  getCommitmentStats?: (commitmentId: string) => GoalStats;
  /** Function to get schedule info for a task (enables time pill display) */
  getTaskSchedule?: (taskId: string) => TaskScheduleInfo | null;
  /** Function to get deadline info for a task (enables deadline pill display) */
  getTaskDeadline?: (taskId: string) => TaskDeadlineInfo | null;
  /** Enable drag-and-drop (requires DragProvider wrapper) */
  draggable?: boolean;
  
  // Edit commitments mode props
  /** Current display mode */
  mode?: BacklogMode;
  /** All available commitments (for edit mode) */
  allCommitments?: BacklogItem[];
  /** Set of enabled commitment IDs (for edit mode, uses draft during editing) */
  enabledCommitmentIds?: Set<string>;
  /** Set of mandatory commitment IDs (cannot be disabled) */
  mandatoryCommitmentIds?: Set<string>;
  /** Toggle commitment enabled state */
  onToggleCommitmentEnabled?: (id: string) => void;
  /** Enter edit mode */
  onEditCommitments?: () => void;
  /** Save and exit edit mode */
  onSaveCommitments?: () => void;
  /** Cancel and exit edit mode */
  onCancelEditCommitments?: () => void;
  
  // Goal creation props
  /** Callback for creating a new goal */
  onCreateGoal?: (goal: NewGoalData) => void;
  /** Life areas for goal creation */
  lifeAreas?: LifeArea[];
  /** Available icons for goal creation */
  goalIcons?: GoalIconOption[];
}

function Backlog({
  commitments,
  goals,
  showHours = true,
  showTasks = true,
  showCommitments = true,
  goalDisplayMode = "goal",
  onAddCommitment,
  onAddGoal,
  onToggleGoalTask,
  getGoalStats,
  getCommitmentStats,
  getTaskSchedule,
  getTaskDeadline,
  draggable = false,
  // Edit commitments props
  mode = "view",
  allCommitments,
  enabledCommitmentIds,
  mandatoryCommitmentIds,
  onToggleCommitmentEnabled,
  onEditCommitments,
  onSaveCommitments,
  onCancelEditCommitments,
  // Goal creation props
  onCreateGoal,
  lifeAreas,
  goalIcons,
  className,
  ...props
}: BacklogProps) {
  const isEditingCommitments = mode === "edit-commitments";

  return (
    <div
      className={cn(
        "flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Content */}
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
        {showCommitments && (
          isEditingCommitments && allCommitments && enabledCommitmentIds && mandatoryCommitmentIds && onToggleCommitmentEnabled && onSaveCommitments && onCancelEditCommitments ? (
            <EditCommitmentsView
              allCommitments={allCommitments}
              enabledIds={enabledCommitmentIds}
              mandatoryIds={mandatoryCommitmentIds}
              onToggle={onToggleCommitmentEnabled}
              onSave={onSaveCommitments}
              onCancel={onCancelEditCommitments}
            />
          ) : (
            <BacklogSection
              title="Commitments"
              description="Time for essentials"
              items={commitments}
              showHours={showHours}
              onAddItem={onAddCommitment}
              getItemStats={getCommitmentStats}
              getTaskSchedule={getTaskSchedule}
              getTaskDeadline={getTaskDeadline}
              draggable={draggable}
              dragType="commitment"
              onEdit={onEditCommitments}
              className="py-2"
            />
          )
        )}

        <BacklogSection
          title="Goals"
          description="Chosen priorities"
          items={goals}
          showHours={showHours}
          showTasks={showTasks}
          goalDisplayMode={goalDisplayMode}
          onAddItem={onAddGoal}
          onToggleTask={onToggleGoalTask}
          getItemStats={getGoalStats}
          getTaskSchedule={getTaskSchedule}
          getTaskDeadline={getTaskDeadline}
          draggable={draggable}
          dragType="goal"
          onCreateGoal={onCreateGoal}
          lifeAreas={lifeAreas}
          goalIcons={goalIcons}
          className="py-2"
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">168 hours in a week</span>
        </div>
      </div>
    </div>
  );
}

export { Backlog, BacklogSection, BacklogItemRow, TaskRow, InlineGoalCreator };
export type {
  BacklogProps,
  BacklogItem,
  BacklogTask,
  BacklogGroup,
  GoalDisplayMode,
  BacklogMode,
  LifeArea,
  NewGoalData,
  GoalIconOption,
};
// Re-export types from use-unified-schedule for convenience
export type { GoalStats, TaskScheduleInfo, TaskDeadlineInfo } from "@/hooks/use-unified-schedule";
