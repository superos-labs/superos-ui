"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine, RiMoonLine } from "@remixicon/react";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { GoalIconOption } from "@/lib/types";
import type { BacklogItem, NewEssentialData } from "./backlog-types";
import { EssentialRow, SleepRow } from "./essential-row";
import { InlineEssentialCreator } from "./inline-creators";

// =============================================================================
// Types
// =============================================================================

export interface EssentialsSectionProps {
  /** Enabled essentials to display (should include Sleep) */
  essentials: BacklogItem[];
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
  className,
}: EssentialsSectionProps) {
  // Internal state for accordion expansion
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  // State for showing the inline creator
  const [isCreating, setIsCreating] = React.useState(false);

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

  // Separate Sleep from other essentials
  const sleepEssential = essentials.find((e) => e.id === "sleep");
  const otherEssentials = essentials.filter((e) => e.id !== "sleep");

  // Create a default Sleep essential if not provided
  const defaultSleep: BacklogItem = {
    id: "sleep",
    label: "Sleep",
    icon: RiMoonLine,
    color: "indigo",
  };

  const sleep = sleepEssential ?? defaultSleep;

  return (
    <div className={cn("flex flex-col px-3 py-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">Essentials</h3>
          <p className="text-xs text-muted-foreground">Recurring activities</p>
        </div>
      </div>

      {/* Essential list */}
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

        {/* Other essentials */}
        {otherEssentials.map((essential) => (
          <EssentialRow
            key={essential.id}
            essential={essential}
            template={getTemplate(essential.id)}
            isExpanded={expandedId === essential.id}
            onToggleExpand={() => handleToggleExpand(essential.id)}
            onSaveSchedule={(slots) => onSaveSchedule(essential.id, slots)}
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
            <span className="text-sm text-muted-foreground">New essential</span>
          </button>
        )}
      </div>
    </div>
  );
}
