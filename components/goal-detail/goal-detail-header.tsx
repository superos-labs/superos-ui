"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiShiningLine } from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { IconComponent, LifeArea } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";

export interface GoalDetailHeaderProps {
  /** Goal icon component */
  icon: IconComponent;
  /** Goal title */
  title: string;
  /** Goal color */
  color: GoalColor;
  /** Associated life area */
  lifeArea?: LifeArea;
  /** Whether milestones are enabled for this goal */
  milestonesEnabled?: boolean;
  /** Callback to toggle milestones enabled state */
  onToggleMilestonesEnabled?: () => void;
  /** Callback to close the goal detail view */
  onClose?: () => void;
  className?: string;
}

export function GoalDetailHeader({
  icon: Icon,
  title,
  color,
  lifeArea,
  milestonesEnabled,
  onToggleMilestonesEnabled,
  onClose,
  className,
}: GoalDetailHeaderProps) {
  const LifeAreaIcon = lifeArea?.icon;

  return (
    <div className={cn("flex flex-col gap-4 px-6 pt-6 pb-4", className)}>
      {/* Top row: Icon + Action buttons */}
      <div className="flex items-start justify-between">
        {/* Large icon - muted background with colored icon */}
        <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
          <Icon className={cn("size-7", getIconColorClass(color))} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Milestones toggle button */}
          {onToggleMilestonesEnabled && (
            <button
              onClick={onToggleMilestonesEnabled}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={milestonesEnabled ? "Hide milestones" : "Show milestones"}
              title={milestonesEnabled ? "Hide milestones" : "Show milestones"}
            >
              <RiShiningLine className="size-4" />
            </button>
          )}

          {/* Close button */}
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
      </div>

      {/* Title and life area */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground leading-tight">
          {title}
        </h1>
        {lifeArea && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {LifeAreaIcon && (
              <LifeAreaIcon
                className={cn("size-3.5", getIconColorClass(lifeArea.color))}
              />
            )}
            <span>{lifeArea.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
