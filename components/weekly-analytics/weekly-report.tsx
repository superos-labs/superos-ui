/**
 * =============================================================================
 * File: weekly-report.tsx
 * =============================================================================
 *
 * Weekly Report unlock card for the analytics sidebar.
 *
 * Shows a "locked" progress checklist of criteria the user must complete
 * during the week to unlock Advanced Analytics, or an "unlocked" teaser
 * previewing the richer analytics experience that becomes available.
 *
 * All content is currently static / dummy — no real logic wired.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render locked state with criteria checklist and per-criterion progress.
 * - Render unlocked state with analytics feature preview and CTA.
 * - Provide a toggle prop to switch between states for design review.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Computing real progress against criteria.
 * - Navigating to an actual advanced analytics view.
 * - Persisting unlock state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Matches existing sidebar card conventions (rounded-xl, border, shadow-sm).
 * - Title bar mirrors WeeklyAnalytics pattern for visual consistency.
 * - Criteria use the same ProgressBar primitive from weekly-analytics.
 * - Unlocked state uses muted preview cards to hint at deeper features.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - WeeklyReport
 * - WeeklyReportProps
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiBarChartBoxLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiFireLine,
  RiFocusLine,
  RiLineChartLine,
  RiLock2Line,
  RiLockUnlockLine,
  RiPieChartLine,
  RiTimeLine,
} from "@remixicon/react";
import { ProgressBar } from "./weekly-analytics";

// =============================================================================
// Types
// =============================================================================

interface UnlockCriterion {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Current progress 0-100 */
  progress: number;
  /** Human-readable progress detail, e.g. "2.5h / 4h" */
  detail: string;
  /** Whether the criterion has been met */
  completed: boolean;
}

export interface WeeklyReportProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the report is unlocked */
  isUnlocked?: boolean;
  /** Label for the week (e.g., "Feb 9 – 15") */
  weekLabel?: string;
  /** Callback when user closes the panel */
  onClose?: () => void;
}

// =============================================================================
// Dummy Data
// =============================================================================

const DUMMY_CRITERIA: UnlockCriterion[] = [
  {
    id: "blocks",
    label: "Complete 75% of planned blocks",
    icon: RiCheckDoubleLine,
    progress: 45,
    detail: "45% / 75%",
    completed: false,
  },
  {
    id: "focus",
    label: "Log 4+ hours of focus time",
    icon: RiTimeLine,
    progress: 63,
    detail: "2.5h / 4h",
    completed: false,
  },
  {
    id: "streak",
    label: "Stay active 5+ days this week",
    icon: RiFireLine,
    progress: 60,
    detail: "3 / 5 days",
    completed: false,
  },
  {
    id: "plan",
    label: "Review weekly plan on Monday",
    icon: RiFocusLine,
    progress: 100,
    detail: "Done",
    completed: true,
  },
];

// =============================================================================
// Locked State
// =============================================================================

