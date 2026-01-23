"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  RiAddLine,
  RiMoreLine,
  RiShiningLine,
  RiFlagLine,
  RiCheckLine,
} from "@remixicon/react"

// Types
interface BacklogTask {
  id: string
  label: string
  completed?: boolean
}

type IconComponent = React.ComponentType<{ className?: string }>

interface BacklogItem {
  id: string
  label: string
  icon: IconComponent
  color: string
  plannedHours?: number
  completedHours?: number
  /** Current milestone - the next concrete step toward this goal */
  milestone?: string
  /** Tasks associated with this item */
  tasks?: BacklogTask[]
}

interface BacklogGroup {
  id: string
  title: string
  description: string
  items: BacklogItem[]
}

// Components
type GoalDisplayMode = "goal" | "milestone"

interface TaskRowProps {
  task: BacklogTask
  onToggle?: (id: string) => void
}

function TaskRow({ task, onToggle }: TaskRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg py-1.5 pl-4.5 pr-3 transition-all",
        "hover:bg-muted/60"
      )}
    >
      <button
        onClick={() => onToggle?.(task.id)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
          task.completed
            ? "bg-muted text-muted-foreground"
            : "bg-muted/60 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
        )}
      >
        {task.completed && <RiCheckLine className="size-3" />}
      </button>
      <span
        className={cn(
          "flex-1 truncate text-xs",
          task.completed
            ? "text-muted-foreground line-through"
            : "text-foreground/80"
        )}
      >
        {task.label}
      </span>
    </div>
  )
}

interface BacklogItemRowProps {
  item: BacklogItem
  showHours?: boolean
  showTasks?: boolean
  /** For goals with milestones, which should be the primary title */
  goalDisplayMode?: GoalDisplayMode
  onToggleTask?: (itemId: string, taskId: string) => void
  className?: string
}

function BacklogItemRow({ 
  item, 
  showHours = true,
  showTasks = true,
  goalDisplayMode = "goal",
  onToggleTask,
  className 
}: BacklogItemRowProps) {
  const IconComponent = item.icon
  
  // Determine what to show as primary vs secondary based on display mode
  const hasMilestone = !!item.milestone
  const showMilestoneAsPrimary = goalDisplayMode === "milestone" && hasMilestone
  const primaryText = showMilestoneAsPrimary ? item.milestone : item.label
  const secondaryText = showMilestoneAsPrimary ? item.label : item.milestone

  const hasTasks = showTasks && item.tasks && item.tasks.length > 0

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
          "hover:bg-muted/60"
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <IconComponent className={cn("size-4", item.color)} />
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

        {showHours && item.plannedHours !== undefined && (
          <div className="flex shrink-0 items-center gap-1.5 text-xs">
            <span className="tabular-nums text-foreground">{item.completedHours ?? 0}h</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="tabular-nums text-muted-foreground">{item.plannedHours}h</span>
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
              onToggle={(taskId) => onToggleTask?.(item.id, taskId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface BacklogSectionProps {
  title: string
  description?: string
  items: BacklogItem[]
  showHours?: boolean
  showTasks?: boolean
  goalDisplayMode?: GoalDisplayMode
  onAddItem?: () => void
  onToggleTask?: (itemId: string, taskId: string) => void
  className?: string
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
  className,
}: BacklogSectionProps) {
  const totalPlannedHours = items.reduce((sum, item) => sum + (item.plannedHours || 0), 0)
  const totalCompletedHours = items.reduce((sum, item) => sum + (item.completedHours || 0), 0)

  return (
    <div className={cn("flex flex-col px-3", className)}>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {showHours && totalPlannedHours > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            <span className="tabular-nums text-foreground">{totalCompletedHours}h</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="tabular-nums text-muted-foreground">{totalPlannedHours}h</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <BacklogItemRow
            key={item.id}
            item={item}
            showHours={showHours}
            showTasks={showTasks}
            goalDisplayMode={goalDisplayMode}
            onToggleTask={onToggleTask}
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
  )
}

interface BacklogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of commitment items to display */
  commitments: BacklogItem[]
  /** Array of goal items to display */
  goals: BacklogItem[]
  showHours?: boolean
  showTasks?: boolean
  showCommitments?: boolean
  /** Whether to display goal or milestone as primary title for goals */
  goalDisplayMode?: GoalDisplayMode
  onAddCommitment?: () => void
  onAddGoal?: () => void
  onToggleGoalTask?: (goalId: string, taskId: string) => void
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
  className,
  ...props
}: BacklogProps) {
  const totalCommitmentPlanned = commitments.reduce((sum, item) => sum + (item.plannedHours || 0), 0)
  const totalCommitmentCompleted = commitments.reduce((sum, item) => sum + (item.completedHours || 0), 0)
  const totalGoalPlanned = goals.reduce((sum, item) => sum + (item.plannedHours || 0), 0)
  const totalGoalCompleted = goals.reduce((sum, item) => sum + (item.completedHours || 0), 0)

  return (
    <div
      className={cn(
        "flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border">
        {showCommitments && (
          <BacklogSection
            title="Commitments"
            description="Time for essentials"
            items={commitments}
            showHours={showHours}
            onAddItem={onAddCommitment}
            className="py-2"
          />
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
          className="py-2"
        />
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">168 hours in a week</span>
        </div>
      </div>
    </div>
  )
}

export { Backlog, BacklogSection, BacklogItemRow }
export type { BacklogProps, BacklogItem, BacklogTask, BacklogGroup, GoalDisplayMode }
