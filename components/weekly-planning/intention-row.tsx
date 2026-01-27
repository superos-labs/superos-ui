"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ScheduleGoal } from "@/lib/unified-schedule";
import { PROGRESS_INDICATOR_LABELS, PROGRESS_INDICATOR_UNITS } from "@/lib/unified-schedule";
import type { WeeklyIntention } from "@/lib/weekly-planning";
import { RiSubtractLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";

// =============================================================================
// Types
// =============================================================================

export interface IntentionRowProps {
  /** The goal to set intention for */
  goal: ScheduleGoal;
  /** Current intention value (if any) */
  intention?: WeeklyIntention;
  /** Callback when intention is changed */
  onIntentionChange?: (target: number, targetTaskIds?: string[]) => void;
  /** Callback when intention is cleared */
  onIntentionClear?: () => void;
  /** Default value from blueprint (shown as placeholder) */
  defaultTarget?: number;
  /** Whether the row is readonly */
  readonly?: boolean;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function IntentionRow({
  goal,
  intention,
  onIntentionChange,
  onIntentionClear,
  defaultTarget,
  readonly = false,
  className,
}: IntentionRowProps) {
  const Icon = goal.icon;
  const indicator = goal.progressIndicator ?? "completed-time";
  const unit = PROGRESS_INDICATOR_UNITS[indicator];
  const colorClass = getIconColorClass(goal.color);

  // Local input state
  const [inputValue, setInputValue] = React.useState<string>(
    intention?.target?.toString() ?? ""
  );

  // Sync with external intention
  React.useEffect(() => {
    setInputValue(intention?.target?.toString() ?? "");
  }, [intention?.target]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      onIntentionClear?.();
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onIntentionChange?.(numValue);
      }
    }
  };

  const handleInputBlur = () => {
    // Clean up the input on blur
    if (inputValue === "") return;
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0) {
      setInputValue(intention?.target?.toString() ?? "");
    } else {
      setInputValue(numValue.toString());
    }
  };

  const hasIntention = intention !== undefined && intention.target > 0;

  // For specific-tasks, show a different UI
  if (indicator === "specific-tasks") {
    const taskCount = intention?.targetTaskIds?.length ?? 0;
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
          hasIntention ? "bg-muted/50" : "hover:bg-muted/30",
          className
        )}
      >
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            hasIntention ? "bg-muted" : "bg-muted/60"
          )}
        >
          <Icon className={cn("size-4", colorClass)} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{goal.label}</span>
          <span className="text-xs text-muted-foreground">
            {PROGRESS_INDICATOR_LABELS[indicator]}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {taskCount > 0 ? (
            <span className="text-sm tabular-nums text-muted-foreground">
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/60">
              Select tasks
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
        hasIntention ? "bg-muted/50" : "hover:bg-muted/30",
        className
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          hasIntention ? "bg-muted" : "bg-muted/60"
        )}
      >
        <Icon className={cn("size-4", colorClass)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{goal.label}</span>
        <span className="text-xs text-muted-foreground">
          {PROGRESS_INDICATOR_LABELS[indicator]}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {readonly ? (
          <span className="text-sm tabular-nums">
            {intention?.target ?? 0} {unit}
          </span>
        ) : (
          <>
            <input
              type="number"
              min="0"
              step={indicator === "completed-time" || indicator === "focused-time" ? "0.5" : "1"}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder={defaultTarget?.toString() ?? "0"}
              className={cn(
                "w-16 rounded-md border border-border bg-background px-2 py-1 text-right text-sm tabular-nums",
                "placeholder:text-muted-foreground/40",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
            <span className="w-10 text-xs text-muted-foreground">{unit}</span>
          </>
        )}

        {!readonly && hasIntention && onIntentionClear && (
          <button
            onClick={onIntentionClear}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Clear intention"
          >
            <RiSubtractLine className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