function LockedState({ weekLabel }: { weekLabel: string }) {
  const completedCount = DUMMY_CRITERIA.filter((c) => c.completed).length;
  const totalCount = DUMMY_CRITERIA.length;
  const overallProgress = Math.round(
    DUMMY_CRITERIA.reduce((sum, c) => sum + c.progress, 0) / totalCount
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Hero section */}
      <div className="flex flex-col items-center gap-3 px-4 pt-5 pb-1">
        {/* Lock icon in ring */}
        <div className="relative flex size-16 items-center justify-center">
          {/* Outer ring — shows overall progress */}
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle
              cx="32"
              cy="32"
              r="29"
              strokeWidth="3"
              className="stroke-muted"
            />
            <circle
              cx="32"
              cy="32"
              r="29"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-foreground/70"
              strokeDasharray={`${(overallProgress / 100) * 182.2} 182.2`}
            />
          </svg>
          <RiLock2Line className="size-6 text-muted-foreground" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold text-foreground">
            Weekly Report
          </span>
          <span className="text-center text-xs leading-relaxed text-muted-foreground">
            Complete {totalCount - completedCount} more{" "}
            {totalCount - completedCount === 1 ? "goal" : "goals"} to unlock
            advanced analytics for {weekLabel}
          </span>
        </div>
      </div>

      {/* Criteria list */}
      <div className="flex flex-col gap-1 px-2">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Unlock criteria
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {DUMMY_CRITERIA.map((criterion) => (
            <CriterionRow key={criterion.id} criterion={criterion} />
          ))}
        </div>
      </div>

      {/* Teaser */}
      <div className="mx-4 mb-4 rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-3">
        <div className="flex items-start gap-2.5">
          <RiBarChartBoxLine className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              What you'll unlock
            </span>
            <span className="text-[11px] leading-relaxed text-muted-foreground/80">
              Productivity patterns, focus quality insights, goal momentum
              trends, and personalized weekly recommendations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Criterion Row
// =============================================================================

function CriterionRow({ criterion }: { criterion: UnlockCriterion }) {
  const Icon = criterion.icon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg px-2 py-2.5 transition-colors",
        criterion.completed && "opacity-60"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
          criterion.completed ? "bg-green-500/15" : "bg-muted/60"
        )}
      >
        <Icon
          className={cn(
            "size-3",
            criterion.completed
              ? "text-green-600"
              : "text-muted-foreground"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm",
              criterion.completed
                ? "text-muted-foreground line-through"
                : "text-foreground"
            )}
          >
            {criterion.label}
          </span>
          <span
            className={cn(
              "shrink-0 text-right text-xs tabular-nums",
              criterion.completed
                ? "font-medium text-green-600"
                : "text-foreground"
            )}
          >
            {criterion.completed ? "✓" : `${criterion.progress}%`}
          </span>
        </div>

        {!criterion.completed && (
          <>
            <ProgressBar progress={criterion.progress} />
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {criterion.detail}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Unlocked State
// =============================================================================

function UnlockedState({ weekLabel }: { weekLabel: string }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Hero section */}
      <div className="flex flex-col items-center gap-3 px-4 pt-5 pb-1">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-green-500/10">
          <RiLockUnlockLine className="size-7 text-green-600" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold text-foreground">
            Advanced Analytics
          </span>
          <span className="text-center text-xs leading-relaxed text-muted-foreground">
            You've unlocked your weekly report for {weekLabel}
          </span>
        </div>
      </div>

      {/* Feature preview cards */}
      <div className="flex flex-col gap-2 px-4">
        <FeaturePreviewCard
          icon={RiLineChartLine}
          title="Productivity patterns"
          description="See when you're most productive and how your energy maps across the week."
          previewContent={<ProductivityMiniChart />}
        />
        <FeaturePreviewCard
          icon={RiTimeLine}
          title="Focus quality"
          description="Deep vs shallow work ratio and your best focus sessions this week."
          previewContent={<FocusQualityMini />}
        />
        <FeaturePreviewCard
          icon={RiPieChartLine}
          title="Goal momentum"
          description="Which goals are accelerating, stalling, or need attention."
          previewContent={<GoalMomentumMini />}
        />
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
            "bg-foreground text-background",
            "text-sm font-medium",
            "transition-opacity hover:opacity-90",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <RiBarChartBoxLine className="size-4" />
          View full report
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Feature Preview Card
// =============================================================================

function FeaturePreviewCard({
  icon: Icon,
  title,
  description,
  previewContent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  previewContent?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="flex items-start gap-2.5">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/60">
          <Icon className="size-3 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-foreground">{title}</span>
          <span className="text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </span>
        </div>
      </div>
      {previewContent && (
        <div className="ml-8.5">{previewContent}</div>
      )}
    </div>
  );
}

// =============================================================================
// Mini Visualizations (static / decorative)
// =============================================================================

/** Fake mini bar chart for productivity patterns */
function ProductivityMiniChart() {
  const bars = [35, 60, 80, 45, 90, 70, 25];
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex items-end gap-1.5 pt-1">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-5 rounded-sm bg-foreground/15"
            style={{ height: `${h * 0.32}px` }}
          />
          <span className="text-[9px] tabular-nums text-muted-foreground/60">
            {days[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Fake focus quality donut */
function FocusQualityMini() {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="relative flex size-10 items-center justify-center">
        <svg viewBox="0 0 40 40" className="-rotate-90" fill="none">
          <circle
            cx="20"
            cy="20"
            r="16"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-foreground/25"
            strokeDasharray={`${0.68 * 100.5} 100.5`}
          />
        </svg>
        <span className="absolute text-[9px] font-medium tabular-nums text-foreground">
          68%
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-foreground/25" />
          <span className="text-[10px] text-muted-foreground">
            Deep work · 4.2h
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-muted" />
          <span className="text-[10px] text-muted-foreground">
            Shallow · 2h
          </span>
        </div>
      </div>
    </div>
  );
}

/** Fake goal momentum indicators */
function GoalMomentumMini() {
  const goals = [
    { label: "SuperOS $1M", trend: "up", color: "text-green-500" },
    { label: "Marathon", trend: "flat", color: "text-amber-500" },
    { label: "Book", trend: "down", color: "text-red-400" },
  ];

  return (
    <div className="flex flex-col gap-1 pt-1">
      {goals.map((g) => (
        <div key={g.label} className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-medium tabular-nums",
              g.color
            )}
          >
            {g.trend === "up" ? "↑" : g.trend === "down" ? "↓" : "→"}
          </span>
          <span className="text-[10px] text-muted-foreground">{g.label}</span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function WeeklyReport({
  isUnlocked = false,
  weekLabel = "this week",
  onClose,
  className,
  ...props
}: WeeklyReportProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      {/* Title bar — mirrors WeeklyAnalytics pattern */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
            <RiBarChartBoxLine className="size-4 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Weekly report
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg",
              "text-muted-foreground transition-colors duration-150",
              "hover:bg-muted hover:text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Close"
          >
            <RiCloseLine className="size-4" />
          </button>
        )}
      </div>

      {/* State content */}
      {isUnlocked ? (
        <UnlockedState weekLabel={weekLabel} />
      ) : (
        <LockedState weekLabel={weekLabel} />
      )}
    </div>
  );
}
