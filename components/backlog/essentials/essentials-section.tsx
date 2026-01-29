"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiMoonLine,
} from "@remixicon/react";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { GoalIconOption } from "@/lib/types";
import type { EssentialItem, NewEssentialData } from "./essential-types";
import { EssentialRow, SleepRow } from "./essential-row";
import { InlineEssentialCreator } from "./inline-essential-creator";
import { EssentialsCTA } from "./essentials-cta";

// =============================================================================
// Types
// =============================================================================

export interface EssentialsSectionProps {
  /** Enabled essentials to display (should include Sleep) */
  essentials: EssentialItem[];
  /** Templates with schedule data */
  templates: EssentialTemplate[];
  /** Called when an essential's schedule is saved */
  onSaveSchedule: (essentialId: string, slots: EssentialSlot[]) => void;
  /** Called when a new essential is created */
  onCreateEssential: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  /** Called when an essential is deleted */
  onDeleteEssential: (essentialId: string) => void;
  /** Sleep wake up time in minutes from midnight */
  wakeUpMinutes: number;
  /** Sleep wind down time in minutes from midnight */
  windDownMinutes: number;
  /** Called when sleep times change */
  onSleepTimesChange: (wakeUp: number, windDown: number) => void;
  /** Whether sleep visualization is configured/enabled */
  isSleepConfigured?: boolean;
  /** Available icons for essential creation */
  essentialIcons: GoalIconOption[];
  /** Whether the section is collapsed */
  isCollapsed?: boolean;
  /** Callback to toggle the collapsed state */
  onToggleCollapse?: () => void;
  /** Whether the essentials section is hidden (user clicked Skip) */
  isHidden?: boolean;
  /** Callback when user clicks Skip to hide essentials */
  onHide?: () => void;
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function EssentialsSection({
  essentials,
  templates,
  onSaveSchedule,
  onCreateEssential,
  onDeleteEssential,
  wakeUpMinutes,
  windDownMinutes,
  onSleepTimesChange,
  isSleepConfigured = false,
  essentialIcons,
  isCollapsed = false,
  onToggleCollapse,
  isHidden = false,
  onHide,
  className,
}: EssentialsSectionProps) {
  // Internal state for accordion expansion
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  // State for showing the inline creator
  const [isCreating, setIsCreating] = React.useState(false);
  // Track IDs of essentials added during CTA flow (to hide from suggestions)
  const [ctaAddedIds, setCtaAddedIds] = React.useState<string[]>([]);
  // Manual control: show CTA until user clicks Done (or Skip)
  const [ctaDismissed, setCtaDismissed] = React.useState(false);

  const getTemplate = (essentialId: string) =>
    templates.find((t) => t.essentialId === essentialId);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    // Close creator when expanding an existing essential
    if (isCreating) {
      setIsCreating(false);
    }
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setExpandedId(null); // Collapse any expanded essential
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleSaveNewEssential = (
    data: NewEssentialData,
    slots: EssentialSlot[],
  ) => {
    onCreateEssential(data, slots);
    setIsCreating(false);
  };

  // Handler for adding essential from CTA (tracks the ID for filtering)
  const handleCTAAddEssential = (
    data: NewEssentialData,
    slots: EssentialSlot[],
  ) => {
    // Generate a stable ID based on the label (lowercase, no spaces)
    const essentialId = data.label.toLowerCase().replace(/\s+/g, "-");
    setCtaAddedIds((prev) => [...prev, essentialId]);
    onCreateEssential(data, slots);
  };

  // Handler for Skip button
  const handleSkip = () => {
    setCtaDismissed(true);
    onHide?.();
  };

  // Handler for Done button
  const handleDone = () => {
    setCtaDismissed(true);
  };

  // Separate Sleep from other essentials
  const sleepEssential = essentials.find((e) => e.id === "sleep");
  const otherEssentials = essentials.filter((e) => e.id !== "sleep");

  // Sort essentials by earliest start time
  const sortedEssentials = [...otherEssentials].sort((a, b) => {
    const aTemplate = templates.find((t) => t.essentialId === a.id);
    const bTemplate = templates.find((t) => t.essentialId === b.id);
    const aStart = aTemplate?.slots[0]?.startMinutes ?? Infinity;
    const bStart = bTemplate?.slots[0]?.startMinutes ?? Infinity;
    return aStart - bStart;
  });

  // Create a default Sleep essential if not provided
  const defaultSleep: EssentialItem = {
    id: "sleep",
    label: "Sleep",
    icon: RiMoonLine,
    color: "indigo",
  };

  const sleep = sleepEssential ?? defaultSleep;

  // Show CTA until user explicitly dismisses it (via Skip or Done)
  // Initial condition: show CTA when no config exists yet
  const shouldShowCTA =
    !ctaDismissed && !isSleepConfigured && otherEssentials.length === 0;

  // If hidden, render nothing
  if (isHidden) {
    return null;
  }

  return (
    <div className={cn("group/essentials flex flex-col", className)}>
      {shouldShowCTA && !isCollapsed ? (
        // CTA empty state - no animation wrapper
        <EssentialsCTA
          sleepEssential={sleep}
          isSleepExpanded={expandedId === "sleep"}
          onToggleSleepExpand={() => handleToggleExpand("sleep")}
          wakeUpMinutes={wakeUpMinutes}
          windDownMinutes={windDownMinutes}
          onSleepTimesChange={onSleepTimesChange}
          isSleepConfigured={isSleepConfigured}
          onAddEssential={handleCTAAddEssential}
          addedEssentialIds={ctaAddedIds}
          onSkip={handleSkip}
          onDone={handleDone}
          essentialIcons={essentialIcons}
        />
      ) : (
        // Configured state - standard list view (no animation)
        <div className="px-3 py-2">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-foreground">
                Essentials
              </h3>
              {!isCollapsed && (
                <p className="text-xs text-muted-foreground">
                  Non-negotiables that shape your time
                </p>
              )}
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover/essentials:opacity-100"
                aria-label={
                  isCollapsed ? "Expand essentials" : "Collapse essentials"
                }
              >
                {isCollapsed ? (
                  <RiArrowDownSLine className="size-4" />
                ) : (
                  <RiArrowUpSLine className="size-4" />
                )}
              </button>
            )}
          </div>

          {/* Essential list - hidden when collapsed */}
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5">
              {/* Sleep - always first, special UI, non-deletable */}
              <SleepRow
                essential={sleep}
                isExpanded={expandedId === "sleep"}
                onToggleExpand={() => handleToggleExpand("sleep")}
                wakeUpMinutes={wakeUpMinutes}
                windDownMinutes={windDownMinutes}
                onTimesChange={onSleepTimesChange}
                isConfigured={isSleepConfigured}
              />

              {/* Other essentials - sorted by earliest time */}
              {sortedEssentials.map((essential) => (
                <EssentialRow
                  key={essential.id}
                  essential={essential}
                  template={getTemplate(essential.id)}
                  isExpanded={expandedId === essential.id}
                  onToggleExpand={() => handleToggleExpand(essential.id)}
                  onSaveSchedule={(slots) =>
                    onSaveSchedule(essential.id, slots)
                  }
                  onDelete={() => onDeleteEssential(essential.id)}
                />
              ))}

              {/* Inline essential creator */}
              {isCreating && (
                <InlineEssentialCreator
                  essentialIcons={essentialIcons}
                  onSave={handleSaveNewEssential}
                  onCancel={handleCancelCreate}
                />
              )}

              {/* New essential button */}
              {!isCreating && (
                <button
                  onClick={handleStartCreating}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted/60"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <RiAddLine className="size-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Add essential
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
