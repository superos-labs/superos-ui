/**
 * =============================================================================
 * File: sidebar-sections.tsx
 * =============================================================================
 *
 * Reusable building blocks for the Block sidebar UI.
 *
 * This file defines a collection of small, composable sidebar sections and
 * controls used inside the block sidebar, including:
 * - Section header wrapper
 * - Inline task creation for goal blocks
 * - Collapsible list of available goal tasks
 * - Goal selector dropdown for unassigned blocks
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Provide consistent layout and visual structure for sidebar sections.
 * - Encapsulate lightweight interaction logic (inline edit, expand/collapse).
 * - Emit user intent via callbacks (no persistence).
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Fetching or mutating domain data.
 * - Managing block selection or sidebar visibility.
 *
 * -----------------------------------------------------------------------------
 * MENTAL MODEL
 * -----------------------------------------------------------------------------
 * "Small focused controls that let me refine what this block represents."
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiArrowDownSLine } from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { ScheduleTask } from "@/lib/unified-schedule";
import type { GoalSelectorOption } from "../block-types";

// =============================================================================
// Section header component
// =============================================================================

export interface BlockSidebarSectionProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function BlockSidebarSection({
  icon,
  label,
  children,
  className,
}: BlockSidebarSectionProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

// =============================================================================
// Inline task creator for goal blocks
// =============================================================================

interface InlineBlockTaskCreatorProps {
  onSave: (label: string) => void;
}

export function InlineBlockTaskCreator({
  onSave,
}: InlineBlockTaskCreatorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onSave(value.trim());
      setValue("");
      inputRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue("");
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onSave(value.trim());
    }
    setValue("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="group flex w-full items-center gap-2.5 rounded-lg py-2 px-2 text-left transition-all hover:bg-muted/60"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground/40 transition-colors group-hover:border-muted-foreground/50 group-hover:text-muted-foreground/60">
          <RiAddLine className="size-3" />
        </div>
        <span className="text-sm text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/70">
          Add task...
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg py-2 px-2">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/40 text-muted-foreground/50">
        <RiAddLine className="size-3" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Task name..."
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}

// =============================================================================
// Collapsible list of available tasks
// =============================================================================

type BlockGoalTask = ScheduleTask;

interface AvailableTasksListProps {
  tasks: BlockGoalTask[];
  onAssign: (taskId: string) => void;
}

export function AvailableTasksList({
  tasks,
  onAssign,
}: AvailableTasksListProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex w-full items-center gap-2.5 rounded-lg py-2 px-2 text-left transition-all hover:bg-muted/60"
      >
        <div className="flex size-5 shrink-0 items-center justify-center">
          <RiArrowDownSLine
            className={cn(
              "size-4 text-muted-foreground/50 transition-transform group-hover:text-muted-foreground/70",
              isExpanded && "rotate-180",
            )}
          />
        </div>
        <span className="text-sm text-muted-foreground/60 transition-colors group-hover:text-muted-foreground/80">
          Show available tasks ({tasks.length})
        </span>
      </button>

      {isExpanded && (
        <div className="flex flex-col">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onAssign(task.id)}
              className="group flex items-center gap-2.5 rounded-lg py-2 px-2 text-left transition-all hover:bg-muted/60"
            >
              <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/20 text-muted-foreground/30 transition-colors group-hover:border-muted-foreground/40 group-hover:text-muted-foreground/50">
                <RiAddLine className="size-3" />
              </div>
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {task.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Goal Selector Dropdown (for unassigned blocks)
// =============================================================================

interface GoalSelectorProps {
  goals: GoalSelectorOption[];
  onSelect: (goalId: string) => void;
}

export function GoalSelector({ goals, onSelect }: GoalSelectorProps) {
  if (goals.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 transition-colors">
          <div className="flex size-5 shrink-0 items-center justify-center rounded border border-dashed border-muted-foreground/40 text-muted-foreground/50 transition-colors group-hover:border-muted-foreground/60 group-hover:text-muted-foreground/70">
            <RiAddLine className="size-3" />
          </div>
          <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            Select goal...
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[240px]">
        {goals.map((goal) => (
          <DropdownMenuItem
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            className="gap-2.5 py-2"
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted/60">
              <goal.icon className={cn("size-3", goal.color)} />
            </div>
            <span className="font-medium">{goal.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
