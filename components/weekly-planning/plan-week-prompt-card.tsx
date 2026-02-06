/**
 * =============================================================================
 * File: plan-week-prompt-card.tsx
 * =============================================================================
 *
 * Prompt card encouraging users to start weekly planning.
 *
 * Presents a short motivational message with a primary call-to-action
 * to begin planning and a secondary dismissal option.
 *
 * Typically surfaced after blueprint creation or when a new week begins.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a lightweight, visually distinctive prompt.
 * - Invoke callbacks for starting planning or dismissing the prompt.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Performing navigation.
 * - Persisting dismissal state.
 * - Determining when the card should appear.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses subtle decorative background layers for depth.
 * - Centered, single-focus layout to minimize cognitive load.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - PlanWeekPromptCard
 * - PlanWeekPromptCardProps
 */

"use client";

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
        "relative flex flex-col items-center overflow-hidden rounded-2xl border border-border bg-background shadow-sm",
        "max-w-[420px]",
        className
      )}
    >
      {/* Decorative gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />

      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content container */}
      <div className="relative flex flex-col items-center gap-6 px-8 py-10 text-center">
        {/* Icon container with layered design */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-2 rounded-2xl bg-primary/5" />
          {/* Icon box */}
          <div className="relative flex size-14 items-center justify-center rounded-xl bg-gradient-to-b from-primary/10 to-primary/5 ring-1 ring-primary/10">
            <RiCalendarScheduleLine className="size-6 text-primary" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Focus on what matters
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your schedule is ready. Pick 2-3 priority tasks for each goal to
            focus on this week.
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 pt-1">
          <Button
            size="lg"
            onClick={onStartPlanning}
            className="h-10 w-full text-sm font-medium"
          >
            Start planning
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            className="py-1 text-sm text-muted-foreground/70 transition-colors hover:text-muted-foreground"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
