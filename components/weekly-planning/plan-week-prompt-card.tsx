"use client";

/**
 * PlanWeekPromptCard - Encourages users to plan their week after onboarding.
 *
 * Displayed as a centered overlay card on top of the dimmed calendar
 * immediately after the user completes goals and essentials setup.
 */

import * as React from "react";
import { RiCalendarScheduleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PlanWeekPromptCardProps {
  /** Called when user clicks "Start planning" */
  onStartPlanning: () => void;
  /** Called when user clicks "Maybe later" */
  onDismiss: () => void;
  className?: string;
}

export function PlanWeekPromptCard({
  onStartPlanning,
  onDismiss,
  className,
}: PlanWeekPromptCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-lg",
        "max-w-[400px] text-center",
        className,
      )}
    >
      {/* Icon container */}
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <RiCalendarScheduleLine className="size-7 text-primary" />
      </div>

      {/* Text content */}
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Make space for what matters this week
        </h2>
        <p className="text-sm text-muted-foreground">
          You've set your goals and essentials. Now place them into a real week
          so they actually have room to happen.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        <Button size="lg" onClick={onStartPlanning}>
          Start planning
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
